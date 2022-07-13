const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('./sendMail');

const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);

const { CLIENT_URL } = process.env;

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Please fill in all fields.' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ msg: 'Invalid email' });
      }

      const user = await Users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: 'This email already exists.' });

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: 'Password must be at least 6 characters.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = {
        name,
        email,
        password: passwordHash,
      };

      const activation_token = createActivationToken(newUser);

      const url = `${CLIENT_URL}/user/activate/${activation_token}`;
      sendMail(email, url, 'Verify your email address');

      res.json({
        msg: 'Register Success! Please activate your email to start.',
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  activateEmail: async (req, res) => {
    try {
      const { activationToken } = req.body;
      const user = jwt.verify(
        activationToken,
        process.env.ACTIVATION_TOKEN_SECRET
      );

      const { name, email, password } = user;

      const check = await Users.findOne({ email });
      if (check)
        return res.status(400).json({ msg: 'This email already exists.' });

      const newUser = new Users({
        name,
        email,
        password,
      });

      await newUser.save();

      res.json({ msg: 'Account has been activated!' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'This email does not exits.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Password is incorrect.' });
      }

      const refreshToken = createRefreshToken({ id: user._id });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/user/refreshToken',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ msg: 'Login success!' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getAccessToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken)
        return res.status(400).json({ msg: 'Please login now!' });

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) return res.status(400).json({ msg: 'Please login now!' });

          const accessToken = createAccessToken({ id: user.id });

          res.json({ accessToken });
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ email });

      if (!user)
        return res.status(400).json({ msg: 'This email does not exits.' });

      const accessToken = createAccessToken({ id: user._id });
      const url = `${CLIENT_URL}/user/resetPassword/${accessToken}`;

      sendMail(email, url, 'Reset your password');
      res.json({ msg: 'Please check your email to reset your password.' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);

      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: passwordHash,
        }
      );

      res.json({ msg: 'Password successfully changed!' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getUserInformation: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select('-password');

      res.json(user);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getUsersAllInformation: async (req, res) => {
    try {
      const users = await Users.find().select('-password');

      res.json(users);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie('refreshToken', { path: '/user/refreshToken' });
      return res.json({ msg: 'Logout success!' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, avatar } = req.body;
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          name,
          avatar,
        }
      );

      res.json({ msg: 'Update Success!' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateUsersRole: async (req, res) => {
    try {
      const { role } = req.body;
      await Users.findOneAndUpdate(
        { _id: req.params.id },
        {
          role,
        }
      );

      res.json({ msg: 'Update Success!' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await Users.findOneAndDelete({ _id: req.params.id });

      res.json({ msg: 'Delete Success!' });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  googleLogin: async (req, res) => {
    try {
      const { tokenId } = req.body;

      const verity = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.MAILING_SERVICE_CLIENT_ID,
      });

      const { email, email_verified, name, picture } = verity.payload;

      const password = email + process.env.GOOGLE_SECRET;

      const passwordHash = await bcrypt.hash(password, 12);

      if (!email_verified)
        return res.status(400).json({ msg: 'Email verification failed.' });

      const user = await Users.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({ msg: 'Password is incorrect.' });

        const refreshToken = createRefreshToken({ id: user._id });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          path: '/user/refreshToken',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ msg: 'Login success!' });
      } else {
        const newUser = new Users({
          name,
          email,
          password: passwordHash,
          avatar: picture,
        });
        await newUser.save();

        const refreshToken = createRefreshToken({ id: newUser._id });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          path: '/user/refreshToken',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ msg: 'Login success!' });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: '5m',
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = userController;
