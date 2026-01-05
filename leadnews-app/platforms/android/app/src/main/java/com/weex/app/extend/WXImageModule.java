package com.weex.app.extend;

import android.Manifest;
import android.app.Activity;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.widget.Toast;

import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.bridge.JSCallback;
import com.taobao.weex.common.WXModule;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class WXImageModule extends WXModule {

    private static final String TAG = "WXImageModule";
    private JSCallback mPickCallback;
    private static final int IMAGE_PICKER_REQUEST = 1001;
    private static final int PERMISSION_REQUEST_CODE = 1002;

    @JSMethod
    public void pickImage(JSCallback callback) {
        mPickCallback = callback;
        Activity activity = (Activity) mWXSDKInstance.getContext();
        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.READ_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(activity,
                    new String[]{Manifest.permission.READ_EXTERNAL_STORAGE},
                    PERMISSION_REQUEST_CODE);
        } else {
            openGallery();
        }
    }

    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        // intent.setType("image/*"); 
        ((Activity) mWXSDKInstance.getContext()).startActivityForResult(intent, IMAGE_PICKER_REQUEST);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                openGallery();
            } else {
                Toast.makeText(mWXSDKInstance.getContext(), "Permission denied", Toast.LENGTH_SHORT).show();
                if (mPickCallback != null) {
                    mPickCallback = null;
                }
            }
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == IMAGE_PICKER_REQUEST && resultCode == Activity.RESULT_OK && data != null) {
            Uri selectedImage = data.getData();
            String picturePath = getPath(mWXSDKInstance.getContext(), selectedImage);
            Log.d(TAG, "Selected image path: " + picturePath);

            if (mPickCallback != null) {
                Map<String, Object> result = new HashMap<>();
                if (picturePath != null) {
                    result.put("path", picturePath);
                    result.put("url", "file://" + picturePath);
                } else {
                    Toast.makeText(mWXSDKInstance.getContext(), "Failed to get image path", Toast.LENGTH_SHORT).show();
                }
                mPickCallback.invoke(result);
                mPickCallback = null;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    public static String getPath(final Context context, final Uri uri) {
        final boolean isKitKat = Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;

        // DocumentProvider
        if (isKitKat && DocumentsContract.isDocumentUri(context, uri)) {
            // ExternalStorageProvider
            if (isExternalStorageDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                if ("primary".equalsIgnoreCase(type)) {
                    return Environment.getExternalStorageDirectory() + "/" + split[1];
                }
            }
            // DownloadsProvider
            else if (isDownloadsDocument(uri)) {
                final String id = DocumentsContract.getDocumentId(uri);
                final Uri contentUri = ContentUris.withAppendedId(
                        Uri.parse("content://downloads/public_downloads"), Long.valueOf(id));

                return getDataColumn(context, contentUri, null, null);
            }
            // MediaProvider
            else if (isMediaDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                Uri contentUri = null;
                if ("image".equals(type)) {
                    contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if ("video".equals(type)) {
                    contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if ("audio".equals(type)) {
                    contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }

                final String selection = "_id=?";
                final String[] selectionArgs = new String[]{split[1]};

                return getDataColumn(context, contentUri, selection, selectionArgs);
            }
        }
        // MediaStore (and general)
        else if ("content".equalsIgnoreCase(uri.getScheme())) {
            return getDataColumn(context, uri, null, null);
        }
        // File
        else if ("file".equalsIgnoreCase(uri.getScheme())) {
            return uri.getPath();
        }

        return null;
    }

    public static String getDataColumn(Context context, Uri uri, String selection, String[] selectionArgs) {
        Cursor cursor = null;
        final String column = "_data";
        final String[] projection = {column};

        try {
            cursor = context.getContentResolver().query(uri, projection, selection, selectionArgs, null);
            if (cursor != null && cursor.moveToFirst()) {
                final int column_index = cursor.getColumnIndexOrThrow(column);
                return cursor.getString(column_index);
            }
        } catch (Exception e) {
             Log.e(TAG, "getDataColumn: " + e.getMessage());
        } finally {
            if (cursor != null)
                cursor.close();
        }
        return null;
    }

    public static boolean isExternalStorageDocument(Uri uri) {
        return "com.android.externalstorage.documents".equals(uri.getAuthority());
    }

    public static boolean isDownloadsDocument(Uri uri) {
        return "com.android.providers.downloads.documents".equals(uri.getAuthority());
    }

    public static boolean isMediaDocument(Uri uri) {
        return "com.android.providers.media.documents".equals(uri.getAuthority());
    }

    @JSMethod
    public void uploadImage(String url, Map<String, Object> params, Map<String, String> headers, final JSCallback callback) {
        Log.d(TAG, "uploadImage: " + url);
        OkHttpClient client = new OkHttpClient();
        MultipartBody.Builder builder = new MultipartBody.Builder().setType(MultipartBody.FORM);

        if (params != null) {
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                if (value instanceof String) {
                    String valStr = (String) value;
                    if (valStr.startsWith("file://")) {
                        String filePath = valStr.substring(7);
                        File file = new File(filePath);
                        if (file.exists()) {
                            Log.d(TAG, "Adding file: " + key + " -> " + filePath);
                            builder.addFormDataPart(key, file.getName(), RequestBody.create(MediaType.parse("image/jpeg"), file));
                        } else {
                             Log.e(TAG, "File not found: " + filePath);
                        }
                    } else {
                        builder.addFormDataPart(key, valStr);
                    }
                }
            }
        }

        Request.Builder requestBuilder = new Request.Builder()
                .url(url)
                .post(builder.build());

        if (headers != null) {
            for (Map.Entry<String, String> header : headers.entrySet()) {
                requestBuilder.addHeader(header.getKey(), header.getValue());
            }
        }

        client.newCall(requestBuilder.build()).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "Upload failed: " + e.getMessage());
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", e.getMessage());
                callback.invoke(result);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.d(TAG, "Upload response: " + response.code());
                Map<String, Object> result = new HashMap<>();
                result.put("success", response.isSuccessful());
                try {
                    result.put("data", response.body().string());
                } catch (Exception e) {
                    result.put("data", "");
                }
                result.put("code", response.code());
                callback.invoke(result);
            }
        });
    }
}
