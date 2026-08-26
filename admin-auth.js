import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Proteção do painel administrativo.
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Ajustes responsivos da lista de produtos para celular.
// A tabela deixa de exigir arrastar a tela horizontalmente: cada produto
// passa a ser exibido como um cartão, mantendo editar/excluir visíveis.
function aplicarListaProdutosResponsiva() {
    if (document.getElementById('lista-produtos-mobile-style')) return;

    const style = document.createElement('style');
    style.id = 'lista-produtos-mobile-style';
    style.textContent = `
        @media (max-width: 749px) {
            .table-wrapper {
                overflow-x: visible !important;
                border: 0 !important;
                background: transparent !important;
            }

            .table-wrapper table {
                width: 100% !important;
                min-width: 0 !important;
                display: block;
                background: transparent;
            }

            .table-wrapper thead {
                display: none;
            }

            .table-wrapper tbody,
            .table-wrapper tr {
                display: block;
                width: 100%;
            }

            .table-wrapper tbody tr {
                margin-bottom: 12px;
                padding: 12px;
                border: 1px solid var(--borda, #dfe5df);
                border-radius: 14px;
                background: #fff;
                box-shadow: 0 3px 12px rgba(0,0,0,.06);
            }

            .table-wrapper td {
                display: block;
                width: 100%;
                padding: 5px 0;
                border: 0;
                font-size: .78rem;
                overflow-wrap: anywhere;
            }

            .table-wrapper td:first-child {
                float: left;
                width: 62px;
                padding: 0 10px 8px 0;
            }

            .table-wrapper td:first-child + td {
                min-height: 52px;
                display: flex;
                align-items: center;
                padding-top: 0;
                font-size: .9rem;
            }

            .table-wrapper td:nth-child(2)::before {
                content: '';
            }

            .table-wrapper td:nth-child(3)::before {
                content: 'Categoria: ';
                font-weight: 800;
                color: var(--texto-secundario, #607d8b);
            }

            .table-wrapper td:nth-child(4)::before {
                content: 'Unidade: ';
                font-weight: 800;
                color: var(--texto-secundario, #607d8b);
            }

            .table-wrapper td:nth-child(5)::before {
                content: 'Status: ';
                font-weight: 800;
                color: var(--texto-secundario, #607d8b);
            }

            .table-wrapper td:nth-child(6) {
                padding-top: 10px;
                clear: both;
            }

            .table-wrapper .acoes-celula {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                width: 100%;
            }

            .table-wrapper .btn-editar,
            .table-wrapper .btn-excluir {
                width: 100%;
                min-height: 40px;
                font-size: .74rem;
            }

            .table-wrapper .img-tabela {
                width: 52px;
                height: 52px;
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
