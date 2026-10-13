const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/leave-service';

async function request(path, { auth = true, ...fetchOpts } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers ?? {}),
  };

  if (auth) {
    const token = localStorage.getItem('jwt');
    if (token) headers['Authorisation'] = token;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOpts,
    headers,
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    // not JSON body
  }

  if (!response.ok) {
    const error = new Error(body?.message ?? `HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
    
  }

  return { data: body?.data ?? null, message: body?.message, status: response.status };
}

export const apiClient = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) =>
    request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  patch: (path, body, opts) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: (path, body, opts) =>
    request(path, { method: 'DELETE', body: JSON.stringify(body), ...opts }),
};
