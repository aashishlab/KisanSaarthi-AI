const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key'; // In a real app, use an environment variable

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Factory & Hub Routes ---

// API Route: Register a new factory with a hub
app.post('/api/factory/register', async (req, res) => {
  const { factory_name, phone, password, hub_name, category, location, latitude, longitude, capacity_per_slot } = req.body;

  if (!factory_name || !phone || !password || !hub_name || !category || !location || latitude == null || longitude == null || !capacity_per_slot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Insert factory user
    const userSql = `INSERT INTO users (name, role, phone, password, location) VALUES (?, 'factory', ?, ?, ?)`;
    db.run(userSql, [factory_name, phone, hashedPassword, location], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'A factory with this phone number already exists.' });
        }
        return res.status(500).json({ error: err.message });
      }

      const factoryId = this.lastID;

      // Step 2: Insert hub linked to factory
      const hubSql = `INSERT INTO hubs (factory_id, name, category, location, latitude, longitude, capacity_per_slot) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(hubSql, [factoryId, hub_name, category, location, parseFloat(latitude), parseFloat(longitude), parseInt(capacity_per_slot)], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          message: 'Factory registered and hub created successfully',
          data: {
            factory_id: factoryId,
            hub_id: this.lastID
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// API Route: Register a new farmer
app.post('/api/farmer/register', async (req, res) => {
  const { name, phone, password, village, vehicle_no, crop_type, preferred_hub } = req.body;
  console.log('Farmer registration attempt:', { name, phone, village, vehicle_no, crop_type, preferred_hub });

  if (!name || !phone || !password || !village || !vehicle_no || !crop_type || !preferred_hub) {
    console.log('Registration failed: Missing fields');
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO farmers (name, phone, password, village, vehicle_no, crop_type, preferred_hub, role)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'farmer')`;
    
    db.run(sql, [name, phone, hashedPassword, village, vehicle_no, crop_type, preferred_hub], function (err) {
      if (err) {
        console.error('Database error during farmer registration:', err.message);
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('phone')) {
            return res.status(400).json({ error: 'A farmer with this phone number already exists.' });
          }
          if (err.message.includes('vehicle_no')) {
            return res.status(400).json({ error: 'This vehicle number is already registered.' });
          }
        }
        return res.status(500).json({ error: err.message });
      }

      console.log('Farmer registered successfully:', { id: this.lastID, name });
      res.status(201).json({
        message: 'Farmer registered successfully',
        data: { id: this.lastID, name, role: 'farmer' }
      });
    });
  } catch (error) {
    console.error('Hashing error during farmer registration:', error);
    res.status(500).json({ error: 'Error hashing password' });
  }
});


// API Route: Unified Login
app.post('/api/login', (req, res) => {
  const { phone, password, role } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required.' });
  }

  // Helper to check password (bcrypt or plain text)
  const checkPassword = async (inputPassword, storedPassword) => {
    if (storedPassword.startsWith('$2b$')) {
      return await bcrypt.compare(inputPassword, storedPassword);
    }
    return inputPassword === storedPassword;
  };

  const checkFarmer = () => {
    return new Promise((resolve) => {
      db.get(`SELECT * FROM farmers WHERE phone = ?`, [phone], async (err, farmer) => {
        if (err || !farmer) return resolve(null);
        const match = await checkPassword(password, farmer.password);
        if (match) {
          const token = jwt.sign({ id: farmer.id, role: 'farmer', name: farmer.name }, JWT_SECRET, { expiresIn: '24h' });
          resolve({ message: 'Login successful', token, role: 'farmer', name: farmer.name });
        } else {
          resolve(null);
        }
      });
    });
  };

  const checkUser = () => {
    return new Promise((resolve) => {
      db.get(`SELECT * FROM users WHERE phone = ?`, [phone], async (err, user) => {
        if (err || !user) return resolve(null);
        const match = await checkPassword(password, user.password);
        if (match) {
          const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
          resolve({ message: 'Login successful', token, role: user.role, name: user.name });
        } else {
          resolve(null);
        }
      });
    });
  };

  const runLogin = async () => {
    if (role === 'farmer') {
      const farmerRes = await checkFarmer();
      if (farmerRes) return res.json({ ...farmerRes, id: (jwt.decode(farmerRes.token)).id });
    } else if (role === 'factory') {
      const userRes = await checkUser();
      if (userRes) return res.json({ ...userRes, id: (jwt.decode(userRes.token)).id });
    } else {
      // Unified login without role hint
      const farmerRes = await checkFarmer();
      if (farmerRes) return res.json({ ...farmerRes, id: (jwt.decode(farmerRes.token)).id });
      const userRes = await checkUser();
      if (userRes) return res.json({ ...userRes, id: (jwt.decode(userRes.token)).id });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  };

  runLogin();
});

