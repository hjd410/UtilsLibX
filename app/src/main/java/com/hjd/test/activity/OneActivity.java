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
import com.hjd.test.databinding.ActivityOneBinding;
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
public class OneActivity extends BaseBindingActivity<ActivityOneBinding> {

    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    protected void initView(Bundle bundle) {

        StackTraceElement[] stackTrace = new Throwable().getStackTrace();
        StackTraceElement targetElement = stackTrace[4];
        Log.e("---1", targetElement.getClassName());
        Log.e("--2-", targetElement.getMethodName());
        Log.e("--3-", targetElement.getFileName());
        Log.e("--4-", targetElement.getLineNumber() + "");
        showLoadingDialog();


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

                        }
                    });
        }
    }
}

