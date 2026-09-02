export const PEDIDOS_CONFIG = Object.freeze({
  // Preencher somente com a configuração pública do MESMO projeto Firebase
  // usado pelo antigo Sistema de Pedidos. Nunca usar o Firebase do Agendamentos.
  firebase: null,
  collections: Object.freeze({
    products: 'products',
    orders: 'orders',
    config: 'config'
  })
});