// API Route: Create a new hub (from factory dashboard)
app.post('/api/hubs', (req, res) => {
  const { factory_id, name, category, location, latitude, longitude, capacity_per_slot } = req.body;
  if (!name || !category || !location || latitude == null || longitude == null || !capacity_per_slot) {
    return res.status(400).json({ error: 'All hub fields are required.' });
  }

  const sql = `INSERT INTO hubs (factory_id, name, category, location, latitude, longitude, capacity_per_slot) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [factory_id || null, name, category, location, parseFloat(latitude), parseFloat(longitude), parseInt(capacity_per_slot)], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Hub created successfully', data: { id: this.lastID } });
  });
});

// API Route: Get all hubs (with optional category filter)
app.get('/api/hubs', (req, res) => {
  const { category } = req.query;
  let sql = `
    SELECT h.*, 
           (SELECT SUM(load_quantity) FROM bookings b WHERE b.hub_id = h.id AND b.status IN ('Pending', 'Approved', 'In Progress')) as total_load
    FROM hubs h
  `;
  const params = [];

  if (category) {
    sql += ` WHERE h.category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY h.created_at DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API Route: Get hub for a specific factory
app.get('/api/factory/hub/:factory_id', (req, res) => {
  const factory_id = req.params.factory_id;
  db.get(`SELECT * FROM hubs WHERE factory_id = ?`, [factory_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Hub not found for this factory.' });
    res.json(row);
  });
});

// GET /api/hubs/category-counts - Get number of hubs per category
app.get('/api/hubs/category-counts', (req, res) => {
  db.all(`SELECT category, COUNT(*) as count FROM hubs GROUP BY category`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const counts = {};
    rows.forEach(r => {
      counts[r.category] = r.count;
    });
    res.json(counts);
  });
});


// --- Slot & Booking Routes ---

const ALL_SLOTS = [
  '08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM',
];

// ─────────────────────────────────────────────────────────
// FARMER REQUEST ROUTES (requests table)
// ─────────────────────────────────────────────────────────

// POST /api/send-request  – farmer submits a new request
app.post('/api/send-request', (req, res) => {
  const { farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time } = req.body;
  if (!farmer_name || !vehicle_no || !hub_name || !crop_type || !preferred_date || !preferred_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const sql = `INSERT INTO requests (farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time, status)
               VALUES (?, ?, ?, ?, ?, ?, 'Pending')`;
  db.run(sql, [farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Request submitted successfully',
      data: { id: this.lastID, farmer_name, vehicle_no, hub_name, crop_type, preferred_date, preferred_time, status: 'Pending' }
    });
  });
});

