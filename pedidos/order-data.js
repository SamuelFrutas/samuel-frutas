import { listProducts, getConfig, createOrder } from './firebase-client.js';

export async function loadCatalog() {
  const products = await listProducts();
  return products.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'));
}

export async function loadOrderConfig() {
  return getConfig();
}

function normUnit(unit) {
  return String(unit || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function factorOf(measure) {
  const q = Number(measure?.quantity || measure?.lotSize || 1) || 1;
  const u = normUnit(measure?.unit);
  if (u === 'dz' || u === 'duzia' || u === 'duzias') return 12 * q;
  if (u === 'dezena' || u === 'dezenas') return 10 * q;
  if (u === 'inteiro' || u === 'inteira') return q;
  const f = String(measure?.unit || '').match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (f) {
    const a = Number(f[1].replace(',', '.'));
    const b = Number(f[2].replace(',', '.'));
    if (a > 0 && b > 0) return q * (a / b);
  }
  return q;
}

function progressiveRound(value, measure) {
  const n = Number(value) || 0;
  return normUnit(measure?.unit) === 'lote'
    ? Math.ceil((n - 1e-9) * 2) / 2
    : Math.ceil((n - 1e-9) * 10) / 10;
}

export function selectedTotal(product, cartItem) {
  const measures = Array.isArray(product?.measures)
    ? product.measures.filter(m => Number(m?.price || 0) > 0)
    : [];
  const selected = measures[Number(cartItem?.measureIndex || 0)] || measures[0];
  const quantity = Number(cartItem?.quantity || 0);
  if (!selected || !quantity) return 0;

  const target = factorOf(selected) * quantity;
  const exact = measures
    .filter(m => Math.abs(factorOf(m) - target) < 1e-9)
    .sort((a, b) => factorOf(b) - factorOf(a))[0];
  if (exact) return Number(exact.price);

  const lower = measures
    .filter(m => factorOf(m) <= target + 1e-9)
    .sort((a, b) => factorOf(b) - factorOf(a))[0];
  if (lower) {
    return progressiveRound(target * (Number(lower.price) / factorOf(lower)), lower);
  }
  return Number(selected.price) * quantity;
}

export function deliveryFee(subtotal) {
  if (subtotal >= 50) return 0;
  if (subtotal >= 20) return 3;
  return 5;
}

export async function saveOrder({ items, subtotal, deliveryFee: fee, total, scheduledFor, observations }) {
  return createOrder({
    orderId: `WEB-${Date.now()}`,
    items,
    subtotal,
    deliveryFee: fee,
    total,
    scheduledFor: scheduledFor || null,
    observations: observations || '',
    status: 'pending',
    source: 'github-pages'
  });
}
