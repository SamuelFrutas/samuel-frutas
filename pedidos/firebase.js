import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { PEDIDOS_CONFIG } from './config.js';

const app = initializeApp(PEDIDOS_CONFIG.firebase);
export const db = getFirestore(app);
export { app };
