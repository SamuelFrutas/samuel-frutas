// =========================================================
// FIREBASE - SAMUEL FRUTAS
// =========================================================

// Firebase App
import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Firebase Authentication
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Storage
import {
    getStorage
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";


// =========================================================
// CONFIGURAÇÃO DO FIREBASE
// =========================================================

const firebaseConfig = {
    apiKey: "AIzaSyBLU3UNXuPGUFrpmV6syI80ynUHppupeNA",
    authDomain: "samuel-frutas.firebaseapp.com",
    projectId: "samuel-frutas",
    storageBucket: "samuel-frutas.firebasestorage.app",
    messagingSenderId: "475005081261",
    appId: "1:475005081261:web:314ac91f8b0578b995824"
};


// =========================================================
// INICIALIZAÇÃO
// =========================================================

// Evita inicializar o Firebase mais de uma vez.
const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);


// =========================================================
// SERVIÇOS
// =========================================================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// =========================================================
// EXPORTAÇÕES
// =========================================================

export {
    app,
    auth,
    db,
    storage
};