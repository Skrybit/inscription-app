import type { NextApiRequest, NextApiResponse } from 'next';
import { apiClient } from '../../../src/config';
import { API_CONSTANTS } from '../../../src/constants/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    console.log('Get sender request headers:', req.headers);
    const response = await apiClient.get(API_CONSTANTS.ENDPOINTS.INSCRIPTIONS.GET_SENDER(address), {
      headers: {
        'Accept': 'application/json',
        'authorization': req.headers.authorization || req.headers.Authorization || '',
      },
    });
    console.log('Get sender response:', response.data);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Skrybit API error (get sender):', {
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