import React from 'react';
import { User, Calendar, LogOut, Heart, Home, Phone } from 'lucide-react';

export default function Header({ user, onLogout, onOpenLogin, activePage, setActivePage }) {
  return (
    <header style={{ backgroundColor: '#1e1510', borderBottom: '3px solid #e5a93b', color: '#ffffff', padding: '0.8rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActivePage('services')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <img 
            src="/favicon.ico" 
            alt="Logo" 
            className="nav-logo-img"
            onError={(e) => {
              e.target.style.display = 'none'; // Fallback if icon isn't loaded
            }}
          />
          <div>
            <h2 style={{ color: '#e5a93b', fontSize: '1.25rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
              Shri Mahakaleshwar
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#ffffffaa', margin: 0, letterSpacing: '0.5px' }}>
              Jyotirlinga, Ujjain (Booking Portal)
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => setActivePage('services')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: activePage === 'services' ? '#e5a93b' : '#ffffff', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.95rem'
            }}
          >
            <Home size={16} /> Services
          </button>
          
          {user ? (
            <>
              <button 
                onClick={() => setActivePage('history')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: activePage === 'history' ? '#e5a93b' : '#ffffff', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.95rem'
                }}
              >
                <Calendar size={16} /> My Bookings
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid #ffffff33', paddingLeft: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e5a93b' }}>
                    {user.name || 'Shankar'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#ffffffaa' }}>
                    +91 {user.mobile}
                  </span>
                </div>
                <button 
                  onClick={onLogout}
                  style={{
                    background: '#c62828',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={onOpenLogin}
              style={{
                backgroundColor: '#d84b06',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: '4px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem'
              }}
            >
              <User size={16} /> Login / Register
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
