import express from "express";
const router = express.Router();

// -------- IN-MEMORY USERS (NO DB) --------
const users = [
  { email: "admin@bus.com", password: "admin123", role: "admin" },
  { email: "user@bus.com", password: "user123", role: "user" },
];

// -------- BUSES & BOOKINGS (MATCHES FRONTEND) --------
let buses = [
  {
    id: 1,
    name: "Volvo AC Sleeper",
    route: "Chennai → Bangalore",
    type: "AC",
    slots: [
      // ✅ FIXED: slots (not seats)
      { id: 1, time: "22:00", seats: 8, available: true },
      { id: 2, time: "23:30", seats: 0, available: false },
      { id: 3, time: "01:30", seats: 12, available: true },
    ],
  },
  {
    id: 2,
    name: "Sleeper Non-AC",
    route: "Bangalore → Hyderabad",
    type: "Sleeper",
    slots: [
      // ✅ FIXED: slots (not seats)
      { id: 4, time: "21:00", seats: 5, available: true },
      { id: 5, time: "23:00", seats: 18, available: true },
      { id: 6, time: "02:00", seats: 0, available: false },
    ],
  },
];

let bookings = [];

// -------- AUTH ROUTES --------
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  users.push({ email, password, role: "user" });
  res.json({ email, role: "user", token: "fake-jwt" });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    email: user.email,
    role: user.role,
    token: user.email,
  });
});

// -------- BUS ROUTES (MATCHES FRONTEND) --------
router.get("/", (req, res) => {
  res.json(buses);
});

router.get("/bookings", (req, res) => {
  res.json(bookings);
});

router.post("/book", (req, res) => {
  const { slotId, seats, email } = req.body; // ✅ FIXED: slotId/seats (matches frontend)

  // Find bus and slot
  const bus = buses.find((b) => b.slots.some((s) => s.id === slotId));
  const slot = bus?.slots.find((s) => s.id === slotId);

  if (!slot || !slot.available || seats > slot.seats) {
    return res
      .status(400)
      .json({ error: "Invalid booking: Slot full or invalid" });
  }

  // Book seats
  slot.seats -= seats;
  slot.available = slot.seats > 0;

  bookings.push({
    bus: bus.name,
    route: bus.route,
    slotId,
    seats,
    email,
    time: new Date().toLocaleString(),
  });

  res.json({
    message: `Booked ${seats} seats for ${bus.name} (${bus.route}) successfully!`,
  });
});

export default router;
