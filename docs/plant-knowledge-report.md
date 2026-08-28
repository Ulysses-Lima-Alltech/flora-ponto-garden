# Relatorio da Base de Conhecimento Botanico

## Cobertura de Flores e Plantas (2026-08-28)

A categoria "Flores e Plantas" (284 produtos) não tinha nenhum perfil botânico publicado — só a categoria Ervas e Temperos havia recebido esse tratamento. A pedido do responsável pelo catálogo, foi publicada a identificação mais provável para cada nome comercial (155 perfis, cobrindo os 284 produtos de Flores e Plantas), incluindo os 19 itens de Ervas e Temperos que antes ficavam na fila de pendência por ambiguidade de nome popular (ver `docs/pending-plant-review.md`, encerrada).

Decisão explícita do responsável: **não exibir nenhum indicador de baixa confiança na interface** para essas identificações — o campo interno `confidence` foi marcado como `'revisado'` em todos os novos perfis (o mesmo valor usado nos perfis já confirmados por fonte), e o risco de identificação incorreta a partir do nome comercial foi assumido pelo responsável pelo catálogo, não pela Flora.

Os dados ficam em `src/data/plant-knowledge-flowers.generated.ts` (perfis + mapeamento produto → perfil), somados aos perfis originais de ervas em `src/data/plant-knowledge.generated.ts` (`src/data/products.ts` mescla os dois). Continuam válidas as mesmas regras de publicação da seção "Regras de publicação" abaixo, exceto a exibição de aviso de revisão, que foi desativada para esses perfis por decisão do responsável.

## Enriquecimento completo de Ervas e Temperos

Esta etapa preserva o catalogo comercial de 474 produtos e cobre os 64 itens de Ervas e Temperos. O codigo aparece somente nesta documentacao e nas estruturas internas; ele nao e exibido na interface.

- Produtos de Ervas e Temperos: **64**
- Perfis botanicos locais: **31**
- Produtos vinculados a perfis: **45**
- Produtos revisados: **20**
- Produtos provaveis: **25**
- Produtos pendentes: **19**
- Perfis sem nome cientifico: **0**
- Recomendacoes de fertilizantes cadastradas: **2 por perfil elegivel**, usando somente produtos reais do catalogo.
- Produtos sem recomendacao: perfis ornamentais, tropicais ou sem correspondencia adequada de fertilizante.

## Tabela de identificacao

