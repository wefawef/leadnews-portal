package com.weex.app.extend;

import android.content.Intent;
import android.net.Uri;
import android.text.TextUtils;

import com.weex.app.WXPageActivity;
import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.common.WXModule;


public class WXEventModule extends WXModule {
  @JSMethod()
  public void openURL(String url) {
    if (TextUtils.isEmpty(url)) {
      return;
    }
    Uri uri = Uri.parse(url);
    String scheme = uri.getScheme();

    if (TextUtils.isEmpty(scheme)) {
      Intent renderIntent = new Intent(mWXSDKInstance.getContext(), WXPageActivity.class);
      renderIntent.setData(uri);
      mWXSDKInstance.getContext().startActivity(renderIntent);
      return;
    }

    if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme) || "file".equalsIgnoreCase(scheme)) {
      Intent renderIntent = new Intent(mWXSDKInstance.getContext(), WXPageActivity.class);
      renderIntent.setData(uri);
      mWXSDKInstance.getContext().startActivity(renderIntent);
    } else {
      Intent intent = new Intent(Intent.ACTION_VIEW);
      intent.setData(uri);
      mWXSDKInstance.getContext().startActivity(intent);
    }
  }
}
