// COMPLETE BUS BOOKING API - VERCEL NATIVE
let users = { "admin@bus.com": { password: "admin123", role: "admin" } };
let bookings = [];
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

export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace("/api/bus", "");

  // GET /api/bus - List all buses
  if (req.method === "GET" && path === "/") {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(buses);
    return;
  }

  // POST /api/bus/login
  if (req.method === "POST" && path === "/login") {
    try {
      const { email, password } = JSON.parse(req.body || "{}");
      const user = users[email];

      if (user && user.password === password) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({
          email: user.email,
          role: user.role,
          token: user.email,
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch {
      res.status(400).json({ error: "Invalid JSON" });
    }
    return;
  }

  // POST /api/bus/register
  if (req.method === "POST" && path === "/register") {
    try {
      const { email, password } = JSON.parse(req.body || "{}");
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      if (users[email]) {
        res.status(400).json({ error: "User already exists" });
      } else {
        users[email] = { email, password, role: "user" };
        res.status(200).json({ email, role: "user", token: email });
      }
    } catch {
      res.status(400).json({ error: "Invalid JSON" });
    }
    return;
  }

  // POST /api/bus/book
  if (req.method === "POST" && path === "/book") {
    try {
      const { slotId, seats, email } = JSON.parse(req.body || "{}");

      const bus = buses.find((b) => b.slots.find((s) => s.id === slotId));
      const slot = bus?.slots.find((s) => s.id === slotId);

      if (!slot || !slot.available || seats > slot.seats || seats <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid booking: Slot full or invalid seats" });
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

      res.status(200).json({
        message: `Booked ${seats} seats for ${bus.name} (${bus.route}) successfully!`,
      });
    } catch {
      res.status(400).json({ error: "Invalid booking data" });
    }
    return;
  }

  // GET /api/bus/bookings - Admin only
  if (req.method === "GET" && path === "/bookings") {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(bookings);
    return;
  }

  res.status(404).json({ error: "Endpoint not found" });
}
