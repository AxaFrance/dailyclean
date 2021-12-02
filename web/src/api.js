
export const urls = {
    podStart: "/pods/start", 
    podStop: "/pods/stop",
    timeranges: "/timeranges",
    status: "/status"
};

export const postAsync = fetch => async (url, data) => {
    if(!data){
      data = {}
    }
    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      withCredentials: true,
      method: 'POST',
      body: JSON.stringify(data),
    };
    return fetch(url, config);
  };

export const getAsync = fetch => async (url) => {
    const config = {
        headers: {
            Accept: 'application/json',
        },
        withCredentials: true,
        method: 'GET',
    };
    return fetch(url, config);
};

