import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const headerContent = document.querySelector('.header-content');
    if (!headerContent || document.getElementById('btn-corrigir-imagens')) {
        return;
    }

    if (localStorage.getItem('samuel_frutas_imagens_corrigidas') === '1') {
        return;
    }

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
});
