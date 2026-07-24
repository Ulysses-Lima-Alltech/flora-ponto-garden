# Relat&oacute;rio de Importa&ccedil;&atilde;o do Cat&aacute;logo Flora

O cat&aacute;logo foi gerado somente a partir de correspond&ecirc;ncias exatas entre o c&oacute;digo da planilha e o c&oacute;digo no nome do arquivo de imagem. As colunas comerciais foram ignoradas e n&atilde;o s&atilde;o exportadas para a aplica&ccedil;&atilde;o.

A base presente possui 474 correspond&ecirc;ncias v&aacute;lidas: 64 Ervas e Temperos, 284 Flores e Plantas e 126 Fertilizantes. O total difere em um item do total auditado informado (473); nenhum produto com correspond&ecirc;ncia exata foi removido sem um crit&eacute;rio verific&aacute;vel.

## Produtos publicados

| Categoria | Quantidade |
| --- | ---: |
| Ervas e Temperos | 64 |
| Flores e Plantas | 284 |
| Fertilizantes | 126 |
| **Total** | **474** |

Insumos n&atilde;o foram publicados: h&aacute; imagens, mas n&atilde;o h&aacute; planilha com os respectivos nomes e c&oacute;digos.

## Itens exclu&iacute;dos por falta de imagem

- Ervas e Temperos: 52 (`00020131, 00030351, 00030394, 00030513, 00030616, 00030889, 00031003, 00031088, 00031197, 00031284, 00031544, 00031574, 00031774, 00032021, 00032405, 00032622, 00032678, 00032719, 00032738, 00033016, 00033384, 00033700, 00034025, 00034153, 00034315, 00034360, 00034958, 00035075, 00035440, 00035791, 00036016, 00036044, 00036209, 00036442, 00036690, 00037452, 00037961, 00037973, 00037986, 00038267, 00038291, 00038513, 00038647, 00038961, 00038984, 00039107, 00039139, 00039234, 00039246, 00039304, 00220024, 00220823`)
- Flores e Plantas: 2 (`00020241, 00022257`)
- Fertilizantes: 18 (`00190044, 00190054, 00190115, 00190146, 00190148, 00190164, 00190176, 00190178, 00190183, 00190193, 00190208, 00190209, 00190210, 00190211, 00190212, 00190216, 00190223, 00190224`)

## Imagens sem descri&ccedil;&atilde;o

- Ervas e Temperos: 0
- Flores e Plantas: 0
- Fertilizantes: 0

## Extra&ccedil;&atilde;o de RAR

Nenhum arquivo RAR foi encontrado. As imagens j&aacute; estavam extra&iacute;das, portanto nenhuma ferramenta de extra&ccedil;&atilde;o foi utilizada.

## Arquivos criados ou alterados

- `scripts/prepare-flora-catalog.py`
- `base_de_dados/utf8/*.csv` (c&oacute;pias UTF-8 com BOM, fora do reposit&oacute;rio)
- `public/products/ervas-temperos/<codigo>.webp`
- `public/products/flores-plantas/<codigo>.webp`
- `public/products/fertilizantes/<codigo>.webp`
- `public/products/product-placeholder.svg`
- `src/data/products.generated.ts`
- `src/data/products.ts`
- `src/types/catalog.ts`
- `src/pages/CategoriesPage.tsx`
- `src/pages/ProductPage.tsx`
- `src/components/products/CatalogProductImage.tsx`
- `src/types/customer.ts`
- `src/data/customers.ts`
- `src/components/access/CustomerAccountPanel.tsx`
- `src/components/access/PhoneAccessForm.tsx`
- `src/utils/formatters.ts`
- `src/index.css`
- `docs/catalog-import-report.md`

## Comandos executados

```powershell
python scripts/prepare-flora-catalog.py
npm run lint
npm run typecheck
npm run build
npx cap sync android
```

## Valida&ccedil;&atilde;o

