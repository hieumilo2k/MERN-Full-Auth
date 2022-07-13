import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  showErrMsg,
  showSuccessMsg,
} from '../../utils/notification/Notification';
import { dispatchLogin } from '../../../redux/actions/authAction';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import { gapi } from 'gapi-script';

const initialState = {
  email: '',
  password: '',
  err: '',
  success: '',
};

const Login = () => {
  const [user, setUser] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { email, password, err, success } = user;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, err: '', success: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/user/login', { email, password });
      setUser({ ...user, err: '', success: res.data.msg });

      localStorage.setItem('firstLogin', true);

      dispatch(dispatchLogin());

      navigate('/');
    } catch (error) {
      error.response.data.msg &&
        setUser({ ...user, err: error.response.data.msg, success: '' });
    }
  };

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId:
          '596221362552-5lb3hquvfne4obej0hqmcela2u888sh8.apps.googleusercontent.com',
        scope: 'email',
      });
    }

    gapi.load('client:auth2', start);
  }, []);

  const responseGoogle = async (response) => {
    console.log(response);
    try {
      const res = await axios.post('/user/googleLogin', {
        tokenId: response.tokenId,
      });

      setUser({ ...user, err: '', success: res.data.msg });
      localStorage.setItem('firstLogin', true);

      dispatch(dispatchLogin());

      navigate('/');
    } catch (error) {
      error.response.data.msg &&
        setUser({ ...user, err: error.response.data.msg, success: '' });
    }
  };

  return (
    <div className='login_page'>
      <h2>Login</h2>
      {err && showErrMsg(err)}
      {success && showSuccessMsg(success)}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='email'>Email</label>
          <input
            type='text'
            placeholder='Enter email address'
            id='email'
            value={email}
            name='email'
            onChange={handleChangeInput}
          />
        </div>

        <div>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            placeholder='Enter password'
            id='password'
            value={password}
            name='password'
            onChange={handleChangeInput}
          />
        </div>

        <div className='row'>
          <button type='submit'>Login</button>
          <Link to='/forgotPassword'>Forgot your password ?</Link>
        </div>
      </form>

      <div className='hr'>Or Login With</div>

      <div className='social'>
        <GoogleLogin
          clientId='596221362552-5lb3hquvfne4obej0hqmcela2u888sh8.apps.googleusercontent.com'
          buttonText='Login with google'
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
          scope=''
        />
      </div>

      <p>
        New Customer ? <Link to='/register'>Register</Link>
      </p>
    </div>
  );
};

export default Login;
