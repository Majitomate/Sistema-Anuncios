require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Base de datos conectada');
  } catch (error) {
    console.error('❌ Error conectando a la base');
  }

  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});