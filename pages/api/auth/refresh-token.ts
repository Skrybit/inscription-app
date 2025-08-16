import type { NextApiRequest, NextApiResponse } from 'next';
import { apiClient } from '../../../src/config'; // Adjust path
import { API_CONSTANTS } from '../../../src/constants/api'; // Adjust path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Refresh token request headers:', req.headers);
    const response = await apiClient.post(API_CONSTANTS.ENDPOINTS.AUTH.REFRESH_TOKEN, {}, {
      headers: {
        'Accept': 'application/json',
        'authorization': req.headers.authorization || req.headers.Authorization || '',
      },
    });
    const newToken = response.data?.token;
    if (newToken) {
      res.status(200).json({ message: 'Token refreshed', token: newToken });
    } else {
      res.status(400).json({ message: 'No new token returned' });
    }
  } catch (error: any) {
    console.error('Token refresh error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
    });
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error || 'Internal server error',
      details: error.response?.data?.details || error.message,
    });
  }
}