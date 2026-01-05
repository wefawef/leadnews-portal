package com.weex.app.hotreload;

import android.text.TextUtils;

import com.taobao.weex.utils.WXLogUtils;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;

public class HotReloadManager {
  private static final String TAG = "HotReloadManager";

  private final ActionListener listener;
  private final OkHttpClient client;
  private WebSocket session;

  public HotReloadManager(String ws, ActionListener actionListener) {
    if (TextUtils.isEmpty(ws) || actionListener == null) {
      WXLogUtils.w(TAG, "Illegal arguments");
      listener = null;
      client = null;
      return;
    }

    listener = actionListener;
    client = new OkHttpClient.Builder()
        .pingInterval(15, TimeUnit.SECONDS)
        .build();

    Request request = new Request.Builder().url(ws).build();
    session = client.newWebSocket(request, new WebSocketListener() {
      @Override
      public void onOpen(WebSocket webSocket, Response response) {
        WXLogUtils.w(TAG, "ws session open");
        session = webSocket;
      }

      @Override
      public void onMessage(WebSocket webSocket, String text) {
        if (TextUtils.isEmpty(text) || listener == null) {
          return;
        }
        try {
          JSONObject rpcMessage = new JSONObject(text);
          String method = rpcMessage.optString("method", null);
          if (TextUtils.isEmpty(method)) {
            return;
          }
          if ("WXReload".equals(method)) {
            listener.reload();
          } else if ("WXReloadBundle".equals(method)) {
            String bundleUrl = rpcMessage.optString("params", null);
            if (!TextUtils.isEmpty(bundleUrl)) {
              listener.render(bundleUrl);
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }

      @Override
      public void onMessage(WebSocket webSocket, ByteString bytes) {
      }

      @Override
      public void onClosed(WebSocket webSocket, int code, String reason) {
        WXLogUtils.w(TAG, "Closed:" + code + ", " + reason);
      }

      @Override
      public void onFailure(WebSocket webSocket, Throwable t, Response response) {
        t.printStackTrace();
      }
    });
  }

  public void destroy() {
    if (session != null) {
      session.close(1001, "GOING_AWAY");
      session = null;
    }
    if (client != null) {
      client.dispatcher().executorService().shutdown();
      client.connectionPool().evictAll();
    }
  }

  public interface ActionListener {
    void reload();

    void render(String bundleUrl);
  }
}
