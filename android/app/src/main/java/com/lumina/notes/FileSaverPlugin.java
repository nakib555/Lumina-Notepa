package com.lumina.notes;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.util.Base64;
import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.FileOutputStream;

@CapacitorPlugin(name = "FileSaverPrompt")
public class FileSaverPlugin extends Plugin {

    private String pendingData = "";

    @PluginMethod
    public void saveFile(PluginCall call) {
        String fileName = call.getString("fileName", "Document.txt");
        String data = call.getString("data", ""); 
        Boolean isBase64 = call.getBoolean("isBase64", false);
        
        pendingData = data;
        
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_TITLE, fileName);
        
        startActivityForResult(call, intent, "saveFileResult");
    }

    @ActivityCallback
    private void saveFileResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent intent = result.getData();
            if (intent != null) {
                Uri uri = intent.getData();
                if (uri != null) {
                    try {
                        ParcelFileDescriptor pfd = getContext().getContentResolver().openFileDescriptor(uri, "w");
                        if (pfd != null) {
                            FileOutputStream fileOutputStream = new FileOutputStream(pfd.getFileDescriptor());
                            
                            Boolean isBase64 = call.getBoolean("isBase64", false);
                            if (Boolean.TRUE.equals(isBase64)) {
                                byte[] bytes = Base64.decode(pendingData, Base64.DEFAULT);
                                fileOutputStream.write(bytes);
                            } else {
                                fileOutputStream.write(pendingData.getBytes("UTF-8"));
                            }
                            
                            fileOutputStream.close();
                            pfd.close();
                            
                            JSObject ret = new JSObject();
                            ret.put("success", true);
                            ret.put("uri", uri.toString());
                            call.resolve(ret);
                            pendingData = "";
                            return;
                        }
                    } catch (Throwable e) {
                        call.reject("Error saving file: " + e.getMessage());
                        pendingData = "";
                        return;
                    }
                }
            }
        }
        call.reject("Save cancelled");
        pendingData = "";
    }
}
