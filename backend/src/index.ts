import express from 'express';
import cors from 'cors';
import { buildServer } from './server';

const app = express();
const PORT = process.env.PORT || 3001;

const server = buildServer();
const serverInfo = server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});