import ApiClient from './src/ApiClient'

export function configureApiClient(token) {
  const client = ApiClient.instance
  client.basePath = import.meta.env.VITE_API_BASE?.trim() || 'https://saglikta-7d7a2dbc0cf4.herokuapp.com'
  client.defaultHeaders = {
    ...(client.defaultHeaders || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  }
  return client
}

export function setAuthToken(token) {
  const client = ApiClient.instance
  client.defaultHeaders = {
    ...(client.defaultHeaders || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  }
}