- `npm run lint`: conclu&iacute;do sem erros.
- `npm run typecheck`: conclu&iacute;do sem erros.
- `npm run build`: conclu&iacute;do sem erros. O Vite emitiu somente o aviso de bundle acima de 500 kB.
- `npx cap sync android`: conclu&iacute;do sem erros.
- Testes automatizados: n&atilde;o existe script de teste configurado em `package.json`.
- Busca por `cebolinha`: o produto real `CEBOLINHA PT11 MUDA` est&aacute; presente no cat&aacute;logo e no campo normalizado de busca.
- Busca interna por c&oacute;digo real: `00035451` permanece presente em `searchText`, sem ser exibido no resultado.
- Filtro de Fertilizantes: h&aacute; 126 produtos publicados nessa categoria.
- Fallback de imagem: `CatalogProductImage` usa `/products/product-placeholder.svg` ap&oacute;s falha de carregamento, mantendo `loading="lazy"`.
- Aus&ecirc;ncia de informa&ccedil;&otilde;es comerciais: o contrato de produto e as telas de categoria/detalhe n&atilde;o possuem pre&ccedil;o, valor, quantidade ou fluxo de compra.
- Recomenda&ccedil;&otilde;es de Meu Acesso: todos os itens s&atilde;o derivados de c&oacute;digos presentes no cat&aacute;logo gerado.
- Viewport de 800 px: conferido no navegador headless com cabe&ccedil;alho, busca, filtros e grade renderizados.
- Mobile: a regra `@media (max-width: 560px)` aplica grade de uma coluna, imagens menores e filtros com rolagem horizontal. O navegador headless usado para a captura n&atilde;o ativou a emula&ccedil;&atilde;o de dispositivo m&oacute;vel, por isso essa confer&ecirc;ncia foi feita pela regra CSS responsiva.

## Auditoria final dos 474 itens

### Item adicional identificado

O item adicional em rela&ccedil;&atilde;o ao total inicial de 473 &eacute; o 286&ordm; registro de produto da planilha de Flores e Plantas:

| Campo | Valor |
| --- | --- |
| C&oacute;digo | `00020085` |
| Nome | `CLOROFITO MUDA` |
| Descri&ccedil;&atilde;o | `CLOROFITO PT11 MUDA` |
| Categoria | Flores e Plantas |
| Planilha | `285 Flores e Plantas - P&aacute;gina1.csv` |
| Imagem de origem | `base_de_dados/Imagens_Produtos_Flores e Plantas/00020085.webp` |
| Imagem publicada | `public/products/flores-plantas/00020085.webp` |

A planilha possui 286 linhas de produto com c&oacute;digo e descri&ccedil;&atilde;o, embora seu nome indique 285. Duas linhas (`00022257` e `00020241`) n&atilde;o t&ecirc;m imagem; por isso a conta correta &eacute; 286 menos 2, ou 284 itens publicados. A auditoria inicial partiu de 285 linhas e chegou a 283. O c&oacute;digo `00020085` aparece uma &uacute;nica vez na planilha e foi associado exclusivamente ao arquivo de mesmo c&oacute;digo. Os hashes SHA-256 do arquivo de origem e da c&oacute;pia publicada s&atilde;o id&ecirc;nticos: `407E6A2353BCFC935D41A21D15C845BC9AC5786A1D234BC4D505278EBA869B2F`.

### Integridade do cat&aacute;logo

| Verifica&ccedil;&atilde;o | Resultado |
| --- | ---: |
| Produtos | 474 |
| Ervas e Temperos | 64 |
| Flores e Plantas | 284 |
| Fertilizantes | 126 |
| C&oacute;digos &uacute;nicos | 474 |
| IDs &uacute;nicos | 474 |
| Caminhos de imagem &uacute;nicos | 474 |
| Produtos sem nome, descri&ccedil;&atilde;o, c&oacute;digo, categoria ou imagem | 0 |
| Imagens apontadas pelo cat&aacute;logo inexistentes no disco | 0 |
| Linhas de cabe&ccedil;alho ou total interpretadas como produto | 0 |

