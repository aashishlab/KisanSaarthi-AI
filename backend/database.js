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

    // New bookings table for arrival slot requests
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL,
      hub_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, approved, rejected
      token_number TEXT,
      slot_time TEXT,
      waiting_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farmer_id) REFERENCES farmers(id),
      FOREIGN KEY (hub_id) REFERENCES hubs(id)
    )`, (err) => {
      if (err) console.error('Error creating bookings table', err.message);
      else console.log('Bookings table ready.');
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
  }
});

module.exports = db;
