package com.ggmp.marketplace;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.content.Context;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String APP_URL = "https://gemmarket.vercel.app";
    private static final String OFFLINE_URL = "file:///android_asset/public/offline.html";
    private boolean isFirstLoad = true;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getBridge().getWebView().addJavascriptInterface(new AndroidBridge(), "Android");

        // Only load on first launch
        if (isFirstLoad) {
            isFirstLoad = false;
            checkAndLoad();
        }
    }

    @Override
    public void onResume() {
        super.onResume();

        // Only check connection if currently showing offline page
        String currentUrl = getBridge().getWebView().getUrl();
        if (currentUrl != null && currentUrl.contains("offline.html")) {
            if (isConnected()) {
                getBridge().getWebView().loadUrl(APP_URL);
            }
        }
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

    public class AndroidBridge {
        @JavascriptInterface
        public void loadApp() {
            runOnUiThread(() -> {
                getBridge().getWebView().loadUrl(APP_URL);
            });
        }
    }
}