import axios from 'axios';

/**
 * Instancia preconfigurada de Axios para usar en el frontend.
 * Puedes agregar interceptores aquí (por ejemplo, para JWT).
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ejemplo de interceptor opcional para agregar token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('jwt');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
