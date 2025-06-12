// Function to save notification
export const saveNotification = (userId, notification) => {
  const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
  notifications[userId] = notifications[userId] || [];
  notifications[userId].unshift({
    ...notification,
    id: Date.now(),
    isRead: false,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('notifications', JSON.stringify(notifications));
};

// Function to get notifications for a user
export const getNotifications = (userId) => {
  const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
  return notifications[userId] || [];
};

// Function to mark notification as read
export const markNotificationAsRead = (userId, notificationId) => {
  const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
  const userNotifications = notifications[userId] || [];
  const updatedNotifications = userNotifications.map(notification => 
    notification.id === notificationId ? { ...notification, isRead: true } : notification
  );
  notifications[userId] = updatedNotifications;
  localStorage.setItem('notifications', JSON.stringify(notifications));
};
