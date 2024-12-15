const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Asegúrate de que este es el archivo correcto para la conexión

const IMEI = sequelize.define('IMEI', {
  imei: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'L', // L para Libre
  },
}, {
  timestamps: true, // Esto añade automáticamente las columnas createdAt y updatedAt
});

module.exports = IMEI;
