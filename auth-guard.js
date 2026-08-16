// =========================================================
// ADMIN-AUTH.JS - SAMUEL FRUTAS
// Controle de acesso ao painel administrativo
// =========================================================

import {
    auth
} from './firebase.js';

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


// =========================================================
// VERIFICA AUTENTICAÇÃO
// =========================================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            // Não existe usuário autenticado.
            // Volta para a página de login.

            window.location.href =
                'login.html';

            return;
        }


        // Usuário autenticado.
        // O admin.js pode continuar normalmente.

        console.log(
            'Usuário autenticado:',
            user.email || user.uid
        );
    }
);