// In src/api/common.js
export const showNotificationMsg = (msg, type = "info") => {
    alert(`${type.toUpperCase()}: ${msg}`);
  };
  