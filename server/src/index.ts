import { fileURLToPath } from 'url';
import path from 'path';
import { existsSync } from 'fs';
import express from 'express';
import cors from 'cors';
import propertiesRouter from './routes/properties.js';
import chatRouter from './routes/chat.js';
import propertyChatRouter from './routes/property-chat.js';
import recommendationsRouter from './routes/recommendations.js';
import compareRouter from './routes/compare.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/properties', propertiesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/chat/property', propertyChatRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/compare', compareRouter);

const clientDist = path.join(__dirname, '../../client/dist');
const indexHtml = path.join(clientDist, 'index.html');

if (!existsSync(indexHtml)) {
  console.error(`ERROR: client/dist not found at ${clientDist}`);
  console.error('Run "npm run build" from the repository root before starting.');
  process.exit(1);
}

app.use(express.static(clientDist));
app.get('/{*path}', (_req, res) => {
  res.sendFile(indexHtml);
});

app.listen(PORT, () => {
  console.log(`Lusael server running on port ${PORT}`);
  console.log(`Serving client from ${clientDist}`);
});
