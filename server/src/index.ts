import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Lusael server running on port ${PORT}`);
});
