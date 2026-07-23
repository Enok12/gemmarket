package com.ggmp.marketplace;

import android.animation.ObjectAnimator;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.content.Context;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String APP_URL    = "https://gemmarket.vercel.app";
    private static final String OFFLINE_URL = "file:///android_asset/public/offline.html";
    private boolean isFirstLoad  = true;
    private boolean doubleBackToExitPressedOnce = false;
    private String lastUrl = APP_URL;
    private View splashOverlay;
    private boolean splashDismissed = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getBridge().getWebView().addJavascriptInterface(new AndroidBridge(), "Android");

        // Custom animated splash overlay — sits above the WebView with three
        // bouncing gold dots, and is dismissed once the web app finishes loading.
        splashOverlay = getLayoutInflater().inflate(R.layout.splash_overlay, null);
        addContentView(splashOverlay, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        animateDot(splashOverlay.findViewById(R.id.dot1), 0);
        animateDot(splashOverlay.findViewById(R.id.dot2), 160);
        animateDot(splashOverlay.findViewById(R.id.dot3), 320);
        // Safety net: never let the splash stick if the page never reports finished.
        new Handler().postDelayed(this::dismissSplash, 15000);

        getBridge().getWebView().setWebViewClient(new WebViewClient() {

            @Override
            public void onPageFinished(WebView view, String url) {
                if (!url.contains("offline.html") && !url.contains("file://")) {
                    lastUrl = url;
                }
                // Fade the splash out once content is ready (real app or offline page).
                view.postDelayed(MainActivity.this::dismissSplash, 500);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.loadUrl(OFFLINE_URL);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();

                // Open WhatsApp links in external app
                if (url.startsWith("https://wa.me") || url.startsWith("whatsapp://")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    try {
                        startActivity(intent);
                    } catch (Exception e) {
                        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(browserIntent);
                    }
                    return true;
                }

                return false;
            }
        });

        // Handle back button
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge().getWebView();

                // If WebView can go back navigate back in history
                if (webView.canGoBack()) {
                    webView.goBack();
                    return;
                }

                // If on offline page go to app
                String currentUrl = webView.getUrl();
                if (currentUrl != null && currentUrl.contains("offline.html")) {
                    if (isConnected()) {
                        webView.loadUrl(APP_URL);
                    }
                    return;
                }

                // Already at root — require double press to exit
                if (doubleBackToExitPressedOnce) {
                    finish();
                    return;
                }

                doubleBackToExitPressedOnce = true;
                Toast.makeText(
                    MainActivity.this,
                    "Press back again to exit",
                    Toast.LENGTH_SHORT
                ).show();

                // Reset after 2 seconds
                new Handler().postDelayed(
                    () -> doubleBackToExitPressedOnce = false,
                    2000
                );
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

    // Bounce a single dot up and back down, forever, offset by `delay`.
    private void animateDot(View dot, long delay) {
        if (dot == null) return;
        float density = getResources().getDisplayMetrics().density;
        ObjectAnimator anim = ObjectAnimator.ofFloat(dot, "translationY", 0f, -10f * density, 0f);
        anim.setDuration(650);
        anim.setStartDelay(delay);
        anim.setRepeatCount(ObjectAnimator.INFINITE);
        anim.setInterpolator(new AccelerateDecelerateInterpolator());
        anim.start();
    }

    // Fade out and remove the splash overlay (idempotent).
    private void dismissSplash() {
        if (splashDismissed || splashOverlay == null) return;
        splashDismissed = true;
        splashOverlay.animate().alpha(0f).setDuration(400).withEndAction(() -> {
            ViewGroup parent = (ViewGroup) splashOverlay.getParent();
            if (parent != null) parent.removeView(splashOverlay);
            splashOverlay = null;
        }).start();
    }

    public class AndroidBridge {
        @JavascriptInterface
        public void loadApp() {
            runOnUiThread(() -> {
                getBridge().getWebView().loadUrl(lastUrl);
            });
        }
    }
}