package com.ggmp.marketplace;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.content.Context;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String APP_URL = "https://gemmarket.vercel.app";
    private static final String OFFLINE_URL = "file:///android_asset/public/offline.html";
    private boolean isFirstLoad = true;
    private String lastUrl = APP_URL;  // ← tracks last visited URL

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getBridge().getWebView().addJavascriptInterface(new AndroidBridge(), "Android");

        getBridge().getWebView().setWebViewClient(new WebViewClient() {

            @Override
            public void onPageFinished(WebView view, String url) {
                // Save last visited URL (but not the offline page)
                if (!url.contains("offline.html") && !url.contains("file://")) {
                    lastUrl = url;
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.loadUrl(OFFLINE_URL);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });

        if (isFirstLoad) {
            isFirstLoad = false;
            checkAndLoad();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        String currentUrl = getBridge().getWebView().getUrl();
        if (currentUrl != null && currentUrl.contains("offline.html")) {
            if (isConnected()) {
                // Resume from last visited URL not homepage
                getBridge().getWebView().loadUrl(lastUrl);
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
                // Go back to last visited URL
                getBridge().getWebView().loadUrl(lastUrl);
            });
        }
    }
}