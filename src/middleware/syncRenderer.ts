import { ipcRenderer } from 'electron';
import { Action, AnyAction, Middleware, Reducer } from 'redux';
import { stopForwarding, validateAction } from '../helpers';

export async function getRendererState<S>(): Promise<S> {
  const state = await ipcRenderer.invoke('mckayla.electron-redux.FETCH_STATE');

  // TODO: I don't think this is the right error handling anymore
  if (typeof state !== 'string') {
    throw new Error(
      'No Redux store found in main process. Did you apply the middleware?'
    );
  }

  return JSON.parse(state);
}

interface ReplaceStateAction<S> extends Action {
  type: 'mckayla.electron-redux.REPLACE_STATE';
  payload: S;
  meta: { scope: 'local' };
}

function replaceState<S>(state: S): ReplaceStateAction<S> {
  return {
    type: 'mckayla.electron-redux.REPLACE_STATE',
    payload: state,
    meta: { scope: 'local' },
  };
}

export function wrapRendererReducer(reducer: Reducer): Reducer {
  return <S, A extends Action>(
    state: S,
    action: A | ReplaceStateAction<S>
  ): S => {
    switch (action.type) {
      case 'mckayla.electron-redux.REPLACE_STATE':
        return (action as ReplaceStateAction<S>).payload;
      default:
        return reducer(state, action);
    }
  };
}

export const syncRenderer: Middleware = ({ dispatch }) => {
  getRendererState().then((state) => {
    dispatch(replaceState(state));
  });

  ipcRenderer.on('mckayla.electron-redux.ACTION', (_, action: Action) => {
    dispatch(stopForwarding(action));
  });

  return (next) => <A extends AnyAction>(action: A): A => {
    if (validateAction(action)) {
      // TODO: We need a way to send actions from one renderer to another
      ipcRenderer.send('mckayla.electron-redux.ACTION', action);
    }

    return next(action);
  };
};
