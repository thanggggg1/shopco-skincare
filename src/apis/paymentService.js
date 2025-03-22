import axiosClient from './axiosClient';

// Function to verify payment
export const verifyPayment = async (orderId, transactionRef, responseCode, amount, transactionStatus, secureHash) => {
  try {
    const response = await axiosClient.get('/api/Payments/PaymentCallback', {
      params: {
        orderId: orderId,
        vnp_TxnRef: transactionRef,
        vnp_ResponseCode: responseCode,
        vnp_Amount: amount,
        vnp_TransactionStatus: transactionStatus,
        vnp_SecureHash: secureHash
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 