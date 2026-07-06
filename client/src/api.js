const API_URL = "/api";

// Reads the saved token (if any) so protected requests can include it
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...authHeader(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

/* ---------- Auth ---------- */
export function registerUser(payload) {
  return request("/user/register", { method: "POST", body: JSON.stringify(payload) });
}

export function loginUser(payload) {
  return request("/user/login", { method: "POST", body: JSON.stringify(payload) });
}

export function getSecurityQuestion(email, role) {
  return request("/user/forgot-password/verify", { method: "POST", body: JSON.stringify({ email, role }) });
}

export function resetPassword(payload) {
  return request("/user/forgot-password/reset", { method: "POST", body: JSON.stringify(payload) });
}

/* ---------- Properties (public browsing) ---------- */
export function getProperties(query = "") {
  return request(`/user/properties${query}`);
}

export function getPropertyById(id) {
  return request(`/user/properties/${id}`);
}

/* ---------- Bookings (renter) ---------- */
export function createBooking(payload) {
  return request("/user/bookings", { method: "POST", body: JSON.stringify(payload) });
}

export function getMyBookings() {
  return request("/user/bookings/mine");
}

export function cancelBooking(id) {
  return request(`/user/bookings/${id}/cancel`, { method: "PATCH" });
}

/* ---------- Owner ---------- */
export function addProperty(formData) {
  return request("/owner/properties", { method: "POST", body: formData });
}

export function getMyProperties() {
  return request("/owner/properties");
}

export function getMyPropertyById(id) {
  return request(`/owner/properties/${id}`);
}

export function updateProperty(id, formData) {
  return request(`/owner/properties/${id}`, { method: "PUT", body: formData });
}

export function respondToRemovalRequest(id, consent) {
  return request(`/owner/properties/${id}/removal-response`, { method: "POST", body: JSON.stringify({ consent }) });
}

export function deleteProperty(id) {
  return request(`/owner/properties/${id}`, { method: "DELETE" });
}

export function getOwnerBookings() {
  return request("/owner/bookings");
}

export function updateBookingStatus(id, status) {
  return request(`/owner/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

/* ---------- Chat ---------- */
export function getConversation(bookingId) {
  return request(`/chat/${bookingId}`);
}

export function sendChatMessage(bookingId, text) {
  return request(`/chat/${bookingId}`, { method: "POST", body: JSON.stringify({ text }) });
}

/* ---------- Admin ---------- */
export function getAdminStats() {
  return request("/admin/stats");
}

export function getAdminUsers() {
  return request("/admin/users");
}

export function toggleUserStatus(id) {
  return request(`/admin/users/${id}/toggle-status`, { method: "PATCH" });
}

export function getAdminProperties() {
  return request("/admin/properties");
}

export function requestPropertyRemoval(id, reason) {
  return request(`/admin/properties/${id}/request-removal`, { method: "POST", body: JSON.stringify({ reason }) });
}

export function getAdminBookings() {
  return request("/admin/bookings");
}
