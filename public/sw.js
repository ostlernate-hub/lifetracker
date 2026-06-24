self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Level Up!", {
      body: data.body || "Time to complete your quests!",
      icon: "/favicon.svg",
      tag: "lt-reminder",
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
