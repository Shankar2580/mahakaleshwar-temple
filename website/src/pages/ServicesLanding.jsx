import React from 'react';
import { Calendar, CreditCard, Home, FileText, ArrowRight } from 'lucide-react';

export default function ServicesLanding({ user, onOpenLogin, setActivePage }) {
  const services = [
    {
      id: 'sheeghra-darshan',
      title: 'Sheeghra Darshan (Quick Darshan)',
      description: 'Quick entry ticket system for darshan at Shri Mahakaleshwar Temple. Avoid long queues and get prioritized entry within selected time slots.',
      price: '₹ 250 / Person',
      actionText: 'Book Now',
      icon: <Calendar size={24} style={{ color: 'var(--primary)' }} />,
      available: true
    },
    {
      id: 'bhaktniwas',
      title: 'Bhaktniwas (Dharamshala Rooms)',
      description: 'Comfortable budget lodging and room reservations at the official temple guest houses (Bhaktniwas, Shivniwas). AC & Non-AC rooms available.',
      price: 'From ₹ 500 / Night',
      actionText: 'Book Room',
      icon: <Home size={24} style={{ color: 'var(--primary)' }} />,
      available: true
    },
    {
      id: 'donation',
      title: 'Donation (Annakshetra / Temple)',
      description: 'Support temple welfare activities, free food distribution (Annakshetra), and ongoing temple renovation projects. Tax benefits under Section 80G.',
      price: 'Custom Amount',
      actionText: 'Donate Now',
      icon: <CreditCard size={24} style={{ color: 'var(--primary)' }} />,
      available: true
    },
    {
      id: 'bhasma-aarti',
      title: 'Tatkal Bhasma Aarti Booking',
      description: 'Request online seat allocation for the famous early morning Bhasma Aarti ritual. Seats are allocated via an automated daily draw system.',
      price: 'Free / Allocation',
      actionText: 'Apply Now',
      icon: <FileText size={24} style={{ color: 'var(--primary)' }} />,
      available: false,
      note: 'Advance slot booking full. Tatkal draws open daily at 6:00 PM.'
    },
    {
      id: 'pujan-booking',
      title: 'Pujan & Abhishek Booking',
      description: 'Book official priests (Pujaris) for special rituals inside the temple, such as Rudrabhishek, Mahapuja, or Laghurudra.',
      price: 'From ₹ 1,500 / Pujan',
      actionText: 'Book Puja',
      icon: <Calendar size={24} style={{ color: 'var(--primary)' }} />,
      available: false,
      note: 'Rituals restricted inside Garbhagriha due to VIP events.'
    }
  ];

  const handleServiceClick = (serviceId) => {
    if (serviceId === 'sheeghra-darshan' || serviceId === 'bhaktniwas' || serviceId === 'donation') {
      if (!user) {
        onOpenLogin();
      } else {
        setActivePage(serviceId);
      }
    }
  };

  return (
    <div className="animated-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <h1>श्री महाकालेश्वर ज्योतिर्लिंग</h1>
        <p>Official Online Services Booking Portal - Shri Mahakaleshwar Temple Management Committee, Ujjain</p>
      </div>

      <div className="container">
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--dark)', marginBottom: '0.5rem' }}>
            Temple Booking Services
          </h2>
          <p style={{ color: 'var(--dark-gray)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            Book your darshan slots, guest house rooms, or donate to temple charity programs securely online.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid-3">
          {services.map((service) => (
            <div key={service.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%' }}>
                    {service.icon}
                  </div>
                  <h3 className="card-title" style={{ margin: 0, fontSize: '1.2rem' }}>
                    {service.title}
                  </h3>
                </div>
                
                <p className="card-text">{service.description}</p>
                
                {service.note && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontStyle: 'italic', marginBottom: '1rem', padding: '0.4rem 0.6rem', backgroundColor: 'var(--danger-light)', borderRadius: '4px' }}>
                    * {service.note}
                  </div>
                )}
              </div>

              <div className="card-footer">
                <span className="price-tag">{service.price}</span>
                {service.available ? (
                  <button 
                    onClick={() => handleServiceClick(service.id)} 
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {service.actionText} <ArrowRight size={14} />
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    disabled 
                    style={{ cursor: 'not-allowed' }}
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
