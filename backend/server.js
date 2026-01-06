import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// -------- IN-MEMORY DATA --------
const users = [
  { email: "admin@bus.com", password: "admin123", role: "admin" },
  { email: "user@bus.com", password: "user123", role: "user" },
];

let buses = [
  {
    id: 1,
    name: "Volvo AC Sleeper",
    route: "Chennai → Bangalore",
    type: "AC",
    slots: [
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
      { id: 4, time: "21:00", seats: 5, available: true },
      { id: 5, time: "23:00", seats: 18, available: true },
      { id: 6, time: "02:00", seats: 0, available: false },
    ],
  },
];

let bookings = [];

// -------- API ROUTES --------
app.get("/api/bus", (req, res) => res.json(buses));

app.post("/api/bus/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ email: user.email, role: user.role, token: user.email });
});

app.post("/api/bus/register", (req, res) => {
  const { email, password } = req.body;
  if (users.find((u) => u.email === email))
    return res.status(400).json({ error: "User exists" });
  users.push({ email, password, role: "user" });
  res.json({ email, role: "user", token: email });
});

app.post("/api/bus/book", (req, res) => {
  const { slotId, seats, email } = req.body;
  const bus = buses.find((b) => b.slots.find((s) => s.id === slotId));
  const slot = bus?.slots.find((s) => s.id === slotId);

  if (!slot || !slot.available || seats > slot.seats) {
    return res.status(400).json({ error: "Invalid booking" });
  }

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
  res.json({ message: `Booked ${seats} seats successfully!` });
});

app.get("/api/bus/bookings", (req, res) => res.json(bookings));

export default app;
