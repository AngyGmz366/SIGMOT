import axios from 'axios';
import { attachInterceptors } from './logs';

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '',
  headers: { 'Content-Type': 'application/json' },
});

// 👉 activa interceptores
attachInterceptors(http);
