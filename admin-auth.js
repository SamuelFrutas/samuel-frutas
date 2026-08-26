import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return;

    // Importação de frutas: fica visível diretamente no painel para o usuário autenticado.
    if (!document.getElementById('btn-importar-frutas')) {
        const button = document.createElement('button');
        button.id = 'btn-importar-frutas';
        button.type = 'button';
        button.className = 'header-button';
        button.textContent = '🍎 Importar frutas';
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

    // A antiga ferramenta de correção de imagens continua separada e não interfere na importação.
    if (
        !document.getElementById('btn-corrigir-imagens') &&
        localStorage.getItem('samuel_frutas_imagens_corrigidas') !== '1'
    ) {
        const button = document.createElement('button');
        button.id = 'btn-corrigir-imagens';
        button.type = 'button';
        button.className = 'header-button';
        button.textContent = '🖼️ Corrigir imagens';
        button.addEventListener('click', () => {
            window.location.href = 'corrigir-imagens-hortifruti.html';
        });

        const lojaButton = headerContent.querySelector('.header-button');
        if (lojaButton) {
            headerContent.insertBefore(button, lojaButton);
        } else {
            headerContent.appendChild(button);
        }
    }
});
