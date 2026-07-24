# Expansao de Recomendacoes de Produtos

## Situacao atual

As recomendacoes botanicas usam IDs de produtos reais, motivo, tipo e prioridade. A estrutura ja aceita tipos novos sem alterar os perfis existentes: vaso, substrato, drenagem, ferramentas, suporte e manutencao.

Nenhuma das 127 imagens de Insumos foi cadastrada ou publicada nesta etapa, porque ainda nao existe planilha validada que associe imagem e produto.

## Campos necessarios na planilha de Insumos

| Campo | Uso na integracao |
| --- | --- |
| codigo | Chave unica para associacao exata entre planilha, imagem e recomendacao. |
| nome | Nome comercial exibido ao usuario. |
| descricao | Finalidade clara e verificavel; requisito para publicacao. |
| categoria | Grupo principal, como vaso, substrato, drenagem, ferramenta, suporte ou manutencao. |
| subcategoria | Detalhe operacional, como vaso autoirrigavel, argila expandida ou tutor. |
| material | Material relevante para compatibilidade, como plastico, ceramica, fibra, metal ou madeira. |
| tamanho ou capacidade | Medida comercial para avaliar porte, volume ou adequacao. |
| finalidade | Necessidade que o item atende no cultivo. |
| compatibilidade | Perfis, portes ou ambientes indicados e restricoes conhecidas. |
| nome do arquivo de imagem | Nome exato do ativo publico associado ao codigo. |

## Regras antes da publicacao

- Cada recomendacao deve usar um `productId` existente e uma imagem validada por codigo.
- O motivo deve explicar a compatibilidade, sem prometer resultado nem prescrever dosagem.
- Itens sem descricao, finalidade ou imagem correspondente nao podem ser publicados.
- Preco, carrinho, checkout e quantidade vendida continuam fora da experiencia botanica.
