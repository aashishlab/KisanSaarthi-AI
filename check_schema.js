const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(hubs)", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  if (!rows || rows.length === 0) {
    console.log("No hubs table found!");
  } else {
    console.log("Hubs table columns:");
    rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
  }
  db.close();
});
