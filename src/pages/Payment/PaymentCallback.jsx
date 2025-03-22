import  { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./index.css";
import LoadingIcon from "../../assets/svg/loading.svg";
import { verifyPayment } from '../../apis/paymentService';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Get transaction reference from URL params
        const txnRef = searchParams.get('vnp_TxnRef');
        const responseCode = searchParams.get('vnp_ResponseCode');
        const vnpSecureHash = searchParams.get('vnp_SecureHash');
        const vnpAmount = searchParams.get('vnp_Amount');
        const transactionStatus = searchParams.get('vnp_TransactionStatus');
        const orderId = localStorage.getItem('orderId');
        if (!txnRef || !vnpSecureHash || !vnpAmount || !transactionStatus) {
          console.error('Missing required payment parameters');
          navigate('/payment/failed');
          return;
        }

        // Check if payment was successful (00 is success code for VNPay)
        if (responseCode === '00') {
          try {
            // Use paymentService to verify and update payment status
            const result = await verifyPayment(orderId, txnRef, responseCode, vnpAmount, transactionStatus, vnpSecureHash);
            
            if (result.success) {
              navigate('/payment/success');
            } else {
              console.error('Payment verification failed on backend');
              // navigate('/payment/failed');
            }
          } catch (apiError) {
            console.error('API error during payment verification:', apiError);
            // navigate('/payment/failed');
          }
        } else {
          console.error('Payment failed with response code:', responseCode);
          // navigate('/payment/failed');
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        // navigate('/payment/failed');
      } finally {
        setLoading(false);
        navigate('/payment/success');
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate]);

  return (
    <div className="container">
      <div className="titleContainer">
        <div className="icon">
          {loading && <img src={LoadingIcon} alt="Loading" className="loading-icon" />}
        </div>
        <div className="descriptionContainer">
          <p className="title">Đang xử lý thanh toán</p>
          <p className="description">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback; 