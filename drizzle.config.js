import { config } from 'dotenv';

// Dynamically load the correct environment file.
// If nothing is specified, default to your local development file.
const environment = process.env.NODE_ENV || 'development';
config({ path: `.env.${environment}` });

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