N&atilde;o h&aacute; c&oacute;digo, ID ou caminho de imagem duplicado. Foram encontradas 17 repeti&ccedil;&otilde;es de c&oacute;digo nas planilhas de origem, todas com o mesmo nome e descri&ccedil;&atilde;o; a gera&ccedil;&atilde;o deduplicou esses registros por c&oacute;digo. H&aacute; 36 grupos de nomes iguais em c&oacute;digos distintos, mas cada item possui c&oacute;digo e imagem pr&oacute;prios, logo s&atilde;o varia&ccedil;&otilde;es reais e n&atilde;o duplicatas conflitantes. Nenhum c&oacute;digo aparece com nomes ou descri&ccedil;&otilde;es diferentes.

Em 204 itens o nome e a descri&ccedil;&atilde;o s&atilde;o iguais: 190 vieram de planilhas sem coluna `Nome`, para as quais a descri&ccedil;&atilde;o &eacute; o nome de origem; nos 14 restantes os dois campos j&aacute; eram iguais na planilha. Portanto n&atilde;o h&aacute; uso incorreto de descri&ccedil;&atilde;o como nome.

A planilha complementar `285 - 335 Plantas - P&aacute;gina1.csv` possui 49 registros, mas nenhum tem imagem correspondente na pasta configurada. Nenhum desses 49 itens foi publicado.

### Imagens p&uacute;blicas

Nas tr&ecirc;s pastas publicadas do cat&aacute;logo n&atilde;o h&aacute; imagem &oacute;rf&atilde;: 64 + 284 + 126 arquivos correspondem aos 474 caminhos gerados. H&aacute;, por&eacute;m, 602 arquivos sob `public/products` fora desses caminhos: 474 c&oacute;pias brutas nas pastas `Imagens_Produtos_*`, 127 imagens de Insumos ainda sem planilha e o fallback `product-placeholder.svg`. Eles n&atilde;o s&atilde;o referenciados pelo cat&aacute;logo; foram mantidos nesta auditoria para n&atilde;o apagar ativos existentes.

### Dados comerciais

O arquivo gerado cont&eacute;m somente `id`, `code`, `name`, `description`, `category`, `categoryLabel`, `image` e `searchText`. N&atilde;o foram encontrados campos ou textos comerciais no cat&aacute;logo, nas telas ou no script de prepara&ccedil;&atilde;o. A busca textual ampla encontrou apenas falsos positivos t&eacute;cnicos: `margin` como propriedade CSS e `COSTELA` em nomes bot&acirc;nicos; a documenta&ccedil;&atilde;o cita a aus&ecirc;ncia de dados comerciais.

Existe um estado legado e n&atilde;o exposto em `src/store/useKioskStore.ts` (`orderItems`, `addToOrder` e `quantity`). Ele n&atilde;o &eacute; importado ou acionado por nenhuma tela, rota ou card do cat&aacute;logo e n&atilde;o armazena pre&ccedil;o, receita ou vendas. Foi preservado para evitar alterar funcionalidades fora do escopo.

### Uso interno e exibi&ccedil;&atilde;o do c&oacute;digo

O campo `code` continua presente no cat&aacute;logo gerado, nos tipos e nas regras de integra&ccedil;&atilde;o. Ele permanece respons&aacute;vel pela correspond&ecirc;ncia exata entre planilha e imagem, busca interna, IDs e rotas quando aplic&aacute;vel, favoritos, compara&ccedil;&atilde;o, recomenda&ccedil;&otilde;es e auditoria dos dados.

O c&oacute;digo n&atilde;o &eacute; mais exibido em nenhuma interface voltada ao usu&aacute;rio: cards do cat&aacute;logo, detalhe do produto, produtos consultados, recomenda&ccedil;&otilde;es do Meu Acesso e demais resultados visuais. A busca por c&oacute;digo continua funcional internamente, mas o n&uacute;mero n&atilde;o &eacute; renderizado no resultado.

