import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import ActivationEmail from './auth/ActivationEmail';
import NotFound from '../utils/NotFound/NotFound';
import ForgotPassword from './auth/ForgotPassword';

import { useSelector } from 'react-redux';
import ResetPassword from './auth/ResetPassword';
import Profile from '../profile/Profile';
import EditUser from '../profile/EditUser';

const Body = () => {
  const auth = useSelector((state) => state.auth);
  const { isLogged, isAdmin } = auth;
  return (
    <section>
      <Routes>
        <Route
          path='/login'
          element={isLogged ? <NotFound /> : <Login />}
          exact
        />
        <Route
          path='/register'
          element={isLogged ? <NotFound /> : <Register />}
          exact
        />
        <Route
          path='/forgotPassword'
          element={isLogged ? <NotFound /> : <ForgotPassword />}
          exact
        />
        <Route
          path='/user/resetPassword/:token'
          element={isLogged ? <NotFound /> : <ResetPassword />}
          exact
        />
        <Route
          path='/user/activate/:activationToken'
          element={<ActivationEmail />}
          exact
        />
        <Route
          path='/profile'
          element={isLogged ? <Profile /> : <NotFound />}
          exact
        />
        <Route
          path='/editUser/:id'
          element={isAdmin ? <EditUser /> : <NotFound />}
          exact
        />
      </Routes>
    </section>
  );
};

export default Body;
