export const API_CONSTANTS = {
  ENDPOINTS: {
    INSCRIPTIONS: {
      CREATE_COMMIT: '/inscriptions/create-commit',
      PAYMENT_STATUS: '/payments/status',
      GET_BY_ID: (id: string) => `/inscriptions/${id}`,
      GET_SENDER: (sender: string) => `/inscriptions/sender/${sender}`,
      CREATE_REVEAL: '/inscriptions/create-reveal',
      BROADCAST_REVEAL: '/transactions/broadcast-reveal',
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
  },
  PROXY: {
    INSCRIPTIONS: {
      CREATE_COMMIT: '/api/inscriptions/create-commit',
      PAYMENT_STATUS: '/api/inscriptions/payment-status',
      GET_BY_ID: '/api/inscriptions/get-by-id',
      GET_SENDER: '/api/inscriptions/get-sender',
      CREATE_REVEAL: '/api/inscriptions/create-reveal',
      BROADCAST_REVEAL: '/api/inscriptions/broadcast-reveal',
      STATS: '/api/inscriptions/stats',
    },
    AUTH: {
      SIGNIN: '/api/auth/signin',
      SIGNUP: '/api/auth/signup',
      REVOKE_TOKEN: '/api/auth/revoke-token',
      NEW_TOKEN: '/api/auth/new-token',
      REFRESH_TOKEN: '/api/auth/refresh-token', // Matches file path
      VERIFY: '/api/auth/verify',
    },
  },
} as const;