import API from './api';

export const createSession = async (data) => {
  const response = await API.post('/sessions', data);
  return response.data;
};

export const getUserSessions = async (params = {}) => {
  const response = await API.get('/sessions', { params });
  return response.data;
};

export const updateSessionStatus = async (sessionId, status) => {
  const response = await API.put(`/sessions/${sessionId}/status`, { status });
  return response.data;
};
