// Configuração isolada do Sistema de Pedidos.
// Este é o MESMO projeto Firebase usado pelo antigo SamuelFrutasBot.
// NÃO importar o firebase.js da raiz: ele pertence ao Sistema de Agendamentos.

export const PEDIDOS_CONFIG = Object.freeze({
  firebase: Object.freeze({
    apiKey: 'AIzaSyB1E9oQsIwYO2-r4W5-uqK4ax92OmxISOI',
    authDomain: 'samuelfrutasbot.firebaseapp.com',
    projectId: 'samuelfrutasbot',
    storageBucket: 'samuelfrutasbot.firebasestorage.app',
    messagingSenderId: '1052699327049',
    appId: '1:1052699327049:web:cf22d68c76d064d56b5d98'
  }),
  collections: Object.freeze({
    products: 'products',
    orders: 'orders',
    config: 'config'
  })
});
