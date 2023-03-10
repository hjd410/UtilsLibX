package com.hjd.test;


import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.view.View;

import com.alibaba.android.arouter.launcher.ARouter;
import com.blankj.utilcode.util.LogUtils;
import com.blankj.utilcode.util.ZipUtils;
import com.bumptech.glide.Glide;
import com.hjd.apputils.base.BaseBindingActivity;
import com.hjd.test.databinding.ActivityMainBinding;
import com.hjd.test.model.PeopleModel;
import com.hjq.permissions.OnPermissionCallback;
import com.hjq.permissions.Permission;
import com.hjq.permissions.XXPermissions;

import java.io.File;
import java.io.IOException;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;

import static java.lang.annotation.ElementType.*;

import androidx.databinding.DataBindingUtil;
import androidx.recyclerview.widget.AsyncListDiffer;


public class MainActivity extends BaseBindingActivity<ActivityMainBinding> {

    MusicService.SimpleBinder bindService;
    PeopleModel model;



    private boolean isBind;
    File file = new File(Environment.getExternalStorageDirectory()
                                 .getPath() + "/appTest/one.zip");
    File fileDes = new File(Environment.getExternalStorageDirectory()
                                    .getPath() + "/appTest/one");
    private ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            bindService = (MusicService.SimpleBinder) service;
            bindService.doTask();
            isBind = true;
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBind = false;
            LogUtils.i("是个啥:" + name.toString());
        }
    };


    @Override
    protected void initView(Bundle bundle) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            XXPermissions.with(this)
                    .permission(Permission.MANAGE_EXTERNAL_STORAGE)
                    .request(new OnPermissionCallback() {
                        @Override
                        public void onGranted(List<String> permissions, boolean all) {

                        }
                    });
        } else {
            XXPermissions.with(this)
                    .permission(Permission.Group.STORAGE)
                    .request(new OnPermissionCallback() {
                        @Override
                        public void onGranted(List<String> permissions, boolean all) {
                            LogUtils.d("权限成功");
                        }
                    });
        }

    }


    @Override
    public void initData() {

    }


    @Override
    public int checkPermission(String permission, int pid, int uid) {
        return super.checkPermission(permission, pid, uid);
    }

    @Target(TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface ContentView {
        int value();
    }

    @Override
    protected void onDestroy() {
        unbindService(serviceConnection);
        super.onDestroy();
    }
}