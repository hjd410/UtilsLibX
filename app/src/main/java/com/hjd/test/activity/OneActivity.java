package com.hjd.test.activity;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;
import androidx.webkit.ProxyConfig;
import androidx.webkit.ProxyController;
import androidx.webkit.WebViewFeature;

import com.blankj.utilcode.util.ConvertUtils;
import com.blankj.utilcode.util.DeviceUtils;
import com.blankj.utilcode.util.EncryptUtils;
import com.blankj.utilcode.util.FileUtils;
import com.blankj.utilcode.util.LogUtils;
import com.blankj.utilcode.util.PhoneUtils;
import com.blankj.utilcode.util.SPUtils;
import com.blankj.utilcode.util.StringUtils;
import com.blankj.utilcode.util.TimeUtils;
import com.blankj.utilcode.util.ToastUtils;
import com.hjd.apputils.base.BaseBindingActivity;
import com.hjd.test.AESUtils;
import com.hjd.test.databinding.ActivityWebBinding;
import com.hjq.permissions.OnPermissionCallback;
import com.hjq.permissions.Permission;
import com.hjq.permissions.XXPermissions;
import com.just.agentweb.AgentWeb;
import com.just.agentweb.DefaultWebClient;
import com.just.agentweb.WebViewClient;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * @author Hou
 * @date 2022/7/6 14:32.
 * @apiNote
 */
public class OneActivity extends BaseBindingActivity<ActivityWebBinding> {
    private AgentWeb web;
    private String html = "file:///android_asset/index.html";
    List<String> list = new ArrayList<>();
    private String keyAES = "iVc5Q3l7eugbv0514u";
    private String keyStore = "yGBoxfh2Ls85vvvA3doCx6_GcIQTpIGsfzPVaNaHebxanvI5LioZ0UaTqwn2i0bN";


    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected void initView(Bundle bundle) {
        web = AgentWeb.with(this)
                .setAgentWebParent(binding.llView, new LinearLayout.LayoutParams(-1, -1))
                .useDefaultIndicator()
                .setWebViewClient(webViewClient)
                .setOpenOtherPageWays(DefaultWebClient.OpenOtherPageWays.DISALLOW)
                .createAgentWeb()
                .ready()
                .go(html);
        web.getAgentWebSettings()
                .getWebSettings()
                .setJavaScriptEnabled(true);

        StackTraceElement[] stackTrace = new Throwable().getStackTrace();
        StackTraceElement targetElement = stackTrace[4];
        Log.e("---1", targetElement.getClassName());
        Log.e("--2-", targetElement.getMethodName());
        Log.e("--3-", targetElement.getFileName());
        Log.e("--4-", targetElement.getLineNumber() + "");
        showLoadingDialog();


        int i = 20;
        if (i != 200 & i != 10) {
            ToastUtils.showShort("停止");
            return;
        } else {

            ToastUtils.showShort("chengong");
        }
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                dismissLoading();
            }
        }, 2000);

        //        if (WebViewFeature.isFeatureSupported(WebViewFeature.PROXY_OVERRIDE)) {
        //            ToastUtils.showShort("设置代理");
        //            ProxyConfig proxyConfig = new ProxyConfig.Builder()
        //                    .addProxyRule("http://192.168.0.22:18080")
        //                    .addDirect().build();
        //            ProxyController.getInstance().setProxyOverride(proxyConfig, new Executor() {
        //                @Override
        //                public void execute(Runnable command) {
        //                    //do nothing
        //                    Log.i("Info", "代理设置完成");
        //                }
        //            }, new Runnable() {
        //                @Override
        //                public void run() {
        //                    Log.w("Wanning", "WebView代理 改变");
        //                }
        //            });
        //        } else {
        //
        //            ToastUtils.showShort("代理设置失败");
        //        }
        String IMEI = "1231231231234";
        if (IMEI.length() < 15) {
            int len = 15 - IMEI.length();
            LogUtils.d(String.format("%015d", 15));
        }


        String dataSource =
                keyStore.length() + " " + "121212121212121212" + keyStore + TimeUtils.date2String(
                        new Date(),
                        "yyyyMMddHHmmss") + SPUtils.getInstance()
                        .getString("user");

        String ss = "3Khtc@,7_76.897Zmmk33g0Y8!HIW7f1";

        LogUtils.d(dataSource);
        String encoded = AESUtils.encrypt(dataSource, keyAES);
        LogUtils.d("加密的:  " + AESUtils.encrypt(ss, keyAES));
        LogUtils.i(AESUtils.decrypt(encoded, keyAES));


        //        /*只执行一次的*/
        //        ScheduledExecutorService service = Executors.newScheduledThreadPool(5);
        //        service.schedule(new Runnable() {
        //            @RequiresApi(api = Build.VERSION_CODES.O)
        //            @Override
        //            public void run() {
        //                LogUtils.d("执行线程任务" + LocalTime.now());
        //            }
        //        }, 3, TimeUnit.SECONDS);

    }


    @Override
    protected void initData() {
        list.add("test.js");
        list.add("testb.js");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            XXPermissions.with(this)
                    .permission(Permission.MANAGE_EXTERNAL_STORAGE)
                    .request(new OnPermissionCallback() {
                        @Override
                        public void onGranted(List<String> permissions, boolean all) {
                            //
                        }
                    });
        } else {
            XXPermissions.with(this)
                    .permission(Permission.Group.STORAGE)
                    .request(new OnPermissionCallback() {
                        @Override
                        public void onGranted(List<String> permissions, boolean all) {
                            //                        if (all) {
                            //                            String desp = Environment
                            //                            .getExternalStorageDirectory()
                            //                            .getAbsolutePath() + "/wyy/";
                            //                            List<File> fileList = FileUtils
                            //                            .listFilesInDir(desp);
                            //                            for (int i = 0; i < fileList.size();
                            //                            i++) {
                            //                                list.add(fileList.get(i)
                            //                                .getAbsolutePath());
                            //                            }
                            //                        }
                        }
                    });
        }
    }

    WebViewClient webViewClient = new WebViewClient() {
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            view.postDelayed(new Runnable() {
                @Override
                public void run() {
                    onJsLocal();
                }
            }, 1000);
        }
    };

    @SuppressLint("ObsoleteSdkInt")
    public void onJsLocal() {
        for (int i = 0; i < list.size(); i++) {
            StringBuilder builder = new StringBuilder(getJS(OneActivity.this, list.get(i)));
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
                web.getWebCreator()
                        .getWebView()
                        .loadUrl("javascript:" + builder.toString());
            } else {
                web.getWebCreator()
                        .getWebView()
                        .evaluateJavascript(builder.toString(), new ValueCallback<String>() {
                            @Override
                            public void onReceiveValue(String value) {
                                Log.i("onReceiveValue", value);
                            }
                        });
            }
        }

    }

    /**
     * 获取js文件内容
     *
     * @param context  参数为当前上下文对象
     * @param fileName 参数为要获取的js文件名称
     * @return
     */
    public static String getJS(Context context, String fileName) {
        InputStream inputStream = null;
        FileInputStream fileInputStream = null;
        ByteArrayOutputStream outputStream = null;
        try {
            //            fileInputStream = new FileInputStream(fileName);
            inputStream = context.getAssets()
                    .open(fileName);//获取assets里的文件
            outputStream = new ByteArrayOutputStream();
            int len = 0;
            byte[] buffer = new byte[2048];
            while ((len = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, len);
            }
            return new String(outputStream.toByteArray());
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (outputStream != null) {
                try {
                    outputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (fileInputStream != null) {
                try {
                    fileInputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return null;
    }
}

