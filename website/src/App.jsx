import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import ServicesLanding from './pages/ServicesLanding';
import SheeghraDarshan from './pages/SheeghraDarshan';
import Bhaktniwas from './pages/Bhaktniwas';
import Donation from './pages/Donation';
import History from './pages/History';

export default function App() {
  const [activePage, setActivePage] = useState('services');
  const [selectedDarshanType, setSelectedDarshanType] = useState(null);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load user session and past bookings on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedBookings = localStorage.getItem('user_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    localStorage.setItem('user_session', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    setActivePage('services');
  };

  const handleAddBooking = (newBooking) => {
    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('user_bookings', JSON.stringify(updatedBookings));
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onOpenLogin={() => setIsLoginModalOpen(true)}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {activePage === 'services' && (
          <ServicesLanding 
            user={user}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            setActivePage={setActivePage}
            setSelectedDarshanType={setSelectedDarshanType}
          />
        )}

        {activePage === 'sheeghra-darshan' && (
          <SheeghraDarshan 
            user={user}
            onAddBooking={handleAddBooking}
            setActivePage={setActivePage}
            initialDarshanType={selectedDarshanType}
          />
        )}

        {activePage === 'bhaktniwas' && (
          <Bhaktniwas 
            user={user}
            onAddBooking={handleAddBooking}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'donation' && (
          <Donation 
            user={user}
            onAddBooking={handleAddBooking}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'history' && (
          <History 
            bookings={bookings}
            setActivePage={setActivePage}
          />
        )}
      </main>

      {/* Footer Area */}
      <Footer />

      {/* Login & Registration Modal Overlay */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
