import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Cookies from 'js-cookie';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get authentication headers with token
export function getAuthHeaders() {
  const token = Cookies.get('authToken');
  return token ? { authorization: `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
}