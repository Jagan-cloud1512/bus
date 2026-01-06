export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // IN-MEMORY DATA
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

  let bookings = [
    {
      bus: "Volvo AC Sleeper",
      route: "Chennai → Bangalore",
      slotId: 1,
      seats: 2,
      email: "test@test.com",
      time: "8:46 PM",
    },
  ];

  // ROUTES
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path === "/api/bus") {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(buses);
    return;
  }

  if (req.method === "POST" && path === "/api/bus/login") {
    const { email, password } = JSON.parse(req.body || "{}");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      res.setHeader("Content-Type", "application/json");
      res
        .status(200)
        .json({ email: user.email, role: user.role, token: user.email });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
    return;
  }

  if (req.method === "POST" && path === "/api/bus/register") {
    const { email, password } = JSON.parse(req.body || "{}");
    if (users.find((u) => u.email === email)) {
      res.status(400).json({ error: "User exists" });
    } else {
      res.status(200).json({ email, role: "user", token: email });
    }
    return;
  }

  if (req.method === "POST" && path === "/api/bus/book") {
    const { slotId, seats, email } = JSON.parse(req.body || "{}");
    const bus = buses.find((b) => b.slots.find((s) => s.id === slotId));
    const slot = bus?.slots.find((s) => s.id === slotId);

    if (slot && slot.available && seats <= slot.seats) {
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
      res.status(200).json({ message: `Booked ${seats} seats successfully!` });
    } else {
      res.status(400).json({ error: "Invalid booking" });
    }
    return;
  }

  if (path === "/api/bus/bookings") {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(bookings);
    return;
  }

  res.status(404).json({ error: "Not found" });
}
