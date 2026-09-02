# Etapa 4 — Adaptação para GitHub Pages

Concluída na branch `migracao-pedidos-pages`.

## O que foi adaptado

- Firebase Web do projeto original `samuelfrutasbot` conectado diretamente ao sistema de pedidos.
- Firestore isolado nas coleções `products`, `orders` e `config`.
- Loja em `pedidos/index.html`, sem dependência do servidor Node antigo.
- Cálculo de medidas, fatores, preços progressivos, carrinho, observações, taxa de entrega e gravação de pedidos preservados/adaptados do sistema antigo.
- Painel independente em `pedidos/admin.html`.
- Login do painel adaptado para Firebase Authentication, evitando senha administrativa embutida em JavaScript público.
- CRUD de produtos, medidas/preços, arquivamento, restauração e exclusão permanente adaptados para Firestore.
- Consulta de pedidos recentes adicionada ao painel do sistema de pedidos.
- `pedidos/firestore.rules` preparado para publicação no projeto `samuelfrutasbot`.

## Isolamento

O sistema de Agendamentos continua usando a configuração e a coleção `produtos` próprias. Nenhum arquivo do Firebase do Agendamentos foi reutilizado pelo sistema de pedidos.

## Segurança

Nenhuma chave privada, service account, senha ou token secreto foi adicionado ao repositório. A configuração Web do Firebase é a configuração pública fornecida pelo proprietário do projeto.

As regras em `firestore.rules` devem ser publicadas no Firebase antes do teste funcional completo da Etapa 5. A Etapa 5 será responsável por validar leitura, criação de pedido, autenticação do painel e todas as operações reais no banco.
