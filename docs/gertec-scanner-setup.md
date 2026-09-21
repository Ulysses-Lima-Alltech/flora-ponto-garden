# Integracao do leitor Gertec

## Status

O Flora agora tem duas implementacoes nativas do plugin Capacitor `GertecScanner`:

- `mobile`: stub seguro, sem dependencia do AAR proprietario.
- `totem`: ponte real para o Gertec SDK em `android/app/libs/GerSDK_v104.aar`.

O leitor fisico ainda precisa ser aprovado no equipamento real. Compilacao, empacotamento e presenca do SDK no APK totem nao substituem teste fisico.

## AAR

Arquivo local:

```text
android/app/libs/GerSDK_v104.aar
```

SHA-256 confirmado:

```text
1a48c9e689b1385ea4732d8066545551c73b4b57a0d54e7cc7ec8a967fb0aed3
```

O arquivo e proprietario e esta ignorado pelo Git por `android/.gitignore` (`*.aar`). Nao versione o AAR sem autorizacao explicita da Gertec.

## API confirmada

Comandos usados:

```powershell
jar tf android/app/libs/GerSDK_v104.aar
jar xf android/app/libs/GerSDK_v104.aar
javap -classpath classes.jar br.com.gertec.gdk.codescanner.CodeScanner br.com.gertec.gdk.codescanner.ScannerCallback
```

Classes e assinaturas relevantes:

```java
import br.com.gertec.gdk.codescanner.CodeScanner;
import br.com.gertec.gdk.codescanner.ScannerCallback;

public static CodeScanner getInstance(ScannerCallback callback);
public CodeScanner(ScannerCallback callback);
public void scanCode(android.content.Context context);
public void scanCode(android.content.Context context, String codeType);
public void scanCode(android.content.Context context, java.util.Collection<String> codeTypes);
public void stopService();
public boolean isRunning();

public interface ScannerCallback {
    void result(String barcodeType, String data);
    void cancelled(String causes);
}
```

O SDK tambem expoe `scanCodeFebraban(Context, SurfaceView)`, mas a Flora nao usa FEBRABAN nem `SurfaceView`.

O detector interno observado no bytecode (`br.com.gertec.retailnexus.internal.n2.a()`) valida modelos `TS-G 820`, `TS-G 810`, `SK 210`, `SK 315` e `SK 100`. O plugin usa esse detector por reflexao em `isAvailable()` para nao afirmar disponibilidade apenas porque a classe existe.

## Ciclo de vida

No flavor `totem`, `startScan()`:

1. impede mais de uma leitura ativa;
2. cria um `ScannerCallback` da sessao antes de iniciar a leitura;
3. valida suporte pelo detector real do SDK;
4. cria `new CodeScanner(callback)`;
5. chama `scanCode(Context)`;
6. aceita somente o primeiro resultado nao vazio;
7. retorna `{ barcodeType, data }` ao TypeScript;
8. chama `stopService()` apos sucesso, cancelamento, erro, saida de tela, app em segundo plano ou destruicao do plugin.

Callbacks sao postados para a main thread via `Handler(Looper.getMainLooper())`. Cada chamada e resolvida ou rejeitada uma unica vez. Callbacks tardios de sessoes encerradas sao ignorados pelo `sessionId`.

O TypeScript reutiliza `resolveProductFromScan(...)`; nao ha pipeline duplicado. A entrada manual continua sempre disponivel.

## Modos

O app usa `VITE_SCAN_MODE`:

```env
VITE_SCAN_MODE=camera
VITE_SCAN_MODE=gertec
VITE_SCAN_MODE=keyboard
```

- `camera`: APK de celular, usa camera/ML Kit.
- `gertec`: APK de totem, usa o plugin nativo Gertec.
- `keyboard`: fallback tecnico explicito para leitores que emulam teclado e finalizam com Enter.

No modo Gertec, a camera nao e aberta silenciosamente quando o leitor falha. O listener keyboard wedge so fica ativo no modo `keyboard`, evitando captura simultanea com Gertec.

## Manifesto do AAR

O manifesto do AAR declara:

- `android:sharedUserId="android.uid.system"` no manifesto da biblioteca;
- `uses-sdk minSdkVersion="24"`;
- permissoes `READ_EXTERNAL_STORAGE`, `CAMERA`, `USB_PERMISSION` duplicada, `DISABLE_KEYGUARD`, `NFC`;
- features de camera opcionais, wifi opcional, landscape opcional e `android.hardware.usb.host` duplicada como `required="true"`;
- atividades internas de scanner ZXing/Urovo/Feitian;
- servico `br.com.gertec.internal.dependencies.usb.UsbService`.

Resultado do merge em `totemDebug`:

- `sharedUserId` / `android.uid.system` nao aparece no manifesto final;
- permissoes, features, atividades e servico do AAR aparecem apenas no APK totem;
- o merger avisa duplicidade interna do proprio AAR para `USB_PERMISSION` e `android.hardware.usb.host`;
- nao foi adicionado `sharedUserId` ao Flora e nao foi tentada assinatura de plataforma.

