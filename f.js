require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta principal para verificar que la API funciona
app.get('/', (req, res) => {
  res.send('API de Vía Segura en línea y funcionando correctamente.');
});

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.database_url,
  ssl: {
    rejectUnauthorized: false
  }
});

// Inicializar base de datos
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        sub VARCHAR(255),
        time VARCHAR(255),
        icon VARCHAR(100),
        color VARCHAR(20),
        bg VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla de reportes verificada/creada.");
  } catch (err) {
    console.error("Error inicializando DB:", err);
  }
}
initDB();

// Obtener todos los reportes
app.get('/api/reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo reporte
app.post('/api/reports', async (req, res) => {
  try {
    const { title, sub, time, icon, color, bg } = req.body;
    const result = await pool.query(
      'INSERT INTO reports(title, sub, time, icon, color, bg) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, sub, time, icon, color, bg]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API de Vía Segura ejecutándose en http://localhost:${PORT}`);
  });
}

// Exportar la app para que Vercel la pueda ejecutar como Serverless Function
module.exports = app;