O detalhe do produto exibe somente nome, descri&ccedil;&atilde;o, categoria, imagem e dica geral, al&eacute;m dos comandos existentes de favorito e compara&ccedil;&atilde;o quando aplic&aacute;veis.

### Testes funcionais e desempenho

- Home: servidor local respondeu `HTTP 200`; a captura em 800 px abriu a p&aacute;gina sem erro.
- Categorias: somente Ervas e Temperos, Flores e Plantas e Fertilizantes s&atilde;o produzidas pelos dados publicados.
- Busca: `cebolinha` retorna quatro itens reais, incluindo `00035451` (`CEBOLINHA PT11 MUDA`); a busca por `00035451` retorna exatamente esse item.
- Normaliza&ccedil;&atilde;o: `alstromelia` e `ALSTROM&Eacute;LIA` retornam o mesmo c&oacute;digo (`00020384`).
- Filtro: Fertilizantes retorna 126 itens, todos com categoria `fertilizers`.
- Detalhe: a captura do item auditado mostrou nome, descri&ccedil;&atilde;o, categoria, imagem e dica geral; o c&oacute;digo n&atilde;o &eacute; exibido em card ou detalhe.
- Fallback e estado vazio: os dois caminhos est&atilde;o implementados em `CatalogProductImage` e `CategoriesPage`; o fallback troca uma imagem com erro por `product-placeholder.svg` sem quebrar o card. N&atilde;o h&aacute; infraestrutura de automa&ccedil;&atilde;o instalada para injetar uma falha de arquivo na interface sem alterar os ativos existentes.
- Pagina&ccedil;&atilde;o: a tela renderiza 48 produtos inicialmente, usa 10 p&aacute;ginas para 474 itens e a confer&ecirc;ncia de IDs entre p&aacute;ginas encontrou 0 repeti&ccedil;&otilde;es.
- Meu Acesso: as 20 refer&ecirc;ncias de produto em compras de consulta e recomenda&ccedil;&otilde;es existem no cat&aacute;logo real. Encerrar acesso chama `endCustomerSession`, que limpa cliente ativo, status e telefone tempor&aacute;rio.
- Viewports: home e detalhe conferidos a 800 px; cat&aacute;logo conferido a 540 px com uma coluna, filtros horizontais e navega&ccedil;&atilde;o de totem.
- Imagens e desempenho: os produtos usam caminhos p&uacute;blicos, sem import&aacute;-los no JavaScript, e `CatalogProductImage` usa `loading="lazy"`. A busca em 474 registros levou, em m&eacute;dia, 0,29 ms em 1.000 execu&ccedil;&otilde;es locais alternadas. Nenhuma otimiza&ccedil;&atilde;o adicional &eacute; necess&aacute;ria.

### Comandos t&eacute;cnicos e pend&ecirc;ncias

`npm run lint`, `npm run typecheck`, `npm run build` e `npx cap sync android` foram executados novamente ao final desta auditoria e conclu&iacute;ram sem erros. O build manteve somente o aviso informativo do Vite sobre bundle acima de 500 kB. `package.json` continua sem script de testes, e nenhum script de testes foi criado.

Pend&ecirc;ncias n&atilde;o bloqueantes:

- Os 602 arquivos p&uacute;blicos n&atilde;o referenciados devem permanecer at&eacute; uma auditoria espec&iacute;fica; n&atilde;o devem ser exclu&iacute;dos sem essa revis&atilde;o.
- O estado legado `orderItems` no Zustand continua preservado e n&atilde;o &eacute; exposto pela interface.
- O Vite emite um aviso informativo sobre bundle acima de 500 kB, sem impacto na conclus&atilde;o do build.

N&atilde;o h&aacute; pend&ecirc;ncias de integridade nos 474 itens publicados.
