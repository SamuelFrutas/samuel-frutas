# Etapa 6 — Conferência final

Concluída na branch `migracao-pedidos-pages`.

## Conferência contra o sistema antigo

Foram comparados o fluxo público antigo (`public/order.html` e `public/order-fixes.js`) e o motor oficial antigo (`src/order.js`) com a implementação em `pedidos/`.

### Funcionalidades preservadas

- catálogo público de produtos ativos;
- busca de produtos;
- seleção de unidade/medida;
- quantidade por produto;
- carrinho/sacola;
- alteração e remoção de itens;
- observações por produto;
- preços progressivos e cálculo proporcional;
- fatores para dúzia, dezena, inteiro e frações;
- lotes com arredondamento progressivo;
- taxa de entrega: abaixo de R$ 20 = R$ 5; de R$ 20 até abaixo de R$ 50 = R$ 3; R$ 50 ou mais = grátis;
- gravação do pedido na coleção `orders`;
- geração da mensagem do pedido;
- envio para o número responsável configurado em `config/bot`;
- painel independente para produtos;
- login independente do painel por Firebase Authentication;
- edição, arquivamento, restauração e exclusão de produtos;
- imagens dos produtos e fallback;
- restrição de horário da loja;
- cálculo da próxima entrega;
- isolamento do Firebase/Firestore do Sistema de Agendamentos.

## Correções feitas durante a conferência

- removido o campo de telefone do cliente, que não fazia parte do fluxo correto do sistema antigo;
- envio do WhatsApp direcionado ao `responsibleNumber` de `config/bot`;
- removida a dependência do `/api/` antigo;
- horário da restrição e calendário da próxima entrega alinhados ao fuso `America/Sao_Paulo`;
- testes automatizados corrigidos para não confundir caminhos internos legítimos com a antiga API.

## Isolamento confirmado

O sistema de pedidos permanece dentro de `pedidos/` e usa as coleções `products`, `orders` e `config` do projeto Firebase `samuelfrutasbot`. O Sistema de Agendamentos continua separado, inclusive na coleção `produtos`.

Nenhuma alteração foi feita na branch `main`.

## Limite da conferência

A conferência de código e lógica foi concluída. A única validação que depende de ambiente externo é a execução real contra o Firestore/Auth em produção, pois a publicação das regras no Firebase e a existência de um usuário do Firebase Authentication não podem ser efetuadas por este repositório público.
