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
// CORREÇÃO DE UNIDADES NO SITE DE AGENDAMENTO
//
// Mantém a lógica existente e acrescenta as novas formas
// cadastradas no painel: BDJ, 1/4, 1/8 e Metade.
// =========================================================

function instalarCorrecaoUnidadesAgendamento() {

    if (window.__samuelUnidadesCorrigidas) {
        return true;
    }

    if (typeof window.parseUnits !== "function") {
        return false;
    }

    const parseUnitsOriginal = window.parseUnits;

    window.parseUnits = function(data) {

        const unidades = parseUnitsOriginal(data);
        const resultado = Array.isArray(unidades)
            ? [...unidades]
            : [];

        const u = data?.unidadesMedida;
        const formas = data?.formasVenda || data?.formasDeVenda;

        const temBdj =
            u?.bdj === true ||
            formas?.bdj === true ||
            (Array.isArray(formas) && formas.some(v =>
                String(v).toLowerCase().includes("bdj") ||
                String(v).toLowerCase().includes("bandeja")
            ));

        const temUmQuarto =
            u?.umQuarto === true ||
            formas?.umQuarto === true ||
            (Array.isArray(formas) && formas.some(v =>
                String(v).replace(/\s/g, "").includes("1/4")
            ));

        const temUmOitavo =
            u?.umOitavo === true ||
            formas?.umOitavo === true ||
            (Array.isArray(formas) && formas.some(v =>
                String(v).replace(/\s/g, "").includes("1/8")
            ));

        const temMetade =
            u?.metade === true ||
            formas?.metade === true ||
            (Array.isArray(formas) && formas.some(v =>
                String(v).toLowerCase().includes("metade") ||
                String(v).replace(/\s/g, "").includes("1/2")
            ));

        const temUnidadeExplicita =
            u?.unidade === true ||
            data?.unidade === true ||
            data?.un === true ||
            (Array.isArray(formas) && formas.some(v =>
                String(v).toLowerCase().includes("unidade") ||
                String(v).toLowerCase() === "un"
            ));

        const novas = [];

        if (temBdj) novas.push("BDJ");
        if (temUmQuarto) novas.push("1/4");
        if (temUmOitavo) novas.push("1/8");
        if (temMetade) novas.push("METADE");

        if (novas.length > 0) {

            // O parse antigo devolve UN como fallback quando não
            // conhece as novas formas. Remova esse fallback quando
            // o produto não foi cadastrado como Unidade.
            if (!temUnidadeExplicita) {
                const semFallback = resultado.filter(unidade =>
                    String(unidade).toUpperCase() !== "UN"
                );
                resultado.length = 0;
                resultado.push(...semFallback);
            }

            novas.forEach(unidade => {
                if (!resultado.includes(unidade)) {
                    resultado.push(unidade);
                }
            });
        }

        return resultado.length > 0 ? resultado : ["UN"];
    };

    window.__samuelUnidadesCorrigidas = true;
    return true;
}


// O arquivo principal define parseUnits depois deste módulo.
// Aguarda a função existir e então aplica somente o complemento.
const timerUnidades = setInterval(() => {
    if (instalarCorrecaoUnidadesAgendamento()) {
        clearInterval(timerUnidades);
    }
}, 10);


// =========================================================
// RESPONSIVIDADE DA CATEGORIA "OUTROS"
// Três emojis juntos precisam ser menores para manter
// proporção visual com as demais categorias.
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