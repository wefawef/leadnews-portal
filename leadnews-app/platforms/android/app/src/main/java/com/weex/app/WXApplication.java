package com.weex.app;

import android.app.Application;
import android.net.Uri;
import android.text.TextUtils;

import com.weex.app.extend.ImageAdapter;
import com.weex.app.extend.WXEventModule;
import com.weex.app.extend.WXImageModule;
import com.alibaba.weex.plugin.loader.WeexPluginContainer;
import com.weex.app.util.AppConfig;
import com.taobao.weex.InitConfig;
import com.taobao.weex.WXSDKEngine;
import com.taobao.weex.adapter.DefaultWXHttpAdapter;
import com.taobao.weex.adapter.IWXHttpAdapter;
import com.taobao.weex.common.WXRequest;
import com.taobao.weex.common.WXResponse;
import com.taobao.weex.common.WXException;

public class WXApplication extends Application {

  private static class SafeHttpAdapter implements IWXHttpAdapter {
    private final DefaultWXHttpAdapter delegate = new DefaultWXHttpAdapter();

    @Override
    public void sendRequest(WXRequest request, OnHttpListener listener) {
      if (request == null || TextUtils.isEmpty(request.url) || listener == null) {
        if (listener != null) {
          WXResponse response = new WXResponse();
          response.statusCode = "-1";
          response.errorCode = "-1";
          response.errorMsg = "invalid request";
          listener.onHttpFinish(response);
        }
        return;
      }

      String scheme = Uri.parse(request.url).getScheme();
      if (TextUtils.isEmpty(scheme)
          || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
        WXResponse response = new WXResponse();
        response.statusCode = "-1";
        response.errorCode = "-1";
        response.errorMsg = "unsupported scheme: " + scheme;
        listener.onHttpFinish(response);
        return;
      }

      delegate.sendRequest(request, listener);
    }
  }

  @Override
  public void onCreate() {
    super.onCreate();
    WXSDKEngine.addCustomOptions("appName", "WXSample");
    WXSDKEngine.addCustomOptions("appGroup", "WXApp");
    InitConfig initConfig = new InitConfig.Builder()
        .setImgAdapter(new ImageAdapter())
        .setHttpAdapter(new SafeHttpAdapter())
        .build();
    WXSDKEngine.initialize(this, initConfig);
    try {
      WXSDKEngine.registerModule("event", WXEventModule.class);
      WXSDKEngine.registerModule("image", WXImageModule.class);
    } catch (WXException e) {
      e.printStackTrace();
    }
    AppConfig.init(this);
    WeexPluginContainer.loadAll(this);
  }
}
