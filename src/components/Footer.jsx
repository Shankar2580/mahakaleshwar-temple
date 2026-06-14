import React from 'react';
import { Phone, Mail, MapPin, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1e1510', borderTop: '4px solid #e5a93b', color: '#ffffffdd', padding: '3rem 0 1.5rem 0', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Temple Contacts */}
          <div>
            <h3 style={{ color: '#e5a93b', fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
              Contact Office
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={18} style={{ color: '#e5a93b', flexShrink: 0, marginTop: '2px' }} />
                <span>Shri Mahakaleshwar Temple Management Committee, Ujjain (M.P.), India</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: '#e5a93b' }} />
                <span>+91 734-2550563, 2570300</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: '#e5a93b' }} />
                <span>office@shrimahakaleshwar.com</span>
              </li>
            </ul>
          </div>

          {/* Quick Info & Links */}
          <div>
            <h3 style={{ color: '#e5a93b', fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
              Useful Links
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li><a href="#" style={{ color: '#ffffffaa' }} onClick={(e) => e.preventDefault()}>About Ujjain City</a></li>
              <li><a href="#" style={{ color: '#ffffffaa' }} onClick={(e) => e.preventDefault()}>Temple History & Legend</a></li>
              <li><a href="#" style={{ color: '#ffffffaa' }} onClick={(e) => e.preventDefault()}>Daily Rituals & Aarti Timings</a></li>
              <li><a href="#" style={{ color: '#ffffffaa' }} onClick={(e) => e.preventDefault()}>Dharamshala Guidelines</a></li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h3 style={{ color: '#e5a93b', fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
              Important Security
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#ffffffaa', marginBottom: '1rem' }}>
              Carrying mobile phones, cameras, or electronic gadgets inside the Garbhagriha is strictly prohibited. Keep your booking receipts and Aadhaar card handy.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#e5a93b' }}>
              <Shield size={16} /> Secure SSL Booking Portal
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div style={{ borderTop: '1px solid #ffffff1a', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#ffffff77' }}>
          <p>© {new Date().getFullYear()} Shri Mahakaleshwar Temple Management Committee, Ujjain. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: '#ffffff77' }} onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#" style={{ color: '#ffffff77' }} onClick={(e) => e.preventDefault()}>Terms & Conditions</a>
            <a href="#" style={{ color: '#ffffff77' }} onClick={(e) => e.preventDefault()}>Refund Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
