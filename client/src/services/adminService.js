import API from './api';

export const getAdminStats = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await API.get('/admin/users', { params });
  return response.data;
};

export const toggleUserStatus = async (userId) => {
  const response = await API.put(`/admin/users/${userId}/status`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAdminSkills = async () => {
  const response = await API.get('/admin/skills');
  return response.data;
};

export const deleteSkill = async (skillId) => {
  const response = await API.delete(`/admin/skills/${skillId}`);
  return response.data;
};

export const getAdminExchanges = async () => {
  const response = await API.get('/admin/exchanges');
  return response.data;
};
