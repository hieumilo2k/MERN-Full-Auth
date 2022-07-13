import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  showErrMsg,
  showSuccessMsg,
} from '../../utils/notification/Notification';
import { isEmail, isEmpty, isLength, isMatch } from '../../utils/validation/Validation';

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  err: '',
  success: '',
};

const Register = () => {
  const [user, setUser] = useState(initialState);

  const { name, email, password, confirmPassword , err, success } = user;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, err: '', success: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isEmpty(name) || isEmpty(password)) {
      return setUser({ ...user, err: "Please fill in all fields.", success: '' });
    }

    if(!isEmail(email)) {
      return setUser({ ...user, err: "Invalid emails.", success: '' });
    }

    if(isLength(password)) {
      return setUser({ ...user, err: "Password must be at least 6 characters.", success: '' });
    }

    if(!isMatch(password, confirmPassword)) {
      return setUser({ ...user, err: "Password did not match.", success: '' });
    }

    try {
      const res = await axios.post('/user/register', { name, email, password });

      setUser({...user, err: '', success: res.data.msg});
    } catch (error) {
      error.response.data.msg &&
        setUser({ ...user, err: error.response.data.msg, success: '' });
    }
  };

  return (
    <div className='login_page'>
      <h2>Register</h2>
      {err && showErrMsg(err)}
      {success && showSuccessMsg(success)}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            placeholder='Enter name'
            id='name'
            value={name}
            name='name'
            onChange={handleChangeInput}
          />
        </div>

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

        <div>
          <label htmlFor='confirmPassword'>Confirm Password</label>
          <input
            type='password'
            placeholder='Enter confirm password'
            id='confirmPassword'
            value={confirmPassword}
            name='confirmPassword'
            onChange={handleChangeInput}
          />
        </div>

        <div className='row'>
          <button type='submit'>Register</button>
        </div>
      </form>
      <p>Already an account ? <Link to='/login'>Login</Link></p>
    </div>

  );
};

export default Register;
