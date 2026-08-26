import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Proteção do painel administrativo.
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Lista de produtos realmente responsiva no celular.
// O CSS original ainda mantinha uma tabela de 760px. Aqui sobrescrevemos
// esse comportamento e transformamos cada linha em um cartão sem rolagem lateral.
function aplicarListaProdutosResponsiva() {
    if (document.getElementById('lista-produtos-mobile-style')) return;

    const style = document.createElement('style');
    style.id = 'lista-produtos-mobile-style';
    style.textContent = `
        @media (max-width: 749px) {
            html, body {
                width: 100% !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
            }

            .container,
            main,
            .admin-grid,
            .products-section,
            .products-section.card {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
            }

            .products-section {
                overflow: hidden !important;
            }

            .table-wrapper {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                overflow: visible !important;
                overflow-x: hidden !important;
                border: 0 !important;
                background: transparent !important;
            }

            .table-wrapper table {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                display: block !important;
                table-layout: auto !important;
                background: transparent !important;
            }

            .table-wrapper thead {
                display: none !important;
            }

            .table-wrapper tbody {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .table-wrapper tbody tr {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                margin: 0 0 12px 0 !important;
                padding: 12px !important;
                border: 1px solid var(--borda, #dfe5df) !important;
                border-radius: 14px !important;
                background: #fff !important;
                box-shadow: 0 3px 12px rgba(0,0,0,.06) !important;
                overflow: hidden !important;
            }

            .table-wrapper td {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                padding: 5px 0 !important;
                border: 0 !important;
                font-size: .78rem !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
            }

            .table-wrapper td:first-child {
                float: left !important;
                width: 62px !important;
                max-width: 62px !important;
                padding: 0 10px 8px 0 !important;
            }

            .table-wrapper td:nth-child(2) {
                min-height: 52px !important;
                display: flex !important;
                align-items: center !important;
                padding-top: 0 !important;
                font-size: .9rem !important;
            }

            .table-wrapper td:nth-child(3)::before {
                content: 'Categoria: ' !important;
                font-weight: 800 !important;
                color: var(--texto-secundario, #607d8b) !important;
            }

            .table-wrapper td:nth-child(4)::before {
                content: 'Unidades: ' !important;
                font-weight: 800 !important;
                color: var(--texto-secundario, #607d8b) !important;
            }

            .table-wrapper td:nth-child(5)::before {
                content: 'Status: ' !important;
                font-weight: 800 !important;
                color: var(--texto-secundario, #607d8b) !important;
            }

            .table-wrapper td:nth-child(6) {
                clear: both !important;
                padding-top: 10px !important;
            }

            .table-wrapper .acoes-celula {
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
                gap: 8px !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .table-wrapper .btn-editar,
            .table-wrapper .btn-excluir {
                display: block !important;
                width: 100% !important;
                min-width: 0 !important;
                min-height: 42px !important;
                padding: 0 6px !important;
                font-size: .72rem !important;
                white-space: normal !important;
            }

            .table-wrapper .img-tabela {
                display: block !important;
                width: 52px !important;
                height: 52px !important;
                max-width: 52px !important;
            }
        }
    `;

    document.head.appendChild(style);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarListaProdutosResponsiva, { once: true });
} else {
    aplicarListaProdutosResponsiva();
}
