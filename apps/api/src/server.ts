import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API running at http://localhost:${env.PORT}/${env.API_PREFIX}`);
});
