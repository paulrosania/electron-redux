import { ipcMain, webContents } from 'electron';
import { Action, Middleware } from 'redux';
import { findRemoteAction } from '../remoteActions';

import { stopForwarding, validateAction } from '../helpers';

export const syncMain: Middleware = ({ dispatch, getState }) => {
  ipcMain.handle('mckayla.electron-redux.FETCH_STATE', async () => {
    return JSON.stringify(getState());
  });

  ipcMain.on('mckayla.electron-redux.ACTION', (event, action: Action) => {
    dispatch(stopForwarding(action));
  });

  ipcMain.on(
    'mckayla.electron-redux.CREATE_ACTION',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event, action: { type: string; args: any[] }) => {
      const localAction = findRemoteAction(action.type)?.(...action.args);
      dispatch(localAction);
    }
  );

  return (next) => <A extends Action>(action: A): A => {
    if (validateAction(action)) {
      webContents.getAllWebContents().forEach((contents) => {
        contents.send('mckayla.electron-redux.ACTION', action);
      });
    }

    return next(action);
  };
};
