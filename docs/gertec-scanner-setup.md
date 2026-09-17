# Integracao do leitor Gertec

## Status atual

Preparacao segura para o totem Gertec SK-210. O arquivo proprietario `GerSDKVarejo.aar` nao esta presente no repositorio local, entao a ponte nativa ainda nao aciona o hardware real. O plugin Android compila e retorna indisponivel com uma mensagem clara.

O leitor Gertec so deve ser declarado funcional depois de teste no equipamento fisico.

## Arquivo esperado

Copie o SDK fornecido pela Gertec para:

```text
android/app/libs/GerSDKVarejo.aar
```

O arquivo esta ignorado pelo Git por ser proprietario:

```text
android/app/libs/*.aar
```

Nao versione o AAR em repositorio publico sem autorizacao explicita da fabricante.

## API do SDK

Como o AAR nao esta disponivel, as classes reais ainda nao foram confirmadas. A documentacao da fabricante informa o fluxo comum:

```java
CodeScanner codeScanner = CodeScanner.getInstance(new ScannerCallback() {
    @Override
    public void result(String barcodeType, String data) {}

    @Override
    public void cancelled(String causes) {}
});

codeScanner.scanCode(this);
codeScanner.stopService();
```

Antes de habilitar o leitor nativo, inspecione o AAR e registre:

- pacote completo de `CodeScanner`;
- pacote completo de `ScannerCallback`;
- assinatura real de `getInstance`;
- assinatura real de `scanCode`;
- assinatura real de `stopService`;
- componentes e permissoes do `AndroidManifest.xml`;
- regras ProGuard/R8;
- bibliotecas nativas e ABIs;
- requisitos de inicializacao do SDK.

Comandos uteis:

```powershell
jar tf android/app/libs/GerSDKVarejo.aar
Expand-Archive android/app/libs/GerSDKVarejo.aar -DestinationPath tmp/gertec-aar
jar tf tmp/gertec-aar/classes.jar
javap -classpath tmp/gertec-aar/classes.jar pacote.real.CodeScanner
```

## Modos de scanner

O app usa `VITE_SCAN_MODE`:

```env
VITE_SCAN_MODE=camera
VITE_SCAN_MODE=gertec
VITE_SCAN_MODE=keyboard
```

- `camera`: build para celular, usa camera/ML Kit.
- `gertec`: build do totem, usa o plugin nativo Gertec como metodo principal.
- `keyboard`: fallback tecnico para leitores que emulam teclado e finalizam com Enter.

A entrada manual fica sempre disponivel.

## Builds

Build web mobile:

```powershell
npm run build
npx cap sync android
Set-Location android
.\gradlew.bat assembleMobileDebug
```

Build web totem:

```powershell
npm run build:totem
npx cap sync android
Set-Location android
.\gradlew.bat assembleTotemDebug
```

Sem `android/app/libs/GerSDKVarejo.aar`, `assembleTotemDebug` deve falhar com uma mensagem orientando a copiar o SDK. Isso e intencional para evitar gerar um APK de totem sem o leitor nativo.

APK mobile esperado:

```text
android/app/build/outputs/apk/mobile/debug/app-mobile-debug.apk
```

APK totem esperado apos adicionar o AAR:

```text
android/app/build/outputs/apk/totem/debug/app-totem-debug.apk
```

## Android Studio

1. Abra a pasta `android/`.
2. Copie `GerSDKVarejo.aar` para `android/app/libs/`.
3. Sincronize o Gradle.
4. Selecione a variante `totemDebug` para o APK do totem.
5. Verifique o manifest merged antes de instalar.

## ADB e logs

Instalar:

```powershell
adb install -r android/app/build/outputs/apk/totem/debug/app-totem-debug.apk
```

Logs:

```powershell
adb logcat | findstr FloraGertecScanner
```

Confirme nos logs de teste:

- `barcodeType` recebido;
- dado bruto recebido sem registrar informacao sensivel;
- codigo normalizado;
- callback recebido uma unica vez;
- `stopService()` chamado apos sucesso, cancelamento, erro, saida da tela e app em segundo plano.

## Erros comuns

- `GerSDKVarejo.aar ausente`: copie o AAR para `android/app/libs/GerSDKVarejo.aar`.
- Plugin indisponivel na tela: o build nao tem o SDK real integrado ou esta rodando fora do Android nativo.
- Produto nao encontrado: confirme se a etiqueta segue o EAN-13 interno da loja ou digite o codigo de 8 digitos.
- Camera abrindo no totem: confirme `VITE_SCAN_MODE=gertec` e use `npm run build:totem`.

## FEBRABAN

Nao use `scanCodeFebraban(...)` nesta integracao. A Flora precisa ler codigos de produtos, entao o fluxo esperado e `scanCode(...)`.

## Roteiro de teste fisico

1. Adicionar `GerSDKVarejo.aar`.
2. Gerar `npm run build:totem`.
3. Executar `npx cap sync android`.
4. Gerar `.\gradlew.bat assembleTotemDebug`.
5. Instalar via ADB.
6. Abrir `/scanner`.
7. Confirmar que a interface mostra `Leitor Gertec`.
8. Acionar o leitor fisico.
9. Ler um codigo de produto conhecido.
10. Confirmar logs de `barcodeType`, dado normalizado, callback unico e `stopService()`.
11. Confirmar abertura do produto correto.
12. Repetir o mesmo codigo e verificar bloqueio de duplicidade.
13. Cancelar a leitura e tentar novamente.
14. Sair da tela durante leitura e confirmar encerramento.
15. Colocar o app em segundo plano e retornar.
16. Testar sem internet.
17. Testar codigo inexistente.
18. Testar entrada manual.
19. Testar fallback `keyboard`.
20. Confirmar que a camera nao abre no modo Gertec, salvo se o SDK real provar que isso e obrigatorio.
