// services/unreadService.js
let unreadCount = 0;
const listeners = [];

export const getUnreadCount = () => unreadCount;

export const setUnreadCount = (count) => {
  unreadCount = count;
  listeners.forEach(fn => fn(count));
};

export const subscribeToUnread = (callback) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};