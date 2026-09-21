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
    private static final String MOBILE_REASON = "Leitor Gertec disponivel apenas no APK totem com android/app/libs/GerSDK_v104.aar integrado.";

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", false);
        result.put("reason", MOBILE_REASON);
        call.resolve(result);
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        Log.w(TAG, "Plugin Gertec chamado em build mobile.");
        call.reject(MOBILE_REASON);
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        call.resolve();
    }
}
