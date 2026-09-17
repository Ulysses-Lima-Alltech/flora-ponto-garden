package br.com.pontogarden.flora;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(GertecScannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