// GET /api/requests  – get all pending requests with AI slot recommendation
app.get('/api/requests', (req, res) => {
  const MAX_PER_SLOT = 3;

  db.all(`SELECT arrival_slot, COUNT(*) as count FROM live_queue WHERE status IN ('Waiting','In Progress','Approved') GROUP BY arrival_slot`, [], (err, slotCounts) => {
    if (err) return res.status(500).json({ error: err.message });

    const slotUsage = {};
    ALL_SLOTS.forEach(s => slotUsage[s] = 0);
    slotCounts.forEach(r => { if (slotUsage[r.arrival_slot] !== undefined) slotUsage[r.arrival_slot] = r.count; });
    const availableSlots = ALL_SLOTS.filter(s => slotUsage[s] < MAX_PER_SLOT);

    db.all(`SELECT * FROM requests WHERE status = 'Pending' ORDER BY id ASC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const tentativeSlotUsage = { ...slotUsage };

      const requestsWithRecommendation = rows.map(req => {
        // Match preferred_time to nearest slot
        const preferredIdx = ALL_SLOTS.findIndex(s => s.startsWith(req.preferred_time.split(' ')[0]));
        const matchIdx = preferredIdx >= 0 ? preferredIdx : 0;

        const preferredSlotAvail = ALL_SLOTS[matchIdx] && tentativeSlotUsage[ALL_SLOTS[matchIdx]] < MAX_PER_SLOT;
        let recommendedSlot = null;

        if (preferredSlotAvail) {
          recommendedSlot = ALL_SLOTS[matchIdx];
        } else {
          let bestSlot = null, minDist = Infinity;
          ALL_SLOTS.forEach((slot, idx) => {
            if (tentativeSlotUsage[slot] < MAX_PER_SLOT) {
              const dist = Math.abs(idx - matchIdx);
              if (dist < minDist) { minDist = dist; bestSlot = slot; }
            }
          });
          recommendedSlot = bestSlot;
        }

        if (recommendedSlot) tentativeSlotUsage[recommendedSlot]++;
        const slotLoad = slotUsage[recommendedSlot] || 0;
        const slotLoadLabel = slotLoad === 0 ? 'Empty' : slotLoad < 2 ? 'Low Load' : 'Moderate';

        return { ...req, recommended_slot: recommendedSlot, slot_load: slotLoad, slot_load_label: slotLoadLabel };
      });

      res.json({ requests: requestsWithRecommendation, total: requestsWithRecommendation.length, available_slots: availableSlots });
    });
  });
});

// PUT /api/accept-request/:id  – auto-assign next available slot
app.put('/api/accept-request/:id', (req, res) => {
  const id = req.params.id;
  db.all(`SELECT arrival_slot FROM live_queue WHERE status IN ('Waiting','In Progress','Approved')`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const usedSlots = rows.map(r => r.arrival_slot);
    const nextSlot = ALL_SLOTS.find(s => !usedSlots.includes(s)) || ALL_SLOTS[0];
    db.run(`UPDATE requests SET status = 'Approved', assigned_slot = ? WHERE id = ? AND status = 'Pending'`, [nextSlot, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Request not found or already processed.' });
      res.json({ message: 'Request accepted and slot assigned', data: { id, status: 'Approved', arrival_slot: nextSlot } });
    });
  });
});

// PUT /api/reject-request/:id  – reject a pending request
app.put('/api/reject-request/:id', (req, res) => {
  const id = req.params.id;
  db.run(`UPDATE requests SET status = 'Rejected' WHERE id = ? AND status = 'Pending'`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Request not found or already processed.' });
    res.json({ message: 'Request rejected', data: { id, status: 'Rejected' } });
  });
});

// PUT /api/assign-slot/:id  – manually assign a specific slot
app.put('/api/assign-slot/:id', (req, res) => {
  const id = req.params.id;
  const { arrival_slot } = req.body;
  if (!arrival_slot) return res.status(400).json({ error: 'Arrival slot is required.' });
  db.run(`UPDATE requests SET status = 'Approved', assigned_slot = ? WHERE id = ?`, [arrival_slot, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Request not found.' });
    res.json({ message: 'Slot assigned successfully', data: { id, status: 'Approved', arrival_slot } });
  });
});

// GET /api/pending-count  – live badge count
app.get('/api/pending-count', (req, res) => {
  const { hub_id } = req.query;
  let sql = `SELECT COUNT(*) as count FROM bookings WHERE status = 'Pending'`;
  const params = [];

  if (hub_id) {
    sql += ` AND hub_id = ?`;
    params.push(hub_id);
  }

  db.get(sql, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: row.count });
  });
});

// ─────────────────────────────────────────────────────────
// FACTORY-CONTROLLED SLOT SYSTEM (Updated Spec)
// ─────────────────────────────────────────────────────────

// 1. POST /api/slots - Factory defines a new slot
app.post('/api/slots', (req, res) => {
  const { hub_id, slot_time, capacity } = req.body;
  if (!hub_id || !slot_time || !capacity) {
    return res.status(400).json({ error: 'Hub ID, slot time, and capacity are required.' });
  }

  const sql = `INSERT INTO slots (hub_id, slot_time, capacity, booked_count) VALUES (?, ?, ?, 0)`;
  db.run(sql, [hub_id, slot_time, capacity], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Slot created successfully',
      data: { id: this.lastID, hub_id, slot_time, capacity, booked_count: 0 }
    });
  });
});

// 2. GET /api/slots - Fetch slots for a hub
app.get('/api/slots', (req, res) => {
  const { hub_id } = req.query;
  if (!hub_id) return res.status(400).json({ error: 'Hub ID is required.' });

  const sql = `SELECT * FROM slots WHERE hub_id = ? ORDER BY slot_time ASC`;
  db.all(sql, [hub_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 3. POST /api/book-slot - Farmer books arrival slot(s) with multi-slot support
app.post('/api/book-slot', (req, res) => {
  const { farmer_id, hub_id, vehicle_number, total_load, slots } = req.body;
  if (!farmer_id || !hub_id || !vehicle_number || !total_load || !slots || !slots.length) {
    return res.status(400).json({ error: 'All fields including valid slots are required.' });
  }

  // Calculate estimated wait time based on queue load IN FRONT of them
  const calcWaitTime = (callback) => {
    db.get(`SELECT SUM(load_quantity) as total_load_ahead FROM bookings WHERE hub_id = ? AND status IN ('Pending', 'Approved', 'In Progress')`, [hub_id], (err, row) => {
      let loadAhead = row?.total_load_ahead || 0;
      
      db.get(`SELECT processing_capacity_per_hour FROM hubs WHERE id = ?`, [hub_id], (err, hub) => {
        const capacity = hub?.processing_capacity_per_hour || 1;
        const waitTimeRaw = (loadAhead / capacity) * 60;
        
        let waitTimeString = "0 minutes";
        if (waitTimeRaw >= 60) {
          const hrs = Math.floor(waitTimeRaw / 60);
          const mins = Math.round(waitTimeRaw % 60);
          waitTimeString = mins > 0 ? `${hrs} hours ${mins} minutes` : `${hrs} hours`;
        } else {
          waitTimeString = `${Math.round(waitTimeRaw)} minutes`;
        }
        
        callback(waitTimeString);
      });
    });
  };


  db.get(`SELECT COUNT(*) as count FROM bookings WHERE hub_id = ? AND status IN ('Pending', 'Approved', 'In Progress')`, [hub_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const newToken = (row.count || 0) + 1;

    db.serialize(() => {
      // Create the main booking
      const insertBooking = `INSERT INTO bookings (farmer_id, hub_id, slot_id, vehicle_no, load_quantity, token_number, status)
                             VALUES (?, ?, ?, ?, ?, ?, 'Pending')`;
      
      // We use the first slot_id as the primary reference for the booking table, though it spans multiple
      const primary_slot_id = slots[0].slot_id;

      db.run(insertBooking, [farmer_id, hub_id, primary_slot_id, vehicle_number, total_load, newToken], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const bookingId = this.lastID;

        const slotUpdateStmt = db.prepare(`UPDATE slots SET booked_count = booked_count + 1, total_booked_load = total_booked_load + ? WHERE id = ?`);
        const allocStmt = db.prepare(`INSERT INTO booking_slots (booking_id, slot_id, load_allocated) VALUES (?, ?, ?)`);

        slots.forEach(a => {
          slotUpdateStmt.run(a.allocated_load, a.slot_id);
          allocStmt.run(bookingId, a.slot_id, a.allocated_load);
        });

        slotUpdateStmt.finalize();
        allocStmt.finalize();

        db.run(`UPDATE hubs SET queue_size = queue_size + 1 WHERE id = ?`, [hub_id]);

        calcWaitTime((estimated_wait_time) => {
          res.status(201).json({
            booking_id: bookingId,
            token_number: newToken,
            allocated_slots: slots.map(s => ({ slot_time: s.slot_time, load: s.allocated_load })),
            estimated_wait_time
          });
        });
      });
    });
  });
});

// 4. GET /api/bookings - Get all bookings for a hub (Factory side)
app.get('/api/bookings', (req, res) => {
  const { hub_id } = req.query;
  if (!hub_id) return res.status(400).json({ error: 'Hub ID is required.' });

  const sql = `
    SELECT b.*, f.name as farmer_name, f.phone as farmer_phone, f.crop_type,
           (SELECT GROUP_CONCAT(s.slot_time, ', ') 
            FROM booking_slots bs 
            JOIN slots s ON bs.slot_id = s.id 
            WHERE bs.booking_id = b.id) as slot_time
    FROM bookings b
    JOIN farmers f ON b.farmer_id = f.id
    WHERE b.hub_id = ?
    ORDER BY b.created_at ASC
  `;
  db.all(sql, [hub_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 5. PUT /api/update-booking-status - Update booking status
app.put('/api/update-booking-status', (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ error: 'ID and status are required.' });

  db.get(`SELECT * FROM bookings WHERE id = ?`, [id], (err, booking) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    db.run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // If completed or rejected, free up the slots? 
      // Actually, if rejected, we MUST free up slots.
      if (status === 'Rejected') {
        db.all(`SELECT * FROM booking_slots WHERE booking_id = ?`, [id], (err, allocs) => {
          if (!err) {
            db.serialize(() => {
              const freeStmt = db.prepare(`UPDATE slots SET booked_count = booked_count - 1, total_booked_load = total_booked_load - ? WHERE id = ?`);
              allocs.forEach(a => freeStmt.run(a.load_allocated, a.slot_id));
              freeStmt.finalize();
            });
          }
        });
        db.run(`UPDATE hubs SET queue_size = CASE WHEN queue_size > 0 THEN queue_size - 1 ELSE 0 END WHERE id = ?`, [booking.hub_id]);
      } else if (status === 'Completed') {
        db.run(`UPDATE hubs SET queue_size = CASE WHEN queue_size > 0 THEN queue_size - 1 ELSE 0 END WHERE id = ?`, [booking.hub_id]);
      }

      res.json({ message: 'Status updated successfully' });
    });
  });
});



// ─────────────────────────────────────────────────────────
// LIVE QUEUE ROUTES (live_queue table)
// ─────────────────────────────────────────────────────────

// GET /api/queue – live queue data for factory dashboard
app.get('/api/queue', (req, res) => {
  db.all(`SELECT * FROM live_queue WHERE status NOT IN ('Rejected') ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const waiting = rows.filter(r => r.status === 'Approved' || r.status === 'Waiting').length;
    const active = rows.filter(r => r.status === 'In Progress').length;
    const completed = rows.filter(r => r.status === 'Mark Unloaded').length;
    res.json({ metrics: { waiting, active, completed }, queue: rows });
  });
});

// PUT /api/update-status/:id – update booking status in queue
app.put('/api/update-status/:id', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  db.run(`UPDATE live_queue SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Status updated', data: { id: req.params.id, status } });
  });
});

app.get('/api/farmer/profile/:id', (req, res) => {
  const farmer_id = req.params.id;
  
  const sql = `
    SELECT f.*, 
           (SELECT COUNT(*) FROM bookings WHERE farmer_id = f.id AND status = 'Completed') as total_visits,
           (SELECT h.name FROM bookings b JOIN hubs h ON b.hub_id = h.id WHERE b.farmer_id = f.id AND b.status = 'Completed' ORDER BY b.created_at DESC LIMIT 1) as last_factory,
           (SELECT GROUP_CONCAT(s.slot_time, ', ') 
            FROM booking_slots bs 
            JOIN slots s ON bs.slot_id = s.id 
            WHERE bs.booking_id = (SELECT id FROM bookings WHERE farmer_id = f.id ORDER BY created_at DESC LIMIT 1)) as last_slot,
           (SELECT COUNT(*) FROM bookings WHERE farmer_id = f.id AND status = 'Pending') as pending_requests,
           (SELECT COUNT(*) FROM bookings WHERE farmer_id = f.id AND status = 'Approved') as approved_requests,
           (SELECT COUNT(*) FROM bookings WHERE farmer_id = f.id) as total_bookings
    FROM farmers f
    WHERE f.id = ?
  `;

  db.get(sql, [farmer_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Farmer not found' });

    // Calculate reliability score
    const total = row.total_bookings || 0;
    const completed = row.total_visits || 0;
    const reliability = total > 0 ? Math.round((completed / total) * 100) : 100;

    res.json({
      ...row,
      reliability_score: reliability,
      avg_waiting_time: "45 min" // Mocked for now as real calculation needs historical tracking
    });
  });
});

app.get('/api/farmer/bookings/:farmer_id', (req, res) => {
  const farmer_id = req.params.farmer_id;
  const sql = `
    SELECT b.*, h.name as hub_name, h.location as hub_location, h.category as hub_category, 
           h.queue_size, h.processing_capacity_per_hour, 
           (SELECT GROUP_CONCAT(s.slot_time, ', ') 
            FROM booking_slots bs 
            JOIN slots s ON bs.slot_id = s.id 
            WHERE bs.booking_id = b.id) as slot_time,
           (SELECT SUM(load_quantity) FROM bookings WHERE hub_id = b.hub_id AND status IN ('Pending', 'Approved', 'In Progress')) as total_hub_load
    FROM bookings b
    JOIN hubs h ON b.hub_id = h.id
    WHERE b.farmer_id = ?
    ORDER BY b.created_at DESC
  `;
  db.all(sql, [farmer_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Calculate waiting_time for each booking: total_load / processing_capacity
    const processedRows = rows.map(row => {
      let waitTimeString = "0 min";
      const totalLoad = row.total_hub_load || 0;
      const capacity = row.processing_capacity_per_hour || 1; // avoid div by 0

      const waitTimeRaw = (totalLoad / capacity) * 60;
      if (waitTimeRaw >= 60) {
        const hrs = Math.floor(waitTimeRaw / 60);
        const mins = Math.round(waitTimeRaw % 60);
        waitTimeString = mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
      } else {
        waitTimeString = `${Math.max(0, Math.round(waitTimeRaw))} min`;
      }
      return { ...row, waiting_time: waitTimeString };
    });
    
    res.json(processedRows);
  });
});

// API Route: Update hub settings and generate slots automatically
app.put('/api/hubs/:hub_id/settings', (req, res) => {
  const { hub_id } = req.params;
  const { processing_capacity_per_hour, average_truck_load, working_start_time, working_end_time, break_start, break_end } = req.body;

  if (!processing_capacity_per_hour || !average_truck_load || !working_start_time || !working_end_time) {
    return res.status(400).json({ error: 'All configuration fields are required.' });
  }

  // Update hub settings
  const updateHubSql = `
    UPDATE hubs SET 
      processing_capacity_per_hour = ?, 
      average_truck_load = ?, 
      working_start_time = ?, 
      working_end_time = ?, 
      break_start = ?, 
      break_end = ?
    WHERE id = ?
  `;

  db.run(updateHubSql, [
    processing_capacity_per_hour, 
    average_truck_load, 
    working_start_time, 
    working_end_time, 
    break_start, 
    break_end, 
    hub_id
  ], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Auto-generate slots
    const capacity_numeric = parseFloat(processing_capacity_per_hour);
    const load_numeric = parseFloat(average_truck_load);
    const trucks_per_hour = capacity_numeric / load_numeric;
    const slot_duration = Math.floor(60 / trucks_per_hour);
    const capacity_per_slot = load_numeric;

    // Helper to parse time string "HH:MM" to minutes
    const toMins = (t) => {
      if (!t) return -1;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    // Helper to format minutes to "HH:MM AM/PM"
    const fromMins = (m) => {
      let hrs = Math.floor(m / 60);
      const mins = m % 60;
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
    };

    const start = toMins(working_start_time);
    const end = toMins(working_end_time);
    const bStart = break_start ? toMins(break_start) : -1;
    const bEnd = break_end ? toMins(break_end) : -1;

    db.serialize(() => {
      // Clear existing slots for this hub
      db.run(`DELETE FROM slots WHERE hub_id = ?`, [hub_id]);

      let current = start;
      const stmt = db.prepare(`INSERT INTO slots (hub_id, slot_time, capacity, booked_count, total_booked_load) VALUES (?, ?, ?, 0, 0)`);
      
      while (current + slot_duration <= end) {
        // Skip break hours
        if (bStart !== -1 && bEnd !== -1) {
          if (current >= bStart && current < bEnd) {
            current = bEnd;
            continue;
          }
        }

        const slotLabel = `${fromMins(current)} - ${fromMins(current + slot_duration)}`;
        stmt.run(hub_id, slotLabel, capacity_per_slot);
        current += slot_duration;
      }
      
      stmt.finalize();
      res.json({ message: 'Settings updated and slots generated successfully.' });
    });
  });
});

// --- Chatbot API ---
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const userMessage = message.toLowerCase();
  let reply = "I am KisanSaarthi's AI assistant. How can I help you today?";

  // Simple intent detection for farmer navigation
  if (userMessage.includes('dashboard') || userMessage.includes('home')) {
    reply = "Sure! I can help you with your dashboard. Redirecting you to your dashboard now.";
  } else if (userMessage.includes('hub') || userMessage.includes('nearby')) {
    reply = "Looking for hub information? I'll show you the nearby hubs and booking options.";
  } else if (userMessage.includes('queue') || userMessage.includes('waiting') || userMessage.includes('line')) {
    reply = "I'll take you to the live queue status page so you can check and track your position.";
  } else if (userMessage.includes('booking') || userMessage.includes('book') || userMessage.includes('slot')) {
    reply = "Need to book a slot? I'll open the slot booking page for you.";
  } else if (userMessage.includes('crop') || userMessage.includes('price')) {
    reply = "I can guide you to your activity section where you can view and find more info about crops and bookings.";
  } else if (userMessage.includes('help') || userMessage.includes('support')) {
    reply = "I'm here to help! You can ask me to navigate to the dashboard, book a slot, or check the queue status.";
  }

  res.json({ reply });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
