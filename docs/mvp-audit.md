# Auditoria Final do MVP

Data de preparacao: 24/07/2026.

## Integridade funcional

- 474 produtos no catalogo local: 64 Ervas e Temperos, 284 Flores e Plantas e 126 Fertilizantes.
- 31 perfis botanicos locais e 45 produtos vinculados.
- `/escolher` e `/comparar` sao rotas ativas e usam apenas dados locais.
- Favoritos exigem cliente identificado; comparacao funciona sem login e so em memoria.
- A interface nao mostra preco, codigo de estoque, carrinho ou checkout.
- Nao ha chamadas externas obrigatorias durante a navegacao. A permissao `INTERNET` do Capacitor nao e usada como dependencia do MVP.
- Nenhum caminho absoluto do Windows e usado em tempo de execucao.

## Assets e arquivos grandes

Nao ha arquivos versionaveis maiores que 20 MB. O maior ativo publico atual e `public/products/Imagens_Produtos_Flores e Plantas/00020384.png`, com 1.09 MB.

O catalogo aponta 474 caminhos de imagem unicos e todos existem fisicamente. Existem 1.076 imagens em `public/products`; 602 nao sao referenciadas pelo catalogo atual. Elas ficam principalmente nas pastas `public/products/Imagens_Produtos_*` e parecem ser ativos complementares importados junto com os materiais de origem.

Tambem foram identificados 395 grupos de arquivos publicos com hash identico, totalizando 531 copias alem da primeira. Nao foram removidos: a auditoria de associacao por codigo e a origem comercial desses ativos precisam de revisao especifica antes de qualquer consolidacao.

Recomendacao futura: manter os ativos no repositorio para reproduzir o aplicativo atual e abrir uma tarefa exclusiva para decidir quais imagens complementares podem ser arquivadas ou deduplicadas.

## Seguranca e Git

A verificacao de codigo e configuracoes nao encontrou `.env`, keystores, `google-services.json`, certificados, tokens ou credenciais reais. O `.gitignore` cobre builds web e Android, APK/AAB, SDK local, arquivos de assinatura, logs, editor local, capturas temporarias, arquivos compactados e planilhas brutas.

O APK de debug e intencionalmente excluido do Git. A assinatura de producao ainda nao existe e deve ser criada em ambiente protegido, fora do repositorio.

## Primeiro APK de teste

- Origem: `android/app/build/outputs/apk/debug/app-debug.apk`.
- Copia de distribuicao local: `C:\Users\ulyss\Desktop\Flora\releases\Flora-MVP-1.0.0-debug.apk`.
- Tamanho: 82.584.434 bytes.
- SHA-256: `F277BF54111D92015FDC86FC339FB4EA04E8920E43912A665E20DEB770942804`.
- Application ID: `br.com.pontogarden.flora`.
- Versao: `versionName` `1.0.0`, `versionCode` `1`.
- Assinatura: chave de debug padrao do Android Gradle Plugin.

Nenhum dispositivo ADB autorizado estava conectado durante a geracao; por isso o APK nao foi instalado fisicamente nesta auditoria.

## Pendencias nao bloqueantes

- Aviso informativo do Vite para bundle acima de 500 kB.
- 602 imagens publicas sem referencia no catalogo atual.
- 19 produtos botanicos pendentes de identificacao humana.
- `orderItems` legado no Zustand, ainda sem exposicao pela interface.
