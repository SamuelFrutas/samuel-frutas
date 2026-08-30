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
//
// O index.html já possui a leitura original de unidades. O painel
// passou a salvar também BDJ, 1/4, 1/8 e metade. Este adaptador
// apenas acrescenta essas formas aos dados que chegam ao catálogo,
// sem substituir a lógica original.
// =========================================================

function adaptarDadosProduto(data) {

    const resultado = {
        ...data,
        unidadesMedida: data?.unidadesMedida
            ? { ...data.unidadesMedida }
            : undefined
    };

    const u = resultado.unidadesMedida || {};
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

    if (temForma("bdj", "bdj", "bandeja")) {
        resultado.unidadesMedida = resultado.unidadesMedida || {};
        resultado.unidadesMedida.bdj = true;
    }

    if (temForma("umQuarto", "1/4", "¼", "um quarto")) {
        resultado.unidadesMedida = resultado.unidadesMedida || {};
        resultado.unidadesMedida.umQuarto = true;
    }

    if (temForma("umOitavo", "1/8", "⅛", "um oitavo")) {
        resultado.unidadesMedida = resultado.unidadesMedida || {};
        resultado.unidadesMedida.umOitavo = true;
    }

    if (temForma("metade", "metade", "1/2", "½")) {
        resultado.unidadesMedida = resultado.unidadesMedida || {};
        resultado.unidadesMedida.metade = true;
    }

    return resultado;
}


// O index.html atribui o getDocs à janela depois que este módulo
// é carregado. Interceptamos somente essa atribuição para adaptar
// os dados dos produtos; nenhuma outra operação do Firebase muda.
const descriptorOriginal = Object.getOwnPropertyDescriptor(
    window,
    "getDocs"
);

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
                        const originalData = docSnap.data();
                        const adaptedData = adaptarDadosProduto(originalData);

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