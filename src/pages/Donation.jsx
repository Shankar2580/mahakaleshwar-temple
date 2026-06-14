import React, { useState, useEffect } from 'react';
import { CreditCard, Heart, FileCheck, CheckCircle, Printer } from 'lucide-react';
import RazorpayModal from '../components/RazorpayModal';

export default function Donation({ user, onAddBooking, setActivePage }) {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Receipt
  
  const [purpose, setPurpose] = useState('General Donation');
  const [amount, setAmount] = useState('500');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Autofill details
  useEffect(() => {
    if (user) {
      setName(user.name || 'Shankar');
      setMobile(user.mobile || '8828596372');
      if (user.mobile === '8828596372') {
        setPan('ABCDE1234F');
        setEmail('shankar@templedevotee.org');
      }
    }
  }, [user]);

  const handleDonate = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    if (mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setIsPayModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId) => {
    setIsPayModalOpen(false);
    
    const receiptRef = 'DN' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalDonation = {
      id: receiptRef,
      type: 'Temple Donation',
      purpose: purpose,
      amount: parseFloat(amount),
      donorName: name,
      donorMobile: mobile,
      donorEmail: email,
      donorPan: pan || 'Not Provided',
      paymentId: paymentId,
      bookingTime: new Date().toLocaleString()
    };
    
    setConfirmedBooking(finalDonation);
    onAddBooking(finalDonation); // Add to general list
    setStep(2);
  };

  return (
    <div className="container animated-page" style={{ marginTop: '2rem', maxWidth: '650px' }}>
      
      {step === 1 ? (
        /* Step 1: Donation Form */
        <div>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', marginBottom: '0.75rem' }}>
              <Heart size={36} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Make a Devotional Donation</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Contribute to welfare activities. All donations are exempted under Sec 80G of IT Act.</p>
          </div>

          <div style={{ backgroundColor: 'var(--white)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-light)', boxShadow: 'var(--shadow-sm)' }}>
            <form onSubmit={handleDonate}>
              
              <div className="form-group">
                <label className="form-label">Donation Purpose</label>
                <select className="form-control" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                  <option value="General Donation">General Donation (Temple Development)</option>
                  <option value="Annakshetra (Free Meals)">Annakshetra (Free Meals for Pilgrims)</option>
                  <option value="Gaushala (Cowshed Care)">Gaushala (Cowshed Care & Welfare)</option>
                  <option value="Temple Renovation / Garbha Griha">Temple Renovation & Garbha Griha Projects</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Donation Amount (INR)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--primary)' }}>
                    ₹
                  </span>
                  <input 
                    type="number" 
                    className="form-control"
                    style={{ paddingLeft: '2rem', fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary)' }}
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Donor Full Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" className="form-control" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email ID</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="optional" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PAN Number (Required for 80G tax exemption claim)</label>
                <input 
                  type="text" 
                  maxLength={10}
                  className="form-control" 
                  style={{ textTransform: 'uppercase' }}
                  value={pan} 
                  onChange={(e) => setPan(e.target.value.toUpperCase())} 
                  placeholder="e.g. ABCDE1234F"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ height: '45px', fontSize: '1rem', marginTop: '1.5rem' }}>
                Donate ₹ {amount ? parseFloat(amount).toFixed(2) : '0.00'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Step 2: Donation Receipt */
        <div className="animated-page">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '50%', marginBottom: '0.75rem' }}>
              <CheckCircle size={44} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ color: 'var(--success)' }}>Donation Successful!</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>We sincerely appreciate your contribution. Your donation receipt has been generated.</p>
          </div>

          <div className="ticket-paper">
            <div className="ticket-header" style={{ background: 'linear-gradient(135deg, #1A2530 0%, var(--primary) 100%)' }}>
              <h2>श्री महाकालेश्वर मंदिर प्रबंध समिति, उज्जैन</h2>
              <p>MAHAKALESHWAR CHARITABLE TRUST DONATION RECEIPT</p>
              <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: '1px solid #4CAF50', color: '#4CAF50', fontSize: '0.65rem', padding: '2px 6px', fontWeight: '800', borderRadius: '3px' }}>
                DONATED
              </div>
            </div>

            <div className="ticket-body">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--dark-gray)', textTransform: 'uppercase', fontWeight: '600' }}>Exempted Donation Amount</span>
                <h3 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontWeight: '800' }}>₹ {confirmedBooking.amount.toFixed(2)}</h3>
              </div>

              <div className="ticket-grid">
                <div>
                  <span className="ticket-field-label">Receipt Voucher ID</span>
                  <div className="ticket-field-value">{confirmedBooking.id}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Donation Purpose</span>
                  <div className="ticket-field-value" style={{ color: 'var(--primary)' }}>{confirmedBooking.purpose}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Donor Name</span>
                  <div className="ticket-field-value">{confirmedBooking.donorName}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Donor Phone</span>
                  <div className="ticket-field-value">+91 {confirmedBooking.donorMobile}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Donor PAN Card</span>
                  <div className="ticket-field-value" style={{ fontFamily: 'monospace' }}>{confirmedBooking.donorPan}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Payment ID Reference</span>
                  <div className="ticket-field-value" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{confirmedBooking.paymentId}</div>
                </div>
              </div>

              <div className="ticket-divider"></div>

              <div style={{ backgroundColor: 'var(--light)', border: '1px solid var(--gray-medium)', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--dark-gray)', textAlign: 'justify' }}>
                <FileCheck size={16} style={{ color: 'var(--success)', verticalAlign: 'middle', marginRight: '6px' }} />
                <strong>80G Tax Exemption Certificate:</strong> This receipt certifies that the donation of ₹{confirmedBooking.amount.toFixed(2)} made to Shri Mahakaleshwar Jyotirlinga, Ujjain is exempt under section 80G of the Income Tax Act, 1961. The exemption will be reflected on your PAN tax filing statement.
              </div>
            </div>

            <div className="ticket-footer">
              <p>Thank you for supporting the temple welfare initiatives. May Lord Shiva bless you and your family.</p>
              <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#888' }}>Receipt generated on {confirmedBooking.bookingTime}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setActivePage('services')} className="btn btn-secondary">
              Back to Services
            </button>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <RazorpayModal 
        isOpen={isPayModalOpen}
        amount={amount ? parseFloat(amount) : 0}
        onClose={() => setIsPayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
