// =========================================================
// FIREBASE - SAMUEL FRUTAS
// =========================================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
// COMPATIBILIDADE DAS FORMAS DE VENDA NO AGENDAMENTO
// =========================================================

function adaptarDadosProduto(data) {

    const resultado = { ...data };
    const u = data?.unidadesMedida || {};
    const formas = data?.formasVenda || data?.formasDeVenda;

    const temForma = (nome, ...alternativas) => {
        if (u[nome] === true) return true;
        if (formas?.[nome] === true) return true;

        if (Array.isArray(formas)) {
            return formas.some(v => {
                const texto = String(v).trim().toLowerCase();
                return alternativas.some(a => texto === a || texto.includes(a));
            });
        }

        return false;
    };

    const unidades = [];

    // Preserva todas as formas antigas que o agendamento já entende.
    if (u.unidade === true || data?.unidade === true || data?.un === true) unidades.push("UN");
    if (u.quilo === true || data?.quilo === true || data?.kg === true) unidades.push("KG");
    if (u.maco === true || data?.maco === true || data?.maço === true) unidades.push("MAÇO");
    if (u.duzia === true || data?.duzia === true || data?.dúzia === true) unidades.push("DÚZIA");

    if (u.lote === true || data?.lote === true) {
        const qtd = parseInt(u.quantidadePorLote || data?.quantidadeLote || 3, 10);
        unidades.push(qtd > 0 ? `LOTE C/${qtd}` : "LOTE");
    }

    // Novas formas solicitadas.
    if (temForma("bdj", "bdj", "bandeja")) unidades.push("BDJ");
    if (temForma("umQuarto", "1/4", "¼", "um quarto")) unidades.push("1/4");
    if (temForma("umOitavo", "1/8", "⅛", "um oitavo")) unidades.push("1/8");
    if (temForma("metade", "metade", "1/2", "½")) unidades.push("METADE");

    // Formato antigo em array também é preservado.
    const listaAntiga = data?.unidades || data?.units;
    if (Array.isArray(listaAntiga)) {
        listaAntiga.forEach(v => {
            const texto = String(v).trim().toUpperCase();
            if (texto.includes("BDJ") || texto.includes("BANDEJA")) unidades.push("BDJ");
            else if (texto.includes("1/4") || texto.includes("¼")) unidades.push("1/4");
            else if (texto.includes("1/8") || texto.includes("⅛")) unidades.push("1/8");
            else if (texto.includes("METADE") || texto.includes("1/2") || texto.includes("½")) unidades.push("METADE");
            else unidades.push(texto);
        });
    }

    if (unidades.length > 0) {
        // Faz o index.html usar a lista consolidada, evitando o fallback para UN.
        resultado.unidades = [...new Set(unidades)];
        resultado.units = resultado.unidades;
        resultado.unidadesMedida = undefined;
    }

    return resultado;
}


// O index.html atribui getDocs à janela depois que este módulo é carregado.
// Interceptamos apenas essa atribuição para adaptar os dados dos produtos.
Object.defineProperty(window, "getDocs", {
    configurable: true,
    get() {
        return this.__samuelGetDocs;
    },
    set(fn) {
        if (typeof fn !== "function") {
            this.__samuelGetDocs = fn;
            return;
        }

        this.__samuelGetDocs = async function(...args) {
            const snapshot = await fn(...args);

            if (!snapshot || typeof snapshot.forEach !== "function") {
                return snapshot;
            }

            return new Proxy(snapshot, {
                get(target, prop, receiver) {
                    if (prop !== "forEach") {
                        return Reflect.get(target, prop, receiver);
                    }

                    return callback => target.forEach(docSnap => {
                        const adaptedData = adaptarDadosProduto(docSnap.data());

                        const adaptedDoc = new Proxy(docSnap, {
                            get(docTarget, docProp, docReceiver) {
                                if (docProp === "data") {
                                    return () => adaptedData;
                                }
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


// =========================================================
// RESPONSIVIDADE DA CATEGORIA "OUTROS"
// =========================================================

const estiloOutros = document.createElement("style");
estiloOutros.textContent = `
    button.category-card[onclick="showView('aguaOvos')"] .category-icon {
        font-size: 1.45rem;
    }

    @media (min-width: 600px) {
        button.category-card[onclick="showView('aguaOvos')"] .category-icon {
            font-size: 1.7rem;
        }
    }

    @media (min-width: 900px) {
        button.category-card[onclick="showView('aguaOvos')"] .category-icon {
            font-size: 1.9rem;
        }
    }
`;
document.head.appendChild(estiloOutros);


// =========================================================
// EXPORTAÇÕES
// =========================================================

export {
    app,
    auth,
    db,
    storage
};