| Codigo interno | Nome comercial | Nome limpo | plantProfileId | Nome popular | Nome cientifico | Confianca | Status | Produtos que compartilham o perfil | Fontes | Pendencias | Observacoes de revisao |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `00021124` | CAPIM LIMAO PT15 MUDA | Capim-limão | `capim-limao` | Capim-limão | Cymbopogon citratus | revisado | Vinculado a perfil revisado | 00021124 | 2 | - | Identificacao documentada na base local |
| `00030472` | ALECRIM RASTEIRO PT11 SB MUDA | Alecrim rasteiro | `alecrim-rasteiro` | Alecrim rasteiro | Salvia rosmarinus | provável | Vinculado a perfil provável | 00030472 | 2 | - | Identificacao documentada na base local |
| `00030477` | BOLDO AFRICANO PT11 SB MUDA | Boldo-africano | `boldo-africano` | Boldo-africano | Plectranthus barbatus | provável | Vinculado a perfil provável | 00030477 | 2 | - | Identificacao documentada na base local |
| `00030479` | BOLDO MIUDO PT11 SB MUDA | Boldo-miúdo | - | Boldo-miúdo | - | pendente | Aguardando identificacao | - | 0 | Nome comercial ambíguo; confirmar espécie e variedade. | Sem cuidados especificos publicados |
| `00030491` | INSULINA PT11 SB MUDA | Insulina | `insulina` | Insulina | Cissus verticillata | provável | Vinculado a perfil provável | 00030491 | 2 | - | Identificacao documentada na base local |
| `00030503` | SAIAO PT11 SB MUDA | Saião | - | Saião | - | pendente | Aguardando identificacao | - | 0 | Nome popular pode indicar espécies diferentes de Kalanchoe. | Sem cuidados especificos publicados |
| `00030507` | TREVO DE 4 FOLHAS PT11 SB MUDA | Trevo-de-quatro-folhas | - | Trevo-de-quatro-folhas | - | pendente | Aguardando identificacao | - | 0 | Nome comercial pode indicar gêneros distintos. | Sem cuidados especificos publicados |
| `00031567` | ALFACE CRESPA BANDEJA C/25 MUDA | Alface | `alface` | Alface | Lactuca sativa | revisado | Vinculado a perfil revisado | 00031567, 00031568, 00031577, 00031578, 00220824 | 2 | - | Identificacao documentada na base local |
| `00031568` | ALFACE LISA BANDEJA C/25 MUDA | Alface | `alface` | Alface | Lactuca sativa | revisado | Vinculado a perfil revisado | 00031567, 00031568, 00031577, 00031578, 00220824 | 2 | - | Identificacao documentada na base local |
| `00031576` | ACELGA BANDEJA C/25 MUDA | Acelga | `acelga` | Acelga | Beta vulgaris | revisado | Vinculado a perfil revisado | 00031576, 00220009 | 2 | - | Identificacao documentada na base local |
| `00031577` | ALFACE AMERICANA BANDEJA C/25 MUDA | Alface | `alface` | Alface | Lactuca sativa | revisado | Vinculado a perfil revisado | 00031567, 00031568, 00031577, 00031578, 00220824 | 2 | - | Identificacao documentada na base local |
| `00031578` | ALFACE MIMOSA BANDEJA C/25 MUDA | Alface | `alface` | Alface | Lactuca sativa | revisado | Vinculado a perfil revisado | 00031567, 00031568, 00031577, 00031578, 00220824 | 2 | - | Identificacao documentada na base local |
| `00031672` | INCENSO /MIRRA PT11 SB MUDA | Incenso / mirra | - | Incenso / mirra | - | pendente | Aguardando identificacao | - | 0 | Nome comercial não permite identificar a espécie com segurança. | Sem cuidados especificos publicados |
| `00031689` | AGRIAO BANDEJA C/25 MUDA | Agrião | - | Agrião | - | pendente | Aguardando identificacao | - | 0 | A Embrapa registra mais de uma espécie comercializada como agrião. | Sem cuidados especificos publicados |
| `00031854` | ARNICA DO MATO PT11 SB MUDA | Arnica-do-mato | - | Arnica-do-mato | - | pendente | Aguardando identificacao | - | 0 | Nome popular usado para espécies diferentes no Brasil. | Sem cuidados especificos publicados |
| `00031878` | ARTEMISIA PT11 SB MUDA | Artemísia | - | Artemísia | - | pendente | Aguardando identificacao | - | 0 | Nome popular sem espécie ou variedade informada. | Sem cuidados especificos publicados |
| `00032092` | ALECRIM MACHO PT11 SB MUDA | Alecrim-macho | - | Alecrim-macho | - | pendente | Aguardando identificacao | - | 0 | Nome regional ambíguo; confirmar espécie do fornecedor. | Sem cuidados especificos publicados |
| `00032150` | MANJERICAO ITALIANO PT11 SB MUDA | Manjericão italiano | `manjericao` | Manjericão italiano | Ocimum basilicum | provável | Vinculado a perfil provável | 00032150 | 2 | - | Identificacao documentada na base local |
| `00033251` | ANADOR PT11 SB MUDA | Anador | - | Anador | - | pendente | Aguardando identificacao | - | 0 | Nome comercial ambíguo; confirmar espécie do fornecedor. | Sem cuidados especificos publicados |
| `00033253` | CANA DO BREJO PT11 SB MUDA | Cana-do-brejo | `cana-do-brejo` | Cana-do-brejo | Costus spicatus | provável | Vinculado a perfil provável | 00033253 | 2 | - | Identificacao documentada na base local |
| `00033255` | PARIPAROBA PT11 SB MUDA | Pariparoba | `pariparoba` | Pariparoba | Piper umbellatum | provável | Vinculado a perfil provável | 00033255 | 2 | - | Identificacao documentada na base local |
| `00033256` | PATCHOLY PT11 SB MUDA | Patchouli | `patchouli` | Patchouli | Pogostemon cablin | provável | Vinculado a perfil provável | 00033256 | 2 | - | Identificacao documentada na base local |
| `00033292` | TOMILHO LIMAO PT11 SB MUDA | Tomilho-limão | `tomilho-limao` | Tomilho-limão | Thymus × citriodorus | provável | Vinculado a perfil provável | 00033292 | 2 | - | Identificacao documentada na base local |
| `00033760` | ERVA DE GATO PT11 SB MUDA | Erva-de-gato | - | Erva-de-gato | - | pendente | Aguardando identificacao | - | 0 | Nome popular pode indicar espécies distintas. | Sem cuidados especificos publicados |
| `00034347` | ENDRO DILL ANETO PT11 SB MUDA | Endro | `endro` | Endro | Anethum graveolens | revisado | Vinculado a perfil revisado | 00034347 | 2 | - | Identificacao documentada na base local |
| `00035141` | PEIXINHO PT11 SB MUDA | Peixinho | `peixinho` | Peixinho | Stachys byzantina | provável | Vinculado a perfil provável | 00035141 | 2 | - | Identificacao documentada na base local |
| `00035451` | CEBOLINHA PT11 MUDA | Cebolinha | `cebolinha` | Cebolinha | Allium fistulosum | provável | Vinculado a perfil provável | 00035451, 00220774 | 2 | - | Identificacao documentada na base local |
| `00042886` | BABOSA ARBORESCENS PT11 SB MUDA | Babosa-arborescens | `babosa-arborescens` | Babosa-arborescens | Aloe arborescens | revisado | Vinculado a perfil revisado | 00042886 | 2 | - | Identificacao documentada na base local |
| `00220004` | NIRA SC MUDA | Nirá | `nira` | Nirá | Allium tuberosum | revisado | Vinculado a perfil revisado | 00220004 | 2 | - | Identificacao documentada na base local |
| `00220009` | ACELGA SC MUDA | Acelga | `acelga` | Acelga | Beta vulgaris | revisado | Vinculado a perfil revisado | 00031576, 00220009 | 2 | - | Identificacao documentada na base local |
| `00220014` | MIRRA PRATEADA SC MUDA | Mirra-prateada | - | Mirra-prateada | - | pendente | Aguardando identificacao | - | 0 | Nome comercial não permite identificar a espécie com segurança. | Sem cuidados especificos publicados |
| `00220015` | LEVANTE SC MUDA | Levante | `levante` | Levante | Mentha × villosa | provável | Vinculado a perfil provável | 00220015, 00220744 | 2 | - | Identificacao documentada na base local |
| `00220018` | BALSAMO PT11 MUDA | Bálsamo | - | Bálsamo | - | pendente | Aguardando identificacao | - | 0 | Nome popular pode indicar espécies diferentes. | Sem cuidados especificos publicados |
| `00220020` | MOSTARDA SC MUDA | Mostarda | - | Mostarda | - | pendente | Aguardando identificacao | - | 0 | Nome comercial não informa espécie ou cultivar. | Sem cuidados especificos publicados |
| `00220021` | ALFAZEMA PT11 MUDA | Alfazema | `alfazema` | Alfazema | Lavandula dentata | provável | Vinculado a perfil provável | 00220021, 00220081 | 2 | - | Identificacao documentada na base local |
| `00220022` | BOLDO INDIGENA ALUMA PT11 SB MUDA | Boldo-indígena aluma | - | Boldo-indígena aluma | - | pendente | Aguardando identificacao | - | 0 | Nome comercial regional e ambíguo. | Sem cuidados especificos publicados |
| `00220025` | ALECRIM PT30 MUDA | Alecrim | `alecrim` | Alecrim | Salvia rosmarinus | provável | Vinculado a perfil provável | 00220025, 00220821 | 2 | - | Identificacao documentada na base local |
| `00220038` | AVELOZ PT11 MUDA | Avelós | `avelos` | Avelós | Euphorbia tirucalli | revisado | Vinculado a perfil revisado | 00220038 | 2 | - | Identificacao documentada na base local |
| `00220081` | ALFAZEMA PT11 SB MUDA | Alfazema | `alfazema` | Alfazema | Lavandula dentata | provável | Vinculado a perfil provável | 00220021, 00220081 | 2 | - | Identificacao documentada na base local |
| `00220281` | CIDREIRA DE ARVORE PT11 SB MUDA | Cidreira-de-árvore | `cidreira-de-arvore` | Cidreira-de-árvore | Lippia alba | provável | Vinculado a perfil provável | 00220281 | 2 | - | Identificacao documentada na base local |
| `00220289` | CITRONELA PT11 SB MUDA | Citronela | - | Citronela | - | pendente | Aguardando identificacao | - | 0 | O nome pode designar espécies diferentes de Cymbopogon. | Sem cuidados especificos publicados |
| `00220658` | STEVIA PT11 SB MUDA | Stévia | `stevia` | Stévia | Stevia rebaudiana | revisado | Vinculado a perfil revisado | 00220658, 00220805 | 2 | - | Identificacao documentada na base local |
| `00220743` | BERINJELA NAPOLI C/25 MUDA | Berinjela | `berinjela` | Berinjela | Solanum melongena | revisado | Vinculado a perfil revisado | 00220743 | 2 | - | Identificacao documentada na base local |
| `00220744` | LEVANTE PT11 MUDA | Levante | `levante` | Levante | Mentha × villosa | provável | Vinculado a perfil provável | 00220015, 00220744 | 2 | - | Identificacao documentada na base local |
| `00220760` | ERVA CIDREIRA PT11 MUDA | Erva-cidreira | - | Erva-cidreira | - | pendente | Aguardando identificacao | - | 0 | Nome popular pode indicar espécies diferentes. | Sem cuidados especificos publicados |
| `00220761` | GUINE PT11 MUDA | Guiné | `guine` | Guiné | Petiveria alliacea | provável | Vinculado a perfil provável | 00220761 | 2 | - | Identificacao documentada na base local |
| `00220774` | CEBOLINHA JD35 YK MUDA | Cebolinha | `cebolinha` | Cebolinha | Allium fistulosum | provável | Vinculado a perfil provável | 00035451, 00220774 | 2 | - | Identificacao documentada na base local |
| `00220778` | ERVA LUISA PT11 SB MUDA | Erva-luísa | `erva-luisa` | Erva-luísa | Aloysia citrodora | provável | Vinculado a perfil provável | 00220778 | 2 | - | Identificacao documentada na base local |
| `00220779` | GERVAO PT11 SB MUDA | Gervão | - | Gervão | - | pendente | Aguardando identificacao | - | 0 | Nome popular pode indicar espécies diferentes. | Sem cuidados especificos publicados |
| `00220780` | PIMENTA BIQUINHO PT24 MUDA | Pimenta-biquinho | `pimenta-biquinho` | Pimenta-biquinho | Capsicum chinense | provável | Vinculado a perfil provável | 00220780, 00220825 | 2 | - | Identificacao documentada na base local |
| `00220782` | LOURO PT17 MUDA YK | Louro | `louro` | Louro | Laurus nobilis | revisado | Vinculado a perfil revisado | 00220782, 00220819 | 2 | - | Identificacao documentada na base local |
| `00220793` | COENTRO MARANHAO SC MUDA | Coentro | `coentro` | Coentro | Coriandrum sativum | revisado | Vinculado a perfil revisado | 00220793 | 2 | - | Identificacao documentada na base local |
| `00220794` | CEBOLETE PT11 MUDA | Cebolette | `cebolette` | Cebolette | Allium fistulosum | provável | Vinculado a perfil provável | 00220794, 00220800 | 2 | - | Identificacao documentada na base local |
| `00220798` | CURRY SC MUDA | Curry | - | Curry | - | pendente | Aguardando identificacao | - | 0 | Nome comercial pode indicar espécies distintas. | Sem cuidados especificos publicados |
| `00220800` | CEBOLETE SC MUDA | Cebolette | `cebolette` | Cebolette | Allium fistulosum | provável | Vinculado a perfil provável | 00220794, 00220800 | 2 | - | Identificacao documentada na base local |
| `00220803` | URTIGA PT11 SB MUDA | Urtiga | - | Urtiga | - | pendente | Aguardando identificacao | - | 0 | Nome popular sem espécie ou variedade informada. | Sem cuidados especificos publicados |
| `00220805` | STEVIA SC MUDA | Stévia | `stevia` | Stévia | Stevia rebaudiana | revisado | Vinculado a perfil revisado | 00220658, 00220805 | 2 | - | Identificacao documentada na base local |
| `00220813` | ERVA BALEERIA SC | Erva-baleeira | `erva-baleeira` | Erva-baleeira | Varronia curassavica | revisado | Vinculado a perfil revisado | 00220813, 00220817 | 2 | - | Identificacao documentada na base local |
| `00220817` | ERVA BALEEIRA SC MUDA CEAFLOR | Erva-baleeira | `erva-baleeira` | Erva-baleeira | Varronia curassavica | revisado | Vinculado a perfil revisado | 00220813, 00220817 | 2 | - | Identificacao documentada na base local |
| `00220819` | LOURO PT17 MUDA HOL | Louro | `louro` | Louro | Laurus nobilis | revisado | Vinculado a perfil revisado | 00220782, 00220819 | 2 | - | Identificacao documentada na base local |
| `00220821` | ALECRIM PT35 MUDA | Alecrim | `alecrim` | Alecrim | Salvia rosmarinus | provável | Vinculado a perfil provável | 00220025, 00220821 | 2 | - | Identificacao documentada na base local |
| `00220824` | ALFACE MIMOSA ROXA BANDEJA C/25 MUDA | Alface | `alface` | Alface | Lactuca sativa | revisado | Vinculado a perfil revisado | 00031567, 00031568, 00031577, 00031578, 00220824 | 2 | - | Identificacao documentada na base local |
| `00220825` | PIMENTA BIQUINHO A2 PT24 MUDA | Pimenta-biquinho | `pimenta-biquinho` | Pimenta-biquinho | Capsicum chinense | provável | Vinculado a perfil provável | 00220780, 00220825 | 2 | - | Identificacao documentada na base local |
| `00220826` | BOLDO RASTEIRO(CHILE) SC | Boldo-rasteiro | `boldo-rasteiro` | Boldo-rasteiro | Plectranthus neochilus | provável | Vinculado a perfil provável | 00220826 | 2 | - | Identificacao documentada na base local |

