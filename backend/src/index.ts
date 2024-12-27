import express from 'express';
import { createServer } from 'http';
import testPlanRoutes from './routes/testPlanRoutes';
import fileRoutes from './routes/fileRoutes';
import deviceRoutes from './routes/deviceRoutes';
import { Logger } from './utils/logger';
import cors from 'cors';
import { WebSocketService } from './websocket';
import { initWebSocketService } from './websocketGlobal';
import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = express();
const httpServer = createServer(app);
const websocketService = new WebSocketService(httpServer);
initWebSocketService(websocketService);

app.use(cors());
app.use(express.json());
app.use('/api', testPlanRoutes);
app.use('/api', fileRoutes);
app.use('/api', deviceRoutes);
const port = config.port || 3000;
httpServer.listen(port, () => {
    Logger.info(`Server running on port ${port}`);
});