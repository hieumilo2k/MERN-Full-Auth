import { combineReducers } from 'redux';
import authReducer from './authReducer';
import tokenReducer from './tokenReducer';
import usersReducer from './usersReducer';

export default combineReducers({
  auth: authReducer,
  token: tokenReducer,
  users: usersReducer,
});
