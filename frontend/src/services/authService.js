import API from './api';

export const loginUser = async (form) => {
  const response = await API.post('/auth/login', form);

  return response.data;
};

export const logoutUser = async () => {
  try {
    await API.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};