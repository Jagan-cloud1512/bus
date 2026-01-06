let users = { "admin@bus.com": { password: "admin123", role: "admin" } };
let bookings = [];
let buses = [
  {
    id: 1,
    name: "Volvo AC Sleeper",
    route: "Chennai→Bangalore",
    type: "AC",
    slots: [
      { id: 1, time: "22:00", seats: 8, available: true },
      { id: 2, time: "23:30", seats: 0, available: false },
    ],
  },
  {
    id: 2,
    name: "Sleeper Non-AC",
    route: "Bangalore→Hyderabad",
    type: "Sleeper",
    slots: [{ id: 3, time: "21:00", seats: 5, available: true }],
  },
];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { method, url, body } = req;
  const path = new URL(url, `http://${req.headers.host}`).pathname.replace(
    "/api/bus",
    ""
  );

  // GET /api/bus
  if (method === "GET" && path === "/") return res.json(buses);

  // POST /api/bus/login
  if (method === "POST" && path === "/login") {
    try {
      const { email, password } = JSON.parse(body);
      const user = users[email];
      if (user?.password === password) {
        return res.json({ email: user.email, role: user.role, token: email });
      }
      res.status(401).json({ error: "Invalid credentials" });
    } catch {
      res.status(400).json({ error: "Bad request" });
    }
    return;
  }

  // POST /api/bus/book
  if (method === "POST" && path === "/book") {
    try {
      const { slotId, seats, email } = JSON.parse(body);
      const bus = buses.find((b) => b.slots.find((s) => s.id === slotId));
      const slot = bus?.slots.find((s) => s.id === slotId);
      if (slot?.available && seats <= slot.seats) {
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
        return res.json({ message: `Booked ${seats} seats!` });
      }
      res.status(400).json({ error: "Invalid booking" });
    } catch {
      res.status(400).json({ error: "Bad request" });
    }
    return;
  }

  // GET /api/bus/bookings
  if (method === "GET" && path === "/bookings") return res.json(bookings);

  res.status(404).json({ error: "Not found" });
}
