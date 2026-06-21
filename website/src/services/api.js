/**
 * Mahakaleshwar Temple — Centralized API Client
 *
 * Base URL : https://api.dev.facepe.ai
 * All routes: /sm/api/*
 *
 * API Reference from backend developer:
 *   GET    /sm/api/booking-types
 *   GET    /sm/api/slots?booking_type=&date=
 *   POST   /sm/api/bookings
 *   GET    /sm/api/bookings/{ref}
 *   POST   /sm/api/bookings/{ref}/enroll  (multipart)
 *   POST   /sm/api/bookings/{ref}/guests  (multipart)
 *   POST   /sm/api/gate/verify            (multipart)
 *   POST   /sm/api/gate/confirm-aadhaar   (multipart)
 *   POST   /sm/api/gate/fallback/start    (multipart)
 *   POST   /sm/api/gate/fallback/verify   (multipart)
 *   GET    /sm/api/admin/entries
 *   GET    /sm/api/admin/stats
 */

const BASE = 'https://api.dev.facepe.ai';
const SM   = `${BASE}/sm`;

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || res.statusText || `HTTP ${res.status}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking APIs
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  /** GET /sm/api/booking-types */
  bookingTypes: () =>
    fetch(`${SM}/api/booking-types`).then(handleResponse),

  /**
   * GET /sm/api/slots?booking_type=BHASMA&date=2026-06-20
   * @returns [{ id, slot, gate_id, available, capacity }]
   */
  slots: (bookingType, date) =>
    fetch(`${SM}/api/slots?booking_type=${encodeURIComponent(bookingType)}&date=${encodeURIComponent(date)}`)
      .then(handleResponse),

  /**
   * POST /sm/api/bookings
   * Body: { booking_type, slot_id, holder_name, mobile, id_type, id_number, head_count, consent_given }
   * @returns { booking_ref, booking_type, status, holder_name, darshan_date, slot, gate_id, head_count, face_optional, enrollments }
   */
  createBooking: (body) =>
    fetch(`${SM}/api/bookings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).then(handleResponse),

  /**
   * GET /sm/api/bookings/{booking_ref}
   * @returns booking object
   */
  getBooking: (ref) =>
    fetch(`${SM}/api/bookings/${encodeURIComponent(ref)}`).then(handleResponse),

  /**
   * POST /sm/api/bookings/{booking_ref}/enroll
   * multipart/form-data: enrollment_id (int), file (image), id_portrait (image, optional)
   * @returns updated booking object with enrollment status
   */
  enroll: (ref, enrollmentId, selfieBlob, idPortraitBlob = null) => {
    const fd = new FormData();
    fd.append('enrollment_id', String(enrollmentId));
    fd.append('file', selfieBlob, 'selfie.jpg');
    if (idPortraitBlob) fd.append('id_portrait', idPortraitBlob, 'id_portrait.jpg');
    return fetch(`${SM}/api/bookings/${encodeURIComponent(ref)}/enroll`, {
      method: 'POST',
      body:   fd,
    }).then(handleResponse);
  },

  /**
   * POST /sm/api/bookings/{booking_ref}/guests
   * multipart/form-data: person_name (string)
   * @returns updated booking object with new guest enrollment
   */
  addGuest: (ref, personName) => {
    const fd = new FormData();
    fd.append('person_name', personName);
    return fetch(`${SM}/api/bookings/${encodeURIComponent(ref)}/guests`, {
      method: 'POST',
      body:   fd,
    }).then(handleResponse);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Gate / Kiosk APIs
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * POST /sm/api/gate/verify
   * multipart/form-data: gate_id, file (image)
   * @returns { decision, reason_code, message, booking_ref?, person?, ... }
   */
  gateVerify: (gateId, blob) => {
    const fd = new FormData();
    fd.append('gate_id', gateId);
    fd.append('file', blob, 'probe.jpg');
    return fetch(`${SM}/api/gate/verify`, { method: 'POST', body: fd }).then(handleResponse);
  },

  /**
   * POST /sm/api/gate/fallback/start
   * multipart/form-data: booking_ref OR mobile
   * @returns { booking_ref, holder_name, mobile_masked, demo_otp? }
   */
  fallbackStart: (bookingRef, mobile = null) => {
    const fd = new FormData();
    if (bookingRef) fd.append('booking_ref', bookingRef);
    if (mobile)     fd.append('mobile', mobile);
    return fetch(`${SM}/api/gate/fallback/start`, { method: 'POST', body: fd }).then(handleResponse);
  },

  /**
   * POST /sm/api/gate/fallback/verify
   * multipart/form-data: gate_id, booking_ref, otp, file (optional)
   */
  fallbackVerify: (gateId, bookingRef, otp, blob = null) => {
    const fd = new FormData();
    fd.append('gate_id', gateId);
    fd.append('booking_ref', bookingRef);
    fd.append('otp', otp);
    if (blob) fd.append('file', blob, 'probe.jpg');
    return fetch(`${SM}/api/gate/fallback/verify`, { method: 'POST', body: fd }).then(handleResponse);
  },

  /**
   * POST /sm/api/gate/confirm-aadhaar
   * multipart/form-data: gate_id, booking_ref, last4
   */
  confirmAadhaar: (gateId, bookingRef, last4) => {
    const fd = new FormData();
    fd.append('gate_id', gateId);
    fd.append('booking_ref', bookingRef);
    fd.append('last4', last4);
    return fetch(`${SM}/api/gate/confirm-aadhaar`, { method: 'POST', body: fd }).then(handleResponse);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Admin APIs
  // ─────────────────────────────────────────────────────────────────────────

  adminEntries: (limit = 50) =>
    fetch(`${SM}/api/admin/entries?limit=${limit}`).then(handleResponse),

  adminAudit: (limit = 100) =>
    fetch(`${SM}/api/admin/audit?limit=${limit}`).then(handleResponse),

  adminStats: () =>
    fetch(`${SM}/api/admin/stats`).then(handleResponse),

  cancelBooking: (ref) =>
    fetch(`${SM}/api/admin/bookings/${encodeURIComponent(ref)}/cancel`, {
      method: 'POST',
    }).then(handleResponse),

  eraseBooking: (ref) =>
    fetch(`${SM}/api/admin/erasure/${encodeURIComponent(ref)}`, {
      method: 'DELETE',
    }).then(handleResponse),

  retentionPurge: () =>
    fetch(`${SM}/api/admin/retention/purge`, { method: 'POST' }).then(handleResponse),

  /** Health check */
  health: () => fetch(`${SM}/health`).then(handleResponse),
};

export default api;
