// Cliente Firebase exclusivo do Sistema de Pedidos.
// A configuração deve ser a do MESMO projeto Firebase usado pelo SamuelFrutasbot.
// Nunca coloque service-account, private key ou senha administrativa aqui.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { PEDIDOS_CONFIG } from './config.js';

const firebaseConfig = PEDIDOS_CONFIG.firebase;
if (!firebaseConfig) {
  throw new Error('Firebase do Sistema de Pedidos ainda não foi configurado.');
}

const app = initializeApp(firebaseConfig, 'samuel-frutas-pedidos');
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function listProducts() {
  const snap = await getDocs(collection(db, PEDIDOS_CONFIG.collections.products));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !p.archived);
}

export async function listAllProducts() {
  const snap = await getDocs(collection(db, PEDIDOS_CONFIG.collections.products));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getConfig() {
  const snap = await getDoc(doc(db, PEDIDOS_CONFIG.collections.config, 'main'));
  return snap.exists() ? snap.data() : {};
}

export async function createOrder(order) {
  const ref = await addDoc(collection(db, PEDIDOS_CONFIG.collections.orders), {
    ...order,
    createdAt: new Date().toISOString(),
    source: order.source || 'github-pages'
  });
  return ref.id;
}

export async function loginAdmin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutAdmin() {
  return signOut(auth);
}
