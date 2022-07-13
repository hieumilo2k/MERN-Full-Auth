import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  showErrMsg,
  showSuccessMsg,
} from '../../utils/notification/Notification';
import { isLength, isMatch } from '../../utils/validation/Validation';

const initialState = {
  password: '',
  confirmPassword: '',
  err: '',
  success: '',
};

const ResetPassword = () => {
  const [data, setData] = useState(initialState);
  const { token } = useParams();

  const { password, confirmPassword, err, success } = data;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, err: '', success: '' });
  };

  const handleResetPassword = async () => {
    if (isLength(password)) {
      return setData({
        ...data,
        err: 'Password must be at least 6 characters.',
        success: '',
      });
    }

    if (!isMatch(password, confirmPassword)) {
      return setData({
        ...data,
        err: 'Password did not match.',
        success: '',
      });
    }

    try {
      const res = await axios.post(
        '/user/resetPassword',
        { password },
        {
          headers: { Authorization: token },
        }
      );

      return setData({ ...data, err: '', success: res.data.msg });
    } catch (error) {
      error.response.data.msg &&
        setData({ ...data, err: error.response.data.msg, success: '' });
    }
  };

  return (
    <div className='forgot-password'>
      <h2>Reset Your Password</h2>

      <div className='row'>
        {err && showErrMsg(err)}
        {success && showSuccessMsg(success)}

        <label htmlFor='password'>Password</label>
        <input
          type='password'
          name='password'
          id='password'
          value={password}
          onChange={handleChangeInput}
        />

        <label htmlFor='confirmPassword'>Confirm Password</label>
        <input
          type='password'
          name='confirmPassword'
          id='confirmPassword'
          value={confirmPassword}
          onChange={handleChangeInput}
        />
        <button onClick={handleResetPassword}>Reset Password</button>
      </div>
    </div>
  );
};

export default ResetPassword;
