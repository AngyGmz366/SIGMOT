import axios from 'axios';
import { attachInterceptors } from './logs';

/**
 * Instancia principal de Axios para APIs del backend (MySQL / Next.js API routes).
 */
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '',
  headers: { 'Content-Type': 'application/json' },
});

// 👉 activa interceptores
attachInterceptors(http);

/**
 * 🔹 Helper universal para hacer GET con `fetch`
 * Ideal para componentes React (useEffect, etc.) donde no conviene usar axios directamente.
 * Evita cache y maneja errores de forma simple.
 */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Error ${res.status} al obtener ${url}`);
  }
  return res.json() as Promise<T>;
}
