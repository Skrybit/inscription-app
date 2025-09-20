export const API_CONSTANTS = {
  ENDPOINTS: {
    INSCRIPTIONS: {
      CREATE_COMMIT: '/inscriptions/create-commit',
      PAYMENT_STATUS: '/payments/status',
      GET_BY_ID: (id: string) => `/inscriptions/${id}`,
      GET_SENDER: (sender: string) => `/inscriptions/sender/${sender}`,
      STATS: '/inscriptions/stats',
    },
    AUTH: {
      SIGNIN: '/auth/signin',
      SIGNUP: '/auth/signup',
      REVOKE_TOKEN: '/auth/revoke-token',
      NEW_TOKEN: '/auth/new-token',
      REFRESH_TOKEN: '/auth/refresh',
      VERIFY: '/auth/verify',
    },
    BRC20: {
      DEPLOY: '/brc20/deploy',
      CHECK_TICKER: (ticker: string) => `/brc20/check-ticker/${ticker}`,
      MINT: '/brc20/mint',
    },
  },
  PROXY: {
    INSCRIPTIONS: {
      CREATE_COMMIT: '/api/inscriptions/create-commit',
      PAYMENT_STATUS: '/api/inscriptions/payment-status',
      GET_BY_ID: (id: string) => `/api/inscriptions/${id}`,
      GET_SENDER: (sender: string) => `/api/inscriptions/get-sender?address=${sender}`,
      STATS: '/api/inscriptions/stats',
    },
    AUTH: {
      SIGNIN: '/api/auth/signin',
      SIGNUP: '/api/auth/signup',
      REVOKE_TOKEN: '/api/auth/revoke-token',
      NEW_TOKEN: '/api/auth/new-token',
      REFRESH_TOKEN: '/api/auth/refresh-token',
      VERIFY: '/api/auth/verify',
    },
    BRC20: {
      DEPLOY: 'https://api.skrybit.io/brc20/deploy',
      CHECK_TICKER: (ticker: string) => `https://api.skrybit.io/brc20/check-ticker/${ticker}`,
      MINT: 'https://api.skrybit.io/brc20/mint',
    },
  },
} as const;