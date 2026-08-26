import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const headerContent = document.querySelector('.header-content');
    if (!headerContent) {
        return;
    }

    // Acesso temporário à importação das frutas.
    // A importação só é executada quando o usuário clicar na página.
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

    // Ferramenta antiga de correção de imagens.
    // Continua disponível somente se ainda não tiver sido marcada como concluída.
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
