import API from './api';

export const createSession = async (data) => {
  const response = await API.post('/sessions', data);
  return response.data;
};

export const getUserSessions = async () => {
  const response = await API.get('/sessions');
  return response.data;
};

export const updateSessionStatus = async (sessionId, status) => {
  const response = await API.put(`/sessions/${sessionId}/status`, { status });
  return response.data;
};
