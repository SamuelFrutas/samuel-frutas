// =========================================================
// FIREBASE - SAMUEL FRUTAS
// =========================================================

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBLU3UNXuPGUFrpmV6syI80ynUHppupeNA",
    authDomain: "samuel-frutas.firebaseapp.com",
    projectId: "samuel-frutas",
    storageBucket: "samuel-frutas.firebasestorage.app",
    messagingSenderId: "475005081261",
    appId: "1:475005081261:web:314ac91f8b0578b995824"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

function adaptarDadosProduto(data) {
    const resultado = { ...data };
    const u = data?.unidadesMedida || {};
    const formas = data?.formasVenda || data?.formasDeVenda;
    const temForma = (nome, ...alternativas) => {
        if (u[nome] === true || formas?.[nome] === true) return true;
        if (Array.isArray(formas)) return formas.some(v => {
            const texto = String(v).trim().toLowerCase();
            return alternativas.some(a => texto === a || texto.includes(a));
        });
        return false;
    };
    const unidades = [];
    if (u.unidade === true || data?.unidade === true || data?.un === true) unidades.push("UN");
    if (u.quilo === true || data?.quilo === true || data?.kg === true) unidades.push("KG");
    if (u.maco === true || data?.maco === true || data?.maço === true) unidades.push("MAÇO");
    if (u.duzia === true || data?.duzia === true || data?.dúzia === true) unidades.push("DÚZIA");
    if (u.lote === true || data?.lote === true) {
        const qtd = parseInt(u.quantidadePorLote || data?.quantidadeLote || 3, 10);
        unidades.push(qtd > 0 ? `LOTE C/${qtd}` : "LOTE");
    }
    if (temForma("bdj", "bdj", "bandeja")) unidades.push("BDJ");
    if (temForma("umQuarto", "1/4", "¼", "um quarto")) unidades.push("1/4");
    if (temForma("umOitavo", "1/8", "⅛", "um oitavo")) unidades.push("1/8");
    if (temForma("metade", "metade", "1/2", "½")) unidades.push("METADE");
    const listaAntiga = data?.unidades || data?.units;
    if (Array.isArray(listaAntiga)) listaAntiga.forEach(v => {
        const texto = String(v).trim().toUpperCase();
        if (texto.includes("BDJ") || texto.includes("BANDEJA")) unidades.push("BDJ");
        else if (texto.includes("1/4") || texto.includes("¼")) unidades.push("1/4");
        else if (texto.includes("1/8") || texto.includes("⅛")) unidades.push("1/8");
        else if (texto.includes("METADE") || texto.includes("1/2") || texto.includes("½")) unidades.push("METADE");
        else unidades.push(texto);
    });
    if (unidades.length) {
        resultado.unidades = [...new Set(unidades)];
        resultado.units = resultado.unidades;
        resultado.unidadesMedida = undefined;
    }
    return resultado;
}

Object.defineProperty(window, "getDocs", {
    configurable: true,
    get() { return this.__samuelGetDocs; },
    set(fn) {
        if (typeof fn !== "function") { this.__samuelGetDocs = fn; return; }
        this.__samuelGetDocs = async function(...args) {
            const snapshot = await fn(...args);
            if (!snapshot || typeof snapshot.forEach !== "function") return snapshot;
            return new Proxy(snapshot, {
                get(target, prop, receiver) {
                    if (prop !== "forEach") return Reflect.get(target, prop, receiver);
                    return callback => target.forEach(docSnap => {
                        const adaptedData = adaptarDadosProduto(docSnap.data());
                        const adaptedDoc = new Proxy(docSnap, {
                            get(docTarget, docProp, docReceiver) {
                                if (docProp === "data") return () => adaptedData;
                                return Reflect.get(docTarget, docProp, docReceiver);
                            }
                        });
                        callback(adaptedDoc);
                    });
                }
            });
        };
    }
});

// Desktop: mantém os três emojis de Outros lado a lado e dentro da bolinha.
// Mobile: os mesmos três emojis ficam lado a lado e dentro da bolinha,
// sem alterar o restante do layout.
const estiloOutros = document.createElement("style");
estiloOutros.textContent = `
    button.category-card[onclick="showView('aguaOvos')"] .category-icon {
        position: relative !important;
        overflow: hidden !important;
    }

    @media (min-width: 750px) {
        button.category-card[onclick="showView('aguaOvos')"] .category-icon {
            font-size: 0 !important;
            white-space: nowrap !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        button.category-card[onclick="showView('aguaOvos')"] .category-icon::before {
            content: "🥥 🥚 🍯";
            display: block;
            width: 100%;
            text-align: center;
            white-space: nowrap;
            font-size: 1rem;
            line-height: 1;
            letter-spacing: -0.04rem;
        }
    }

    @media (max-width: 749px) {
        button.category-card[onclick="showView('aguaOvos')"] .category-icon {
            font-size: 0 !important;
            white-space: nowrap !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        button.category-card[onclick="showView('aguaOvos')"] .category-icon::before {
            content: "🥥 🥚 🍯";
            display: block;
            width: 100%;
            text-align: center;
            white-space: nowrap;
            font-size: 1rem;
            line-height: 1;
            letter-spacing: -0.08rem;
        }
    }
`;
document.head.appendChild(estiloOutros);

export { app, auth, db, storage };