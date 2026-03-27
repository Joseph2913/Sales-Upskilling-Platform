import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import routes from './routes.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

// Initialise database (creates tables + seed data on first run)
getDb();
console.log('Database initialised.');

app.listen(PORT, () => {
  console.log(`Voice simulation server running on http://localhost:${PORT}`);
});
