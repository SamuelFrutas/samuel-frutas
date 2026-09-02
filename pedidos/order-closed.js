// Restrição de horário do Sistema de Pedidos adaptada para GitHub Pages.
// Regra original: fechado das 13:30 às 20:00.
// O painel pode ativar o bloqueio manual em config/bot.orderRestrictionForceClosed.
import { db } from './firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { PEDIDOS_CONFIG } from './config.js';

const CLOSED_START = 13 * 60 + 30;
const CLOSED_END = 20 * 60;

function saoPauloMinutes() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const hour = Number(parts.find(p => p.type === 'hour')?.value || 0);
  const minute = Number(parts.find(p => p.type === 'minute')?.value || 0);
  return hour * 60 + minute;
}

function scheduledClosed() {
  const minutes = saoPauloMinutes();
  return minutes >= CLOSED_START && minutes < CLOSED_END;
}

function renderClosed(manual = false) {
  if (document.getElementById('orderClosedOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'orderClosedOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#f4f6f5;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;box-sizing:border-box';
  const title = manual ? 'Sistema temporariamente indisponível' : 'Hoje as entregas já se encerraram.';
  const message = manual ? 'No momento, o site está temporariamente fora do ar.' : 'Os pedidos pelo sistema estarão disponíveis novamente a partir das 20h.';
  const footer = manual ? 'Em breve voltaremos a receber pedidos. 😊' : 'Funcionamento do sistema: 20h às 13h30';
  overlay.innerHTML = `<div style="max-width:430px;background:#fff;border-radius:18px;padding:28px 22px;box-shadow:0 4px 20px rgba(0,0,0,.08)"><div style="font-size:48px;margin-bottom:12px">🍍</div><h2 style="margin:0 0 10px;color:#182230">${title}</h2><p style="margin:0;color:#667085;line-height:1.5">${message}</p><p style="margin:14px 0 0;font-size:14px;color:#667085">${footer}</p></div>`;
  document.body.appendChild(overlay);
}

async function enforceRestriction() {
  try {
    const snap = await getDoc(doc(db, PEDIDOS_CONFIG.collections.config, 'bot'));
    const manualClosed = snap.exists() && Boolean(snap.data()?.orderRestrictionForceClosed);
    if (manualClosed) return renderClosed(true);
    if (scheduledClosed()) return renderClosed(false);
  } catch (error) {
    console.error('Restrição de pedidos:', error);
    // Não bloqueia a loja por uma falha transitória de leitura da configuração.
  }
}

enforceRestriction();
