# Etapa 3 — Preparação

Status: concluída.

A estrutura inicial do Sistema de Pedidos foi criada de forma isolada em `pedidos/` na branch `migracao-pedidos-pages`.

## Garantias
1. Nenhum arquivo existente do Sistema de Agendamentos foi alterado nesta etapa.
2. Nenhuma coleção do Firebase foi alterada.
3. Nenhum banco foi criado, copiado ou migrado.
4. A coleção `produtos` continua exclusiva do Sistema de Agendamentos.
5. `products`, `orders` e `config` continuam reservadas ao Sistema de Pedidos.
6. Nenhuma credencial privada foi adicionada ao repositório.

## Estrutura criada
- `pedidos/README.md` — mapa e regras de isolamento.
- `pedidos/config.js` — ponto único para a configuração pública futura do Firebase do Sistema de Pedidos.

## Próxima etapa
A implementação/adaptação só deve começar depois de obter a configuração pública correta do Firebase original do Sistema de Pedidos e definir as regras de segurança do Firestore para uso direto pelo GitHub Pages.
