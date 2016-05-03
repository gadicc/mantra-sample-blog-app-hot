import React from 'react';
import {mount} from 'react-mounter';
import { AppContainer } from 'react-hot-loader';

// import MainLayout from './components/main_layout';
// import PostList from './containers/postlist';
// import Post from './containers/post';
// import NewPost from './containers/newpost';

// Optional, but helpful
import Redbox from 'redbox-react';
const consoleErrorReporter = ({error}) => {
  /*eslint no-console: ["error", { allow: ["error"] }] */
  console.error(error);
  return <Redbox error={error} />;
};
consoleErrorReporter.propTypes = {
  error: React.PropTypes.instanceOf(Error).isRequired
};

// So we can call FlowRotuer again later during hot reload
var localFlowRouter;

export default function (injectDeps, {FlowRouter}) {
  // MainLayoutCtx = injectDeps(MainLayout);
  localFlowRouter = FlowRouter;

  const MainLayoutCtx = function(props) {
    const MainLayout = require('./components/main_layout').default;
    const MainLayoutCtx = injectDeps(MainLayout);
    return (
      <AppContainer errorReporter={consoleErrorReporter}>
        <MainLayoutCtx {...props} />
      </AppContainer>
    );
  };

  FlowRouter.route('/', {
    name: 'posts.list',
    action() {
      const PostList = require('./containers/postlist').default;
      mount(MainLayoutCtx, {
        content: () => (<PostList />)
      });
    }
  });

  FlowRouter.route('/post/:postId', {
    name: 'posts.single',
    action({postId}) {
      const Post = require('./containers/post').default;
      mount(MainLayoutCtx, {
        content: () => (<Post postId={postId}/>)
      });
    }
  });

  FlowRouter.route('/new-post', {
    name: 'newpost',
    action() {
      const NewPost = require('./containers/newpost').default;
      mount(MainLayoutCtx, {
        content: () => (<NewPost/>)
      });
    }
  });
}

if (module.hot) {
  module.hot.accept([
    './components/main_layout',
    './containers/postlist',
    './containers/post',
    './containers/newpost',
  ], function () {
    localFlowRouter._current.route._action();
  });
}
