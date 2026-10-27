const path = require('node:path');
const dns = require("dns"); 
const dotenv = require('dotenv');
const app = require('./src/app');
const connectDatabase = require('./src/config/database');

dotenv.config({ path: path.join(__dirname, '.env') });
dns.setServers(["8.8.8.8", "1.1.1.1"]);
async function startServer() {
  const { MONGODB_URI, JWT_SECRET } = process.env;
  const port = Number(process.env.PORT) || 3200;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI doit être renseigné dans backend/.env');
  }
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET doit contenir au moins 32 caractères dans backend/.env');
  }

  await connectDatabase(MONGODB_URI);
  app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Impossible de démarrer le serveur :', error.message);
    process.exitCode = 1;
  });
}

module.exports = startServer;
