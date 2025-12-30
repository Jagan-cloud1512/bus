let currentUser = null;
const API_BASE = "/api"; // Perfect for Vercel

function showRegister() {
  document.getElementById("signupModal").style.display = "flex";
}

function hideRegister() {
  document.getElementById("signupModal").style.display = "none";
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return alert("Enter email and password");

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Invalid credentials");

    currentUser = data;
    localStorage.setItem("user", JSON.stringify(data));

    if (currentUser.role === "admin") {
      showAdminPage();
    } else {
      showUserPage();
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Refresh and try again.");
  }
}

async function register() {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  if (!email || !password) return alert("Enter email and password");

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Unable to register");

    alert("✅ Account created! You can login now.");
    hideRegister();
  } catch (err) {
    console.error(err);
    alert("Server error while registering.");
  }
}

function hideLoginUI() {
  document.querySelector(".login-container").style.display = "none";
  document.getElementById("signupModal").style.display = "none";
  document.body.classList.add("app-mode");
}

function logout() {
  localStorage.removeItem("user");
  currentUser = null;
  document.body.classList.remove("app-mode");
  window.location.reload();
}

// ========== USER PAGE ==========
function showUserPage() {
  hideLoginUI();
  const userPage = document.getElementById("userPage");
  const adminPage = document.getElementById("adminPage");
  adminPage.style.display = "none";
  userPage.style.display = "block";

  userPage.innerHTML = `
    <div class="dashboard">
      <div class="dash-header">
        <div class="dash-title">
          <div class="dash-title-icon">🚌</div>
          <div>
            <h2>Bus Booking</h2>
            <div class="user-chip">${currentUser.email} · traveler</div>
          </div>
        </div>
        <button class="btn outline small" onclick="logout()">Logout</button>
      </div>
      <div class="dash-body">
        <div class="dash-left">
          <p class="dash-section-title">Choose your bus and seats</p>
          <div id="busList" class="bus-grid"></div>
          <div id="seatBookingForm" class="booking-panel" style="display:none;">
            <h4>Book seats</h4>
            <div style="margin-top:6px;">
              <label>Bus Route</label>
              <input id="selectedBusRoute" class="input" readonly />
            </div>
            <div style="margin-top:6px;">
              <label>Departure</label>
              <input id="selectedDeparture" class="input" readonly />
            </div>
            <div style="margin-top:6px;">
              <label>Select seats (click to choose)</label>
              <div id="seatSelection" style="margin-top:10px; max-height:200px; overflow-y:auto;"></div>
            </div>
            <div style="margin-top:10px;">
              <label>Total Amount</label>
              <input id="totalAmount" class="input" readonly value="₹0" />
            </div>
            <button class="btn primary" style="margin-top:10px;" onclick="userConfirmBooking()">Confirm Booking</button>
          </div>
        </div>
      </div>
    </div>
  `;
  loadBusesForUser();
}

async function loadBusesForUser() {
  try {
    // ✅ FIXED: /api (not /api/)
    const res = await fetch(`${API_BASE}`);
    window.buses = await res.json();

    const container = document.getElementById("busList");
    container.innerHTML = window.buses
      .map(
        (bus) => `
        <div class="bus-card">
          <div class="bus-card-header">
            <h4>${bus.name}</h4>
            <span class="bus-tag">${bus.route}</span>
          </div>
          <div class="bus-details">
            <div><strong>Departure:</strong> ${bus.departure}</div>
            <div><strong>Arrival:</strong> ${bus.arrival}</div>
          </div>
          <div class="seat-summary">
            ${bus.seats.filter((s) => s.available).length} / ${
          bus.seats.length
        } seats available
            <button class="btn small" onclick="userSelectBus(${
              bus.id
            })">View Seats</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    alert("Unable to load buses");
  }
}

function userSelectBus(busId) {
  const bus = window.buses.find((b) => b.id === busId);
  if (!bus) return alert("Bus not found");

  document.getElementById("selectedBusRoute").value = bus.route;
  document.getElementById("selectedDeparture").value = bus.departure;

  const seatContainer = document.getElementById("seatSelection");
  seatContainer.innerHTML = bus.seats
    .map(
      (seat) => `
      <button class="seat-btn ${seat.available ? "available" : "booked"}"
              onclick="toggleSeat(${busId}, ${seat.id}, ${seat.price})"
              style="margin: 4px;">
        ${seat.seatNo} (${seat.type}) - ₹${seat.price}
      </button>
    `
    )
    .join("");

  document.getElementById("seatBookingForm").style.display = "block";
  window.selectedBus = bus;
  window.selectedSeats = [];
  updateTotalAmount();
}

function toggleSeat(busId, seatId, price) {
  const btn = event.target;
  const seatIds = window.selectedSeats || [];

  if (btn.classList.contains("selected")) {
    window.selectedSeats = seatIds.filter((id) => id !== seatId);
    btn.classList.remove("selected");
    btn.classList.add("available");
  } else if (btn.classList.contains("available")) {
    window.selectedSeats = [...seatIds, seatId];
    btn.classList.remove("available");
    btn.classList.add("selected");
  }
  updateTotalAmount();
}

function updateTotalAmount() {
  const seats = window.selectedSeats || [];
  if (!window.selectedBus || !seats.length) {
    document.getElementById("totalAmount").value = "₹0";
    return;
  }

  const total = seats.reduce((sum, seatId) => {
    const seat = window.selectedBus.seats.find((s) => s.id === seatId);
    return sum + (seat?.price || 0);
  }, 0);

  document.getElementById("totalAmount").value = `₹${total}`;
}

async function userConfirmBooking() {
  if (!currentUser || !window.selectedSeats?.length) {
    return alert("Please select seats");
  }

  try {
    const res = await fetch(`${API_BASE}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        busId: window.selectedBus.id,
        seatIds: window.selectedSeats,
        email: currentUser.email,
      }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Booking failed");

    alert(data.message);
    document.getElementById("seatBookingForm").style.display = "none";
    window.selectedSeats = [];
    window.selectedBus = null;
    await loadBusesForUser();
  } catch (err) {
    console.error(err);
    alert("Server error while booking");
  }
}

