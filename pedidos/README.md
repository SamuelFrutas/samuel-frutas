# Sistema de Pedidos — preparação para GitHub Pages

Esta pasta pertence exclusivamente ao Sistema de Pedidos.

## Isolamento
- Não reutilizar `firebase.js` da raiz: ele pertence ao Sistema de Agendamentos.
- O Sistema de Pedidos usa o Firebase/Firestore original do antigo SamuelFrutasbot.
- Coleções do pedido: `products`, `orders` e `config`.
- Não usar a coleção `produtos` do Sistema de Agendamentos.
- Não compartilhar login/autenticação com o Sistema de Agendamentos.

## Migração
A loja e o painel serão adaptados para ambiente estático sem remover funcionalidades do sistema antigo. APIs `/api/*` do servidor antigo não devem ser chamadas diretamente pelo GitHub Pages; cada dependência será substituída por acesso compatível com o Firebase original ou por uma solução segura equivalente.

## Arquivos do sistema antigo que serão incorporados/adaptados
- Loja: `order.html`, `order.js`, `order-fixes.js`, `order-cart-ui.js`, `order-closed.js`
- Produtos/painel: `produtos.html`, `product-admin-fixes.js`, `product-image-save.js`, `order-restriction-settings.js`
- Regras de cálculo/pedido: lógica equivalente de `src/order.js` e `src/rules.js`, adaptada para cliente quando seguro

## O que fica fora
WhatsApp/Baileys, bot, Gemini/Groq, QR Code, reconexão, bloqueio de números do bot, broadcast e servidor Node completo.

## Regra de segurança
Não inserir credenciais privadas, service-account keys, senhas administrativas ou tokens secretos em arquivos públicos do GitHub Pages.
