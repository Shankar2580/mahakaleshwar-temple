import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck, HelpCircle } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState(1); // 1 = Input Phone, 2 = Input OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMobile('');
      setStep(1);
      setOtp(['', '', '', '', '', '']);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Handle backspace back-focus
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6 || !/^\d+$/.test(otpString)) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    
    setLoading(true);
    
    // Simulate API verification delay
    setTimeout(() => {
      setLoading(false);
      
      // Setup mock profile depending on mobile
      const profile = {
        mobile: mobile,
        name: mobile === '8828596372' ? 'Shankar' : 'Guest Visitor',
        idType: 'Aadhaar Card',
        idNumber: mobile === '8828596372' ? '483285089973' : ''
      };
      
      onLoginSuccess(profile);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Secure Login</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500' }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            /* Step 1: Mobile Number Input */
            <form onSubmit={handleSendOtp}>
              <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', marginBottom: '1.25rem' }}>
                Please enter your registered 10-digit mobile number. We will send a verification code (OTP).
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-gray)', fontWeight: '600' }}>
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    className="form-control"
                    style={{ paddingLeft: '3rem' }}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {mobile === '8828596372' && (
                <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <strong>Recognized Tester Profile:</strong> Signing in will auto-fill name <em>Shankar</em> and Aadhaar <em>483285...</em> during booking.
                  </span>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
                style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Entry */
            <form onSubmit={handleVerifyOtp}>
              <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', marginBottom: '0.5rem' }}>
                One-Time Password (OTP) has been sent to <strong>+91 {mobile}</strong>.
              </p>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}
              >
                Change Mobile Number
              </button>

              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP</label>
                <div className="otp-inputs">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="otp-box"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      required
                    />
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--dark-gray)', marginBottom: '1.25rem', textAlign: 'center' }}>
                <HelpCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--primary)' }} />
                <span>Simulated Mode: You can enter any 6 numbers (e.g., <strong>123456</strong>) to verify.</span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
                style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
