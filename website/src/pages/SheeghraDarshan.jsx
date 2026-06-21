/**
 * SheeghraDarshan — Booking Portal
 *
 * Wired to the live Mahakaleshwar Temple backend:
 *   Base: https://api.dev.facepe.ai/sm
 *
 * Flow:
 *   Step 1 → Pick booking type, date, slot (real /sm/api/booking-types + /sm/api/slots)
 *   Step 2 → Visitor details + selfie webcam capture
 *   Step 3 → Review & confirm → POST /sm/api/bookings
 *            → POST /sm/api/bookings/{ref}/enroll  (face enrollment)
 *   Step 4 → Booking confirmed — show booking_ref
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Plus, Trash2, Camera, Upload, Loader } from 'lucide-react';
import api from '../services/api';

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** Maps backend id_type codes to display labels */
const ID_TYPE_LABELS = { AADHAAR: 'Aadhaar Card', VOTER_ID: 'Voter ID', PAN: 'PAN Card', DL: "Driver's Licence" };
const ID_TYPE_CODES  = { 'Aadhaar Card': 'AADHAAR', 'Voter ID': 'VOTER_ID', 'PAN Card': 'PAN', "Driver's Licence": 'DL' };

function today() {
  return new Date().toISOString().split('T')[0];
}

function fmt(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/** Build calendar metadata for a year + month (JS 0-indexed month) */
function buildCalendar(year, month) {
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // make Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { startOffset, daysInMonth };
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];


// ─── WebcamCapture component ──────────────────────────────────────────────────

function WebcamCapture({ onCapture, captured }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const [active,   setActive]  = useState(false);
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [capturing,setCapturing] = useState(false);

  // Attach stream after React renders the video element
  useEffect(() => {
    if (active && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [active]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    setError('');
    setLoading(true);
    try {
      let s;
      try {
        // High resolution for better liveness detection
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch {
        s = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = s;
      setActive(true);
    } catch (err) {
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Permission denied — click the 🔒 in your browser address bar, allow Camera, then Retry.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setError('Camera in use by another app. Close it and Retry.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(`Camera error (${name || err?.message || 'unknown'}).`);
      }
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current)  { videoRef.current.srcObject = null; }
    setActive(false);
  };

  const capture = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setCapturing(true);
    try {
      // Wait for the video to have actual frames loaded (readyState >= 2 = HAVE_CURRENT_DATA)
      if (video.readyState < 2) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Camera not ready')), 5000);
          video.addEventListener('canplay', () => { clearTimeout(timeout); resolve(); }, { once: true });
        });
      }

      const w = video.videoWidth;
      const h = video.videoHeight;

      if (!w || !h) {
        setError('Camera not ready yet — please wait a moment and try again.');
        return;
      }

      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(video, 0, 0, w, h);

      canvas.toBlob(blob => {
        if (!blob || blob.size < 10000) {
          setError('Image capture failed (blank frame). Please try again.');
          return;
        }
        onCapture(blob, canvas.toDataURL('image/jpeg', 0.95));
        stopCamera();
      }, 'image/jpeg', 0.95);
    } catch (e) {
      setError('Capture failed: ' + e.message);
    } finally {
      setCapturing(false);
    }
  };

  const showLive        = active && !captured;
  const showPlaceholder = !active && !captured && !loading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>

      {/* ── Preview ── */}
      <div style={{ position: 'relative', lineHeight: 0 }}>
        {/* Video always in DOM */}
        <video ref={videoRef} autoPlay playsInline muted
          style={{
            display: showLive ? 'block' : 'none',
            width: 200, height: 200,
            borderRadius: '50%', objectFit: 'cover',
            border: '3px solid #d84b06', boxShadow: '0 0 0 4px #ffe0cc',
          }}
        />

        {/* Captured photo */}
        {captured && (
          <>
            <img src={captured} alt="selfie"
              style={{ display: 'block', width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2e7d32', boxShadow: '0 0 0 4px #c8e6c9' }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: '#2e7d32', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>✓</div>
          </>
        )}

        {/* Loading ring */}
        {loading && (
          <div style={{ width: 100, height: 100, borderRadius: '50%', border: '3px dashed #d84b06', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#d84b06', fontSize: '0.7rem' }}>
            <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
            Starting…
          </div>
        )}

        {/* Idle placeholder */}
        {showPlaceholder && (
          <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', color: '#ccc', backgroundColor: '#fafafa' }}>👤</div>
        )}

        {/* Hint overlay while live */}
        {showLive && !capturing && (
          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6rem', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            📷 Look straight &amp; click Capture
          </div>
        )}
        {capturing && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size={28} style={{ color: '#d84b06', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Live camera tips */}
      {showLive && (
        <div style={{ backgroundColor: '#f0f7ff', border: '1px solid #90caf9', borderRadius: 6, padding: '0.4rem 0.6rem', fontSize: '0.68rem', color: '#1565c0', maxWidth: 220, textAlign: 'left', lineHeight: 1.5 }}>
          ✅ Good lighting • Face camera directly<br />
          ✅ No mask / glasses • Keep still<br />
          ✅ Face must fill the circle
        </div>
      )}

      {/* Error box */}
      {error && (
        <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#e65100', maxWidth: 260, textAlign: 'center', lineHeight: 1.5 }}>
          ⚠ {error}
          <button type="button" onClick={startCamera} disabled={loading}
            style={{ display: 'block', margin: '0.4rem auto 0', fontSize: '0.72rem', padding: '3px 14px', backgroundColor: '#e65100', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}>
            🔄 Retry Camera
          </button>
        </div>
      )}

      {/* Buttons — ONLY live camera; no upload (backend rejects uploaded photos) */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {showLive ? (
          <button type="button" onClick={capture} disabled={capturing} className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', opacity: capturing ? 0.7 : 1 }}>
            {capturing
              ? <><Loader size={13} style={{ marginRight: 5 }} />Processing…</>
              : <><Camera size={14} style={{ marginRight: 5 }} />Capture Photo</>}
          </button>
        ) : !captured && (
          <button type="button" onClick={startCamera} disabled={loading} className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', backgroundColor: '#d84b06', opacity: loading ? 0.7 : 1 }}>
            <Camera size={14} style={{ marginRight: 5 }} />
            {loading ? 'Starting Camera…' : '📸 Open Camera (Required)'}
          </button>
        )}
      </div>

      {/* Retake */}
      {captured && (
        <button type="button" onClick={() => { onCapture(null, null); stopCamera(); setError(''); }}
          style={{ fontSize: '0.68rem', color: '#c62828', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Remove &amp; Retake
        </button>
      )}

      {/* Note about why upload is not available */}
      {!captured && !active && !loading && (
        <p style={{ fontSize: '0.65rem', color: '#999', textAlign: 'center', maxWidth: 200, margin: 0 }}>
          ⚠ File upload not available — the backend requires a live camera selfie for security verification.
        </p>
      )}
    </div>
  );
}



// ─── Main component ───────────────────────────────────────────────────────────


const BLANK_VISITOR = () => ({
  name: '', mobile: '', id_type: 'AADHAAR', id_number: '',
  selfieBlob: null, selfiePreview: null, consent_given: true,
});

export default function SheeghraDarshan({ user, onAddBooking, setActivePage }) {
  const [step, setStep] = useState(1);

  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Step 1 state
  const [bookingTypes, setBookingTypes]   = useState([]);
  const [selectedType, setSelectedType]   = useState(null);
  const [selectedDate, setSelectedDate]   = useState(today());
  const [slots, setSlots]                 = useState([]);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [loadingTypes, setLoadingTypes]   = useState(false);
  const [loadingSlots, setLoadingSlots]   = useState(false);
  const [typeError, setTypeError]         = useState('');
  const [slotError, setSlotError]         = useState('');

  // Step 2 state
  const [visitors, setVisitors] = useState([BLANK_VISITOR()]);

  // Step 3 state
  const [agreedTerms, setAgreedTerms]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState('');

  // Step 4 state
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // ─── Load booking types on mount ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTypes(true);
        setTypeError('');
        const allTypes = await api.bookingTypes();

        // Exclude types that have their own dedicated pages on the home screen
        // (Bhasma Aarti, Garbha Griha — these are separate cards in ServicesLanding)
        const EXCLUDE = ['BHASMA', 'BHASMA_AARTI', 'GARBH', 'GARBHA', 'PUJAN'];
        const filtered = allTypes.filter(t =>
          !EXCLUDE.some(ex => t.code.toUpperCase().includes(ex))
        );

        setBookingTypes(filtered);

        // Auto-select if only one type (or fall back to first)
        if (filtered.length === 1) {
          setSelectedType(filtered[0]);
        } else if (filtered.length > 1) {
          setSelectedType(filtered[0]);
        }
      } catch (e) {
        setTypeError('Could not load darshan types: ' + e.message);
      } finally {
        setLoadingTypes(false);
      }
    };
    load();
  }, []);

  // ─── Load slots when type or date changes ──────────────────────────────────
  useEffect(() => {
    if (!selectedType || !selectedDate) return;
    const load = async () => {
      try {
        setLoadingSlots(true);
        setSlotError('');
        setSelectedSlot(null);
        const data = await api.slots(selectedType.code, selectedDate);
        setSlots(data);
      } catch (e) {
        setSlotError('Could not load slots: ' + e.message);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    load();
  }, [selectedType, selectedDate]);

  // ─── Visitor helpers ───────────────────────────────────────────────────────
  const addVisitor = () => {
    const maxGroup = selectedType?.group_allowed ? 5 : 1;
    if (visitors.length >= maxGroup) {
      alert(`This darshan type allows max ${maxGroup} visitor(s).`);
      return;
    }
    setVisitors(v => [...v, BLANK_VISITOR()]);
  };

  const removeVisitor = idx => setVisitors(v => v.filter((_, i) => i !== idx));

  const updateVisitor = (idx, field, val) =>
    setVisitors(v => { const c = [...v]; c[idx] = { ...c[idx], [field]: val }; return c; });

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateVisitors = () => {
    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i];
      if (!v.name.trim())    return `Visitor #${i+1}: Please enter full name.`;
      if (!v.mobile.trim() || !/^\d{10}$/.test(v.mobile)) return `Visitor #${i+1}: Enter valid 10-digit mobile.`;
      if (!v.id_number.trim()) return `Visitor #${i+1}: Please enter ID number.`;
      if (v.id_type === 'AADHAAR' && !/^\d{12}$/.test(v.id_number)) return `Visitor #${i+1}: Aadhaar must be 12 digits.`;
      if (!v.selfieBlob)     return `Visitor #${i+1}: Please capture or upload a selfie photo.`;
    }
    return '';
  };

  // ─── Submit booking + enroll faces ─────────────────────────────────────────
  const handleSubmit = async () => {
    const err = validateVisitors();
    if (err) { alert(err); return; }

    // Hard block: all visitors must have a selfie
    const missingSelfie = visitors.findIndex(v => !v.selfieBlob);
    if (missingSelfie !== -1) {
      alert(`Visitor #${missingSelfie + 1}: Face photo is compulsory. Please click "Open Camera" and capture a live selfie.`);
      return;
    }

    let createdRef = null;
    try {
      setSubmitError('');
      setSubmitting(true);

      const host = visitors[0];

      // 1. Create booking
      const booking = await api.createBooking({
        booking_type:  selectedType.code,
        slot_id:       selectedSlot.id,
        holder_name:   host.name.trim(),
        mobile:        host.mobile.trim(),
        id_type:       host.id_type,
        id_number:     host.id_number.trim(),
        head_count:    visitors.length,
        consent_given: host.consent_given,
      });

      createdRef = booking.booking_ref;

      // 2. Add guest enrollments (group bookings)
      for (let i = 1; i < visitors.length; i++) {
        await api.addGuest(createdRef, visitors[i].name.trim());
      }

      // 3. Fetch updated booking to get enrollment IDs
      const updated = await api.getBooking(createdRef);

      // 4. Enroll ALL selfies — REQUIRED, face_optional=false
      for (let i = 0; i < updated.enrollments.length; i++) {
        const enr = updated.enrollments[i];
        const vis = visitors[i];
        if (vis && vis.selfieBlob && enr.consent_given !== false) {
          try {
            await api.enroll(createdRef, enr.id, vis.selfieBlob);
          } catch (enrollErr) {
            // Enrollment failed — cancel booking and surface the error
            try { await api.cancelBooking(createdRef); } catch (_) {}
            throw new Error(
              `Face enrollment failed for Visitor #${i + 1}: ${enrollErr.message}\n\n` +
              `❌ Booking cancelled. Please try again using the live camera (click "Open Camera" — do NOT upload a photo file). ` +
              `The system requires a live selfie for liveness detection.`
            );
          }
        }
      }

      const finalBooking = {
        id:            createdRef,
        booking_ref:   createdRef,
        type:          selectedType.label || selectedType.code,
        date:          selectedDate,
        slot:          selectedSlot.slot,
        gate_id:       booking.gate_id ?? updated.gate_id,
        head_count:    visitors.length,
        holder_name:   host.name.trim(),
        mobile:        host.mobile.trim(),
        bookingTime:   new Date().toLocaleString(),
        enrollErrors:  [],
        face_optional: updated.face_optional,
      };

      setConfirmedBooking(finalBooking);
      onAddBooking(finalBooking);
      setStep(4);
    } catch (e) {
      setSubmitError(e.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  // ─── Render ────────────────────────────────────────────────────────────────

  const todayStr = today();
  const { startOffset, daysInMonth } = buildCalendar(calYear, calMonth);

  // Navigate months — don't allow going before current month
  const canGoPrev = !(calYear === now.getFullYear() && calMonth === now.getMonth());
  const goPrev = () => {
    if (!canGoPrev) return;
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const goNext = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="container animated-page" style={{ marginTop: '2rem' }}>

      {/* Wizard Step Navigation */}
      <div className="wizard-header">
        <div className="wizard-steps">
          {[
            { num: 1, label: 'Slots' },
            { num: 2, label: 'Visitors' },
            { num: 3, label: 'Review' },
            { num: 4, label: 'Confirmed' },
          ].map(s => {
            const isClickable = step > s.num && step !== 4;
            return (
              <div key={s.num} className="step-wrapper"
                onClick={() => isClickable && setStep(s.num)}
                style={{ cursor: isClickable ? 'pointer' : 'default' }}>
                <div className={`step-node ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>{s.num}</div>
                <span className="step-label">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step 1: Darshan Type + Date + Slot ── */}
      {step === 1 && (
        <div className="animated-page">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Select Darshan Date &amp; Slot</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>Choose your darshan type, visit date, and preferred time slot.</p>
          </div>

          {/* Darshan Type selector */}
          {loadingTypes ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', marginBottom: '1rem' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading darshan types…
            </div>
          ) : typeError ? (
            <div style={{ color: '#c62828', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={16} /> {typeError}
            </div>
          ) : bookingTypes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              {bookingTypes.length > 1 ? (
                <>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Darshan Type</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {bookingTypes.map(t => (
                      <button key={t.code}
                        onClick={() => setSelectedType(t)}
                        className={`btn ${selectedType?.code === t.code ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.85rem' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                // Only one type — show it as a badge, no selector needed
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: 0.5 }}>Darshan Type</span>
                  <span style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {selectedType?.label}
                  </span>
                </div>
              )}
              {selectedType && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                  {selectedType.aadhaar_required && '⚠ Aadhaar required · '}
                  {selectedType.group_allowed ? `Group allowed (max ${selectedType.head_count ?? 5}) · ` : 'Individual only · '}
                  {selectedType.gate_id && `Gate: ${selectedType.gate_id}`}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>

            {/* ── Calendar panel ── */}
            <div className="calendar-container">
              {/* Month header */}
              <div className="calendar-header">
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-sans)', fontWeight: '700' }}>
                  {MONTH_NAMES[calMonth]} {calYear}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Legend */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem' }}>
                    <span style={{ width: 10, height: 10, backgroundColor: '#e8f5e9', border: '1px solid #2e7d32', borderRadius: 2, display: 'inline-block' }}></span> Available
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem' }}>
                    <span style={{ width: 10, height: 10, backgroundColor: '#e2dbd5', border: '1px solid #d0c5bd', borderRadius: 2, display: 'inline-block' }}></span> Past
                  </span>
                  {/* Prev / Next */}
                  <button onClick={goPrev} disabled={!canGoPrev}
                    style={{ background: 'none', border: '1px solid #ddd', borderRadius: 4, cursor: canGoPrev ? 'pointer' : 'not-allowed', padding: '2px 7px', fontSize: '0.9rem', opacity: canGoPrev ? 1 : 0.35 }}>
                    ‹
                  </button>
                  <button onClick={goNext}
                    style={{ background: 'none', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', padding: '2px 7px', fontSize: '0.9rem' }}>
                    ›
                  </button>
                </div>
              </div>

              {/* Day-of-week headers */}
              <div className="calendar-grid">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <div key={d} className="calendar-day-header">{d}</div>
                ))}

                {/* Leading empty cells */}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`pad-${i}`} className="calendar-day past-date" style={{ visibility: 'hidden' }}></div>
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum  = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
                  const isPast  = dateStr < todayStr;
                  const isToday = dateStr === todayStr;
                  const isSelected = selectedDate === dateStr;

                  let dayClass = 'calendar-day';
                  if (isPast)     dayClass += ' past-date';
                  else            dayClass += ' avail-date';
                  if (isSelected) dayClass += ' selected';

                  return (
                    <div
                      key={dateStr}
                      className={dayClass}
                      onClick={() => { if (!isPast) { setSelectedDate(dateStr); setSelectedSlot(null); } }}
                      title={isPast ? 'Past date' : fmt(dateStr)}>
                      <span style={{ fontWeight: isToday ? '800' : undefined, color: isToday && !isSelected ? 'var(--primary)' : undefined }}>
                        {dayNum}
                      </span>
                      {isToday && !isSelected && (
                        <span style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--primary)', margin: '1px auto 0' }}></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Slots panel ── */}
            <div className="slots-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem' }}>
                  Available Slots: {fmt(selectedDate)}
                </h3>

                {loadingSlots ? (
                  <div style={{ color: '#888', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Loader size={14} /> Loading slots…
                  </div>
                ) : slotError ? (
                  <div style={{ color: '#c62828', fontSize: '0.85rem' }}>⚠ {slotError}</div>
                ) : slots.length === 0 ? (
                  <div style={{ color: '#888', fontSize: '0.85rem', padding: '1rem 0' }}>No slots available for this date.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {slots.map(slot => {
                      const full = slot.available === 0;
                      return (
                        <div key={slot.id}
                          onClick={() => { if (!full) setSelectedSlot(slot); }}
                          className={`slot-card ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                          style={{ opacity: full ? 0.6 : 1, cursor: full ? 'not-allowed' : 'pointer',
                            backgroundColor: full ? '#fafafa' : '', borderColor: full ? '#eee' : '' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="slot-time">{slot.slot}</span>
                            {slot.gate_id && (
                              <span style={{ fontSize: '0.7rem', color: '#777', marginTop: 2 }}>Gate: {slot.gate_id}</span>
                            )}
                          </div>
                          <span className="slot-avail" style={{ color: full ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>
                            {full ? 'Full' : `${slot.available} Left`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(2)}
                  className="btn btn-primary btn-block"
                  style={{ height: '45px', opacity: selectedSlot ? 1 : 0.6 }}>
                  Continue to Visitor Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Visitor Details ── */}
      {step === 2 && (
        <div className="animated-page">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)' }}>Visitor Registration</h2>
              <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>
                Fill in details and capture a selfie for each visitor. The face will be enrolled for kiosk check-in.
              </p>
            </div>
            {selectedType?.group_allowed && (
              <button onClick={addVisitor} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} /> Add Visitor
              </button>
            )}
          </div>

          {visitors.map((v, idx) => (
            <div key={idx} className="visitor-row">
              <div className="visitor-row-header">
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
                  {idx === 0 ? 'Primary Visitor (Host)' : `Visitor #${idx + 1}`}
                </span>
                {idx > 0 && (
                  <button onClick={() => removeVisitor(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Trash2 size={16} /> Remove
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Selfie capture */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Selfie *</span>
                  <WebcamCapture
                    captured={v.selfiePreview}
                    onCapture={(blob, preview) => {
                      updateVisitor(idx, 'selfieBlob', blob);
                      updateVisitor(idx, 'selfiePreview', preview);
                    }}
                  />
                </div>

                {/* Text fields */}
                <div className="visitor-inputs">
                  <div className="form-group visitor-name-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-control" placeholder="Full Name as on ID"
                      value={v.name} onChange={e => updateVisitor(idx, 'name', e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile *</label>
                    <input type="tel" className="form-control" placeholder="10-digit mobile"
                      value={v.mobile} maxLength={10} onChange={e => updateVisitor(idx, 'mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ID Proof Type *</label>
                    <select className="form-control" value={Object.keys(ID_TYPE_CODES).find(k => ID_TYPE_CODES[k] === v.id_type) || 'Aadhaar Card'}
                      onChange={e => { updateVisitor(idx, 'id_type', ID_TYPE_CODES[e.target.value]); updateVisitor(idx, 'id_number', ''); }}>
                      {Object.keys(ID_TYPE_CODES).map(label => <option key={label}>{label}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ID Number *</label>
                    <input type="text" className="form-control"
                      placeholder={v.id_type === 'AADHAAR' ? '12-digit Aadhaar' : 'ID number'}
                      value={v.id_number}
                      onChange={e => updateVisitor(idx, 'id_number', e.target.value.replace(/\s/g, ''))} />
                    {v.id_type === 'AADHAAR' && v.id_number && !/^\d{12}$/.test(v.id_number) && (
                      <span style={{ fontSize: '0.7rem', color: '#c62828' }}>Aadhaar must be 12 digits</span>
                    )}
                  </div>

                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: 'var(--dark-gray)' }}>
                      <input type="checkbox" checked={v.consent_given}
                        onChange={e => updateVisitor(idx, 'consent_given', e.target.checked)}
                        style={{ marginTop: 2, flexShrink: 0 }} />
                      I consent to biometric face enrollment for contactless temple entry. My photo will be stored securely for the duration of my visit only.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">← Back to Slots</button>
            <button onClick={() => {
              const err = validateVisitors();
              if (err) { alert(err); return; }
              setStep(3);
            }} className="btn btn-primary">
              Proceed to Review →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
        <div className="animated-page">
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark)', marginBottom: '0.25rem' }}>Review &amp; Confirm</h2>
          <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Verify all details before confirming your booking.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div>
              <div className="review-panel">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem' }}>Booking Summary</h3>
                {[
                  ['Darshan Type', selectedType?.label ?? selectedType?.code],
                  ['Date',         fmt(selectedDate)],
                  ['Slot',         selectedSlot?.slot],
                  ['Gate',         selectedSlot?.gate_id],
                  ['Visitors',     `${visitors.length} person(s)`],
                ].map(([k, v]) => (
                  <div key={k} className="summary-row">
                    <span style={{ fontWeight: 500 }}>{k}:</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="review-panel" style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-light)', paddingBottom: '0.5rem' }}>Visitors ({visitors.length})</h3>
                <table className="visitor-table">
                  <thead><tr><th>S.No</th><th>Name</th><th>Mobile</th><th>ID Type</th><th>ID Number</th><th>Selfie</th></tr></thead>
                  <tbody>
                    {visitors.map((v, i) => (
                      <tr key={i}>
                        <td>{i+1}</td>
                        <td style={{ fontWeight: 600 }}>{v.name}</td>
                        <td>{v.mobile}</td>
                        <td>{ID_TYPE_LABELS[v.id_type] ?? v.id_type}</td>
                        <td style={{ fontFamily: 'monospace' }}>{v.id_number}</td>
                        <td>{v.selfieBlob ? '✅' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="review-panel" style={{ borderTop: '4px solid var(--primary)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Confirm Booking</h3>

                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <input type="checkbox" id="terms-cb" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} style={{ marginTop: 3, cursor: 'pointer', flexShrink: 0 }} />
                  <label htmlFor="terms-cb" style={{ fontSize: '0.8rem', color: 'var(--dark-gray)', cursor: 'pointer', userSelect: 'none' }}>
                    I agree to the temple policies. Tickets are non-refundable and non-transferable. Physical ID must match at entry.
                  </label>
                </div>

                {submitError && (
                  <div style={{ backgroundColor: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 6, padding: '0.6rem 0.8rem', fontSize: '0.82rem', color: '#c62828', marginBottom: '1rem' }}>
                    ⚠ {submitError}
                  </div>
                )}

                {/* Selfie readiness check — shown before confirm button */}
                {visitors.some(v => !v.selfieBlob) && (
                  <div style={{ backgroundColor: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 6, padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: '#e65100', marginBottom: '0.75rem', display: 'flex', gap: 8 }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <strong>Face photo required for all visitors:</strong>
                      {visitors.map((v, i) => !v.selfieBlob && (
                        <div key={i}>• Visitor #{i+1} ({v.name || 'unnamed'}): selfie missing — go back and use <strong>Open Camera</strong></div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setStep(2)} className="btn btn-secondary btn-block" style={{ height: 44 }}>
                    ← Back
                  </button>
                  <button
                    disabled={!agreedTerms || submitting || visitors.some(v => !v.selfieBlob)}
                    onClick={handleSubmit}
                    className="btn btn-primary btn-block"
                    style={{ height: 44, opacity: (!agreedTerms || submitting || visitors.some(v => !v.selfieBlob)) ? 0.5 : 1 }}>
                    {submitting
                      ? <><Loader size={15} style={{ marginRight: 6 }} /> Submitting…</>
                      : 'Confirm Booking ✓'}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid #ffe0b2', padding: '0.75rem', borderRadius: 6, fontSize: '0.8rem', display: 'flex', gap: 6, marginTop: '1rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Face photo is <strong>compulsory</strong> for all visitors. Use the live camera (not file upload) for best results. All IDs must match at entry.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Confirmed ── */}
      {step === 4 && confirmedBooking && (
        <div className="animated-page">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', backgroundColor: '#e8f5e9', padding: 14, borderRadius: '50%', marginBottom: '0.75rem' }}>
              <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ color: 'var(--success)' }}>Booking Confirmed!</h2>
            <p style={{ color: 'var(--dark-gray)', fontSize: '0.9rem' }}>
              {confirmedBooking.enrollErrors?.length
                ? '⚠ Booking saved — but face enrollment failed. See below.'
                : 'Your face has been enrolled. Present yourself at the temple kiosk for instant check-in.'}
            </p>
          </div>

          <div className="ticket-paper">
            <div className="ticket-header">
              <h2>श्री महाकालेश्वर मंदिर प्रबंध समिति, उज्जैन</h2>
              <p>SHRI MAHAKALESHWAR TEMPLE MANAGEMENT COMMITTEE, UJJAIN</p>
              <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: '2px solid #2e7d32', color: '#2e7d32', fontSize: '0.65rem', padding: '2px 8px', fontWeight: '800', borderRadius: 3 }}>
                CONFIRMED
              </div>
            </div>

            <div className="ticket-body">
              <div className="ticket-grid">
                <div>
                  <span className="ticket-field-label">Booking Reference</span>
                  <span className="ticket-field-value" style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: 1 }}>
                    {confirmedBooking.booking_ref}
                  </span>
                </div>
                <div>
                  <span className="ticket-field-label">Primary Visitor</span>
                  <span className="ticket-field-value">{confirmedBooking.holder_name}</span>
                </div>
                <div>
                  <span className="ticket-field-label">Darshan Type</span>
                  <span className="ticket-field-value">{confirmedBooking.type}</span>
                </div>
                <div>
                  <span className="ticket-field-label">Date of Visit</span>
                  <span className="ticket-field-value">{fmt(confirmedBooking.date)}</span>
                </div>
                <div>
                  <span className="ticket-field-label">Time Slot</span>
                  <span className="ticket-field-value">{confirmedBooking.slot}</span>
                </div>
                <div>
                  <span className="ticket-field-label">Entry Gate</span>
                  <span className="ticket-field-value">{confirmedBooking.gate_id ?? '—'}</span>
                </div>
                <div>
                  <span className="ticket-field-label">No. of Visitors</span>
                  <span className="ticket-field-value">{confirmedBooking.head_count}</span>
                </div>
                <div>
                  <span className="ticket-field-label">Mobile</span>
                  <span className="ticket-field-value">{confirmedBooking.mobile}</span>
                </div>
              </div>

              {confirmedBooking.enrollErrors?.length ? (
                /* ── Enrollment failed — show exact error ── */
                <div style={{ backgroundColor: '#fff3e0', border: '2px solid #ff9800', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                    <AlertTriangle size={20} style={{ color: '#e65100', flexShrink: 0 }} />
                    <strong style={{ color: '#e65100', fontSize: '0.9rem' }}>Face Enrollment Failed</strong>
                  </div>
                  {confirmedBooking.enrollErrors.map((e, i) => (
                    <p key={i} style={{ fontSize: '0.82rem', color: '#bf360c', margin: '0.25rem 0' }}>
                      Visitor {e.visitor}: {e.msg}
                    </p>
                  ))}
                  <div style={{ marginTop: '0.75rem', backgroundColor: '#ffe0cc', borderRadius: 6, padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: '#b34000', lineHeight: 1.6 }}>
                    <strong>How to fix:</strong><br />
                    1. Click <em>Book Another</em> below and create a new booking.<br />
                    2. On the selfie step, click <strong>📸 Open Camera</strong> — do NOT upload a photo file.<br />
                    3. Look directly at the camera and click <strong>Capture Photo</strong>.<br />
                    4. The backend requires a live camera selfie for liveness detection.<br /><br />
                    Or at the gate, visit the <strong>Temple Help Desk</strong> with your Booking Ref <strong style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{confirmedBooking.booking_ref}</strong>.
                  </div>
                </div>
              ) : (
                /* ── Enrollment OK ── */
                <div style={{ backgroundColor: '#e8f5e9', borderRadius: 8, padding: '0.75rem 1rem', marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.82rem', color: '#2e7d32' }}>
                    <strong>Face Enrolled ✓</strong> — Walk up to the kiosk on your darshan day and look at the camera. Entry will be granted automatically.
                    <br />If face scan fails at the gate, visit the <strong>Temple Help Desk</strong> with your Booking Ref <strong>{confirmedBooking.booking_ref}</strong>.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              🖨 Print / Save PDF
            </button>
            <button onClick={() => { setStep(1); setConfirmedBooking(null); setVisitors([BLANK_VISITOR()]); setSelectedSlot(null); setAgreedTerms(false); }} className="btn btn-secondary">
              Book Another
            </button>
            <button onClick={() => setActivePage('services')} className="btn btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
