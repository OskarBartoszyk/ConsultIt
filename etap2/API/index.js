const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8080;

// Połączenie z bazą danych SQLite
const db = new sqlite3.Database('../database.db', (err) => {
  if (err) {
    console.error('Błąd połączenia z bazą danych:', err.message);
  } else {
    console.log('Połączono z bazą danych SQLite.');
  }
});

// Zwracanie Logów 
app.get('/error-logs', (req, res) => {
  const query = 'SELECT * FROM ERROR_LOGS';
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania danych:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server działa na http://localhost:${PORT}`);
});