export const isEmpty = (value) => {
  if (!value) return true;
  return false;
};

export const isEmail = (email) => {
  const re =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(email);
};

export const isLength = (password) => {
  if (password.length < 6) return true;
  return false;
};

export const isMatch = (password, confirmPassword) => {
  if (password === confirmPassword) return true;
  return false;
};
