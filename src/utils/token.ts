// src/utils/token.ts
import { jwtDecode } from 'jwt-decode'; // Use named import

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token); // Use jwtDecode
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true; // Treat invalid tokens as expired
  }
}