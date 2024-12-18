const mysql = require('mysql2');

// URL pública proporcionada por Railway
const db = mysql.createConnection({
  host: 'junction.proxy.rlwy.net',    // Host público de Railway
  user: 'root',                        // Tu usuario de base de datos
  password: 'DtgDkOKbJHbNIMLePFUUfNWRbYZBegla', // Tu contraseña de base de datos
  database: 'railway',                 // Nombre de la base de datos
  port: 44923                          // Puerto proporcionado por Railway
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});


// Exporta el pool para usarlo en otros archivos
module.exports = db;