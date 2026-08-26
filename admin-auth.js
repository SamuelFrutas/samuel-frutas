import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Proteção do painel administrativo.
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Responsividade da lista de produtos no celular.
function aplicarListaProdutosResponsiva() {
    if (document.getElementById('lista-produtos-mobile-style')) return;

    const style = document.createElement('style');
    style.id = 'lista-produtos-mobile-style';
    style.textContent = `
        @media (max-width: 749px) {
            html, body { width:100%!important; max-width:100%!important; overflow-x:hidden!important; }
            .container, main, .admin-grid, .products-section, .products-section.card { width:100%!important; max-width:100%!important; min-width:0!important; }
            .products-section { overflow:hidden!important; }
            .products-filters { display:grid!important; grid-template-columns:1fr!important; gap:8px!important; }
            .products-filters input, .products-filters select { width:100%!important; min-width:0!important; box-sizing:border-box!important; }
            .table-wrapper { width:100%!important; max-width:100%!important; min-width:0!important; overflow:visible!important; border:0!important; background:transparent!important; }
            .table-wrapper table { width:100%!important; max-width:100%!important; min-width:0!important; display:block!important; background:transparent!important; }
            .table-wrapper thead { display:none!important; }
            .table-wrapper tbody { display:block!important; width:100%!important; }
            .table-wrapper tbody tr { display:block!important; width:100%!important; max-width:100%!important; min-width:0!important; box-sizing:border-box!important; margin:0 0 12px!important; padding:12px!important; border:1px solid var(--borda,#dfe5df)!important; border-radius:14px!important; background:#fff!important; box-shadow:0 3px 12px rgba(0,0,0,.06)!important; overflow:hidden!important; }
            .table-wrapper td { display:block!important; width:100%!important; max-width:100%!important; min-width:0!important; box-sizing:border-box!important; padding:5px 0!important; border:0!important; font-size:.78rem!important; overflow-wrap:anywhere!important; word-break:break-word!important; }
            .table-wrapper td:first-child { float:left!important; width:62px!important; max-width:62px!important; padding:0 10px 8px 0!important; }
            .table-wrapper td:nth-child(2) { min-height:52px!important; display:flex!important; align-items:center!important; padding-top:0!important; font-size:.9rem!important; }
            .table-wrapper td:nth-child(3)::before { content:'Categoria: '!important; font-weight:800!important; color:var(--texto-secundario,#607d8b)!important; }
            .table-wrapper td:nth-child(4)::before { content:'Unidades: '!important; font-weight:800!important; color:var(--texto-secundario,#607d8b)!important; }
            .table-wrapper td:nth-child(5)::before { content:'Status: '!important; font-weight:800!important; color:var(--texto-secundario,#607d8b)!important; }
            .table-wrapper td:nth-child(6) { clear:both!important; padding-top:10px!important; }
            .table-wrapper .acoes-celula { display:grid!important; grid-template-columns:1fr 1fr!important; gap:8px!important; width:100%!important; }
            .table-wrapper .btn-editar,.table-wrapper .btn-excluir { width:100%!important; min-width:0!important; min-height:42px!important; padding:0 6px!important; font-size:.72rem!important; white-space:normal!important; }
            .table-wrapper .img-tabela { display:block!important; width:52px!important; height:52px!important; max-width:52px!important; object-fit:cover!important; }
        }
    `;
    document.head.appendChild(style);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarListaProdutosResponsiva, { once: true });
} else {
    aplicarListaProdutosResponsiva();
}

// Filtros da lista de produtos.
(function iniciarFiltrosProdutos() {
    const normalizar = (valor) => String(valor ?? '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim();

    function aplicar() {
        const busca = document.getElementById('filtro-produto');
        const categoria = document.getElementById('filtro-categoria');
        const ordem = document.getElementById('filtro-ordem');
        const tbody = document.getElementById('lista-produtos-body');
        if (!tbody) return;

        const termo = normalizar(busca?.value);
        const cat = normalizar(categoria?.value);
        const linhas = [...tbody.querySelectorAll('tr')].filter(linha => linha.querySelector('[data-id]'));

        linhas.forEach(linha => {
            const celulas = linha.querySelectorAll('td');
            const nome = normalizar(celulas[1]?.textContent);
            const categoriaLinha = normalizar(celulas[2]?.textContent);
            const correspondeBusca = !termo || nome.includes(termo);
            const correspondeCategoria = !cat || cat === 'todas' || categoriaLinha === cat;
            linha.style.display = correspondeBusca && correspondeCategoria ? '' : 'none';
        });

        if (ordem && (ordem.value === 'az' || ordem.value === 'za')) {
            const visiveis = linhas.filter(linha => linha.style.display !== 'none');
            visiveis.sort((a,b) => {
                const na = normalizar(a.querySelectorAll('td')[1]?.textContent);
                const nb = normalizar(b.querySelectorAll('td')[1]?.textContent);
                return ordem.value === 'az' ? na.localeCompare(nb, 'pt-BR') : nb.localeCompare(na, 'pt-BR');
            });
            visiveis.forEach(linha => tbody.appendChild(linha));
        }
    }

    function ligar() {
        ['filtro-produto','filtro-categoria','filtro-ordem'].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.dataset.filtroLigado) {
                el.addEventListener('input', aplicar);
                el.addEventListener('change', aplicar);
                el.dataset.filtroLigado = '1';
            }
        });
        const tbody = document.getElementById('lista-produtos-body');
        if (tbody && !tbody.dataset.observadorFiltros) {
            new MutationObserver(() => setTimeout(aplicar, 0)).observe(tbody, { childList:true, subtree:true });
            tbody.dataset.observadorFiltros = '1';
        }
        aplicar();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar, { once:true });
    else ligar();
})();
