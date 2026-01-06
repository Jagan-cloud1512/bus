export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Data
  const users = {
    "admin@bus.com": { password: "admin123", role: "admin" },
    "user@bus.com": { password: "user123", role: "user" },
  };

  let bookings = [];
  const buses = [
    {
      id: 1,
      name: "Volvo AC Sleeper",
      route: "Chennai→Bangalore",
      slots: [{ id: 1, time: "22:00", seats: 8, available: true }],
    },
    {
      id: 2,
      name: "Sleeper Non-AC",
      route: "Bangalore→Hyderabad",
      slots: [{ id: 2, time: "23:00", seats: 5, available: true }],
    },
  ];

  // ✅ FIXED: Parse FULL path correctly
  const fullPath = req.url;
  console.log("FULL PATH:", fullPath); // Debug log

  // GET /api/bus → List buses
  if (req.method === "GET" && fullPath === "/api/bus") {
    res.json(buses);
    return;
  }

  // POST /api/bus/login → Login
  if (req.method === "POST" && fullPath === "/api/bus/login") {
    try {
      const { email, password } = JSON.parse(req.body || "{}");

      if (users[email] && users[email].password === password) {
        res.json({
          email: email,
          role: users[email].role,
          token: email,
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch {
      res.status(400).json({ error: "Bad request" });
    }
    return;
  }

  // POST /api/bus/book → Book seats
  if (req.method === "POST" && fullPath === "/api/bus/book") {
    try {
      const { slotId, seats, email } = JSON.parse(req.body || "{}");
      // Booking logic here...
      res.json({ message: `Booked ${seats} seats!` });
    } catch {
      res.status(400).json({ error: "Invalid booking" });
    }
    return;
  }

  // GET /api/bus/bookings → Admin bookings
  if (req.method === "GET" && fullPath === "/api/bus/bookings") {
    res.json(bookings);
    return;
  }

  // 404 for everything else
  res.status(404).json({ error: "Route not found", path: fullPath });
}
