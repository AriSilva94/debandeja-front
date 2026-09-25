# Cadastro de produto simplificado

## Objetivo

Permitir criar um produto com os dados mínimos em uma única passagem, mantendo configurações de estoque e catálogo disponíveis sem sobrecarregar a primeira decisão.

## Decisões aprovadas

- O primeiro salvamento exige nome, SKU, categoria, unidade e preço de venda.
- Estoque mínimo é padrão global; valor zero significa que não há alerta de estoque baixo.
- Estoque inicial por filial é opcional e fica recolhido até ser solicitado.
- Marca e código de barras ficam em detalhes opcionais; a imagem é removida até existir upload funcional.
- Erros de campo aparecem junto ao input, recebem foco no envio e mantêm uma mensagem geral apenas para falhas não associáveis a um campo.
- Fechamentos com alterações não salvas pedem confirmação.
- Após criar, o usuário recebe confirmação e pode cadastrar outro item.

## Limites

O frontend não altera regras de persistência, limites por filial ou validação autoritativa do backend. A verificação de SKU no cliente é apenas uma melhoria de feedback quando a API informar conflito.
