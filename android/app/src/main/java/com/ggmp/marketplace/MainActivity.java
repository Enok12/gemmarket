package com.ggmp.marketplace;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.content.Context;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String APP_URL = "https://gemmarket.vercel.app";
    private static final String OFFLINE_URL = "file:///android_asset/public/offline.html";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Expose Android interface to JavaScript
        getBridge().getWebView().addJavascriptInterface(new AndroidBridge(), "Android");
    }

    @Override
    public void onResume() {
        super.onResume();
        checkAndLoad();
    }

    private void checkAndLoad() {
        if (isConnected()) {
            getBridge().getWebView().loadUrl(APP_URL);
        } else {
            getBridge().getWebView().loadUrl(OFFLINE_URL);
        }
    }

    private boolean isConnected() {
        ConnectivityManager cm = (ConnectivityManager)
            getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }

    // JavaScript interface
    public class AndroidBridge {
        @JavascriptInterface
        public void loadApp() {
            runOnUiThread(() -> {
                getBridge().getWebView().loadUrl(APP_URL);
            });
        }
    }
}