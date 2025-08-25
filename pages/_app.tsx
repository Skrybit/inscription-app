import { useEffect } from 'react';
import Cookies from 'js-cookie';
import '../styles/globals.css';
import { Toaster } from '@/src/components/ui/sonner';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    if (token) {
      Cookies.set('authToken', token, {
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      console.error('No NEXT_PUBLIC_AUTH_TOKEN found in environment variables');
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default MyApp;