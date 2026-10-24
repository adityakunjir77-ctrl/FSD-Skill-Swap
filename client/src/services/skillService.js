import API from './api';

export const getSkills = async (params = {}) => {
  const response = await API.get('/skills', { params });
  return response.data;
};

export const getSkillCategories = async () => {
  const response = await API.get('/skills/categories');
  return response.data;
};

export const createSkill = async (skillData) => {
  const response = await API.post('/skills', skillData);
  return response.data;
};

export const getRecommendedMatches = async () => {
  const response = await API.get('/matches');
  return response.data;
};
