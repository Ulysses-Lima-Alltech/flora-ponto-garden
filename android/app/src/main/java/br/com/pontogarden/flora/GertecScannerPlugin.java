package br.com.pontogarden.flora;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GertecScanner")
public class GertecScannerPlugin extends Plugin {
    private static final String TAG = "FloraGertecScanner";
    private static final String MISSING_AAR_REASON = "GerSDKVarejo.aar ausente ou nao integrado. Copie o SDK para android/app/libs/GerSDKVarejo.aar e inspecione as classes reais antes de habilitar o leitor nativo.";
    private boolean activeScan = false;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", false);
        result.put("reason", MISSING_AAR_REASON);
        call.resolve(result);
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        if (activeScan) {
            call.reject("Ja existe uma leitura Gertec em andamento.");
            return;
        }

        activeScan = true;
        Log.w(TAG, "Gertec SDK indisponivel: GerSDKVarejo.aar nao foi integrado.");
        stopCurrentScan();
        call.reject(MISSING_AAR_REASON);
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        stopCurrentScan();
        call.resolve();
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        stopCurrentScan();
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        stopCurrentScan();
    }

    private void stopCurrentScan() {
        if (activeScan) {
            Log.d(TAG, "Encerrando estado local de leitura Gertec.");
        }
        activeScan = false;
    }
}
