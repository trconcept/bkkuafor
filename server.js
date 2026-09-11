// Entry point shim for Node.js / Hostinger deployments
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
require('./dist/server.cjs');
