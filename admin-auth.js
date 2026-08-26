import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Proteção do painel administrativo.
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = 'login.html';
});

// Responsividade da lista de produtos no celular.
function aplicarListaProdutosResponsiva() {
    if (document.getElementById('lista-produtos-mobile-style')) return;
    const style = document.createElement('style');
    style.id = 'lista-produtos-mobile-style';
    style.textContent = `
        @media (max-width: 749px) {
            html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important}
            .container,main,.admin-grid,.products-section,.products-section.card{width:100%!important;max-width:100%!important;min-width:0!important}
            .products-section{overflow:hidden!important}
            .products-filters{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
            .products-filters input,.products-filters select{width:100%!important;min-width:0!important;box-sizing:border-box!important}
            .table-wrapper{width:100%!important;max-width:100%!important;min-width:0!important;overflow:visible!important;border:0!important;background:transparent!important}
            .table-wrapper table{width:100%!important;max-width:100%!important;min-width:0!important;display:block!important;background:transparent!important}
            .table-wrapper thead{display:none!important}.table-wrapper tbody{display:block!important;width:100%!important}
            .table-wrapper tbody tr{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:0 0 12px!important;padding:12px!important;border:1px solid var(--borda,#dfe5df)!important;border-radius:14px!important;background:#fff!important;box-shadow:0 3px 12px rgba(0,0,0,.06)!important;overflow:hidden!important}
            .table-wrapper td{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;padding:5px 0!important;border:0!important;font-size:.78rem!important;overflow-wrap:anywhere!important;word-break:break-word!important}
            .table-wrapper td:first-child{float:left!important;width:62px!important;max-width:62px!important;padding:0 10px 8px 0!important}
            .table-wrapper td:nth-child(2){min-height:52px!important;display:flex!important;align-items:center!important;padding-top:0!important;font-size:.9rem!important}
            .table-wrapper td:nth-child(3)::before{content:'Categoria: '!important;font-weight:800!important;color:var(--texto-secundario,#607d8b)!important}
            .table-wrapper td:nth-child(4)::before{content:'Unidades: '!important;font-weight:800!important;color:var(--texto-secundario,#607d8b)!important}
            .table-wrapper td:nth-child(5)::before{content:'Status: '!important;font-weight:800!important;color:var(--texto-secundario,#607d8b)!important}
            .table-wrapper td:nth-child(6){clear:both!important;padding-top:10px!important}
            .table-wrapper .acoes-celula{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important}
            .table-wrapper .btn-editar,.table-wrapper .btn-excluir{width:100%!important;min-width:0!important;min-height:42px!important;padding:0 6px!important;font-size:.72rem!important;white-space:normal!important}
            .table-wrapper .img-tabela{display:block!important;width:52px!important;height:52px!important;max-width:52px!important;object-fit:cover!important}
        }
    `;
    document.head.appendChild(style);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicarListaProdutosResponsiva, { once:true });
else aplicarListaProdutosResponsiva();

// Filtros da lista de produtos.
(function iniciarFiltrosProdutos(){
    const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    let ultimaAssinatura = '';
    let agendado = false;

    function obterElementos(){
        return {
            busca: document.getElementById('filtro-produto'),
            categoria: document.getElementById('filtro-categoria'),
            ordem: document.getElementById('filtro-ordem'),
            tbody: document.getElementById('lista-produtos-body')
        };
    }

    function aplicar(){
        const { busca, categoria, ordem, tbody } = obterElementos();
        if (!tbody) return;
        const termo = normalizar(busca?.value);
        const cat = normalizar(categoria?.value);
        const linhas = [...tbody.querySelectorAll('tr')].filter(l => l.querySelector('[data-id]'));

        linhas.forEach(linha => {
            const celulas = linha.querySelectorAll('td');
            const nome = normalizar(celulas[1]?.textContent);
            const categoriaLinha = normalizar(celulas[2]?.textContent);
            const mostra = (!termo || nome.includes(termo)) && (!cat || cat === 'todas' || categoriaLinha === cat);
            linha.style.display = mostra ? '' : 'none';
        });

        if (ordem?.value === 'az' || ordem?.value === 'za') {
            const visiveis = linhas.filter(l => l.style.display !== 'none');
            visiveis.sort((a,b) => {
                const na = normalizar(a.querySelectorAll('td')[1]?.textContent);
                const nb = normalizar(b.querySelectorAll('td')[1]?.textContent);
                const comparacao = na.localeCompare(nb, 'pt-BR', { sensitivity:'base' });
                return ordem.value === 'az' ? comparacao : -comparacao;
            });
            visiveis.forEach(l => tbody.appendChild(l));
        }
    }

    function ligar(){
        const { busca, categoria, ordem, tbody } = obterElementos();
        [busca,categoria,ordem].filter(Boolean).forEach(el => {
            if (el.dataset.filtroLigado === '1') return;
            el.addEventListener('input', aplicar);
            el.addEventListener('change', aplicar);
            el.dataset.filtroLigado = '1';
        });
        if (tbody && !tbody.dataset.observadorFiltros) {
            new MutationObserver(() => {
                const assinatura = [...tbody.querySelectorAll('tr')].map(l => l.querySelector('[data-id]')?.dataset.id || '').join('|');
                if (assinatura === ultimaAssinatura || agendado) return;
                ultimaAssinatura = assinatura;
                agendado = true;
                setTimeout(() => { agendado = false; aplicar(); }, 0);
            }).observe(tbody, { childList:true });
            tbody.dataset.observadorFiltros = '1';
        }
        aplicar();
    }

    function iniciar(){
        ligar();
        setInterval(() => {
            const { busca, categoria, ordem } = obterElementos();
            if (busca && categoria && ordem && (busca.dataset.filtroLigado !== '1' || categoria.dataset.filtroLigado !== '1' || ordem.dataset.filtroLigado !== '1')) ligar();
        }, 500);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once:true });
    else iniciar();
})();
