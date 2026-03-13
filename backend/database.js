const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kisansaarthi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Original table renamed to live_queue
    db.run(`CREATE TABLE IF NOT EXISTS live_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_name TEXT NOT NULL,
      vehicle_no TEXT NOT NULL,
      hub_name TEXT NOT NULL,
      arrival_slot TEXT NOT NULL,
      status TEXT DEFAULT 'Waiting'
    )`, (err) => {
      if (err) console.error('Error creating live_queue table', err.message);
      else console.log('live_queue table ready.');
    });

    // Updated bookings table to match new spec
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL,
      hub_id INTEGER NOT NULL,
      slot_id INTEGER,
      vehicle_no TEXT,
      load_quantity REAL DEFAULT 0,
      token_number INTEGER,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'In Progress', 'Completed', 'Rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (hub_id) REFERENCES hubs(id),
      FOREIGN KEY (slot_id) REFERENCES slots(id)
    )`, (err) => {
      if (err) console.error('Error creating bookings table', err.message);
      else console.log('Bookings table ready.');
    });

    // New booking_slots table for multi-slot support
    db.run(`CREATE TABLE IF NOT EXISTS booking_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      slot_id INTEGER NOT NULL,
      load_allocated REAL NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (slot_id) REFERENCES slots(id)
    )`, (err) => {
      if (err) console.error('Error creating booking_slots table', err.message);
      else console.log('booking_slots table ready.');
    });

    // New slots table defined by factory
    db.run(`CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hub_id INTEGER NOT NULL,
      slot_time TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      booked_count INTEGER DEFAULT 0,
      total_booked_load REAL DEFAULT 0,
      FOREIGN KEY (hub_id) REFERENCES hubs(id)
    )`, (err) => {
      if (err) console.error('Error creating slots table', err.message);
      else console.log('Slots table ready.');
    });

    // New requests table (farmer request submissions)
    db.run(`CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_name TEXT NOT NULL,
      vehicle_no TEXT NOT NULL,
      hub_name TEXT NOT NULL,
      crop_type TEXT NOT NULL,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      assigned_slot TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating requests table', err.message);
      else console.log('Requests table ready.');

    });

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      location TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating users table', err.message);
      } else {
        console.log('Users table ready.');
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS hubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factory_id INTEGER,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      capacity_per_slot INTEGER NOT NULL,
      processing_capacity_per_hour REAL DEFAULT 40,
      average_truck_load REAL DEFAULT 10,
      working_start_time TEXT DEFAULT '08:00',
      working_end_time TEXT DEFAULT '18:00',
      break_start TEXT DEFAULT '12:00',
      break_end TEXT DEFAULT '13:00',
      queue_size INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (factory_id) REFERENCES users(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating hubs table', err.message);
      } else {
        console.log('Hubs table ready.');
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      village TEXT NOT NULL,
      vehicle_no TEXT NOT NULL UNIQUE,
      crop_type TEXT NOT NULL,
      preferred_hub TEXT NOT NULL,
      role TEXT DEFAULT 'farmer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating farmers table', err.message);
      } else {
        console.log('Farmers table ready.');
      }
    });

    // --- Dynamic Migrations (Add missing columns to existing tables) ---
    const migrations = [
      { table: 'hubs', column: 'processing_capacity_per_hour', type: 'REAL DEFAULT 40' },
      { table: 'hubs', column: 'average_truck_load', type: 'REAL DEFAULT 10' },
      { table: 'hubs', column: 'working_start_time', type: "TEXT DEFAULT '08:00'" },
      { table: 'hubs', column: 'working_end_time', type: "TEXT DEFAULT '18:00'" },
      { table: 'hubs', column: 'break_start', type: "TEXT DEFAULT '12:00'" },
      { table: 'hubs', column: 'break_end', type: "TEXT DEFAULT '13:00'" },
      { table: 'hubs', column: 'capacity_per_slot', type: "REAL DEFAULT 10" },
      { table: 'slots', column: 'total_booked_load', type: 'REAL DEFAULT 0' },
      { table: 'bookings', column: 'load_quantity', type: 'REAL DEFAULT 0' }
    ];

    migrations.forEach(m => {
      db.all(`PRAGMA table_info(${m.table})`, [], (err, rows) => {
        if (!err && rows) {
          const exists = rows.some(r => r.name === m.column);
          if (!exists) {
            db.run(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type}`, (err) => {
              if (err) console.error(`Error migrating ${m.table}.${m.column}:`, err.message);
              else console.log(`Migrated ${m.table}: Added ${m.column}`);
            });
          }
        }
      });
    });
  }
});

module.exports = db;
