import express from 'express';
import serverless from 'serverless-http';
import { createApiRouter } from '../../src/server/apiRouter';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Netlify strips the "/api" prefix isn't guaranteed depending on redirect config,
// so we mount the router at both "/" and "/api" to be safe.
const router = createApiRouter();
app.use('/', router);
app.use('/api', router);

export const handler = serverless(app);
