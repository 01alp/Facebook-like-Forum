import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UsersContextProvider } from '../store/users-context';
import { WebSocketContextProvider } from '../store/websocket-context';
import Layout from '../layouts/Layout';
import { FollowingContextProvider } from '../store/following-context';
import { PostsContextProvider } from '../store/posts-context';

const Root = () => {
  return (
    <>
      <UsersContextProvider>
        <WebSocketContextProvider>
          <FollowingContextProvider>
            <PostsContextProvider>
              <Layout>
                <Outlet />
              </Layout>
            </PostsContextProvider>
          </FollowingContextProvider>
        </WebSocketContextProvider>
      </UsersContextProvider>
    </>
  );
};

export default Root;
