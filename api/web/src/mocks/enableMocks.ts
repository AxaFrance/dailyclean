export const enableMocks = async () => {
  if (import.meta.env.DEV !== true) {
    return;
  }

  const { worker } = await import("./browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  const result = await worker.start({
    onUnhandledRequest: "warn",
  });

  return result;
};
