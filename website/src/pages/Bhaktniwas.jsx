import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, Hotel, ChevronRight, CheckCircle, Printer } from 'lucide-react';
import RazorpayModal from '../components/RazorpayModal';

export default function Bhaktniwas({ user, onAddBooking, setActivePage }) {
  const [step, setStep] = useState(1); // 1 = Search & Rooms, 2 = Guest Info, 3 = Ticket
  
  const [checkIn, setCheckIn] = useState('2026-06-23');
  const [checkOut, setCheckOut] = useState('2026-06-24');
  const [guests, setGuests] = useState('2');
  const [roomsCount, setRoomsCount] = useState('1');
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestAge, setGuestAge] = useState('');
  const [guestGender, setGuestGender] = useState('Male');
  const [guestIdType, setGuestIdType] = useState('Aadhaar Card');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Autofill if Shankar
  useEffect(() => {
    if (user && user.mobile === '8828596372') {
      setGuestName('Shankar');
      setGuestAge('35');
      setGuestGender('Male');
      setGuestIdType('Aadhaar Card');
      setGuestIdNumber('483285089973');
    }
  }, [user, step]);

  const roomsData = [
    {
      id: 'r-nonac',
      title: 'Standard Non-AC Room',
      description: 'Budget-friendly clean room. Twin beds, attached toilet-bathroom, charging socket, storage table. Suitable for pilgrims.',
      price: 500,
      amenities: 'Twin Beds • Attached Bathroom • Hot Water (Geyser)'
    },
    {
      id: 'r-ac',
      title: 'Standard AC Room',
      description: 'Comfortable air-conditioned room. Twin beds, attached modern toilet-bathroom, flat-screen TV, clothes rack.',
      price: 1200,
      amenities: 'AC • Twin Beds • TV • Attached Bathroom'
    },
    {
      id: 'r-deluxe-ac',
      title: 'Deluxe AC Room',
      description: 'Premium spacious air-conditioned room. King-size bed, sofa chairs, wardrobe, TV, geyser, temple view (subject to availability).',
      price: 1800,
      amenities: 'AC • King Bed • TV • Sofa Set • Geyser'
    },
    {
      id: 'r-family',
      title: 'Family Suite AC (4 Beds)',
      description: 'Large suite room ideal for families. 4 separate single beds, large attached bathroom, TV, seating lounge.',
      price: 2500,
      amenities: 'AC • 4 Single Beds • TV • Seating Area • Geyser'
    }
  ];

  // Number of nights calculation
  const getNightsCount = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const timeDiff = d2.getTime() - d1.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 1;
  };

  const nights = getNightsCount();
  const totalPrice = selectedRoom ? selectedRoom.price * nights * parseInt(roomsCount) : 0;

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setStep(2);
  };

  const handlePaymentSuccess = (paymentId) => {
    setIsPayModalOpen(false);
    
    const bookingRef = 'BN' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalBooking = {
      id: bookingRef,
      type: 'Dharamshala (Bhaktniwas)',
      roomName: selectedRoom.title,
      checkIn: checkIn,
      checkOut: checkOut,
      nights: nights,
      roomsCount: roomsCount,
      guestsCount: guests,
      amount: totalPrice,
      paymentId: paymentId,
      guestName: guestName,
      guestId: guestIdNumber,
      bookingTime: new Date().toLocaleString()
    };
    
    setConfirmedBooking(finalBooking);
    onAddBooking(finalBooking);
    setStep(3);
  };

  return (
    <div className="container animated-page" style={{ marginTop: '2rem' }}>
      
      {/* Search Header */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Book Dharamshala Room (Bhaktniwas)</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Secure comfortable budget rooms managed by the temple trust.</p>
          </div>

          {/* Search bar */}
          <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Check-in Date</label>
              <input type="date" className="form-control" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Check-out Date</label>
              <input type="date" className="form-control" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Guests Count</label>
              <select className="form-control" value={guests} onChange={(e) => setGuests(e.target.value)}>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label"><Hotel size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Rooms Count</label>
              <select className="form-control" value={roomsCount} onChange={(e) => setRoomsCount(e.target.value)}>
                <option value="1">1 Room</option>
                <option value="2">2 Rooms</option>
                <option value="3">3 Rooms</option>
              </select>
            </div>

            <button className="btn btn-primary" style={{ height: '42px', fontWeight: '700' }}>
              Search Rooms
            </button>
          </div>

          {/* Rooms Grid */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>
              Available Room Types for {nights} Night{nights > 1 ? 's' : ''} ({checkIn.split('-').reverse().join('/')} - {checkOut.split('-').reverse().join('/')})
            </h3>

            {roomsData.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-img">
                  <Hotel size={44} style={{ color: '#fffbf8aa' }} />
                </div>
                
                <div className="room-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--dark)' }}>{room.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#8b8480', margin: '4px 0 10px 0' }}>{room.amenities}</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>{room.description}</p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary)' }}>₹ {room.price}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--dark-gray)', display: 'block' }}>per Night</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--gray-light)', paddingTop: '1rem' }}>
                    <button 
                      onClick={() => handleBookRoom(room)} 
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Book Room <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Guest Information */}
      {step === 2 && selectedRoom && (
        <div className="animated-page" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Guest & Booking Details</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Fill in details for the primary room occupant. Physical ID cards will be verified.</p>
          </div>

          <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>
              Booking Summary: {selectedRoom.title}
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <span>Stay Period:</span>
              <strong>{checkIn.split('-').reverse().join('/')} to {checkOut.split('-').reverse().join('/')} ({nights} Night{nights > 1 ? 's' : ''})</strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <span>Rooms Count:</span>
              <strong>{roomsCount} Room{parseInt(roomsCount) > 1 ? 's' : ''}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', paddingTop: '0.5rem' }}>
              <span>Total Price:</span>
              <span>₹ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Form */}
          <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="form-group">
              <label className="form-label">Full Name of Primary Guest</label>
              <input type="text" className="form-control" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-control" value={guestAge} onChange={(e) => setGuestAge(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={guestGender} onChange={(e) => setGuestGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">ID Proof Type</label>
                <select className="form-control" value={guestIdType} onChange={(e) => setGuestIdType(e.target.value)}>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ID Card Number</label>
                <input type="text" className="form-control" value={guestIdNumber} onChange={(e) => setGuestIdNumber(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                Back to Rooms
              </button>
              <button 
                disabled={!guestName || !guestAge || !guestIdNumber}
                onClick={() => setIsPayModalOpen(true)} 
                className="btn btn-primary"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Voucher Receipt */}
      {step === 3 && confirmedBooking && (
        <div className="animated-page">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '50%', marginBottom: '0.75rem' }}>
              <CheckCircle size={44} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ color: 'var(--success)' }}>Bhaktniwas Room Booked!</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Your room booking is confirmed. Show this receipt at check-in counter.</p>
          </div>

          {/* High-fidelity Ticket Receipt */}
          <div className="ticket-paper">
            <div className="ticket-header">
              <h2>श्री महाकालेश्वर भक्त निवास - उज्जैन</h2>
              <p>MAHAKALESHWAR BHAKTNIWAS ROOM BOOKING RECEIPT</p>
              <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.65rem', padding: '2px 6px', fontWeight: '800', borderRadius: '3px' }}>
                PAID
              </div>
            </div>

            <div className="ticket-body">
              <div className="ticket-grid">
                <div>
                  <span className="ticket-field-label">Lodging Receipt ID</span>
                  <div className="ticket-field-value" style={{ color: 'var(--primary)' }}>{confirmedBooking.id}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Room Type Booked</span>
                  <div className="ticket-field-value">{confirmedBooking.roomName}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Check-in Date</span>
                  <div className="ticket-field-value">{confirmedBooking.checkIn.split('-').reverse().join('/')}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Check-out Date</span>
                  <div className="ticket-field-value">{confirmedBooking.checkOut.split('-').reverse().join('/')}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Booking Summary</span>
                  <div className="ticket-field-value">{confirmedBooking.roomsCount} Room({confirmedBooking.nights} Night)</div>
                </div>
                <div>
                  <span className="ticket-field-label">Primary Guest</span>
                  <div className="ticket-field-value">{confirmedBooking.guestName}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Guest ID Number</span>
                  <div className="ticket-field-value" style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>{confirmedBooking.guestId}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Total Amount Paid</span>
                  <div className="ticket-field-value">₹ {confirmedBooking.amount.toFixed(2)}</div>
                </div>
              </div>

              <div className="ticket-divider"></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span className="ticket-field-label">Payment ID Reference</span>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--dark)' }}>{confirmedBooking.paymentId}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="barcode-sim">BARCODE</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dark-gray)', marginTop: '2px', fontFamily: 'monospace' }}>
                    {confirmedBooking.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <p>Note: Check-in starts at 12:00 PM. Carry a printout of this voucher and matching physical ID card.</p>
              <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#888' }}>Receipt generated on {confirmedBooking.bookingTime}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setActivePage('services')} className="btn btn-secondary">
              Back to Services
            </button>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={16} /> Print Voucher
            </button>
          </div>
        </div>
      )}

      {/* Payment gateway */}
      <RazorpayModal 
        isOpen={isPayModalOpen}
        amount={totalPrice}
        onClose={() => setIsPayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
