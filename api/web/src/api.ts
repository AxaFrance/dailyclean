export const urls = {
  podStart: "/pods/start",
  podStop: "/pods/stop",
  timeranges: "/timeranges",
  status: "/status",
};

export const postAsync =
  (fetch: (url: string, config?: RequestInit) => Promise<Response>) =>
  async (url: string, data?: unknown) => {
    if (!data) {
      data = {};
    }
    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8",
      },
      withCredentials: true,
      method: "POST",
      body: JSON.stringify(data),
    };
    return await fetch(url, config);
  };

export const getAsync =
  (fetch: (url: string, config?: RequestInit) => Promise<Response>) =>
  async (url: string) => {
    const config = {
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
      method: "GET",
    };
    return await fetch(url, config);
  };
