import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// O botão fica disponível no próprio painel assim que o HTML estiver pronto.
// A autenticação continua protegendo a página normalmente.
function adicionarBotaoImportarFrutas() {
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return;
    if (document.getElementById('btn-importar-frutas')) return;

    const button = document.createElement('button');
    button.id = 'btn-importar-frutas';
    button.type = 'button';
    button.className = 'header-button';
    button.textContent = '🍎 Importar frutas';
    button.setAttribute('aria-label', 'Importar frutas para o banco de dados');
    button.addEventListener('click', () => {
        window.location.href = 'importar-frutas.html';
    });

    const lojaButton = headerContent.querySelector('.header-button');
    if (lojaButton) {
        headerContent.insertBefore(button, lojaButton);
    } else {
        headerContent.appendChild(button);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', adicionarBotaoImportarFrutas, { once: true });
} else {
    adicionarBotaoImportarFrutas();
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Garante o botão também após a confirmação da sessão.
    adicionarBotaoImportarFrutas();
});