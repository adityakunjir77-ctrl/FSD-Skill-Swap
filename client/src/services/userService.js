import API from './api';

export const updateProfile = async (profileData) => {
  const response = await API.put('/users/profile', profileData);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await API.get(`/users/${userId}`);
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await API.get('/users', { params });
  return response.data;
};
