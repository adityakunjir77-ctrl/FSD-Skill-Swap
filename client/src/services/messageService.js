import API from './api';

// params: { cursor, limit }; pass the previous response's nextCursor for older messages
export const getMessagesByExchange = async (exchangeId, params = {}) => {
  const response = await API.get(`/messages/${exchangeId}`, { params });
  return response.data;
};

export const sendMessage = async (data) => {
  const response = await API.post('/messages', data);
  return response.data;
};
