import { useEffect } from 'react';
import Cookies from 'js-cookie';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    Cookies.set('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoibml0aGluQHNrcnliaXQuaW8iLCJpYXQiOjE3NTUzNzAxNTEsImV4cCI6MTc1Nzk2MjE1MX0.BkkcH4NH0YZ3Y8R37OiBp6g55-BqUK0AYWoOML-mnC4', {
      sameSite: 'strict',
      secure: false, // Set to true in production with HTTPS
    });
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;