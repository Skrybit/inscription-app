import type { NextApiRequest, NextApiResponse } from 'next';
import { apiClient } from '../../../src/config'; // Adjust path
import { API_CONSTANTS } from '../../../src/constants/api'; // Adjust path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Payment status request headers:', req.headers);
    const { payment_address, required_amount_in_sats, sender_address, id } = req.body;
    if (!payment_address || !required_amount_in_sats || !sender_address || !id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const response = await apiClient.post(API_CONSTANTS.ENDPOINTS.INSCRIPTIONS.PAYMENT_STATUS, {
      payment_address,
      required_amount_in_sats,
      sender_address,
      id,
    }, {
      headers: {
        'Accept': 'application/json',
        'authorization': req.headers.authorization || req.headers.Authorization || '',
      },
    });
    console.log('Payment status response:', response.data);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Skrybit API error (payment status):', {
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