import { db } from '../firebase.js';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const form = document.getElementById('form-produto');
const nome = document.getElementById('nome-produto');
const categoria = document.getElementById('categoria-produto');
const imagem = document.getElementById('imagem-url-input');
const ativo = document.getElementById('produto-ativo');
const lote = document.getElementById('venda-lote');
const qtdLote = document.getElementById('qtd-por-lote');
const grupoLote = document.getElementById('grupo-qtd-lote');
const lista = document.getElementById('lista-produtos-body');
const titulo = document.getElementById('titulo-form');
const salvar = document.getElementById('btn-submit');
const cancelar = document.getElementById('btn-cancelar-edicao');
const filtro = document.getElementById('filtro-produto');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroOrdem = document.getElementById('filtro-ordem');
const preview = document.getElementById('preview-container');
const previewImg = document.getElementById('img-preview');

let produtos = [];
let editandoId = null;

const unidades = [
  ['venda-unidade', 'unidade'],
  ['venda-quilo', 'quilo'],
  ['venda-maco', 'maco'],
  ['venda-duzia', 'duzia'],
  ['venda-lote', 'lote'],
  ['venda-bdj', 'bdj'],
  ['venda-1-4', 'umQuarto'],
  ['venda-1-8', 'umOitavo'],
  ['venda-metade', 'metade']
];

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function getUnidades() {
  const result = {};
  for (const [id, key] of unidades) result[key] = !!document.getElementById(id)?.checked;
  if (result.lote) result.quantidadePorLote = Number(qtdLote.value || 0) || null;
  return result;
}

function setUnidades(data = {}) {
  for (const [id, key] of unidades) document.getElementById(id).checked = !!data[key];
  qtdLote.value = data.quantidadePorLote || '';
  atualizarLote();
}

function atualizarLote() {
  const ligado = lote.checked;
  grupoLote.style.display = ligado ? 'block' : 'none';
  qtdLote.required = ligado;
  if (!ligado) qtdLote.value = '';
}

lote.addEventListener('change', atualizarLote);
imagem.addEventListener('input', () => {
  const url = imagem.value.trim();
  if (!url) { preview.style.display = 'none'; return; }
  previewImg.src = url;
  preview.style.display = 'block';
  previewImg.onerror = () => preview.style.display = 'none';
});

function resetar() {
  editandoId = null;
  form.reset();
  ativo.checked = true;
  categoria.value = 'frutas';
  titulo.textContent = 'Cadastro / Edição de Produtos';
  salvar.textContent = 'Salvar Produto';
  cancelar.style.display = 'none';
  preview.style.display = 'none';
  atualizarLote();
}

cancelar.addEventListener('click', resetar);

document.querySelector('.primary')?.addEventListener('click', () => nome.focus());

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!nome.value.trim()) return alert('Digite o nome do produto.');
  if (lote.checked && !qtdLote.value) return alert('Informe a quantidade de unidades por lote.');

  const dados = {
    nome: nome.value.trim(),
    categoria: categoria.value,
    unidadesMedida: getUnidades(),
    imagemUrl: imagem.value.trim(),
    ativo: ativo.checked
  };

  salvar.disabled = true;
  salvar.textContent = 'Salvando...';
  try {
    if (editandoId) await updateDoc(doc(db, 'produtos', editandoId), dados);
    else await addDoc(collection(db, 'produtos'), dados);
    resetar();
  } catch (err) {
    console.error(err);
    alert('Não foi possível salvar. Verifique a conexão e as regras do Firebase.');
  } finally {
    salvar.disabled = false;
    salvar.textContent = editandoId ? 'Salvar alterações' : 'Salvar Produto';
  }
});

function editar(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  editandoId = id;
  nome.value = p.nome || '';
  categoria.value = p.categoria || 'frutas';
  imagem.value = p.imagemUrl || '';
  ativo.checked = p.ativo !== false;
  setUnidades(p.unidadesMedida || {});
  if (imagem.value) { previewImg.src = imagem.value; preview.style.display = 'block'; }
  titulo.textContent = 'Editando produto';
  salvar.textContent = 'Salvar alterações';
  cancelar.style.display = 'block';
  window.scrollTo({top: 0, behavior: 'smooth'});
}

async function excluir(id) {
  const p = produtos.find(x => x.id === id);
  if (!p || !confirm(`Excluir o produto “${p.nome || ''}”?`)) return;
  try { await deleteDoc(doc(db, 'produtos', id)); }
  catch (err) { console.error(err); alert('Não foi possível excluir. Verifique as regras do Firebase.'); }
}

function render() {
  const termo = filtro.value.trim().toLowerCase();
  let listaAtual = produtos.filter(p =>
    (!termo || (p.nome || '').toLowerCase().includes(termo)) &&
    (filtroCategoria.value === 'todas' || (p.categoria || 'frutas') === filtroCategoria.value)
  );
  if (filtroOrdem.value === 'az') listaAtual.sort((a,b) => (a.nome||'').localeCompare(b.nome||'', 'pt-BR'));
  if (filtroOrdem.value === 'za') listaAtual.sort((a,b) => (b.nome||'').localeCompare(a.nome||'', 'pt-BR'));

  if (!listaAtual.length) {
    lista.innerHTML = '<tr><td colspan="6" class="loading-products">Nenhum produto encontrado.</td></tr>';
    return;
  }

  lista.innerHTML = listaAtual.map(p => {
    const u = p.unidadesMedida || {};
    const nomes = [];
    if (u.unidade) nomes.push('Unidade');
    if (u.quilo) nomes.push('Quilo');
    if (u.maco) nomes.push('Maço');
    if (u.duzia) nomes.push('Dúzia');
    if (u.bdj) nomes.push('BDJ');
    if (u.umQuarto) nomes.push('¼');
    if (u.umOitavo) nomes.push('⅛');
    if (u.metade) nomes.push('½');
    if (u.lote) nomes.push(u.quantidadePorLote ? `Lote C/${u.quantidadePorLote} un.` : 'Lote');
    const img = p.imagemUrl ? `<img src="${esc(p.imagemUrl)}" class="img-tabela" alt="${esc(p.nome)}">` : '—';
    return `<tr><td>${img}</td><td><strong>${esc(p.nome)}</strong></td><td>${esc(p.categoria || 'frutas')}</td><td>${esc(nomes.join(' • ') || '-')}</td><td><span class="${p.ativo === false ? 'badge-inativo' : 'badge-ativo'}">${p.ativo === false ? 'Inativo' : 'Ativo'}</span></td><td><div class="acoes-celula"><button class="btn-editar" type="button" data-edit="${esc(p.id)}">✏️ Editar</button><button class="btn-excluir" type="button" data-delete="${esc(p.id)}">🗑️ Excluir</button></div></td></tr>`;
  }).join('');

  lista.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editar(b.dataset.edit)));
  lista.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => excluir(b.dataset.delete)));
}

[filtro, filtroCategoria, filtroOrdem].forEach(el => el.addEventListener('input', render));

onSnapshot(collection(db, 'produtos'), snap => {
  produtos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render();
}, err => {
  console.error(err);
  lista.innerHTML = '<tr><td colspan="6" class="loading-products">Não foi possível carregar os produtos. Verifique o Firebase.</td></tr>';
});

resetar();
