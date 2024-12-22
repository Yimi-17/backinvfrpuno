const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const { Parser } = require('json2csv');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas CRUD con estados L/V
app.get('/imeis', (req, res) => {
  const estado = req.query.estado || 'L';
  if (estado !== 'L' && estado !== 'V') {
    return res.status(400).json({ error: 'Estado debe ser L o V' });
  }
  
  const query = 'SELECT * FROM imeis WHERE estado = ?';
  db.query(query, [estado], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get('/imeis/all', (req, res) => {
  db.query('SELECT * FROM imeis', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/imeis', (req, res) => {
  const { imei, estado } = req.body;
  if (estado && estado !== 'L' && estado !== 'V') {
    return res.status(400).json({ error: 'Estado debe ser L o V' });
  }
  
  // Verificar si el IMEI ya existe
  db.query('SELECT id FROM imeis WHERE imei = ?', [imei], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) {
      return res.status(400).json({ error: 'Este IMEI ya existe' });
    }
    
    const query = 'INSERT INTO imeis (imei, estado) VALUES (?, ?)';
    db.query(query, [imei, estado || 'L'], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: results.insertId, imei, estado: estado || 'L' });
    });
  });
});

app.put('/imeis/:id', (req, res) => {
  const { id } = req.params;
  const { imei, estado } = req.body;
  
  if (estado && estado !== 'L' && estado !== 'V') {
    return res.status(400).json({ error: 'Estado debe ser L o V' });
  }
  
  const query = 'UPDATE imeis SET imei = ?, estado = ? WHERE id = ?';
  db.query(query, [imei, estado, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'IMEI actualizado exitosamente.' });
  });
});

app.delete('/imeis/:id', (req, res) => {
  const { id } = req.params;
  
  // Obtener el IMEI antes de eliminarlo
  const selectQuery = 'SELECT * FROM imeis WHERE id = ?';
  db.query(selectQuery, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'IMEI no encontrado' });
    
    const imeiData = results[0];
    
    // Insertar el IMEI en la tabla imeis_eliminados
    const insertQuery = 'INSERT INTO imeis_eliminados (imei, estado, createdAt, updatedAt) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [imeiData.imei, imeiData.estado, imeiData.createdAt, imeiData.updatedAt], (err) => {
      if (err) return res.status(500).json({ error: err });
      
      // Eliminar el IMEI de la tabla original
      const deleteQuery = 'DELETE FROM imeis WHERE id = ?';
      db.query(deleteQuery, [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'IMEI movido a la tabla imeis_eliminados exitosamente.' });
      });
    });
  });
});

app.get('/export-imeis', (req, res) => {
  const estado = req.query.estado;
  let query = 'SELECT * FROM imeis';
  if (estado) {
    if (estado !== 'L' && estado !== 'V') {
      return res.status(400).json({ error: 'Estado debe ser L o V' });
    }
    query += ' WHERE estado = ?';
  }
  
  db.query(query, estado ? [estado] : [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(results);
    
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=imeis_export.csv');
    res.send(csv);
  });
});

app.get('/export-imeis-excel', (req, res) => {
  const estado = req.query.estado;
  let query = 'SELECT * FROM imeis';
  if (estado) {
    if (estado !== 'L' && estado !== 'V') {
      return res.status(400).json({ error: 'Estado debe ser L o V' });
    }
    query += ' WHERE estado = ?';
  }
  
  db.query(query, estado ? [estado] : [], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    
    const ws = xlsx.utils.json_to_sheet(results);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'IMEIs');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', 'attachment; filename=imeis_export.xlsx');
    res.send(buffer);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});