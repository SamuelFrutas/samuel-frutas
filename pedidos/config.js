// Configuração isolada do Sistema de Pedidos.
// NÃO importar o firebase.js da raiz: ele pertence ao Sistema de Agendamentos.
// A configuração pública do Firebase original será preenchida somente após
// confirmar o projeto correto e as regras de segurança do Firestore.

export const PEDIDOS_CONFIG = Object.freeze({
  firebase: null,
  collections: Object.freeze({
    products: 'products',
    orders: 'orders',
    config: 'config'
  })
});
