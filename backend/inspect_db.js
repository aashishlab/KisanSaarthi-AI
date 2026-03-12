const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kisansaarthi.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM users', [], (err, factoryRows) => {
  console.log('--- USERS TABLE (Factories) ---');
  if (err) console.error(err);
  else console.table(factoryRows.map(r => ({ ...r, password: r.password.substring(0, 10) + '...' })));

  db.all('SELECT * FROM farmers', [], (err, farmerRows) => {
    console.log('\n--- FARMERS TABLE ---');
    if (err) console.error(err);
    else console.table(farmerRows.map(r => ({ ...r, password: r.password.substring(0, 10) + '...' })));
    db.close();
  });
});
