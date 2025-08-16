import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { Blob } from 'node:buffer';
import { apiClient } from '../../../src/config'; // Adjust path
import { API_CONSTANTS } from '../../../src/constants/api'; // Adjust path

const upload = multer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Incoming request headers:', req.headers);
    console.log('Incoming request method:', req.method);

    const formDataPromise = new Promise((resolve, reject) => {
      upload.any()(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    await formDataPromise;

    console.log('req.body:', req.body);
    console.log('req.files:', (req as any).files);

    const recipient_address = req.body.recipient_address;
    const fee_rate = req.body.fee_rate;
    const sender_address = req.body.sender_address;
    const files = (req as any).files as any[];
    const file = files?.find((f) => f.fieldname === 'file');

    if (!file || !recipient_address || !fee_rate) {
      return res.status(400).json({
        message: 'Missing required fields or file',
        details: {
          hasFile: !!file,
          hasRecipientAddress: !!recipient_address,
          hasFeeRate: !!fee_rate,
          body: req.body,
          files: files ? files.map((f) => ({ fieldname: f.fieldname, originalname: f.originalname })) : null,
        },
      });
    }

    const feeRateNum = parseFloat(fee_rate);
    if (isNaN(feeRateNum) || feeRateNum <= 0) {
      return res.status(400).json({
        message: 'Invalid fee_rate: must be a positive number',
        details: { fee_rate },
      });
    }

    const proxyFormData = new FormData();
    proxyFormData.append('recipient_address', recipient_address);
    proxyFormData.append('fee_rate', fee_rate);
    if (sender_address) proxyFormData.append('sender_address', sender_address);
    const fileBlob = new Blob([file.buffer], { type: file.mimetype });
    proxyFormData.append('file', fileBlob, file.originalname);

    console.log('Proxy FormData:', {
      recipient_address,
      fee_rate,
      sender_address,
      file: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    let response;
    try {
      response = await apiClient.post(API_CONSTANTS.ENDPOINTS.INSCRIPTIONS.CREATE_COMMIT, proxyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'authorization': req.headers.authorization || req.headers.Authorization || '',
        },
      });
      console.log('Skrybit API response:', response.data);
    } catch (apiError: any) {
      console.error('Skrybit API error:', {
        status: apiError.response?.status,
        data: apiError.response?.data,
        headers: apiError.response?.headers,
        message: apiError.message,
      });
      throw apiError;
    }

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error creating commit:', error);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.error || 'Internal server error',
      details: error.response?.data?.details || error.message,
    });
  }
}