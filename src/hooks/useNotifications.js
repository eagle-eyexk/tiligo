import { useState, useCallback } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notify = useCallback((title, body) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: "https://media.base44.com/images/public/user_69e68678ce0d9fdef245009b/8f0358955_IMG_0105.jpeg",
        badge: "https://media.base44.com/images/public/user_69e68678ce0d9fdef245009b/8f0358955_IMG_0105.jpeg",
      });
    } catch (e) {}
  }, []);

  return { permission, requestPermission, notify };
}