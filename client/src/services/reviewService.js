import API from './api';

export const createReview = async (data) => {
  const response = await API.post('/reviews', data);
  return response.data;
};

export const getUserReviews = async (userId) => {
  const response = await API.get(`/reviews/user/${userId}`);
  return response.data;
};
