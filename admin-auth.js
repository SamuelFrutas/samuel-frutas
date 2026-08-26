import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = 'login.html';
});

(function configurarListaProdutos() {
    const normalizar = (valor) => String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    function instalarEstilos() {
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
                /* IMPORTANTE: o !important acima precisa respeitar o filtro hidden. */
                .table-wrapper tbody tr[hidden] { display:none!important; }
                .table-wrapper td { display:block!important; width:100%!important; max-width:100%!important; min-width:0!important; box-sizing:border-box!important; padding:5px 0!important; border:0!important; font-size:.78rem!important; overflow-wrap:anywhere!important; word-break:break-word!important; }
                .table-wrapper td:first-child { float:left!important; width:62px!important; max-width:62px!important; padding:0 10px 8px 0!important; }
                .table-wrapper td:nth-child(2) { min-height:52px!important; display:flex!important; align-items:center!important; padding-top:0!important; font-size:.9rem!important; }
                .table-wrapper td:nth-child(3)::before { content:'Categoria: '!important; font-weight:800!important; color:var(--texto-secundario,#607d8b)!important; }
                .table-wrapper td:nth-child(4)::before { content:'Unidades: '!important; font-weight:800!important; color:var(--texto-secundario,#607d8b)!important; }
                .table-wrapper td:nth-child(5)::before { content:'Status: '!important; font-weight:800!important; color:var(--texto-secundario,#607d8b)!important; }
                .table-wrapper td:nth-child(6) { clear:both!important; padding-top:10px!important; }
                .table-wrapper .acoes-celula { display:grid!important; grid-template-columns:1fr 1fr!important; gap:8px!important; width:100%!important; }
                .table-wrapper .btn-editar, .table-wrapper .btn-excluir { width:100%!important; min-width:0!important; min-height:42px!important; padding:0 6px!important; font-size:.72rem!important; white-space:normal!important; }
                .table-wrapper .img-tabela { display:block!important; width:52px!important; height:52px!important; max-width:52px!important; object-fit:cover!important; }
            }
        `;
        document.head.appendChild(style);
    }

    function obter() {
        return {
            busca: document.getElementById('filtro-produto'),
            categoria: document.getElementById('filtro-categoria'),
            ordem: document.getElementById('filtro-ordem'),
            tbody: document.getElementById('lista-produtos-body')
        };
    }

    function aplicarFiltros() {
        const { busca, categoria, ordem, tbody } = obter();
        if (!tbody) return;

        const termo = normalizar(busca?.value);
        const cat = normalizar(categoria?.value);
        const linhas = [...tbody.querySelectorAll('tr')].filter(linha => linha.querySelector('[data-id]'));

        linhas.forEach((linha) => {
            const celulas = linha.querySelectorAll('td');
            const nome = normalizar(celulas[1]?.textContent);
            const categoriaLinha = normalizar(celulas[2]?.textContent);
            const nomeOK = !termo || nome.includes(termo);
            const categoriaOK = !cat || cat === 'todas' || categoriaLinha === cat;
            linha.hidden = !(nomeOK && categoriaOK);
        });

        const modo = ordem?.value;
        if (modo === 'az' || modo === 'za') {
            linhas.sort((a, b) => {
                const na = normalizar(a.querySelectorAll('td')[1]?.textContent);
                const nb = normalizar(b.querySelectorAll('td')[1]?.textContent);
                const resultado = na.localeCompare(nb, 'pt-BR', { sensitivity:'base', numeric:true });
                return modo === 'az' ? resultado : -resultado;
            });
            linhas.forEach(linha => tbody.appendChild(linha));
        }
    }

    function ligarEventos() {
        if (document.documentElement.dataset.sfFiltrosLigados === '1') return;
        document.documentElement.dataset.sfFiltrosLigados = '1';

        document.addEventListener('input', (evento) => {
            if (evento.target?.id === 'filtro-produto') aplicarFiltros();
        });

        document.addEventListener('change', (evento) => {
            if (evento.target?.id === 'filtro-produto' || evento.target?.id === 'filtro-categoria' || evento.target?.id === 'filtro-ordem') aplicarFiltros();
        });

        const observarLista = () => {
            const tbody = document.getElementById('lista-produtos-body');
            if (!tbody || tbody.dataset.sfObserver === '1') return;
            const observer = new MutationObserver(() => {
                clearTimeout(window.__sfFiltroTimer);
                window.__sfFiltroTimer = setTimeout(aplicarFiltros, 30);
            });
            observer.observe(tbody, { childList:true });
            tbody.dataset.sfObserver = '1';
            aplicarFiltros();
        };

        observarLista();
        const timer = setInterval(observarLista, 300);
        setTimeout(() => clearInterval(timer), 15000);
    }

    function iniciar() {
        instalarEstilos();
        ligarEventos();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once:true });
    else iniciar();
})();
