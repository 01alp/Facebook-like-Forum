import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UsersContextProvider } from '../store/users-context';
import { WebSocketContextProvider } from '../store/websocket-context';
import Layout from '../layouts/Layout';
import { FollowingContextProvider } from '../store/following-context';
import { PostsContextProvider } from '../store/posts-context';
import { ChatProvider } from '../store/chat-context';
import { GroupContextProvider } from '../store/group-context';
import { JoinedGroupContext, JoinedGroupContextProvider } from '../store/joined-group-context';

const Root = () => {
  return (
    <>
      <UsersContextProvider>
        <ChatProvider>
          <WebSocketContextProvider>
            <FollowingContextProvider>
              <GroupContextProvider>
                <JoinedGroupContextProvider>
                  <PostsContextProvider>
                    <Layout>
                      <Outlet />
                    </Layout>
                  </PostsContextProvider>
                </JoinedGroupContextProvider>
              </GroupContextProvider>
            </FollowingContextProvider>
          </WebSocketContextProvider>
        </ChatProvider>
      </UsersContextProvider>
    </>
  );
};

export default Root;