// ========== ADMIN PANEL ==========
function showAdminPage() {
  hideLoginUI();

  const userPage = document.getElementById("userPage");
  const adminPage = document.getElementById("adminPage");
  userPage.style.display = "none";
  adminPage.style.display = "block";

  adminPage.innerHTML = `
    <div class="dashboard">
      <div class="dash-header">
        <div class="dash-title">
          <div class="dash-title-icon">🛠️</div>
          <div>
            <h2>Admin Dashboard</h2>
            <div class="user-chip">${currentUser.email} · admin</div>
          </div>
        </div>
        <button class="btn outline small" onclick="logout()">Logout</button>
      </div>

      <div class="admin-tabs">
        <button class="tab-btn active" onclick="showAdminTab('bookings')">📋 All Bookings</button>
        <button class="tab-btn" onclick="showAdminTab('buses')">🚌 Manage Buses</button>
      </div>

      <div id="adminBookings" class="tab-content" style="display: block;">
        <div class="side-card">
          <h3>All Bus Bookings</h3>
          <div id="adminBookingsList">Loading...</div>
        </div>
      </div>

      <div id="adminBuses" class="tab-content" style="display: none;">
        <div class="side-card">
          <h3>Bus Fleet Management</h3>
          <div id="adminBusesList">Loading...</div>
        </div>
      </div>
    </div>
  `;

  loadBookingsForAdmin();
}

function showAdminTab(tab) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  document.getElementById("adminBookings").style.display =
    tab === "bookings" ? "block" : "none";
  document.getElementById("adminBuses").style.display =
    tab === "buses" ? "block" : "none";

  if (tab === "bookings") {
    loadBookingsForAdmin();
  } else {
    loadBusesForAdmin();
  }
}

async function loadBookingsForAdmin() {
  try {
    // ✅ FIXED: /api/bookings (full path)
    const res = await fetch(`${API_BASE}/bookings`);
    const bookings = await res.json();

    const container = document.getElementById("adminBookingsList");
    if (!bookings.length) {
      container.innerHTML = "<p>No bookings yet. 🚀</p>";
      return;
    }

    container.innerHTML = bookings
      .map(
        (b) => `
        <div class="booking-row" style="border: 1px solid #e5e7eb; padding: 12px; margin-bottom: 12px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <strong style="color: #1f2937;">${b.busName}</strong><br/>
              <span style="color: #6b7280;">${b.route} | ${
          b.seats.length
        } seats</span><br/>
              <span style="color: #059669; font-weight: bold;">₹${
                b.totalAmount
              }</span>
            </div>
            <div style="text-align: right;">
              <div style="color: #6b7280; font-size: 12px;">${b.email}</div>
              <div style="color: #6b7280; font-size: 12px;">${
                b.bookingTime
              }</div>
              <button class="btn small danger" onclick="cancelBooking(${
                b.id
              })" style="margin-top: 4px;">
                ❌ Cancel
              </button>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
            Seats: ${b.seats.join(", ")}
          </div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    document.getElementById("adminBookingsList").innerHTML =
      "<p>Error loading bookings</p>";
  }
}

async function loadBusesForAdmin() {
  try {
    const res = await fetch(`${API_BASE}`);
    window.buses = await res.json();

    const container = document.getElementById("adminBusesList");
    container.innerHTML = window.buses
      .map(
        (bus) => `
        <div class="bus-card" style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h5 style="margin: 0 0 4px 0;">${bus.name}</h5>
              <p style="margin: 0 0 8px 0; color: #6b7280;">${bus.route}</p>
              <p style="margin: 0; color: #059669;">
                ${bus.seats.filter((s) => s.available).length}/${
          bus.seats.length
        } seats available
              </p>
            </div>
            <div style="text-align: right;">
              <span style="color: #6b7280; font-size: 12px;">${
                bus.departure
              } → ${bus.arrival}</span>
            </div>
          </div>
          <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${bus.seats
              .map(
                (seat) =>
                  `<span class="seat-btn ${
                    seat.available ? "available" : "booked"
                  }" style="font-size: 11px; padding: 4px 8px;">
                    ${seat.seatNo}
                  </span>`
              )
              .join("")}
          </div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    document.getElementById("adminBusesList").innerHTML =
      "<p>Error loading buses</p>";
  }
}

async function cancelBooking(bookingId) {
  if (!confirm("Cancel this booking?")) return;

  try {
    // ✅ FIXED: Full DELETE path
    const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("✅ Booking cancelled successfully!");
    loadBookingsForAdmin();
  } catch (err) {
    console.error(err);
    alert("Error cancelling booking");
  }
}

// Auto-login
window.addEventListener("load", () => {
  const saved = localStorage.getItem("user");
  if (!saved) return;
  currentUser = JSON.parse(saved);
  if (currentUser.role === "admin") {
    showAdminPage();
  } else {
    showUserPage();
  }
});
