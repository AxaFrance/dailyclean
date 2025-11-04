export const createMockResponse = (
  status: number,
  jsonData: unknown,
): Response => {
  return {
    status,
    ok: status < 300,
    headers: new Headers(),
    redirected: false,
    statusText: status < 300 ? "OK" : "Error",
    type: "basic" as ResponseType,
    url: "",
    body: null,
    bodyUsed: false,
    clone: () => createMockResponse(status, jsonData),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(""),
    json: () => Promise.resolve(jsonData),
  } as Response;
};

export const createMockFetch = (
  status: number,
  getCallback: () => unknown,
  postCallback?: (body: string) => void,
) => {
  return (url: string, config?: RequestInit): Promise<Response> => {
    if (config && config.method === "POST" && postCallback) {
      postCallback(config.body as string);
      return Promise.resolve(createMockResponse(status, {}));
    }
    return Promise.resolve(createMockResponse(status, getCallback()));
  };
};
