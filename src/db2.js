const mysql = require('mysql2');

// Utiliza las variables de entorno para la configuración
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Dirección del host en la nube
  user: process.env.DB_USER, // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña de la base de datos
  database: process.env.DB_NAME, // Nombre de la base de datos
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos.');
});

module.exports = db;