O build do totem precisou de `androidx.constraintlayout:constraintlayout:2.2.1` apenas em `totemImplementation`, porque layouts do AAR usam atributos `layout_constraint*`.

Bibliotecas do AAR:

```text
libs/NONPAYSDK_v1.02.13_260415.jar
libs/TOPSDK_V3.6.4_20260319.jar
libs/TSG810-Printer.jar
libs/openv-android-3.4.1.jar
libs/usbserial.jar
jni/arm64-v8a/libUBXDCLAPI.so
jni/arm64-v8a/libhwSerial.so
jni/armeabi-v7a/libAmexApi.so
jni/armeabi-v7a/libDiscoverApi.so
jni/armeabi-v7a/libEntryPointApi.so
jni/armeabi-v7a/libJcbApi.so
jni/armeabi-v7a/libMirApi.so
jni/armeabi-v7a/libNfcApi.so
jni/armeabi-v7a/libPayPassApi.so
jni/armeabi-v7a/libPayWaveApi.so
jni/armeabi-v7a/libPureApi.so
jni/armeabi-v7a/libQuicsApi.so
jni/armeabi-v7a/libUBXDCLAPI.so
jni/armeabi-v7a/libUVOPEV300.so
jni/armeabi-v7a/libZBarDecoder.so
jni/armeabi-v7a/libcrypto.so
jni/armeabi-v7a/libentrypoint.so
jni/armeabi-v7a/libhwSerial.so
jni/armeabi-v7a/libopencv_java3.so
jni/armeabi-v7a/librupay.so
jni/armeabi-v7a/librupaykernel.so
jni/armeabi-v7a/libssl.so
```

O `proguard.txt` do AAR esta vazio.

## Builds corretos

Como o Capacitor usa o mesmo diretorio de assets para os dois flavors, gere os APKs em sequencia.

Mobile:

```powershell
npm run build
npx cap sync android
Set-Location android
.\gradlew.bat assembleMobileDebug
```

Totem:

```powershell
npm run build:totem
npx cap sync android
Set-Location android
.\gradlew.bat assembleTotemDebug
```

Sem `android/app/libs/GerSDK_v104.aar`, `assembleTotemDebug` falha de proposito com mensagem clara. O mobile compila sem o AAR.

APKs gerados:

```text
C:\Users\ulyss\Desktop\Flora\projeto\android\app\build\outputs\apk\mobile\debug\app-mobile-debug.apk
C:\Users\ulyss\Desktop\Flora\projeto\android\app\build\outputs\apk\totem\debug\app-totem-debug.apk
```

Verificacoes feitas:

- APK mobile: modo default `camera`; nao contem libs/recursos Gertec pesquisados.
- APK totem: modo `gertec`; contem libs nativas Gertec e layouts do SDK.
- Manifest final totem: sem `sharedUserId`/`android.uid.system`.

## ADB e logs

Instalar o APK totem:

```powershell
adb install -r "C:\Users\ulyss\Desktop\Flora\projeto\android\app\build\outputs\apk\totem\debug\app-totem-debug.apk"
```

Logs do plugin:

```powershell
adb logcat | findstr FloraGertecScanner
```

Eventos esperados nos logs:

- inicio de leitura Gertec;
- resultado recebido com `barcodeType` e `data`;
- callback unico aceito;
- callback tardio ignorado, se ocorrer;
- `stopService()` apos sucesso, cancelamento, erro, saida da tela, segundo plano ou destruicao.

## Roteiro de teste fisico

1. Instalar o APK totem pelo ADB.
2. Abrir `/scanner`.
3. Confirmar que a tela mostra `Leitor Gertec`.
4. Ler um codigo conhecido do catalogo.
5. Confirmar abertura do produto correto.
6. Ler um codigo inexistente e confirmar feedback sem abrir camera.
7. Repetir leituras em sequencia e confirmar que cada leitura gera apenas um resultado.
8. Cancelar uma leitura e tocar em `Tentar novamente`.
9. Sair da tela durante uma leitura e confirmar `stopService()` nos logs.
10. Colocar o app em segundo plano durante leitura e confirmar encerramento.
11. Retornar ao app e iniciar nova leitura.
12. Testar sem internet.
13. Testar entrada manual.
14. Gerar um APK com `VITE_SCAN_MODE=keyboard` e testar o fallback keyboard wedge explicitamente.
15. Confirmar que camera, Gertec e keyboard wedge nao ficam capturando simultaneamente.

## Limitacoes

- Hardware ainda nao aprovado em teste fisico.
- O AAR declara componentes e permissoes de outras funcoes Gertec, incluindo pagamento, NFC, USB e impressora; elas entram somente no flavor totem porque o AAR entra somente em `totemImplementation`.
- Se a Gertec confirmar que o leitor exige privilegios de sistema em algum firmware, sera necessario validar com a fabricante. O Flora nao inclui `sharedUserId` de sistema.
