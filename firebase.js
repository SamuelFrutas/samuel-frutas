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

// =========================================================
// DOM: regras visuais e calendário
// =========================================================

const estilo = document.createElement("style");
estilo.textContent = `
    button.category-card[onclick="showView('aguaOvos')"] .category-icon {
        position: relative !important;
        overflow: hidden !important;
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
        line-height: 1;
    }
    @media (min-width: 750px) {
        button.category-card[onclick="showView('aguaOvos')"] .category-icon::before {
            font-size: 1rem;
            letter-spacing: -0.04rem;
        }
    }
    @media (max-width: 749px) {
        button.category-card[onclick="showView('aguaOvos')"] .category-icon::before {
            font-size: 1rem;
            letter-spacing: -0.08rem;
        }
    }
    .date-input.sunday-disabled,
    .date-input.invalid-date-disabled {
        border-color: var(--vermelho) !important;
        background: #fff5f5 !important;
    }
`;
document.head.appendChild(estilo);

function dataEhDomingo(valor) {
    if (!valor) return false;
    const partes = String(valor).split("-").map(Number);
    if (partes.length !== 3 || partes.some(Number.isNaN)) return false;
    return new Date(partes[0], partes[1] - 1, partes[2]).getDay() === 0;
}

function dataEhHojeOuAnterior(valor) {
    if (!valor) return false;
    const partes = String(valor).split("-").map(Number);
    if (partes.length !== 3 || partes.some(Number.isNaN)) return false;
    const data = new Date(partes[0], partes[1] - 1, partes[2]);
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return data <= inicioHoje;
}

function obterCampoDataAgendamento() {
    return [...document.querySelectorAll('input[type="date"], #delivery-date, .date-input')]
        .find(input => input.value) || document.querySelector('input[type="date"], #delivery-date, .date-input');
}

function proximaEntregaEstaSelecionada() {
    const textos = ["próxima entrega disponível", "proxima entrega disponivel", "próxima entrega", "proxima entrega"];
    return [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')].some(input => {
        const bloco = input.closest('label, div, p, section')?.textContent?.toLowerCase() || "";
        return input.checked && textos.some(t => bloco.includes(t));
    });
}

function rejeitarDataInvalida(input, mensagem) {
    if (!input) return false;
    alert(mensagem);
    input.value = "";
    input.classList.add("invalid-date-disabled");
    try { input.dispatchEvent(new Event("change", { bubbles: true })); } catch (_) {}
    return false;
}

function validarDataNoEnvio(event) {
    const input = obterCampoDataAgendamento();
    if (!input) return true;

    if (dataEhDomingo(input.value)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return rejeitarDataInvalida(input, "Não é possível agendar para domingo. Domingo não temos atendimento.");
    }

    if (input.value && dataEhHojeOuAnterior(input.value)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return rejeitarDataInvalida(input, "Não é possível agendar para o dia atual ou para dias anteriores.");
    }

    if (!input.value && !proximaEntregaEstaSelecionada()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        input.classList.add("invalid-date-disabled");
        alert("Escolha uma data para o agendamento.");
        try { input.focus(); } catch (_) {}
        return false;
    }
    return true;
}

document.addEventListener("submit", validarDataNoEnvio, true);
document.addEventListener("click", event => {
    const botao = event.target?.closest?.('button, input[type="submit"], [role="button"]');
    if (!botao) return;
    const texto = String(botao.textContent || botao.value || "").trim().toLowerCase();
    if (texto.includes("enviar") || texto.includes("pedido") || texto.includes("agendar")) validarDataNoEnvio(event);
}, true);

document.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    validarDataNoEnvio(event);
}, true);

function instalarBloqueioDomingo() {
    const procurar = () => {
        const campos = [...document.querySelectorAll('input[type="date"], #delivery-date, .date-input')];
        campos.forEach(input => {
            if (input.__domingoInstalado) return;
            input.__domingoInstalado = true;
            input.addEventListener("change", () => {
                if (dataEhDomingo(input.value)) {
                    rejeitarDataInvalida(input, "Não é possível agendar para domingo. Domingo não temos atendimento.");
                } else if (dataEhHojeOuAnterior(input.value)) {
                    rejeitarDataInvalida(input, "Não é possível agendar para o dia atual ou para dias anteriores.");
                } else {
                    input.classList.remove("sunday-disabled", "invalid-date-disabled");
                }
            }, true);
        });
    };
    procurar();
    const observer = new MutationObserver(procurar);
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

document.addEventListener("DOMContentLoaded", instalarBloqueioDomingo);
if (document.readyState !== "loading") instalarBloqueioDomingo();

export { app, auth, db, storage };