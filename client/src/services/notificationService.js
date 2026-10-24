import API from './api';

export const getUserNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId = 'all') => {
  const response = await API.put(`/notifications/${notificationId}/read`);
  return response.data;
};
