# Build Android da Flora

## Requisitos

- Node.js 20 ou superior e npm.
- JDK configurado para o Android Gradle Plugin usado pelo projeto.
- Android Studio e Android SDK instalados.
- Gradle Wrapper do projeto em `android/gradlew.bat`; nao e necessario instalar Gradle globalmente.

## Preparar o projeto

Na raiz do projeto:

```powershell
npm install
npm run build
npx cap sync android
```

O `cap sync` copia o build web para `android/app/src/main/assets/public` e atualiza os plugins nativos.

## Gerar APK de depuracao

```powershell
Set-Location android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

O arquivo resultante fica em:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

## Build para o totem Gertec SK-210 (leitor físico em vez de câmera)

O totem Gertec SK-210 tem um leitor de código de barras físico instalado no lugar da câmera. Para esse dispositivo, gere o APK com o modo `totem`, que desativa completamente o caminho de câmera/ML Kit (o botão "Ler com a câmera" some da tela de scanner) e usa somente o leitor físico, que já é lido via teclado (modo *keyboard wedge*, ver `src/features/scanner/KeyboardWedgeScanner.ts`):

```powershell
npm run build:totem
npx cap sync android
Set-Location android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

O modo é controlado pela variável `VITE_SCAN_MODE=hardware`, definida em `.env.totem` (carregado automaticamente pelo Vite quando o build roda com `--mode totem`). Para builds normais (com câmera disponível), continue usando `npm run build`.

Para a entrega local do MVP, ele pode ser copiado para:

```text
C:\Users\ulyss\Desktop\Flora\releases\Flora-MVP-1.0.0-debug.apk
```

APKs e AABs sao ignorados pelo Git e nao devem ser versionados.

## Instalar manualmente

Transfira o APK para o dispositivo, permita a instalacao da origem usada e abra o arquivo. O APK de debug e assinado automaticamente pela chave de debug do ambiente Android.

## Instalar com ADB

Com um dispositivo autorizado em `adb devices`:

```powershell
adb install -r "C:\Users\ulyss\Desktop\Flora\releases\Flora-MVP-1.0.0-debug.apk"
```

O parametro `-r` atualiza a instalacao existente sem apagar dados. Nao execute comandos de desinstalacao ou limpeza para atualizar o MVP.

## Atualizar uma versao existente

1. Altere `versionCode` para um inteiro maior em `android/app/build.gradle`.
2. Atualize `versionName` com a nova versao legivel.
3. Mantenha `package.json` e `capacitor.config.ts` coerentes quando a versao do produto mudar.
4. Execute build, sync e `assembleDebug` novamente.

O application ID atual e `br.com.pontogarden.flora`; ele deve permanecer estavel para que uma nova versao atualize o mesmo aplicativo.

## APK e AAB

- APK: pacote instalavel diretamente em dispositivo Android, adequado para testes internos.
- AAB: pacote para envio a Google Play, que gera APKs otimizados para cada aparelho.

O MVP gera apenas o APK de debug. Uma assinatura de producao, um keystore protegido e o fluxo `bundleRelease` devem ser preparados antes de qualquer publicacao.

## Erros comuns

- `JAVA_HOME` ausente: configure o JDK indicado pelo Android Studio e reabra o terminal.
- SDK nao encontrado: abra o projeto `android/` no Android Studio ou configure `android/local.properties` localmente. Esse arquivo nao entra no Git.
- Alteracoes web nao aparecem: execute `npm run build` e `npx cap sync android` antes do Gradle.
- Dispositivo `unauthorized`: desbloqueie o aparelho e aceite a chave RSA; nao instale enquanto o ADB nao indicar `device`.
- Falha por versao existente: aumente `versionCode` para a proxima distribuicao.

## Aparencia e orientacao

O aplicativo usa retrato no manifesto, preservando o comportamento do totem ja adotado pelo projeto. O layout web respeita areas seguras e usa `adjustResize` para que o teclado nao cubra os controles. Icones e splash sao derivados de `public/images/logo-flora.png` sem distorcer a marca-fonte.
