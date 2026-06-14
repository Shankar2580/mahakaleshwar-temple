import React, { useState } from 'react';
import { CreditCard, Landmark, QrCode, ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function RazorpayModal({ isOpen, amount, onClose, onPaymentSuccess }) {
  const [method, setMethod] = useState(''); // 'upi', 'card', 'netbanking' or empty
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('shankar@upi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment transaction
    setTimeout(() => {
      setLoading(false);
      const mockPayId = 'pay_' + Math.random().toString(36).substring(2, 11).toUpperCase();
      onPaymentSuccess(mockPayId);
    }, 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content razorpay-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Razorpay Header */}
        <div className="razorpay-topbar">
          <div>
            <div className="razorpay-logo">
              <span>Razorpay</span>
              <span style={{ fontSize: '0.65rem', border: '1px solid #3399cc', padding: '1px 3px', borderRadius: '3px' }}>TEST</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>Shri Mahakaleshwar Temple Committee</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="razorpay-amount">₹ {amount}</span>
            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Amount Payable</p>
          </div>
        </div>

        {/* Info bar */}
        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f5f7f8', borderBottom: '1px solid var(--gray-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--dark-gray)' }}>
          <span>Contact: <strong>+91 8828596372</strong></span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {loading ? (
            /* Loading State */
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #3399cc',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'scaleUp 1s infinite linear',
                margin: '0 auto 1.5rem auto'
              }}></div>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Processing Payment...</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--dark-gray)' }}>Please do not close this window or refresh the page.</p>
            </div>
          ) : !method ? (
            /* Method Selection */
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--dark)', marginBottom: '1rem' }}>
                Cards, UPI & More
              </p>
              
              <div className="payment-options-list">
                <div className="payment-option-item" onClick={() => setMethod('upi')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <QrCode style={{ color: '#3399cc' }} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block' }}>UPI (GPay, PhonePe, UPI ID)</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--dark-gray)' }}>Pay instantly via your mobile app</span>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: '#ccc' }} />
                </div>

                <div className="payment-option-item" onClick={() => setMethod('card')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CreditCard style={{ color: '#3399cc' }} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block' }}>Card (Visa, Mastercard, RuPay)</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--dark-gray)' }}>Debit or Credit Cards</span>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: '#ccc' }} />
                </div>

                <div className="payment-option-item" onClick={() => setMethod('netbanking')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Landmark style={{ color: '#3399cc' }} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block' }}>Netbanking</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--dark-gray)' }}>Select from major Indian banks</span>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: '#ccc' }} />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', color: '#2e7d32', fontWeight: '500' }}>
                <ShieldCheck size={16} /> Razorpay Trusted Business. 128-bit encryption.
              </div>
            </div>
          ) : (
            /* Method Input Details Form */
            <div>
              <button 
                onClick={() => setMethod('')} 
                style={{ background: 'none', border: 'none', color: '#3399cc', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ← Back to payment options
              </button>

              <form onSubmit={handlePay}>
                {method === 'upi' && (
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', marginBottom: '1rem' }}>Enter UPI ID</h4>
                    <div className="form-group">
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. shankar@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--dark-gray)', marginBottom: '1.5rem' }}>
                      A payment request will be sent to this UPI ID. Open your UPI app and authorize the payment.
                    </p>
                  </div>
                )}

                {method === 'card' && (
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', marginBottom: '1rem' }}>Enter Card Details</h4>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input 
                        type="text" 
                        maxLength={19}
                        className="form-control"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          className="form-control"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 2) {
                              value = value.substring(0,2) + '/' + value.substring(2,4);
                            }
                            setCardExpiry(value);
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          className="form-control"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === 'netbanking' && (
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', marginBottom: '1rem' }}>Select Bank</h4>
                    <div className="form-group">
                      <select className="form-control" required>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--dark-gray)', marginBottom: '1.5rem' }}>
                      You will be redirected to your bank's secure page to complete the transaction.
                    </p>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-block"
                  style={{ backgroundColor: '#3399cc', color: '#ffffff', height: '42px', fontWeight: '600' }}
                >
                  Pay ₹ {amount}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
