import { ipcRenderer } from 'electron';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RemoteActionCreator = (...args: any[]) => any;

const remoteActionCreators: {
  [index: string]: RemoteActionCreator;
} = {};

export function findRemoteAction(
  type: string
): RemoteActionCreator | undefined {
  return remoteActionCreators[type];
}

export function createRemoteAction(
  type: string,
  creator: RemoteActionCreator
): RemoteActionCreator {
  const isRenderer = process && process.type === 'renderer';

  if (isRenderer) {
    return (...args) => {
      return (): void => {
        ipcRenderer.send('mckayla.electron-redux.CREATE_ACTION', {
          type: type,
          args,
        });
      };
    };
  } else {
    remoteActionCreators[type] = creator;
    return (...args): ReturnType<RemoteActionCreator> => creator(...args);
  }
}
