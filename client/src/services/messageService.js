import API from './api';

export const getMessagesByExchange = async (exchangeId) => {
  const response = await API.get(`/messages/${exchangeId}`);
  return response.data;
};

export const sendMessage = async (data) => {
  const response = await API.post('/messages', data);
  return response.data;
};
