const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia esto según tu configuración
  password: '', // Cambia esto según tu configuración
  database: 'inventario_imeis',
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos.');
});

module.exports = db;
