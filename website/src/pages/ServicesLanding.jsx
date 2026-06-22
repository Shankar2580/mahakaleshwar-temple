import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, Home, Loader, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function ServicesLanding({ user, onOpenLogin, setActivePage, setSelectedDarshanType }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const types = await api.bookingTypes();
        
        const orderMap = {
          'BHASMA_AARTI': { rank: 1, label: 'Bhasma Aarti' },
          'BHASMA_TATKAL': { rank: 2, label: 'Bhasma Aarti — Tatkal' },
          'VIP_DARSHAN': { rank: 3, label: 'Shighra Darshan (₹250)' },
          'SHAYAN_AARTI': { rank: 4, label: 'Shayan Aarti (Night)' },
          'SANDHYA_AARTI': { rank: 5, label: 'Sandhya Aarti (Evening)' },
          'PROTOCOL': { rank: 6, label: 'Protocol / Govt-VIP' }
        };

        // Map backend types to standard cards with sorting and filtering
        const darshanCards = types
          .filter(t => t.code !== 'GARBH_GRAH')
          .sort((a, b) => (orderMap[a.code]?.rank || 99) - (orderMap[b.code]?.rank || 99))
          .map(t => ({
            id: t.code,
            isDarshan: true,
            title: orderMap[t.code]?.label || t.label,
            description: t.note || 'Book your darshan slot.',
            price: t.price ? `₹ ${t.price} / Person` : 'Free / Allocation',
            actionText: 'Book Now',
            icon: <Calendar size={24} style={{ color: 'var(--primary)' }} />,
            available: true,
            note: null
          }));

        // Append static lodging & donation
        const staticCards = [
          {
            id: 'bhaktniwas',
            isDarshan: false,
            title: 'Bhaktniwas (Dharamshala Rooms)',
            description: 'Comfortable budget lodging and room reservations at the official temple guest houses (Bhaktniwas, Shivniwas). AC & Non-AC rooms available.',
            price: 'From ₹ 500 / Night',
            actionText: 'Book Room',
            icon: <Home size={24} style={{ color: 'var(--primary)' }} />,
            available: true
          },
          {
            id: 'donation',
            isDarshan: false,
            title: 'Donation (Annakshetra / Temple)',
            description: 'Support temple welfare activities, free food distribution (Annakshetra), and ongoing temple renovation projects. Tax benefits under Section 80G.',
            price: 'Custom Amount',
            actionText: 'Donate Now',
            icon: <CreditCard size={24} style={{ color: 'var(--primary)' }} />,
            available: true
          }
        ];

        setServices([...darshanCards, ...staticCards]);
      } catch (err) {
        console.error("Failed to load booking types", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const handleServiceClick = (service) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    if (service.isDarshan) {
      if (setSelectedDarshanType) setSelectedDarshanType(service.id);
      setActivePage('sheeghra-darshan');
    } else {
      setActivePage(service.id);
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--primary)' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
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
                      onClick={() => handleServiceClick(service)} 
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
        )}
      </div>
    </div>
  );
}
