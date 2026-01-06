export default function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // In-memory data
  const users = {
    "admin@bus.com": { password: "admin123", role: "admin" },
    "user@bus.com": { password: "user123", role: "user" },
  };

  const buses = [
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

  // Parse path
  const path = req.url.split("?")[0].replace("/api/bus", "");

  // GET /api/bus - List buses
  if (req.method === "GET" && path === "/") {
    res.json(buses);
    return;
  }

  // POST /api/bus/login
  if (req.method === "POST" && path === "/login") {
    try {
      const body = JSON.parse(req.body || "{}");
      const { email, password } = body;

      if (users[email] && users[email].password === password) {
        res.json({
          email: email,
          role: users[email].role,
          token: email,
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e) {
      res.status(400).json({ error: "Invalid JSON" });
    }
    return;
  }

  // POST /api/bus/book
  if (req.method === "POST" && path === "/book") {
    try {
      const body = JSON.parse(req.body || "{}");
      const { slotId, seats, email } = body;

      const bus = buses.find((b) => b.slots.find((s) => s.id === slotId));
      const slot = bus?.slots.find((s) => s.id === slotId);

      if (slot && slot.available && seats <= slot.seats && seats > 0) {
        slot.seats -= seats;
        slot.available = slot.seats > 0;
        res.json({ message: `Booked ${seats} seats for ${bus.name}!` });
      } else {
        res.status(400).json({ error: "Invalid booking" });
      }
    } catch (e) {
      res.status(400).json({ error: "Invalid booking data" });
    }
    return;
  }

  // GET /api/bus/bookings
  if (req.method === "GET" && path === "/bookings") {
    res.json([]);
    return;
  }

  res.status(404).json({ error: "Not found" });
}
