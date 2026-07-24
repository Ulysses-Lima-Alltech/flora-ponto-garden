# Flora

Flora e o catalogo de orientacao botanica da Ponto Garden para consulta em totem e Android. O aplicativo permite explorar 474 produtos reais, consultar cuidados ja revisados, escolher plantas por meio de um questionario local e comparar duas plantas sem depender de internet.

## Funcionalidades

- Catalogo com 474 produtos reais, imagens publicas e busca local.
- Categorias Ervas e Temperos, Flores e Plantas e Fertilizantes.
- Base botanica local com 31 perfis e 45 produtos vinculados.
- Escolha guiada em `/escolher`, com recomendacao deterministica local.
- Comparacao anonima de ate duas plantas em `/comparar`.
- Favoritos em memoria associados somente ao cliente mockado com sessao ativa.
- Interface sem preco, estoque, codigo comercial, carrinho ou checkout.

## Stack

React 19, TypeScript, Vite, React Router, Zustand, Lucide, Tailwind CSS e Capacitor Android.

## Requisitos

- Node.js 20 ou superior e npm.
- Para Android: JDK compativel com o Android Gradle Plugin, Android Studio, Android SDK e as plataformas configuradas pelo Gradle Wrapper.

## Estrutura

```text
android/     projeto nativo gerado e mantido pelo Capacitor
docs/        auditorias e instrucoes de operacao
public/      logo oficial e imagens locais do catalogo
scripts/     ferramentas de importacao e verificacao do catalogo
src/data/    catalogo gerado e base botanica local
src/pages/   telas da aplicacao
src/store/   estado local do totem
```

## Instalacao e execucao local

```bash
npm install
npm run dev
```

O Vite informa a URL local ao iniciar. Nenhuma tela do MVP depende de chamadas externas para catalogo, imagens, perfis botanicos, escolha guiada, comparacao ou dados mockados de acesso.

## Catalogo

O catalogo distribuido em `src/data/products.generated.ts` e a base de conhecimento em `src/data/plant-knowledge.generated.ts` fazem parte da aplicacao. Os scripts em `scripts/` sao destinados a manutencao controlada da importacao; nao altere o catalogo gerado manualmente.

Relatorios de integracao, conhecimento botanico e pendencias estao em `docs/`.

## Validacoes

```bash
npm run lint
npm run typecheck
npm run build
npx cap sync android
```

O Vite pode emitir um aviso informativo para bundle acima de 500 kB. Ele nao impede a geracao do MVP.

## Android e APK

```bash
npm run build
npx cap sync android
cd android
gradlew.bat clean
gradlew.bat assembleDebug
```

O APK de depuracao fica em `android/app/build/outputs/apk/debug/app-debug.apk`. As instrucoes completas, incluindo ADB, assinatura e atualizacao de versao, estao em [docs/android-build.md](docs/android-build.md).

Identidade Android atual:

- Aplicativo: `Flora`.
- Nome completo: `Flora - Ponto Garden`.
- Application ID: `br.com.pontogarden.flora`.
- Versao inicial: `1.0.0` (`versionCode` 1).

## Funcionamento offline

Os recursos do MVP sao empacotados pelo Capacitor: catalogo, imagens utilizadas, perfis botanicos, recomendacoes, comparacao, questionario e contas mockadas. A permissao `INTERNET` permanece no manifesto por padrao do Capacitor, mas nao e uma dependencia obrigatoria da experiencia atual.

## Meu Acesso mockado

Os telefones abaixo sao dados ficticios de desenvolvimento:

- `11999999999` - Mariana.
- `11988888888` - Carlos.

O acesso nao usa backend, SMS ou WhatsApp. Favoritos ficam somente em memoria e sao removidos da interface ao encerrar o acesso; comparacoes tambem sao anonimas e desaparecem ao reiniciar o aplicativo.

## Limitacoes atuais

- 19 itens de Ervas e Temperos seguem sem perfil botanico especifico e usam a dica geral do catalogo.
- Camera, leitor fisico, backend, autenticacao real e dados de vendas nao fazem parte deste MVP.
- A assinatura de producao e a publicacao na Google Play ainda nao foram configuradas.

## Seguranca do repositorio

Nao versione APKs, AABs, keystores, `google-services.json`, variaveis de ambiente reais, artefatos de build ou planilhas comerciais brutas. Consulte [docs/mvp-audit.md](docs/mvp-audit.md) antes de alterar os ativos publicos do catalogo.
