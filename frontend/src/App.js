import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './components/store/auth-context';
import LandingPage from './components/pages/Landingpage';
import LoginForm from './components/pages/LoginForm';
import RegForm from './components/pages/RegForm';
import PostsPage from './components/pages/PostsPage';
import GroupPage from './components/pages/GroupPage';
import GroupProfilePage from './components/pages/GroupProfilePage';
import ProfilePage from './components/pages/ProfilePage';
import ChatPage from './components/pages/ChatPage';
import Root from './components/pages/Root';
import ErrorPage from './components/pages/ErrorPage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const authCtx = useContext(AuthContext);

  return (
    <Routes>
      <Route element={<PrivateRoutes isLoggedIn={authCtx.isLoggedIn} />}>
        <Route element={<Root />}>
          <Route exact path="/" element={<PostsPage />} />
          {/* <Route path="/:userId" element={<PostsPage />} />  IF U UNCOMMENT THIS IT WONT ROUTE TO ERROR PAGE*/}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/group" element={<GroupPage />} />
          <Route path="/groupprofile" element={<GroupProfilePage />} />
          <Route path="/groups" element={<GroupPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Route>

      <Route element={<PublicRoutes isLoggedIn={authCtx.isLoggedIn} />}>
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/reg" element={<RegForm />} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

function PrivateRoutes({ isLoggedIn }) {
  // console.log('Using PrivateRoutes');
  return isLoggedIn ? <Outlet /> : <Navigate to="/welcome" />;
}

function PublicRoutes({ isLoggedIn }) {
  // console.log('Using PublicRoutes');
  return isLoggedIn ? <Navigate to="/" /> : <Outlet />;
}

export default App;
