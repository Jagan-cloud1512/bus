// ✅ VERCEL NATIVE - NO EXPRESS = NO 405 ERRORS!
export default function handler(req, res) {
  // CORS HEADERS FIRST (CRITICAL!)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // GLOBAL DATA
  if (!global.busAppData) {
    global.busAppData = {
      users: [{ id: 1, email: "intern", password: "project", role: "admin" }],
      buses: [
        {
          id: 1,
          name: "Volvo AC Sleeper (BLR-CHN)",
          route: "Bangalore to Chennai",
          departure: "10:30 PM",
          arrival: "5:30 AM",
          seats: [
            {
              id: 1,
              seatNo: "A1",
              type: "Sleeper",
              available: true,
              price: 1200,
            },
            {
              id: 2,
              seatNo: "A2",
              type: "Sleeper",
              available: true,
              price: 1200,
            },
            {
              id: 3,
              seatNo: "B1",
              type: "Sleeper",
              available: true,
              price: 1200,
            },
            {
              id: 4,
              seatNo: "B2",
              type: "Sleeper",
              available: true,
              price: 1200,
            },
          ],
        },
        {
          id: 2,
          name: "Semi Sleeper AC (HYD-BLR)",
          route: "Hyderabad to Bangalore",
          departure: "9:00 PM",
          arrival: "4:00 AM",
          seats: [
            {
              id: 5,
              seatNo: "1",
              type: "Semi-Sleeper",
              available: true,
              price: 900,
            },
            {
              id: 6,
              seatNo: "2",
              type: "Semi-Sleeper",
              available: true,
              price: 900,
            },
            {
              id: 7,
              seatNo: "3",
              type: "Semi-Sleeper",
              available: true,
              price: 900,
            },
          ],
        },
      ],
      bookings: [],
    };
  }

  const data = global.busAppData;

  // LOGIN
  if (req.method === "POST" && req.url.includes("/login")) {
    const body = JSON.parse(req.body || "{}");
    const user = data.users.find(
      (u) => u.email === body.email && u.password === body.password
    );
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    res.json({ token: user.email, role: user.role, email: user.email });
    return;
  }

  // REGISTER
  if (req.method === "POST" && req.url.includes("/register")) {
    const body = JSON.parse(req.body || "{}");
    if (!body.email || !body.password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    if (data.users.find((u) => u.email === body.email)) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    const newUser = {
      id: Date.now(),
      email: body.email,
      password: body.password,
      role: "user",
    };
    data.users.push(newUser);
    res.json({ user: newUser });
    return;
  }

  // GET BUSES
  if (req.method === "GET" && req.url === "/") {
    res.json(data.buses);
    return;
  }

  // GET BOOKINGS
  if (req.method === "GET" && req.url.includes("/bookings")) {
    res.json(data.bookings);
    return;
  }

  // BOOK
  if (req.method === "POST" && req.url.includes("/book")) {
    const body = JSON.parse(req.body || "{}");
    const bus = data.buses.find((b) => b.id === body.busId);
    if (!bus) {
      res.status(404).json({ error: "Bus not found" });
      return;
    }
    const seats = bus.seats.filter((s) => body.seatIds.includes(s.id));
    const unavailable = seats.filter((s) => !s.available);
    if (unavailable.length) {
      res.status(400).json({ error: "Seats unavailable" });
      return;
    }
    seats.forEach((s) => (s.available = false));
    const total = seats.reduce((sum, s) => sum + s.price, 0);
    const booking = {
      id: Date.now(),
      email: body.email,
      busId: body.busId,
      busName: bus.name,
      route: bus.route,
      seats: seats.map((s) => s.seatNo),
      totalAmount: total,
      bookingTime: new Date().toLocaleString(),
    };
    data.bookings.push(booking);
    res.json({
      success: true,
      message: `Booked ${seats.length} seats`,
      booking,
    });
    return;
  }

  // CANCEL
  if (req.method === "DELETE" && req.url.includes("/bookings/")) {
    const id = parseInt(req.url.split("/bookings/")[1]);
    const booking = data.bookings.find((b) => b.id === id);
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    const bus = data.buses.find((b) => b.id === booking.busId);
    if (bus) {
      booking.seats.forEach((seatNo) => {
        const seat = bus.seats.find((s) => s.seatNo === seatNo);
        if (seat) seat.available = true;
      });
    }
    data.bookings = data.bookings.filter((b) => b.id !== id);
    res.json({ success: true, message: "Cancelled" });
    return;
  }

  res.status(404).json({ error: "Route not found" });
}
