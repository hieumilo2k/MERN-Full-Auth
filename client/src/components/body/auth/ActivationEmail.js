import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {showErrMsg, showSuccessMsg} from '../../utils/notification/Notification';
import axios from 'axios';

const ActivationEmail = () => {
  const {activationToken} = useParams();
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if(activationToken) {
      const activationEmail = async() => {
        try {
          const res = await axios.post('/user/activation', { activationToken });
          setSuccess(res.data.msg);
        } catch (error) {
          error.response.data.msg && setErr(error.response.data.msg);
        }
      }
      activationEmail();
    }
  }, [activationToken]);

  return (
    <div className='active_page'>
      {err && showErrMsg(err)}
      {success && showSuccessMsg(success)}
    </div>
  );
};

export default ActivationEmail;