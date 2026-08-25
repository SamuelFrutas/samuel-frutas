import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const headerContent = document.querySelector('.header-content');
    if (!headerContent || document.getElementById('btn-importar-legumes-verduras')) {
        return;
    }

    const button = document.createElement('button');
    button.id = 'btn-importar-legumes-verduras';
    button.type = 'button';
    button.className = 'header-button';
    button.textContent = '🥕 Importar legumes e verduras';
    button.addEventListener('click', () => {
        window.location.href = 'importar-verduras-legumes-exec.html';
    });

    const lojaButton = headerContent.querySelector('.header-button');
    if (lojaButton) {
        headerContent.insertBefore(button, lojaButton);
    } else {
        headerContent.appendChild(button);
    }
});
