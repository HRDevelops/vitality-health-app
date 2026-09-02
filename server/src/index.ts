import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config();

import { connectDB } from './config/db';
import { createApp } from './app';

async function main() {
  await connectDB();
  const app = createApp();
  const port = Number(process.env.PORT || 8010);
  app.listen(port, () => {
    console.log(`[server] Vitality API listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
