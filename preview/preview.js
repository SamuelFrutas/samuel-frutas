let products={frutas:[],legumes:[],verduras:[],aguaOvos:[]};
let cart={}; let category="frutas"; let orderType="Entrega"; let loading=true;
const $=id=>document.getElementById(id);
const normalize=s=>String(s||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function categoryOf(c,n=""){
 const v=normalize(c), name=normalize(n);
 if(v.includes("agua de coco")||v.includes("ovos")||v.includes("ovo")||name.includes("agua de coco")||(name.includes("coco")&&name.includes("agua"))||name.includes("ovo")) return "aguaOvos";
 if(v==="legume"||v==="legumes"||v.includes("legume")) return "legumes";
 if(v==="verdura"||v==="verduras"||v.includes("verdura")) return "verduras";
 return "frutas";
}
function unitsOf(d){
 const u=d?.unidadesMedida&&typeof d.unidadesMedida==="object"?d.unidadesMedida:{};
 const formas=d?.formasVenda||d?.formasDeVenda;
 const a=[];
 const has=(k,...alts)=>{if(u[k]===true||formas?.[k]===true)return true;if(Array.isArray(formas))return formas.some(v=>alts.some(x=>normalize(v)===normalize(x)||normalize(v).includes(normalize(x))));return false};
 if(u.unidade===true||d.unidade===true||d.un===true)a.push("UN");
 if(u.quilo===true||d.quilo===true||d.kg===true)a.push("KG");
 if(u.maco===true||d.maco===true||d["maço"]===true)a.push("MAÇO");
 if(u.duzia===true||d.duzia===true||d["dúzia"]===true)a.push("DÚZIA");
 if(u.lote===true||d.lote===true){const q=parseInt(u.quantidadePorLote||d.quantidadeLote||3,10);a.push(q>0?"LOTE C/"+q:"LOTE")}
 if(has("bdj","bdj","bandeja"))a.push("BDJ");
 if(has("umQuarto","1/4","¼","um quarto"))a.push("1/4");
 if(has("umOitavo","1/8","⅛","um oitavo"))a.push("1/8");
 if(has("metade","metade","1/2","½"))a.push("METADE");
 const old=d.unidades||d.units;
 if(Array.isArray(old))old.forEach(v=>{const t=String(v).trim().toUpperCase();if(!a.includes(t))a.push(t)});
 return [...new Set(a.length?a:["UN"])];
}
function imageOf(d){return d.imagemUrl||d.imagem||d.imageUrl||d.foto||d.image||d.icon||d.url||d.img||""}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function photo(p,cls="product-photo"){return p.img?'<div class="'+cls+'"><img src="'+esc(p.img)+'" alt=""></div>':'<div class="'+cls+'"><span class="placeholder">🍎</span></div>'}
function show(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$(id).classList.add("active");document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.remove("active"));if(id==="homeView")document.querySelector(".bottom-nav button:nth-child(1)").classList.add("active");if(id==="productsView")document.querySelector(".bottom-nav button:nth-child(2)").classList.add("active");if(id==="cartView")document.querySelector(".bottom-nav button:nth-child(3)").classList.add("active");window.scrollTo({top:0,behavior:"smooth"})}
function goHome(){show("homeView");renderHome()}
function showProducts(){show("productsView");renderProducts()}
function openCart(){show("cartView");renderCart()}
function updateCart(){const n=Object.values(cart).reduce((s,x)=>s+x.quantity,0);$("cartCount").textContent=n;$("pageCartCount").textContent=n;$("navBadge").textContent=n;$("cartSummary").textContent=n+" "+(n===1?"item":"itens");$("cartActions").hidden=n===0}
function key(id,u){return id+"__"+u}
function add(id){const p=findProduct(id);if(!p)return;const unit=$("unit-"+id)?.value||p.units[0];const k=key(id,unit);if(cart[k])cart[k].quantity++;else cart[k]={id,name:p.name,img:p.img,unit,quantity:1,obs:""};updateCart();openCart()}
function findProduct(id){for(const c of Object.values(products)){const p=c.find(x=>x.id===id);if(p)return p}return null}
function changeQty(k,d){if(!cart[k])return;cart[k].quantity+=d;if(cart[k].quantity<=0)delete cart[k];updateCart();renderCart()}
function changeUnit(k,u){const x=cart[k];if(!x)return;const nk=key(x.id,u);if(nk!==k){if(cart[nk])cart[nk].quantity+=x.quantity;else cart[nk]={...x,unit:u};delete cart[k]}renderCart();updateCart()}
function removeItem(k){delete cart[k];renderCart();updateCart()}
function setObs(k,v){if(cart[k])cart[k].obs=v}
function renderCategories(){const cats=[["frutas","🍎 Frutas"],["legumes","🥕 Legumes"],["verduras","🥬 Verduras"],["aguaOvos","🥥 Água / Ovos"]];$("categoryChips").innerHTML=cats.map(c=>'<button class="category '+(category===c[0]?"active":"")+'" onclick="setCategory(\''+c[0]+'\')">'+c[1]+"</button>").join("")}
function productTile(p){return '<div class="product-tile">'+photo(p)+'<strong>'+esc(p.name)+'</strong><small>'+esc(p.units.join(" · "))+'</small><button class="tile-add" onclick="add(\''+esc(p.id)+'\')">🛍️ Adicionar</button></div>'}
function row(p){return '<div class="product-row">'+photo(p)+'<div><strong>'+esc(p.name)+'</strong><div class="units">'+esc(p.units.join(" · "))+'</div><div class="row-actions"><select id="unit-'+esc(p.id)+'">'+p.units.map(u=>'<option>'+esc(u)+"</option>").join("")+'</select><button class="add-button" onclick="add(\''+esc(p.id)+'\')">Adicionar</button></div></div></div>'}
function renderHome(){renderCategories();if(loading){$("featured").innerHTML='<div class="state-card">Carregando produtos...</div>';return}const list=products[category].slice(0,6);$("featured").innerHTML=list.map(productTile).join("")||'<div class="state-card">Nenhum produto encontrado nesta categoria.</div>'}
function renderProducts(list){if(!list)list=products[category];$("productsTitle").textContent=category==="aguaOvos"?"Água / Ovos":category.charAt(0).toUpperCase()+category.slice(1);$("productList").innerHTML=loading?'<div class="state-card">Carregando produtos...</div>':list.map(row).join("")||'<div class="state-card">Nenhum produto encontrado.</div>'}
function setCategory(c){category=c;$("homeSearch").value="";$("productSearch").value="";renderHome();showProducts()}
function searchProducts(q){const n=normalize(q);if(!n){renderHome();if($("productsView").classList.contains("active"))renderProducts();return}const all=Object.values(products).flat().filter(p=>normalize(p.name).includes(n));$("homeSearch").value=q;$("productSearch").value=q;if($("productsView").classList.contains("active"))renderProducts(all);else{showProducts();renderProducts(all)}}
function renderCart(){const items=Object.entries(cart);$("cartList").innerHTML=items.length?items.map(([k,x])=>{const p=findProduct(x.id);const units=p?.units||[x.unit];return '<div class="item-card"><div class="item-top">'+photo({img:x.img}, "item-photo-wrap")+'<div class="item-info"><strong>'+esc(x.name)+'</strong><div class="item-controls"><select onchange="changeUnit(\''+esc(k)+'\',this.value)">'+units.map(u=>'<option '+(u===x.unit?"selected":"")+">"+esc(u)+"</option>").join("")+'</select><button class="qty-btn" onclick="changeQty(\''+esc(k)+'\',-1)">−</button><b class="qty">'+x.quantity+'</b><button class="qty-btn" onclick="changeQty(\''+esc(k)+'\',1)">+</button><button class="remove-btn" onclick="removeItem(\''+esc(k)+'\')">×</button></div></div></div><div class="item-note"><label>OBSERVAÇÃO DESTE ITEM (opcional)</label><textarea maxlength="200" placeholder="Ex.: Quero bem maduro, por favor." oninput="setObs(\''+esc(k)+'\',this.value)">'+esc(x.obs)+'</textarea></div></div>'}).join(""):'<div class="empty-card">Sua sacola está vazia.<br><br>Escolha os produtos para começar seu pedido.</div>';updateCart()}
function setOrderType(t){orderType=t;$("deliveryChoice").classList.toggle("selected",t==="Entrega");$("pickupChoice").classList.toggle("selected",t==="Retirada");$("addressCard").style.display=t==="Entrega"?"block":"none"}
function tomorrow(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+1);return d.toISOString().slice(0,10)}
function openCheckout(){if(!Object.keys(cart).length)return alert("Sua sacola está vazia.");if(!$("deliveryDate").value)$("deliveryDate").value=tomorrow();setOrderType(orderType);show("checkoutView")}
function formatDate(v){const a=v.split("-");return a.length===3?a[2]+"/"+a[1]+"/"+a[0]:v}
function finishOrder(){if(!Object.keys(cart).length)return;const date=$("deliveryDate").value;if(!date)return alert("Escolha a data do pedido.");const address=$("address").value.trim();if(orderType==="Entrega"&&!address)return alert("Informe o endereço da entrega.");let msg="🛒 *NOVO PEDIDO - SAMUEL FRUTAS*\n\n";Object.values(cart).forEach(x=>{msg+='• *'+x.quantity+" "+x.unit+" de "+x.name+"*\n";if(x.obs.trim())msg+="  _Obs: "+x.obs.trim()+"_\n"});msg+="\n📅 *Data:* "+formatDate(date)+"\n🚚 *Tipo:* "+orderType+"\n";if(orderType==="Entrega")msg+="📍 *Endereço:* "+address+"\n";const g=$("generalObs").value.trim();if(g)msg+="📝 *Observação geral:* "+g+"\n";window.open("https://wa.me/5521972837869?text="+encodeURIComponent(msg),"_blank")}
async function loadProducts(){loading=true;renderHome();try{if(!window.firebaseReady)await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error("Firebase não inicializou a tempo")),8000);window.addEventListener("firebase-ready",()=>{clearTimeout(t);resolve()}, {once:true})});const snap=await window.getDocs(window.collection(window.db,"produtos"));const next={frutas:[],legumes:[],verduras:[],aguaOvos:[]};snap.forEach(doc=>{const d=doc.data();const ativo=d.ativo!==undefined?d.ativo:d.active!==undefined?d.active:true;if(!ativo)return;const p={id:doc.id,name:d.nome||d.name||"Produto",img:imageOf(d),units:unitsOf(d)};next[categoryOf(d.categoria||d.category,p.name)].push(p)});Object.values(next).forEach(a=>a.sort((x,y)=>x.name.localeCompare(y.name,"pt-BR")));products=next;loading=false;renderHome();renderProducts()}catch(e){console.error("Erro Firebase:",e);loading=false;$("featured").innerHTML='<div class="state-card">Não foi possível carregar os produtos.<br><small>'+esc(e?.message||"Erro desconhecido")+'</small></div>';if($("productList"))$("productList").innerHTML=$("featured").innerHTML}}
window.goHome=goHome;window.showProducts=showProducts;window.openCart=openCart;window.openCheckout=openCheckout;window.setCategory=setCategory;window.add=add;window.changeQty=changeQty;window.changeUnit=changeUnit;window.removeItem=removeItem;window.setObs=setObs;window.setOrderType=setOrderType;window.finishOrder=finishOrder;window.searchProducts=searchProducts;
loadProducts();
