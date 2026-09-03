import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { PEDIDOS_CONFIG } from './config.js';

const UNITS=['Un','Lote','Duplo','Dz','1/8','1/4','Bdj','Cx','1/2','GF','Inteiro'];
let products=[];let archived=false;let editingId=null;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function setMsg(t){$('loginMsg').textContent=t||''}
function measureRows(ms=[]){return ms.length?ms.map(row).join(''):row({quantity:1,unit:'Un',price:0});}
function row(m={quantity:1,unit:'Un',price:0}){return `<div class="measure"><label class="measure-field"><span class="measure-label">Quantidade</span><input class="mq" type="number" min="1" step="1" value="${Number(m.quantity||m.lotSize||1)}" placeholder="Qtd"></label><label class="measure-field"><span class="measure-label">Unidade / medida</span><select class="mu">${UNITS.map(u=>`<option ${u===m.unit?'selected':''}>${u}</option>`).join('')}</select></label><label class="measure-field"><span class="measure-label">Preço</span><input class="mp" type="number" min="0" step="0.01" value="${Number(m.price||0)}" placeholder="0,00"></label><button class="btn danger remove" type="button" title="Remover medida" aria-label="Remover medida">×</button></div>`}
function readMeasures(){return [...document.querySelectorAll('#measureRows .measure')].map(r=>{const unit=r.querySelector('.mu').value;const quantity=Math.max(1,Number(r.querySelector('.mq').value||1));const price=Number(r.querySelector('.mp').value||0);return unit==='Lote'?{quantity,unit,price,lotSize:quantity}:{quantity,unit,price}}).filter(m=>Number.isFinite(m.price)&&m.price>=0)}
function updateImagePreview(){
  const input=$('image'),wrap=$('imagePreviewWrap'),img=$('imagePreview'),status=$('imagePreviewStatus');
  if(!input||!wrap||!img||!status)return;
  const url=input.value.trim();
  wrap.classList.remove('has-error');
  if(!url){img.removeAttribute('src');img.alt='Pré-visualização da imagem';status.textContent='Cole a URL da imagem acima para visualizar.';wrap.classList.add('hidden');return;}
  wrap.classList.remove('hidden');status.textContent='Carregando pré-visualização...';img.alt='Pré-visualização da imagem';
  img.onload=()=>{wrap.classList.remove('has-error');status.textContent='Imagem carregada.'};
  img.onerror=()=>{img.removeAttribute('src');img.alt='Não foi possível carregar esta imagem';wrap.classList.add('has-error');status.textContent='Não foi possível carregar esta URL. Use a URL direta do arquivo da imagem (JPG, PNG, WEBP etc.).'};
  img.src=url;
}
function showForm(p=null){editingId=p?.id||null;$('form').classList.remove('hidden');$('formTitle').textContent=p?'Editar produto':'Novo produto';$('name').value=p?.name||'';$('image').value=p?.image||'';updateImagePreview();$('measureRows').innerHTML=measureRows(p?.measures||[{quantity:1,unit:p?.unit||'Un',price:p?.price||0}]);}
function hideForm(){editingId=null;$('form').classList.add('hidden');$('name').value='';$('image').value='';$('imagePreview').removeAttribute('src');$('imagePreview').alt='Pré-visualização da imagem';$('imagePreviewStatus').textContent='Cole a URL da imagem acima para visualizar.';$('imagePreviewWrap').classList.remove('has-error');$('imagePreviewWrap').classList.add('hidden');}
$('measureRows').addEventListener('click',e=>{if(e.target.closest('.remove'))e.target.closest('.measure').remove()});
$('addMeasure').onclick=()=>{$('measureRows').insertAdjacentHTML('beforeend',row())};
$('image').addEventListener('input',updateImagePreview);
$('image').addEventListener('change',updateImagePreview);
$('image').addEventListener('paste',()=>setTimeout(updateImagePreview,50));
$('newProduct').onclick=()=>showForm();$('cancel').onclick=hideForm;
$('save').onclick=async()=>{try{const name=$('name').value.trim();const measures=readMeasures();if(!name)throw Error('Informe o nome do produto.');if(!measures.length||!measures.some(m=>m.price>0))throw Error('Adicione pelo menos uma medida com preço.');const data={name,category:'produtos',measures,unit:measures[0].unit,price:measures[0].price,priceTiers:measures.filter(m=>m.unit===measures[0].unit&&m.quantity>1).map(m=>({minQty:m.quantity,unitPrice:m.price})),image:$('image').value.trim(),archived:false,updatedAt:serverTimestamp()};if(editingId)await updateDoc(doc(db,PEDIDOS_CONFIG.collections.products,editingId),data);else await addDoc(collection(db,PEDIDOS_CONFIG.collections.products),{...data,createdAt:serverTimestamp()});hideForm();await loadProducts();}catch(e){alert(e.message||'Não foi possível salvar o produto.')}};
async function loadProducts(){const snap=await getDocs(collection(db,PEDIDOS_CONFIG.collections.products));products=snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>Boolean(p.archived)===archived).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));renderProducts();}
function renderProducts(){$('products').innerHTML=products.length?products.map(p=>`<article class="product"><div class="product-head">${p.image?`<img class="thumb" src="${esc(p.image)}" onerror="this.style.display='none'">`:''}<div><div class="name">${esc(p.name)}</div><div class="muted">${(p.measures||[]).map(m=>`${esc(m.quantity||1)} ${esc(m.unit||'Un')} — ${money(m.price)}`).join(' | ')||'Sem medidas'}</div></div></div><div class="actions" style="margin-top:10px"><button class="btn sec" data-edit="${p.id}">Editar</button>${archived?`<button class="btn" data-restore="${p.id}">Desarquivar</button><button class="btn danger" data-delete="${p.id}">Excluir</button>`:`<button class="btn danger" data-archive="${p.id}">Arquivar</button>`}</div></article>`).join(''):'<p class="muted">Nenhum produto nesta lista.</p>'}
$('products').onclick=async e=>{const b=e.target.closest('button');if(!b)return;try{if(b.dataset.edit){const p=products.find(x=>x.id===b.dataset.edit);showForm(p)}if(b.dataset.archive)await updateDoc(doc(db,PEDIDOS_CONFIG.collections.products,b.dataset.archive),{archived:true,updatedAt:serverTimestamp()});if(b.dataset.restore)await updateDoc(doc(db,PEDIDOS_CONFIG.collections.products,b.dataset.restore),{archived:false,updatedAt:serverTimestamp()});if(b.dataset.delete){if(!confirm('Excluir permanentemente este produto?'))return;await deleteDoc(doc(db,PEDIDOS_CONFIG.collections.products,b.dataset.delete))}await loadProducts()}catch(e){alert(e.message||'Erro na operação')}};
$('activeTab').onclick=()=>{archived=false;$('activeTab').className='btn';$('archivedTab').className='btn sec';loadProducts()};$('archivedTab').onclick=()=>{archived=true;$('activeTab').className='btn sec';$('archivedTab').className='btn';loadProducts()};$('reload').onclick=loadProducts;
$('loginBtn').onclick=async()=>{try{setMsg('Entrando...');await signInWithEmailAndPassword(auth,$('email').value.trim(),$('password').value);setMsg('')}catch(e){setMsg(e.code==='auth/invalid-credential'?'E-mail ou senha inválidos.':'Não foi possível entrar.')}};
$('logout').onclick=()=>signOut(auth);
onAuthStateChanged(auth,user=>{if(user){$('login').classList.add('hidden');$('app').classList.remove('hidden');$('user').textContent=user.email||'';loadProducts();loadOrders()}else{$('login').classList.remove('hidden');$('app').classList.add('hidden')}});
async function loadOrders(){try{const q=query(collection(db,PEDIDOS_CONFIG.collections.orders),orderBy('createdAt','desc'),limit(20));const snap=await getDocs(q);$('orders').innerHTML=snap.docs.map(d=>{const o=d.data();return `<article class="order"><strong>${esc(o.orderId||d.id)}</strong> <span class="muted">${esc(o.status||'')}</span><div class="muted">Total ${money(o.total)}</div><ul>${(o.items||[]).map(i=>`<li>${esc(i.quantity)} × ${esc(i.measureQuantity||1)} ${esc(i.unit||'')} — ${esc(i.name)} — ${money(i.total)}</li>`).join('')}</ul>${o.observations?.length?`<div class="muted">Obs.: ${o.observations.map(x=>esc(x.name)+': '+esc(x.observation)).join(' | ')}</div>`:''}</article>`}).join('')||'<p class="muted">Nenhum pedido encontrado.</p>'}catch(e){$('orders').innerHTML='<p class="muted">Não foi possível consultar os pedidos. Verifique as regras do Firestore.</p>'}}
$('reloadOrders').onclick=loadOrders;
