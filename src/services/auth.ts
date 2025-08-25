import Cookies from 'js-cookie';

export const initializeAuthToken = () => {
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
  if (token) {
    console.log('Initializing auth token from environment variable');
    Cookies.set('authToken', token);
  } else {
    console.warn('No auth token found in environment variable NEXT_PUBLIC_AUTH_TOKEN');
  }
};