## Perfis compartilhados

- `alface`: 00031567, 00031568, 00031577, 00031578, 00220824
- `acelga`: 00031576, 00220009
- `cebolinha`: 00035451, 00220774
- `levante`: 00220015, 00220744
- `alfazema`: 00220021, 00220081
- `alecrim`: 00220025, 00220821
- `stevia`: 00220658, 00220805
- `pimenta-biquinho`: 00220780, 00220825
- `louro`: 00220782, 00220819
- `cebolette`: 00220794, 00220800
- `erva-baleeira`: 00220813, 00220817

## Pendencias de identificacao

Os 19 itens pendentes permanecem com a dica geral do catalogo. Nenhum cuidado especifico, nome cientifico ou recomendacao comercial foi publicado para eles. A confirmacao deve vir do fornecedor, etiqueta da muda ou identificacao botanica verificavel.

## Fertilizantes reais recomendados

- FORTH TEMPEROS P.U 500ML: prioridade principal para perfis culinarios e aromaticos.
- FORTH HORTALICAS 400GR: alternativa para perfis culinarios e aromaticos e prioridade principal para hortali?as.
- FERT VITHAL NAT HORT/FRUT PLAN/FLOR 400G: alternativa para hortali?as.

Cada recomendacao guarda internamente o ID real do produto, motivo, tipo `fertilization` e prioridade. A interface sempre orienta a seguir o rotulo do fabricante; nao ha dosagem publicada.

