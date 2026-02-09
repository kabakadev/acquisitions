import express from 'express';
import logger from '#config/logger';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(helmet());
app.use(express.json());
app.use()

app.get('/', (req, res) => {
  logger.info('Hello from Acquisition!');

  res.status(200).send('hello from acquisitions!');
});

export default app;
