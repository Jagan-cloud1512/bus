import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.jag, // ← Use "jag" instead of POSTGRES_URL
  ssl: { rejectUnauthorized: false },
});

let buses = [
  {
    id: 1,
    name: "Volvo AC Sleeper (BLR-CHN)",
    route: "Bangalore to Chennai",
    departure: "10:30 PM",
    arrival: "5:30 AM",
    seats: [
      { id: 1, seatNo: "A1", type: "Sleeper", available: true, price: 1200 },
      { id: 2, seatNo: "A2", type: "Sleeper", available: true, price: 1200 },
      { id: 3, seatNo: "B1", type: "Sleeper", available: true, price: 1200 },
      { id: 4, seatNo: "B2", type: "Sleeper", available: true, price: 1200 },
    ],
  },
  {
    id: 2,
    name: "Semi Sleeper AC (HYD-BLR)",
    route: "Hyderabad to Bangalore",
    departure: "9:00 PM",
    arrival: "4:00 AM",
    seats: [
      { id: 5, seatNo: "1", type: "Semi-Sleeper", available: true, price: 900 },
      { id: 6, seatNo: "2", type: "Semi-Sleeper", available: true, price: 900 },
      { id: 7, seatNo: "3", type: "Semi-Sleeper", available: true, price: 900 },
    ],
  },
];

let bookings = [];

// AUTH
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, password, "user"]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "User already exists" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email = $1",
      [email]
    );
    if (!result.rows.length || result.rows[0].password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    res.json({
      token: user.email,
      role: user.role || "user",
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// BUSES
router.get("/", (req, res) => res.json(buses));
router.get("/bookings", (req, res) => res.json(bookings));

router.post("/book", (req, res) => {
  const { busId, seatIds, email } = req.body;
  const bus = buses.find((b) => b.id === busId);
  if (!bus) return res.status(404).json({ error: "Bus not found" });

  const seats = bus.seats.filter((s) => seatIds.includes(s.id));
  const unavailable = seats.filter((s) => !s.available);
  if (unavailable.length)
    return res.status(400).json({ error: "Seats unavailable" });

  seats.forEach((s) => (s.available = false));
  const total = seats.reduce((sum, s) => sum + s.price, 0);

  const booking = {
    id: Date.now(),
    email,
    busId,
    busName: bus.name,
    route: bus.route,
    seats: seats.map((s) => s.seatNo),
    totalAmount: total,
    bookingTime: new Date().toLocaleString(),
  };
  bookings.push(booking);

  res.json({ success: true, message: `Booked ${seats.length} seats`, booking });
});

router.delete("/bookings/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const booking = bookings.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const bus = buses.find((b) => b.id === booking.busId);
  if (bus) {
    booking.seats.forEach((seatNo) => {
      const seat = bus.seats.find((s) => s.seatNo === seatNo);
      if (seat) seat.available = true;
    });
  }

  bookings = bookings.filter((b) => b.id !== id);
  res.json({ success: true, message: "Cancelled" });
});

export default router;