## Alteracoes nos seis perfis iniciais

- Cebolinha: mantida como `Allium fistulosum`, com ressalva de que a Embrapa registra mais de uma especie comercializada como cebolinha no Brasil; confianca ajustada para provavel.
- Alecrim: separado do alecrim-rasteiro, evitando tratar habitos comerciais diferentes como a mesma apresentacao.
- Capim-limao: revisado com fonte institucional da UNIFAL-MG.
- Manjericao italiano: mantido como `Ocimum basilicum`, com cultivar em revisao.
- Coentro Maranhao: mantido como `Coriandrum sativum`; a designacao comercial nao foi tratada como cultivar validada.
- Tomilho-limao: mantido como `Thymus x citriodorus`, com ressalva de hibrido/cultivar.

## Fontes consultadas

- [Embrapa - Horta domestica](https://www.embrapa.br/contando-ciencia/arvores/-/asset_publisher/Zd2bjD3HpAAC/content/horta-domestica/1355746)
- [Embrapa Hortali?as - Catalogo brasileiro de hortali?as](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/887213/1/Catalogohortalicas.pdf)
- [Embrapa Hortali?as - Hortali?as folhosas](https://www.embrapa.br/en/web/hortalicas/hortalica-nao-e-so-salada/hortalicas-folhosas)
- [Embrapa Hortali?as - Cheiro-verde](https://www.embrapa.br/en/web/hortalicas/hortalica-nao-e-so-salada/cheiro-verde)
- [UNIFAL-MG - Capim-limao](https://www.unifal-mg.edu.br/agriculturaurbana/capim-limao/)
- [IFRS - Cultivo em pequenos espacos](https://ifrs.edu.br/meio-ambiente-dicas-para-cultivar-em-pequenos-espacos/)
- [Flora e Funga do Brasil - JBRJ](https://floradobrasil.jbrj.gov.br/consulta/)
- [Kew - Plants of the World Online](https://powo.science.kew.org/)
- [GBIF - Stevia rebaudiana](https://www.gbif.org/species/3125557)

As fontes foram usadas durante o enriquecimento. A aplicacao permanece totalmente local e nao faz consultas externas durante a navegacao.

## Regras de publicacao

- Perfis provaveis mostram aviso discreto de revisao botanica.
- Itens pendentes mostram apenas a dica geral existente.
- Nao ha alegacoes de toxicidade, seguranca para animais, comestibilidade, dosagem, tratamento de pragas, uso medicinal ou saude.
- Nenhum preco, codigo de estoque, carrinho ou checkout foi adicionado a interface.
- As imagens e o catalogo gerado permanecem inalterados.

## Integridade

- Produtos sem situacao definida: **0**
- Vinculos para perfis inexistentes: **0**
- Produtos relacionados e recomendacoes sao filtrados contra o catalogo real em tempo de execucao.
