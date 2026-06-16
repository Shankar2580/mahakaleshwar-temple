import React, { useState, useEffect } from 'react';
import { Calendar, User, ClipboardList, CheckCircle, Ticket, Plus, Trash2, Printer, AlertTriangle } from 'lucide-react';
import RazorpayModal from '../components/RazorpayModal';

export default function SheeghraDarshan({ user, onAddBooking, setActivePage }) {
  const [step, setStep] = useState(1); // 1 = Calendar, 2 = Visitors, 3 = Review, 4 = Ticket
  
  // State for step 1
  const [selectedDate, setSelectedDate] = useState('2026-06-23'); // Default to June 23, 2026 as user requested
  const [selectedSlot, setSelectedSlot] = useState('');
  const [maxStep, setMaxStep] = useState(1);

  // Hook to update max step reached
  useEffect(() => {
    if (step > maxStep) {
      setMaxStep(step);
    }
  }, [step]);

  // State for step 2
  const [visitors, setVisitors] = useState([
    { name: '', age: '', gender: 'Male', idType: 'Aadhaar Card', idNumber: '', isVerified: false, idDocFile: null, photoFile: null }
  ]);
  
  // State for step 3 & 4
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Auto-fill visitor details on step 2 if the user matches Shankar
  useEffect(() => {
    if (user && user.mobile === '8828596372' && step === 2) {
      setVisitors([
        {
          name: 'Shankar',
          age: '35',
          gender: 'Male',
          idType: 'Aadhaar Card',
          idNumber: '483285089973',
          isVerified: true,
          idDocFile: null,
          photoFile: 'shankar_photo.jpg'
        }
      ]);
    }
  }, [user, step]);

  // Calendar dates mock generator for June 2026
  const getJune2026Dates = () => {
    const dates = [];
    // June 2026 starts on Monday. Let's start showing slots from June 14 (Sunday) to June 30
    for (let day = 14; day <= 30; day++) {
      let status = 'available'; // available, full, limited
      
      // Let's mock status for some dates
      if ([15, 16, 20, 28].includes(day)) {
        status = 'full';
      } else if ([18, 22, 29].includes(day)) {
        status = 'limited';
      }
      
      dates.push({
        dateStr: `2026-06-${day}`,
        dayNum: day,
        status: status,
        slotsLeft: status === 'available' ? 120 : (status === 'limited' ? 12 : 0)
      });
    }
    return dates;
  };

  // Dynamic deterministic slot count based on date hash
  const getSlotsForDate = (dateStr) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return [
      { id: 'slot-1', time: '06:00 AM - 07:00 AM', avail: Math.abs((hash * 7) % 85) + 5 },
      { id: 'slot-2', time: '09:00 AM - 10:00 AM', avail: Math.abs((hash * 13) % 120) + 10 },
      { id: 'slot-3', time: '12:00 PM - 01:00 PM', avail: Math.abs((hash * 3) % 40) + 2 },
      { id: 'slot-4', time: '03:00 PM - 04:00 PM', avail: Math.abs((hash * 19) % 6) === 0 ? 0 : Math.abs((hash * 19) % 35) + 3 },
      { id: 'slot-5', time: '06:00 PM - 07:00 PM', avail: Math.abs((hash * 5) % 15) + 1 }
    ];
  };

  const timeSlots = getSlotsForDate(selectedDate);

  const handleAddVisitor = () => {
    if (visitors.length >= 5) {
      alert('You can book tickets for a maximum of 5 visitors in a single booking.');
      return;
    }
    setVisitors([...visitors, { name: '', age: '', gender: 'Male', idType: 'Aadhaar Card', idNumber: '', isVerified: false, idDocFile: null, photoFile: null }]);
  };

  const handleRemoveVisitor = (index) => {
    if (visitors.length === 1) return;
    const newVisitors = visitors.filter((_, i) => i !== index);
    setVisitors(newVisitors);
  };

  const handleVisitorChange = (index, field, value) => {
    const newVisitors = [...visitors];
    newVisitors[index][field] = value;
    setVisitors(newVisitors);
  };

  const validateVisitors = () => {
    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i];
      if (!v.name.trim()) return `Please enter visitor #${i + 1}'s name.`;
      if (!v.age || isNaN(v.age) || v.age <= 0 || v.age > 120) return `Please enter a valid age for visitor #${i + 1}.`;
      if (!v.idNumber.trim()) return `Please enter the ID card number for visitor #${i + 1}.`;
      
      if (v.idType === 'Aadhaar Card') {
        if (v.idNumber.length !== 12 || !/^\d+$/.test(v.idNumber)) {
          return `Aadhaar Card number for visitor #${i + 1} must be exactly 12 digits.`;
        }
        if (!v.isVerified) {
          return `Please verify visitor #${i + 1}'s Aadhaar with DigiLocker.`;
        }
      }
      
      if (v.idType === 'Passport') {
        if (!v.idDocFile) {
          return `Please upload visitor #${i + 1}'s Passport scan.`;
        }
      }
      
      if (!v.photoFile) {
        return `Please upload a self photograph for visitor #${i + 1}.`;
      }
    }
    return '';
  };

  const handlePaymentSuccess = (paymentId) => {
    setIsPayModalOpen(false);
    
    // Generate Booking Receipt
    const bookingRef = 'DS' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalBooking = {
      id: bookingRef,
      type: 'Sheeghra Darshan',
      date: selectedDate,
      slot: selectedSlot,
      visitors: visitors,
      amount: visitors.length * 250,
      paymentId: paymentId,
      bookingTime: new Date().toLocaleString()
    };
    
    setConfirmedBooking(finalBooking);
    onAddBooking(finalBooking);
    setStep(4);
  };

  const ticketPrice = visitors.length * 250;

  return (
    <div className="container animated-page" style={{ marginTop: '2rem' }}>
      
      {/* Wizard Step Navigation */}
      <div className="wizard-header">
        <div className="wizard-steps">
          {[
            { num: 1, label: 'Slots' },
            { num: 2, label: 'Visitors' },
            { num: 3, label: 'Review' },
            { num: 4, label: 'Receipt' }
          ].map((s) => {
            const isClickable = maxStep >= s.num && step !== 4;
            return (
              <div 
                key={s.num}
                className="step-wrapper"
                onClick={() => { if (isClickable) setStep(s.num); }}
                style={{ cursor: isClickable ? 'pointer' : 'default' }}
              >
                <div className={`step-node ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                  {s.num}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Calendar & Slot Selection */}
      {step === 1 && (
        <div className="animated-page">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Select Darshan Date & Slot</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Choose your date of visit and preferred time slot for Quick Darshan.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            {/* Calendar panel */}
            <div className="calendar-container">
              <div className="calendar-header">
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>June 2026</h3>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#e8f5e9', border: '1px solid #2e7d32', borderRadius: '2px' }}></span> Available
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#e2dbd5', border: '1px solid #d0c5bd', borderRadius: '2px' }}></span> Full
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#f7f7f7', border: '1px solid #eee', borderRadius: '2px' }}></span> Past Date
                  </span>
                </div>
              </div>

              <div className="calendar-grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                
                {/* Pad grid: June 1st to June 13th, 2026 are all in the past */}
                {Array.from({ length: 13 }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="calendar-day past-date">
                    <span>{idx + 1}</span>
                  </div>
                ))}

                {getJune2026Dates().map((dateItem) => {
                  const isPast = dateItem.dayNum < 15;
                  const isFull = dateItem.status === 'full';
                  const isSelected = selectedDate === dateItem.dateStr;

                  let dayClass = 'calendar-day';
                  if (isPast) {
                    dayClass += ' past-date';
                  } else if (isFull) {
                    dayClass += ' full-date';
                  } else {
                    dayClass += ' avail-date';
                  }

                  if (isSelected) {
                    dayClass += ' selected';
                  }

                  return (
                    <div 
                      key={dateItem.dateStr}
                      onClick={() => {
                        if (!isPast && !isFull) {
                          setSelectedDate(dateItem.dateStr);
                          setSelectedSlot(''); // Reset slot selection when date changes
                        }
                      }}
                      className={dayClass}
                    >
                      <span>{dateItem.dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slots Panel */}
            <div className="slots-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem' }}>
                  Available Slots: {selectedDate.split('-').reverse().join('/')}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {timeSlots.map((slot) => {
                    const isFull = slot.avail === 0;
                    return (
                      <div 
                        key={slot.id}
                        onClick={() => {
                          if (!isFull) setSelectedSlot(slot.time);
                        }}
                        className={`slot-card ${selectedSlot === slot.time ? 'selected' : ''}`}
                        style={{ 
                          opacity: isFull ? 0.6 : 1, 
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          backgroundColor: isFull ? '#fafafa' : '',
                          borderColor: isFull ? '#eee' : ''
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="slot-time">{slot.time}</span>
                        </div>
                        <span className="slot-avail" style={{ color: isFull ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>
                          {isFull ? 'Full' : `${slot.avail} Left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button 
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                  className="btn btn-primary btn-block"
                  style={{ height: '45px', opacity: selectedSlot ? 1 : 0.6 }}
                >
                  Continue to Visitor Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Visitor Details */}
      {step === 2 && (
        <div className="animated-page">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Visitor Registration</h2>
              <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Fill in the primary document details for all visitors. Maximum 5 per transaction.</p>
            </div>
            <button 
              onClick={handleAddVisitor} 
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Visitor
            </button>
          </div>

          <div>
            {visitors.map((visitor, idx) => (
              <div key={idx} className="visitor-row">
                <div className="visitor-row-header">
                  <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)' }}>
                    Visitor #{idx + 1}
                  </span>
                  {visitors.length > 1 && (
                    <button 
                      onClick={() => handleRemoveVisitor(idx)} 
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </div>

                <div className="visitor-inputs">
                  <div className="form-group visitor-name-group">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Visitor Full Name"
                      value={visitor.name}
                      onChange={(e) => handleVisitorChange(idx, 'name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input 
                      type="number" 
                      className="form-control"
                      placeholder="Age"
                      value={visitor.age}
                      onChange={(e) => handleVisitorChange(idx, 'age', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select 
                      className="form-control"
                      value={visitor.gender}
                      onChange={(e) => handleVisitorChange(idx, 'gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ID Proof Type</label>
                    <select 
                      className="form-control"
                      value={visitor.idType}
                      onChange={(e) => {
                        const newVisitors = [...visitors];
                        newVisitors[idx].idType = e.target.value;
                        newVisitors[idx].idNumber = '';
                        newVisitors[idx].isVerified = false;
                        newVisitors[idx].idDocFile = null;
                        setVisitors(newVisitors);
                      }}
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ID Proof Number</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder={visitor.idType === 'Aadhaar Card' ? '12-digit Aadhaar' : 'Enter ID number'}
                      value={visitor.idNumber}
                      onChange={(e) => {
                        handleVisitorChange(idx, 'idNumber', e.target.value);
                        // Reset verification if Aadhaar changes
                        if (visitor.idType === 'Aadhaar Card') {
                          handleVisitorChange(idx, 'isVerified', false);
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Identification Verification & Devotee Photo Upload */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px dashed var(--gray-medium)', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* Left Column: ID Document Validation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label" style={{ fontWeight: '700', color: 'var(--dark)' }}>
                      ID Proof Verification
                    </label>

                    {visitor.idType === 'Aadhaar Card' ? (
                      /* Aadhaar DigiLocker Verification Button */
                      <div style={{
                        border: '1px dashed var(--gray-medium)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '92px',
                        gap: '0.5rem'
                      }}>
                        {visitor.isVerified ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)', backgroundColor: 'var(--success-light)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #c8e6c9', fontSize: '0.85rem', fontWeight: '700' }}>
                            ✓ Verified via DigiLocker
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={!visitor.idNumber || visitor.idNumber.length !== 12 || !/^\d+$/.test(visitor.idNumber)}
                              onClick={() => {
                                const newVisitors = [...visitors];
                                newVisitors[idx].isVerified = true;
                                if (!newVisitors[idx].name) {
                                  newVisitors[idx].name = 'SHANKAR';
                                }
                                setVisitors(newVisitors);
                              }}
                              className="btn btn-outline"
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                fontSize: '0.8rem',
                                padding: '0.45rem 0.9rem',
                                opacity: (!visitor.idNumber || visitor.idNumber.length !== 12 || !/^\d+$/.test(visitor.idNumber)) ? 0.6 : 1,
                                cursor: (!visitor.idNumber || visitor.idNumber.length !== 12 || !/^\d+$/.test(visitor.idNumber)) ? 'not-allowed' : 'pointer'
                              }}
                            >
                              🔗 Verify with DigiLocker
                            </button>
                            {(!visitor.idNumber || visitor.idNumber.length !== 12 || !/^\d+$/.test(visitor.idNumber)) && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--danger)', textAlign: 'center' }}>
                                * Enter 12-digit Aadhaar to verify
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      /* Passport Gallery / Camera Upload */
                      <div style={{
                        border: '1px dashed var(--gray-medium)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '92px',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const fileInput = document.getElementById(`passport-file-${idx}`);
                              if (fileInput) fileInput.click();
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                          >
                            📁 Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const mockFile = `passport_scan_${visitor.name ? visitor.name.toLowerCase().replace(/\s+/g, '_') : `visitor_${idx+1}`}.jpg`;
                              handleVisitorChange(idx, 'idDocFile', mockFile);
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                          >
                            📸 Camera
                          </button>
                        </div>
                        <input 
                          type="file" 
                          id={`passport-file-${idx}`}
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleVisitorChange(idx, 'idDocFile', e.target.files[0].name);
                            }
                          }}
                        />
                        {visitor.idDocFile ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', textAlign: 'center', wordBreak: 'break-all' }}>
                            ✓ {visitor.idDocFile}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>* Document scan is mandatory</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Compulsory Face Photo Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label" style={{ fontWeight: '700', color: 'var(--dark)' }}>
                      Devotee Photo (Self Image)
                    </label>
                    
                    <div style={{
                      border: '1px dashed var(--gray-medium)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '92px',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const fileInput = document.getElementById(`photo-file-${idx}`);
                            if (fileInput) fileInput.click();
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                          📁 Gallery
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const mockPhoto = `photo_self_${visitor.name ? visitor.name.toLowerCase().replace(/\s+/g, '_') : `visitor_${idx+1}`}.jpg`;
                            handleVisitorChange(idx, 'photoFile', mockPhoto);
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                          📸 Camera
                        </button>
                      </div>
                      <input 
                        type="file" 
                        id={`photo-file-${idx}`}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleVisitorChange(idx, 'photoFile', e.target.files[0].name);
                          }
                        }}
                      />
                      {visitor.photoFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', textAlign: 'center', wordBreak: 'break-all' }}>
                          👤 ✓ {visitor.photoFile}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>* Devotee photo is mandatory</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                Back to Slots
              </button>
              <button 
                onClick={() => {
                  const errorMsg = validateVisitors();
                  if (errorMsg) {
                    alert(errorMsg);
                  } else {
                    setStep(3);
                  }
                }} 
                className="btn btn-primary"
              >
                Proceed to Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review Page */}
      {step === 3 && (
        <div className="animated-page">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Review Booking Details</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Please verify your details and agree to the terms before making payment.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div>
              {/* Summary table */}
              <div className="review-panel">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>
                  Trip Details
                </h3>
                <div className="summary-row">
                  <span style={{ fontWeight: '500' }}>Service Type:</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Sheeghra Darshan (Quick Entry)</span>
                </div>
                <div className="summary-row">
                  <span style={{ fontWeight: '500' }}>Selected Date:</span>
                  <span style={{ fontWeight: '700' }}>{selectedDate.split('-').reverse().join('/')}</span>
                </div>
                <div className="summary-row">
                  <span style={{ fontWeight: '500' }}>Time Slot:</span>
                  <span style={{ fontWeight: '700' }}>{selectedSlot}</span>
                </div>
              </div>

              {/* Visitors details list */}
              <div className="review-panel">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>
                  Registered Visitors ({visitors.length})
                </h3>
                <table className="visitor-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Name</th>
                      <th>Age/Gender</th>
                      <th>ID Proof Type</th>
                      <th>ID Card Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: '600' }}>{v.name}</td>
                        <td>{v.age} yrs / {v.gender}</td>
                        <td>{v.idType}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '500' }}>{v.idNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Checkout Pricing Sidebar */}
            <div>
              <div className="review-panel" style={{ borderTop: '4px solid var(--primary)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>
                  Pricing Summary
                </h3>
                
                <div className="summary-row">
                  <span>Ticket Fare (₹ 250 x {visitors.length})</span>
                  <span>₹ {ticketPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Service Tax / Fee</span>
                  <span>₹ 0.00</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹ {ticketPrice.toFixed(2)}</span>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <input 
                    type="checkbox" 
                    id="terms-checkbox" 
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    style={{ margin: '3px 0 0 0', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <label htmlFor="terms-checkbox" style={{ fontSize: '0.8rem', color: 'var(--dark-gray)', cursor: 'pointer', userSelect: 'none' }}>
                    I agree to the temple policies. I understand that tickets are non-refundable, non-transferable, and require matching physical ID proof verification at the entrance.
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="btn btn-secondary btn-block"
                    style={{ height: '45px', fontSize: '0.95rem' }}
                  >
                    Back to Visitors
                  </button>
                  <button 
                    disabled={!agreedTerms}
                    onClick={() => setIsPayModalOpen(true)}
                    className="btn btn-primary btn-block"
                    style={{ height: '45px', fontSize: '0.95rem', opacity: agreedTerms ? 1 : 0.6 }}
                  >
                    Pay ₹ {ticketPrice.toFixed(2)}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid #ffe0b2', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Make sure all visitor details match their physical ID cards. Mismatched profiles will not be permitted entry inside the temple.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Booking Ticket Success Receipt */}
      {step === 4 && confirmedBooking && (
        <div className="animated-page">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '50%', marginBottom: '0.75rem' }}>
              <CheckCircle size={44} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ color: 'var(--success)' }}>Booking Confirmed!</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Your ticket has been generated. Please download or print your ticket copy.</p>
          </div>

          {/* High-fidelity Ticket Receipt */}
          <div className="ticket-paper">
            <div className="ticket-header">
              <h2>श्री महाकालेश्वर मंदिर प्रबंध समिति, उज्जैन</h2>
              <p>SHRI MAHAKALESHWAR TEMPLE MANAGEMENT COMMITTEE, UJJAIN</p>
              <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: '1px solid var(--secondary)', color: 'var(--secondary)', fontSize: '0.65rem', padding: '2px 6px', fontWeight: '800', borderRadius: '3px' }}>
                PAID
              </div>
            </div>

            <div className="ticket-body">
              <div className="ticket-grid">
                <div>
                  <span className="ticket-field-label">Ticket Reference ID</span>
                  <div className="ticket-field-value" style={{ color: 'var(--primary)' }}>{confirmedBooking.id}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Service Type</span>
                  <div className="ticket-field-value">Sheeghra Darshan (Rs. 250)</div>
                </div>
                <div>
                  <span className="ticket-field-label">Date of Visit</span>
                  <div className="ticket-field-value">{confirmedBooking.date.split('-').reverse().join('/')}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Reporting Time Slot</span>
                  <div className="ticket-field-value">{confirmedBooking.slot}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Payment Transaction ID</span>
                  <div className="ticket-field-value" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{confirmedBooking.paymentId}</div>
                </div>
                <div>
                  <span className="ticket-field-label">Total Amount Paid</span>
                  <div className="ticket-field-value">₹ {confirmedBooking.amount.toFixed(2)}</div>
                </div>
              </div>

              <div className="ticket-divider"></div>

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
                    {confirmedBooking.visitors.map((v, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '600' }}>{v.name}</td>
                        <td>{v.age} Yrs / {v.gender}</td>
                        <td style={{ fontFamily: 'monospace' }}>{v.idType} - {v.idNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ticket-divider"></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span className="ticket-field-label">Scan at Entry Gate</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--dark-gray)' }}>A valid QR Code scanner will read this voucher.</p>
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
              <p>Guidelines: Report 15 minutes before your slot at Gate No. 4 (Sheeghra Darshan Lane).</p>
              <p style={{ marginTop: '4px', fontSize: '0.75rem', color: '#888' }}>Ticket generated on {confirmedBooking.bookingTime}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => setActivePage('services')} className="btn btn-secondary">
              Go back to Services
            </button>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={16} /> Print / Save Ticket
            </button>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal (Razorpay mock overlay) */}
      <RazorpayModal 
        isOpen={isPayModalOpen}
        amount={ticketPrice}
        onClose={() => setIsPayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
