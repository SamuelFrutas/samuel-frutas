import assert from 'node:assert/strict';
import { calculateItem, deliveryFee } from './order-engine.js';

const produto = {
  id: 'teste',
  name: 'Mamão Papaya',
  category: 'produtos',
  measures: [
    { quantity: 1, unit: 'Un', price: 6 },
    { quantity: 3, unit: 'Un', price: 15 }
  ],
  unit: 'Un',
  price: 6
};

assert.equal(deliveryFee(19.99), 5);
assert.equal(deliveryFee(20), 3);
assert.equal(deliveryFee(49.99), 3);
assert.equal(deliveryFee(50), 0);

assert.equal(calculateItem(produto, { quantity: 1, unit: 'Un', measureQuantity: 1 }).total, 6);
assert.equal(calculateItem(produto, { quantity: 3, unit: 'Un', measureQuantity: 1 }).total, 15);
assert.equal(calculateItem(produto, { quantity: 2, unit: 'Un', measureQuantity: 1 }).total, 12);
assert.equal(calculateItem(produto, { quantity: 1, unit: 'Un', measureQuantity: 3 }).total, 15);

const lote = {
  id: 'lote', name: 'Teste Lote', category: 'produtos',
  measures: [{ quantity: 6, unit: 'Lote', lotSize: 6, price: 30 }],
  unit: 'Lote', price: 30
};
assert.equal(calculateItem(lote, { quantity: 1, unit: 'Lote', measureQuantity: 6 }).total, 30);

assert.throws(() => calculateItem(produto, { quantity: 0, unit: 'Un', measureQuantity: 1 }));

console.log('Pedidos: testes do motor OK');
