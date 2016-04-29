import React from 'react';
import {mount} from 'react-mounter';
import { AppContainer } from 'react-hot-loader';

import origMainLayout from './components/main_layout';
import PostList from './containers/postlist';
import Post from './containers/post';
import NewPost from './containers/newpost';

// Optional, but helpful
import Redbox from 'redbox-react';
const consoleErrorReporter = ({error}) => {
  /*eslint no-console: ["error", { allow: ["error"] }] */
  console.error(error);
  return <Redbox error={error} />;
};
consoleErrorReporter.propTypes = {
// not in react 0.14
//  error: React.PropTypes.error
};

// Temporary, to avoid superflous warnings
let wasCreateElementPatched = false;
const A = () => {};
A.__source = { fileName: 'fake', localName: 'fake' }
const B = () => {};
B.__source = { fileName: 'fake', localName: 'fake' }
if (<A />.type === <B />.type) {
  wasCreateElementPatched = true;
}
if (!wasCreateElementPatched) {
  // See client/modules/comments/components/index.js
  console.warn("NB: Currently we are not using react-hot-loader with Mantra, " +
    "because something is breaking.  HMR will still work, but state stored " +
    "inside components will be lost.  Tracking in " +
    "https://github.com/gadicc/meteor-hmr/issues/60");
}

/*
 * We need to store these outside the funcs so we can use them to re-render
 * an existing route's action (with it's own closures) on hot update.
 */
var MainLayoutCtx;
var localFlowRouter;
var localInjectDeps;
function createMainLayoutCtx(MainLayout) {
  MainLayoutCtx = function(props) {
    if (wasCreateElementPatched)
      return (
        <AppContainer
          component={ localInjectDeps(MainLayout) }
          errorReporter={consoleErrorReporter}
          props={props}
        />
      );
    else {
      const MainLayoutCtx = localInjectDeps(MainLayout);
      return ( <MainLayoutCtx {...props} /> );
    }
  };
}

export default function (injectDeps, {FlowRouter}) {
  // MainLayoutCtx = injectDeps(MainLayout);
  localInjectDeps = injectDeps;
  localFlowRouter = FlowRouter;
  createMainLayoutCtx(origMainLayout);

  FlowRouter.route('/', {
    name: 'posts.list',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<PostList />)
      });
    }
  });

  FlowRouter.route('/post/:postId', {
    name: 'posts.single',
    action({postId}) {
      mount(MainLayoutCtx, {
        content: () => (<Post postId={postId}/>)
      });
    }
  });

  FlowRouter.route('/new-post', {
    name: 'newpost',
    action() {
      mount(MainLayoutCtx, {
        content: () => (<NewPost/>)
      });
    }
  });
}

if (module.hot) {
  module.hot.accept('./components/main_layout', function () {
    const nextMainLayout = require('./components/main_layout').default;
    createMainLayoutCtx(nextMainLayout);
    localFlowRouter._current.route._action();
  });
}
