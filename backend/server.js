import dotenv from 'dotenv';
dotenv.config();

import dotenv from 'dotenv';

dotenv.config();

import app, { httpServer } from './app.js';

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {

}); 