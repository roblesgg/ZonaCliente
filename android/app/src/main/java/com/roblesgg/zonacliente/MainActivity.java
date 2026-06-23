package com.roblesgg.zonacliente;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Que el tamaño de letra grande del sistema no deforme la interfaz:
        // la app se renderiza siempre a su tamaño de diseño (UI estable).
        WebSettings settings = this.getBridge().getWebView().getSettings();
        settings.setTextZoom(100);
    }
}
