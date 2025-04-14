const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());

// Middleware sprawdzający rolę użytkownika
function checkRole(requiredRole) {
  return (req, res, next) => {
    const userRole = req.headers['x-role'];  // Odczytujemy rolę z nagłówka X-Role
    if (!userRole) {
      return res.status(401).json({ error: 'Brak nagłówka x-role - nieautoryzowany dostęp.' });
    }
    if (userRole !== requiredRole) {
      return res.status(403).json({ error: `Dostęp zarezerwowany dla roli "${requiredRole}" (obecnie: "${userRole}").` });
    }
    next();
  };
}

// Połączenie z bazą danych SQLite
const db = new sqlite3.Database('../database.db', (err) => {
  if (err) {
    console.error('Błąd połączenia z bazą danych:', err.message);
  } else {
    console.log('Połączono z bazą danych SQLite.');
  }
});

/*
  API dla serwisantów (obsługa awarii i infrastruktury)
*/

// Pobieranie listy awarii (tylko dla roli "service")
app.get('/outages', checkRole('service'), (req, res) => {
  const query = `
    SELECT * FROM SERVICE_REQUESTS 
    WHERE STATUS IN ('otwarte', 'w trakcie')
    ORDER BY CREATED_AT DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania awarii:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Dodawanie nowej awarii (tylko dla roli "service")
app.post('/outages', checkRole('service'), (req, res) => {
  const { customerId, description, priority, assignedTo } = req.body;
  const now = new Date().toISOString();
  
  const query = `
    INSERT INTO SERVICE_REQUESTS (CUSTOMER_ID, DESCRIPTION, STATUS, PRIORITY, ASSIGNED_TO, CREATED_AT, UPDATED_AT)
    VALUES (?, ?, 'otwarte', ?, ?, ?, ?)
  `;
  
  db.run(query, [customerId, description, priority, assignedTo, now, now], function(err) {
    if (err) {
      console.error('Błąd podczas dodawania awarii:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ 
        id: this.lastID,
        message: 'Awaria została dodana pomyślnie'
      });
    }
  });
});

// Aktualizacja statusu awarii (tylko dla roli "service")
app.put('/outages/:id', checkRole('service'), (req, res) => {
  const { id } = req.params;
  const { status, description } = req.body;
  const now = new Date().toISOString();
  
  const query = `
    UPDATE SERVICE_REQUESTS 
    SET STATUS = ?, DESCRIPTION = ?, UPDATED_AT = ?
    WHERE REQUEST_ID = ?
  `;
  
  db.run(query, [status, description, now, id], function(err) {
    if (err) {
      console.error('Błąd podczas aktualizacji awarii:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ 
        message: 'Awaria została zaktualizowana pomyślnie',
        changes: this.changes
      });
    }
  });
});

// Pobieranie danych infrastruktury (tylko dla roli "service")
app.get('/infrastructure', checkRole('service'), (req, res) => {
  const query = 'SELECT * FROM NETWORK_INFRASTRUCTURE';
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania infrastruktury:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

/*
  API dla konsultantów (obsługa planów, klientów i fakturowania)
*/

// Pobieranie planów taryfowych (tylko dla roli "consultant")
app.get('/plans', checkRole('consultant'), (req, res) => {
  // Testowe dane – w przyszłości można zmienić na pobieranie z bazy
  res.json([
    { id: 1, name: 'Speedster', speed: '900 Mb/s', price: '79.99', type: 'Indywidualny' },
    { id: 2, name: 'Domowy Komfort', speed: '300 Mb/s', price: '59.99', type: 'Indywidualny' },
    { id: 3, name: 'Game On', speed: '600 Mb/s', price: '69.99', type: 'Indywidualny' },
    { id: 4, name: '4business', speed: '1 Gb/s', price: '94.99', type: 'Biznesowy' },
    { id: 5, name: '4business Ultra', speed: '2 Gb/s', price: '149.99', type: 'Biznesowy' }
  ]);
});

// Pobieranie listy klientów (tylko dla roli "consultant")
app.get('/customers', checkRole('consultant'), (req, res) => {
  const query = 'SELECT * FROM CUSTOMERS';
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania klientów:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Tworzenie faktury (tylko dla roli "consultant")
app.post('/invoices', checkRole('consultant'), (req, res) => {
  const { customerId, customerName, lines } = req.body;
  
  db.run('BEGIN TRANSACTION');
  
  // Dodanie nagłówka faktury
  db.run(
    'INSERT INTO INVOICES (CUSTOMER_ID, CUSTOMER_NAME) VALUES (?, ?)',
    [customerId, customerName],
    function(err) {
      if (err) {
        db.run('ROLLBACK');
        console.error('Błąd podczas tworzenia faktury:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      const invoiceId = this.lastID;
      let lineInsertions = 0;
      
      // Dodanie pozycji faktury
      lines.forEach((line, index) => {
        db.run(
          'INSERT INTO INVOICE_LINES (INVOICE_ID, LINE_NUMBER, TITLE, LINE_AMOUNT) VALUES (?, ?, ?, ?)',
          [invoiceId, index + 1, line.title, line.amount],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Błąd podczas dodawania pozycji faktury:', err.message);
              res.status(500).json({ error: err.message });
              return;
            }
            
            lineInsertions++;
            
            // Jeśli wszystkie linie zostały dodane, zatwierdź transakcję
            if (lineInsertions === lines.length) {
              db.run('COMMIT');
              res.status(201).json({ 
                id: invoiceId,
                message: 'Faktura została utworzona pomyślnie'
              });
            }
          }
        );
      });
    }
  );
});

// Pobieranie faktur (tylko dla roli "consultant")
app.get('/invoices', checkRole('consultant'), (req, res) => {
  const query = `
    SELECT i.INVOICE_ID, i.CUSTOMER_ID, i.CUSTOMER_NAME, 
           GROUP_CONCAT(il.LINE_AMOUNT) as AMOUNTS
    FROM INVOICES i
    JOIN INVOICE_LINES il ON i.INVOICE_ID = il.INVOICE_ID
    GROUP BY i.INVOICE_ID
    ORDER BY i.INVOICE_ID DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania faktur:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      // Przetwarzanie danych - obliczenie sumy dla każdej faktury
      const invoices = rows.map(row => {
        const amounts = row.AMOUNTS.split(',').map(Number);
        const total = amounts.reduce((sum, amount) => sum + amount, 0);
        
        return {
          id: row.INVOICE_ID,
          customerId: row.CUSTOMER_ID,
          customerName: row.CUSTOMER_NAME,
          total: total.toFixed(2)
        };
      });
      
      res.json(invoices);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server działa na http://localhost:${PORT}`);
});
