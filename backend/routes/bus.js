import express from "express";

const router = express.Router();

// -------- IN-MEMORY USERS (NO DB) --------
// demo users for login
const users = [
  { email: "admin@bus.com", password: "admin123", role: "admin" },
  { email: "user@bus.com", password: "user123", role: "user" },
];

// -------- BUSES & BOOKINGS (IN-MEMORY) --------

let buses = [
  {
    id: 1,
    name: "Volvo AC Sleeper (BLR-CHN)",
    seats: [
      // ← CHANGED: slots → seats (like your bus frontend expects)
      { id: 1, seatNo: "A1", type: "Sleeper", available: true, price: 1200 },
      { id: 2, seatNo: "A2", type: "Sleeper", available: true, price: 1200 },
      { id: 3, seatNo: "B1", type: "Sleeper", available: true, price: 1200 },
      { id: 4, seatNo: "B2", type: "Sleeper", available: true, price: 1200 },
    ],
  },
  {
    id: 2,
    name: "Semi Sleeper AC (HYD-BLR)",
    seats: [
      { id: 5, seatNo: "1", type: "Semi-Sleeper", available: true, price: 900 },
      { id: 6, seatNo: "2", type: "Semi-Sleeper", available: true, price: 900 },
      { id: 7, seatNo: "3", type: "Semi-Sleeper", available: true, price: 900 },
    ],
  },
];

let bookings = [];

// -------- AUTH (NO DATABASE) --------

// register new user (stored in memory only)
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = { email, password, role: "user" };
  users.push(newUser);

  res.json({ user: { email: newUser.email, role: newUser.role } });
});

// login against in-memory users
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    token: user.email, // simple token placeholder
    role: user.role,
    email: user.email,
  });
});

// -------- BUSES / BOOKINGS --------

router.get("/", (req, res) => {
  res.json(buses);
});

router.get("/bookings", (req, res) => {
  res.json(bookings);
});

router.post("/book", (req, res) => {
  const { busId, seatIds, email } = req.body; // ← CHANGED: slotId/seats → busId/seatIds

  const bus = buses.find((b) => b.seats.find((s) => seatIds.includes(s.id)));
  const selectedSeats = bus?.seats.filter((s) => seatIds.includes(s.id));

  if (!selectedSeats || selectedSeats.some((s) => !s.available)) {
    return res.status(400).json({ error: "Seats unavailable" });
  }

  // Mark seats as booked
  selectedSeats.forEach((s) => (s.available = false));

  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  bookings.push({
    id: Date.now(),
    email,
    bus: bus.name,
    busId,
    seats: selectedSeats.map((s) => s.seatNo),
    totalAmount,
    bookingTime: new Date().toLocaleString(),
  });

  res.json({
    success: true,
    message: `Booked ${selectedSeats.length} seats for ${bus.name}`,
    booking: {
      id: bookings[bookings.length - 1].id,
      seats: selectedSeats.map((s) => s.seatNo),
      totalAmount,
    },
  });
});

router.delete("/bookings/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const booking = bookings.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  // Restore seats
  const bus = buses.find((b) => b.id === booking.busId);
  if (bus) {
    booking.seats.forEach((seatNo) => {
      const seat = bus.seats.find((s) => s.seatNo === seatNo);
      if (seat) seat.available = true;
    });
  }

  bookings = bookings.filter((b) => b.id !== id);
  res.json({ success: true, message: "Booking cancelled successfully" });
});

export default router;
