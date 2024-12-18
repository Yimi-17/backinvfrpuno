const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const { Parser } = require('json2csv');
const xlsx = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas CRUD
app.get('/imeis', (req, res) => {
  db.query('SELECT * FROM imeis', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/imeis', (req, res) => {
  const { imei, estado } = req.body;
  const query = 'INSERT INTO imeis (imei, estado) VALUES (?, ?)';
  db.query(query, [imei, estado], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: results.insertId, imei, estado });
  });
});

app.put('/imeis/:id', (req, res) => {
  const { id } = req.params;
  const { imei, estado } = req.body;
  const query = 'UPDATE imeis SET imei = ?, estado = ? WHERE id = ?';
  db.query(query, [imei, estado, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'IMEI actualizado exitosamente.' });
  });
});

app.delete('/imeis/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM imeis WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'IMEI eliminado exitosamente.' });
  });
});


// Ruta para exportar los IMEIs a CSV
app.get('/export-imeis', (req, res) => {
    db.query('SELECT * FROM imeis', (err, results) => {
      if (err) return res.status(500).json({ error: err });
  
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(results);
  
      // Guardar el archivo CSV en el servidor (opcional)
      const filePath = path.join(__dirname, 'imeis_export.csv');
      fs.writeFileSync(filePath, csv);
  
      // Enviar el archivo al cliente
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename=imeis_export.csv');
      res.send(csv);
    });
  });

  // Ruta para exportar los IMEIs a Excel
app.get('/export-imeis-excel', (req, res) => {
    db.query('SELECT * FROM imeis', (err, results) => {
      if (err) return res.status(500).json({ error: err });
  
      const ws = xlsx.utils.json_to_sheet(results);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'IMEIs');
  
      const filePath = path.join(__dirname, 'imeis_export.xlsx');
      xlsx.writeFile(wb, filePath);
  
      // Enviar el archivo Excel al cliente
      const file = fs.readFileSync(filePath);
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.header('Content-Disposition', 'attachment; filename=imeis_export.xlsx');
      res.send(file);
    });
  });


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
