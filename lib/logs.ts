import type { AxiosInstance } from 'axios';

/**
 * Registra interceptores globales (auth + logs + manejo de errores)
 */
export function attachInterceptors(http: AxiosInstance) {
  // 🔹 Request: antes de enviar la petición
  http.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('APP_TOKEN'); // o Firebase getIdToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log básico de requests
      console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, config);

      return config;
    },
    (error) => {
      console.error('[HTTP Request Error]', error);
      return Promise.reject(error);
    }
  );

  // 🔹 Response: después de recibir la respuesta
  http.interceptors.response.use(
    (response) => {
      console.log(`[HTTP Response] ${response.status} ${response.config.url}`, response.data);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(
          `[HTTP Response Error] ${error.response.status} ${error.config?.url}`,
          error.response.data
        );

        // Manejo centralizado de errores comunes
        if (error.response.status === 401) {
          localStorage.removeItem('APP_TOKEN');
          window.location.href = '/auth/login'; // redirigir si expira la sesión
        }
      } else {
        console.error('[HTTP Error]', error.message);
      }
      return Promise.reject(error);
    }
  );
}
