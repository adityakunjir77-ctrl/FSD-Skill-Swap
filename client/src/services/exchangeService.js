import API from './api';

export const createExchange = async (data) => {
  const response = await API.post('/exchanges', data);
  return response.data;
};

// params: { cursor, limit, status } for paging and filtering
export const getUserExchanges = async (params = {}) => {
  const response = await API.get('/exchanges', { params });
  return response.data;
};

export const updateExchangeStatus = async (exchangeId, status) => {
  const response = await API.put(`/exchanges/${exchangeId}/status`, { status });
  return response.data;
};
