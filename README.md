# electron-redux

[![package version](https://img.shields.io/badge/@paulrosania%2felectron--redux-v2.0.0-afbdf7.svg)](https://npmjs.com/package/@paulrosania/electron-redux)
[![build status](https://github.com/paulrosania/electron-redux/workflows/main/badge.svg)](https://github.com/paulrosania/electron-redux/actions)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)

![electron-redux data flow](https://cloud.githubusercontent.com/assets/307162/20675737/385ce59e-b585-11e6-947e-3867e77c783d.png)

Keeps your state in sync across all of your Electron processes by playing your actions
in all of them.

```javascript
// in the main process
import { syncMain } from '@paulrosania/electron-redux';
const store = createStore(reducer, applyMiddleware(syncMain));
```

```javascript
// in the renderer processes
import { syncRenderer, wrapRendererReducer } from '@paulrosania/electron-redux';
const store = createStore(wrapRendererReducer(reducer), applyMiddleware(syncRenderer));
```

That's it! Just add each middleware to where you initialize your store, and wrap
the renderer reducer so it can receive state from the main process. As long as
your reducers are pure/deterministic (which they already should be) your state
should be reproduced accurately across all of the processes.

## Actions

Actions **MUST** be [FSA](https://github.com/acdlite/flux-standard-action#example)-compliant,
i.e. have a `type` and `payload` property. Any actions not passing this test will
be ignored and simply passed through to the next middleware.

> NB: `redux-thunk` is not FSA-compliant out of the box, but can still produce compatible actions once the async action fires.

Actions **MUST** be serializable

- Objects with enumerable properties
- Arrays
- Numbers
- Booleans
- Strings

### Local actions

By default, all actions are played in all processes. If an action should only be
played in the current thread, then you can set the scope meta property to local.

```javascript
const myLocalActionCreator = () => ({
  type: 'MY_ACTION',
  payload: 123,
  meta: {
    scope: 'local', // only play the action locally
  },
});
```

We also provide a utility function for this

```
import { stopForwarding } from "@paulrosania/electron-redux";
dispatch(stopForwarding(action));
```

## Contributors

- [McKayla Washburn](https://github.com/partheseas)
- [Burkhard Reffeling](https://github.com/hardchor)
- [Charlie Hess](https://github.com/CharlieHess)
- [Roman Paradeev](https://github.com/sameoldmadness)
