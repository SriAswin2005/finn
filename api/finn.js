import { createRequestHandler } from '../src/server.js';

// Keep every UI/API/asset request behind the same gate in local and hosted runs.
export default createRequestHandler();
