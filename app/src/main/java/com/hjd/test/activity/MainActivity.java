package com.hjd.test.activity;



import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;

import com.blankj.utilcode.util.LogUtils;
import com.blankj.utilcode.util.ToastUtils;
import com.hjd.apputils.base.BaseBindingActivity;
import com.hjd.test.bean.DataDemo;
import com.hjd.test.databinding.DialogViewBinding;
import com.hjd.test.server.MusicService;
import com.hjd.test.databinding.ActivityMainBinding;
import com.hjd.test.viewmodel.DemoViewModel;
import com.hjq.permissions.OnPermissionCallback;
import com.hjq.permissions.Permission;
import com.hjq.permissions.XXPermissions;

import java.io.File;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;

import static java.lang.annotation.ElementType.*;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.LiveDataKt;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import androidx.lifecycle.Transformations;
import androidx.lifecycle.ViewModelProvider;
import androidx.lifecycle.ViewModelProviders;

import com.hjd.test.R;


public class MainActivity extends BaseBindingActivity<ActivityMainBinding> {

    private Handler mHandler;
    private DemoViewModel demoViewModel;

    MusicService.SimpleBinder bindService;
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
        LogUtils.d(isCh("ghj"));
    }

    public boolean isCh(String ss) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return ss.chars().distinct().count() == ss.length();
        }
        return false;
    }


    @Override
    public void initData() {
        demoViewModel = ViewModelProviders.of(this).get(DemoViewModel.class);

        Observer<DataDemo> observer = new Observer<DataDemo>() {
            @Override
            public void onChanged(DataDemo dataDemo) {
                LogUtils.d("监听到的数据" + dataDemo.getTag1());
            }
        };
        demoViewModel.getDataDemo().observe(this, observer);

        mHandler = new Handler() {
            @Override
            public void handleMessage(@NonNull Message msg) {
                super.handleMessage(msg);
                if (msg.what == 1) {
                    AlertDialog dialog = new AlertDialog.Builder(MainActivity.this, R.style.MyMiddleDialogStyle).create();
                    DialogViewBinding bindingDialog = DialogViewBinding.inflate(getLayoutInflater());
                    dialog.setView(bindingDialog.getRoot(), 0, 0, 0, 0);
                    dialog.setCancelable(false);
                    dialog.show();
                    bindingDialog.tvDialogMsg.setText(msg.obj.toString());
                    bindingDialog.tvCancelEdit.setText("否");
                    bindingDialog.tvGoonEdit.setText("是");
                    bindingDialog.tvCancelEdit.setOnClickListener(v -> {
                        dialog.dismiss();
                    });
                    bindingDialog.tvGoonEdit.setOnClickListener(v -> {
                        dialog.dismiss();
                        finish();
                    });
//                    ToastUtils.showLong(msg.obj.toString());
                }
            }
        };

        binding.tv1.setOnClickListener(v -> {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    DataDemo dataDemo = new DataDemo();
                    dataDemo.setTag1(234234);
                    demoViewModel.getDataDemo().postValue(dataDemo);
                    Message message = Message.obtain();
                    message.what = 1;
                    message.obj = "向UI线程发送消息";
                    mHandler.sendMessage(message);
                }
            }).start();
        });
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