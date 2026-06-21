import React, { useState } from 'react';
import { Calendar, Home, CreditCard, ChevronRight, Printer, AlertCircle } from 'lucide-react';

export default function History({ bookings, setActivePage }) {
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handlePrint = (e) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div className="container animated-page" style={{ marginTop: '2rem' }}>
      
      {!selectedBooking ? (
        /* List View */
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>My Booking History</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>View, track, and reprint your active tickets, room reservations, and donation receipts.</p>
          </div>

          {bookings.length === 0 ? (
            /* Empty State */
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--gray-light)', padding: '3.5rem 2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <AlertCircle size={48} style={{ color: 'var(--secondary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Bookings Found</h3>
              <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
                You have not booked any services yet. Visit our services portal to book your Darshan tickets or Dharamshala accommodations.
              </p>
              <button onClick={() => setActivePage('services')} className="btn btn-primary">
                Explore Services
              </button>
            </div>
          ) : (
            /* Booking list */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  style={{
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--gray-light)',
                    borderLeft: `4px solid ${
                      booking.type.includes('Darshan') ? 'var(--primary)' : (booking.type.includes('Dharamshala') ? 'var(--secondary)' : '#1a2530')
                    }`,
                    padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  className="history-item-hover"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        backgroundColor: booking.type.includes('Darshan') ? 'var(--primary-light)' : (booking.type.includes('Dharamshala') ? '#fff9e6' : '#f0f4f8'),
                        color: booking.type.includes('Darshan') ? 'var(--primary)' : (booking.type.includes('Dharamshala') ? 'var(--warning)' : '#1a2530')
                      }}>
                        {booking.type}
                      </span>
                      <strong style={{ color: 'var(--dark-gray)', fontSize: '0.85rem' }}>#{booking.id}</strong>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', margin: '4px 0', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>
                      {booking.type.includes('Darshan') 
                        ? `Quick Darshan: ${booking.visitors.length} Visitor(s)`
                        : (booking.type.includes('Dharamshala') ? booking.roomName : booking.purpose)
                      }
                    </h4>

                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
                      Visit Date: {booking.date ? booking.date.split('-').reverse().join('/') : (booking.checkIn ? booking.checkIn.split('-').reverse().join('/') : booking.bookingTime.split(',')[0])}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>₹ {booking.amount.toFixed(2)}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>Confirmed</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                    >
                      View Receipt <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Voucher Detail / Receipt Page */
        <div className="animated-page">
          <button 
            onClick={() => setSelectedBooking(null)}
            className="btn btn-secondary"
            style={{ marginBottom: '1.5rem' }}
          >
            ← Back to History
          </button>

          {/* Ticket paper visualizer */}
          <div className="ticket-paper">
            <div className="ticket-header" style={{
              background: selectedBooking.type.includes('Darshan') 
                ? 'linear-gradient(135deg, var(--dark) 0%, var(--primary) 100%)' 
                : (selectedBooking.type.includes('Dharamshala') 
                  ? 'linear-gradient(135deg, var(--dark) 0%, var(--warning) 100%)'
                  : 'linear-gradient(135deg, #1A2530 0%, var(--primary) 100%)')
            }}>
              <h2>
                {selectedBooking.type.includes('Darshan') && 'श्री महाकालेश्वर मंदिर प्रबंध समिति, उज्जैन'}
                {selectedBooking.type.includes('Dharamshala') && 'श्री महाकालेश्वर भक्त निवास - उज्जैन'}
                {selectedBooking.type.includes('Donation') && 'श्री महाकालेश्वर मंदिर प्रबंध समिति, उज्जैन'}
              </h2>
              <p>
                {selectedBooking.type.includes('Darshan') && 'SHRI MAHAKALESHWAR TEMPLE MANAGEMENT COMMITTEE, UJJAIN'}
                {selectedBooking.type.includes('Dharamshala') && 'MAHAKALESHWAR BHAKTNIWAS ROOM BOOKING RECEIPT'}
                {selectedBooking.type.includes('Donation') && 'MAHAKALESHWAR CHARITABLE TRUST DONATION RECEIPT'}
              </p>
              <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.65rem', padding: '2px 6px', fontWeight: '800', borderRadius: '3px' }}>
                PAID
              </div>
            </div>

            <div className="ticket-body">
              {selectedBooking.type.includes('Donation') && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--dark-gray)', textTransform: 'uppercase', fontWeight: '600' }}>Exempted Donation Amount</span>
                  <h3 style={{ fontSize: '2.2rem', color: 'var(--primary)', fontWeight: '800' }}>₹ {selectedBooking.amount.toFixed(2)}</h3>
                </div>
              )}

              <div className="ticket-grid">
                <div>
                  <span className="ticket-field-label">Reference Booking ID</span>
                  <div className="ticket-field-value" style={{ color: 'var(--primary)' }}>{selectedBooking.id}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Voucher Type</span>
                  <div className="ticket-field-value">{selectedBooking.type}</div>
                </div>

                {selectedBooking.type.includes('Darshan') && (
                  <>
                    <div>
                      <span className="ticket-field-label">Date of Visit</span>
                      <div className="ticket-field-value">{selectedBooking.date.split('-').reverse().join('/')}</div>
                    </div>
                    <div>
                      <span className="ticket-field-label">Time Slot Slot</span>
                      <div className="ticket-field-value">{selectedBooking.slot}</div>
                    </div>
                  </>
                )}

                {selectedBooking.type.includes('Dharamshala') && (
                  <>
                    <div>
                      <span className="ticket-field-label">Room Type</span>
                      <div className="ticket-field-value">{selectedBooking.roomName}</div>
                    </div>
                    <div>
                      <span className="ticket-field-label">Stay Period</span>
                      <div className="ticket-field-value">
                        {selectedBooking.checkIn.split('-').reverse().join('/')} to {selectedBooking.checkOut.split('-').reverse().join('/')}
                      </div>
                    </div>
                    <div>
                      <span className="ticket-field-label">Booking Details</span>
                      <div className="ticket-field-value">{selectedBooking.roomsCount} Room(s) for {selectedBooking.nights} Night(s)</div>
                    </div>
                    <div>
                      <span className="ticket-field-label">Occupant Guest</span>
                      <div className="ticket-field-value">{selectedBooking.guestName}</div>
                    </div>
                  </>
                )}

                {selectedBooking.type.includes('Donation') && (
                  <>
                    <div>
                      <span className="ticket-field-label">Donation Purpose</span>
                      <div className="ticket-field-value">{selectedBooking.purpose}</div>
                    </div>
                    <div>
                      <span className="ticket-field-label">Donor Name</span>
                      <div className="ticket-field-value">{selectedBooking.donorName}</div>
                    </div>
                    <div>
                      <span className="ticket-field-label">Donor PAN Card</span>
                      <div className="ticket-field-value">{selectedBooking.donorPan}</div>
                    </div>
                  </>
                )}

                <div>
                  <span className="ticket-field-label">Payment ID Reference</span>
                  <div className="ticket-field-value" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedBooking.paymentId}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Total Amount Paid</span>
                  <div className="ticket-field-value">₹ {selectedBooking.amount.toFixed(2)}</div>
                </div>
              </div>

              <div className="ticket-divider"></div>

              {selectedBooking.type.includes('Darshan') && (
                <div>
                  <span className="ticket-field-label">Registered Visitors</span>
                  <table className="visitor-table" style={{ marginTop: '0.5rem' }}>
                    <thead>
                      <tr>
                        <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--gray-medium)' }}>Name</th>
                        <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--gray-medium)' }}>Age/Gender</th>
                        <th style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--gray-medium)' }}>ID Card Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBooking.visitors.map((v, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '600' }}>{v.name}</td>
                          <td>{v.age} Yrs / {v.gender}</td>
                          <td style={{ fontFamily: 'monospace' }}>{v.idType} - {v.idNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedBooking.type.includes('Donation') && (
                <div style={{ backgroundColor: 'var(--light)', border: '1px solid var(--gray-medium)', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--dark-gray)', textAlign: 'justify' }}>
                  <strong>80G Tax Exemption Certificate:</strong> This receipt certifies that the donation of ₹{selectedBooking.amount.toFixed(2)} made to Shri Mahakaleshwar Jyotirlinga, Ujjain is exempt under section 80G of the Income Tax Act, 1961. The exemption will be reflected on your PAN tax filing statement.
                </div>
              )}

              {selectedBooking.type.includes('Dharamshala') && (
                <div style={{ fontSize: '0.85rem', color: 'var(--dark-gray)' }}>
                  <strong>Occupant Guest Details:</strong> Booking is registered under primary guest <em>{selectedBooking.guestName}</em> (ID: {selectedBooking.guestId}). Please carry a physical printout of this voucher to the guesthouse reception counter.
                </div>
              )}

              <div className="ticket-divider"></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span className="ticket-field-label">Status</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '700' }}>Transaction Successful</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="barcode-sim">BARCODE</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dark-gray)', marginTop: '2px', fontFamily: 'monospace' }}>
                    {selectedBooking.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <p>Generated on {selectedBooking.bookingTime} from the Shri Mahakaleshwar Temple Management Committee Portal.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
