package br.com.pontogarden.flora;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.lang.reflect.Method;

import br.com.gertec.gdk.codescanner.CodeScanner;
import br.com.gertec.gdk.codescanner.ScannerCallback;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GertecScanner")
public class GertecScannerPlugin extends Plugin {
    private static final String TAG = "FloraGertecScanner";
    private static final String UNAVAILABLE_REASON = "Leitor Gertec indisponivel neste dispositivo. O SDK nao confirmou suporte ao hardware.";
    private static final String CANCELLED_REASON = "Leitura Gertec cancelada.";

    private final Object lock = new Object();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private CodeScanner codeScanner;
    private PluginCall activeCall;
    private int sessionId = 0;
    private boolean activeScan = false;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean available = false;
        String reason = UNAVAILABLE_REASON;

        try {
            available = isHardwareSupportedBySdk();
            if (available) {
                reason = null;
            }
        } catch (Throwable error) {
            Log.w(TAG, "Falha ao verificar disponibilidade do SDK Gertec.", error);
            reason = "Falha ao verificar o leitor Gertec: " + safeMessage(error);
        }

        JSObject result = new JSObject();
        result.put("available", available);
        if (reason != null) {
            result.put("reason", reason);
        }
        call.resolve(result);
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        final int currentSession;

        synchronized (lock) {
            if (activeScan) {
                call.reject("Ja existe uma leitura Gertec em andamento.");
                return;
            }

            activeScan = true;
            activeCall = call;
            currentSession = ++sessionId;
        }

        ScannerCallback callback = new ScannerCallback() {
            @Override
            public void result(String barcodeType, String data) {
                mainHandler.post(() -> handleScannerResult(currentSession, barcodeType, data));
            }

            @Override
            public void cancelled(String causes) {
                mainHandler.post(() -> handleScannerCancelled(currentSession, causes));
            }
        };

        CodeScanner scanner;
        try {
            if (!isHardwareSupportedBySdk()) {
                finishWithReject(currentSession, UNAVAILABLE_REASON, null, false);
                return;
            }
            scanner = new CodeScanner(callback);
        } catch (Throwable error) {
            Log.w(TAG, "Falha ao criar CodeScanner Gertec.", error);
            finishWithReject(currentSession, "Falha ao iniciar leitor Gertec: " + safeMessage(error), null, true);
            return;
        }

        synchronized (lock) {
            if (!isCurrentSessionLocked(currentSession)) {
                stopScannerService(scanner);
                return;
            }
            codeScanner = scanner;
        }

        try {
            Context context = getActivity() != null ? getActivity() : getContext();
            scanner.scanCode(context);
            Log.d(TAG, "Leitura Gertec iniciada.");
        } catch (Throwable error) {
            Log.w(TAG, "Falha ao acionar scanCode Gertec.", error);
            finishWithReject(currentSession, "Falha ao acionar leitor Gertec: " + safeMessage(error), scanner, true);
        }
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        cancelActiveScan(CANCELLED_REASON);
        call.resolve();
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        cancelActiveScan("Leitura Gertec encerrada ao colocar o app em segundo plano.");
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        cancelActiveScan("Leitura Gertec encerrada ao destruir o plugin.");
    }

    private void handleScannerResult(int callbackSessionId, String barcodeType, String data) {
        if (data == null || data.trim().isEmpty()) {
            finishWithReject(callbackSessionId, "Leitor Gertec retornou uma leitura vazia.", null, true);
            return;
        }

        PluginCall call;
        CodeScanner scanner;
        synchronized (lock) {
            if (!isCurrentSessionLocked(callbackSessionId)) {
                Log.d(TAG, "Callback Gertec tardio ignorado.");
                return;
            }
            call = activeCall;
            scanner = codeScanner;
            clearActiveSessionLocked();
        }

        stopScannerService(scanner);

        if (call != null) {
            JSObject result = new JSObject();
            result.put("barcodeType", barcodeType);
            result.put("data", data);
            call.resolve(result);
        }
    }

    private void handleScannerCancelled(int callbackSessionId, String causes) {
        String message = causes == null || causes.trim().isEmpty() ? CANCELLED_REASON : causes;
        finishWithReject(callbackSessionId, message, null, true);
    }

    private void cancelActiveScan(String message) {
        PluginCall call;
        CodeScanner scanner;
        synchronized (lock) {
            if (!activeScan) {
                return;
            }
            sessionId++;
            call = activeCall;
            scanner = codeScanner;
            clearActiveSessionLocked();
        }

        stopScannerService(scanner);

        if (call != null) {
            call.reject(message);
        }
    }

    private void finishWithReject(int targetSessionId, String message, CodeScanner scannerOverride, boolean stopService) {
        PluginCall call;
        CodeScanner scanner;
        synchronized (lock) {
            if (!isCurrentSessionLocked(targetSessionId)) {
                Log.d(TAG, "Finalizacao Gertec tardia ignorada.");
                return;
            }
            call = activeCall;
            scanner = scannerOverride != null ? scannerOverride : codeScanner;
            clearActiveSessionLocked();
        }

        if (stopService) {
            stopScannerService(scanner);
        }

        if (call != null) {
            call.reject(message);
        }
    }

    private boolean isCurrentSessionLocked(int targetSessionId) {
        return activeScan && sessionId == targetSessionId;
    }

    private void clearActiveSessionLocked() {
        activeScan = false;
        activeCall = null;
        codeScanner = null;
    }

    private void stopScannerService(CodeScanner scanner) {
        if (scanner == null) {
            return;
        }

        try {
            scanner.stopService();
            Log.d(TAG, "Servico Gertec encerrado.");
        } catch (Throwable error) {
            Log.w(TAG, "Falha ao encerrar servico Gertec.", error);
        }
    }

    private boolean isHardwareSupportedBySdk() throws Exception {
        Class<?> deviceDetector = Class.forName("br.com.gertec.retailnexus.internal.n2");
        Method isSupported = deviceDetector.getMethod("a");
        Object result = isSupported.invoke(null);
        return Boolean.TRUE.equals(result);
    }

    private static String safeMessage(Throwable error) {
        String message = error.getMessage();
        return message == null || message.trim().isEmpty() ? error.getClass().getSimpleName() : message;
    }
}
