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
import com.hjd.apputils.utils.StatusBarUtil;
import com.hjd.apputils.utils.ToastUtils;
import com.hjd.test.databinding.ActivityMainBinding;
import com.hjd.test.model.PeopleModel;
import com.hjd.test.my.LocationObserver;
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

    LocationObserver locationObserver;


    private boolean isBind;
    File file = new File(Environment.getExternalStorageDirectory().getPath() + "/appTest/one.zip");
    File fileDes = new File(Environment.getExternalStorageDirectory().getPath() + "/appTest/one");
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


        locationObserver = new LocationObserver(this);
        getLifecycle().addObserver(locationObserver);
    }



    @Override
    public void initData() {
        //model = new PeopleModel();
        //model.setName("JDJJDJDJDJDJJFKFKFFKKFKDJSJSJDKDJFDDJ");
        //model.setAge(3838);



        StatusBarUtil.setRootViewFitsSystemWindows(this, false);
        //showLoadingDialog();
        //new Handler().postDelayed(new Runnable() {
        //    @Override
        //    public void run() {
        //        dismissLoading();
        //    }
        //}, 5000);

        //Glide.with(this).load("http://p1.pstatp.com/large/166200019850062839d3").into(binding.img);

        //RxHttp.get("")
        //        .asString()
        //        .subscribe(s -> {
        //        }, throwable -> {
        //        });

        binding.tv.setOnClickListener(new OnSingleClickListener() {
            @Override
            public void onSingleClick(View view) {
//                ToastUtils.showShort("1111");
//                File file = new File(Environment.getExternalStorageDirectory().getAbsolutePath() + "/appTest/星辰大海.mp3");

                /*文件解压*/
                try {
                    ZipUtils.unzipFile(new File(file.getPath()), fileDes);
                } catch (IOException e) {
                    e.printStackTrace();
                }


                //Intent intent = new Intent(MainActivity.this, MusicService.class);
                //intent.putExtra("path", file.getPath());
                //bindService(intent, serviceConnection, BIND_AUTO_CREATE);
             /*   Retrofit retrofit = new Retrofit.Builder().baseUrl("http://192.168.0.122:8081/").build();
                TestApi api = retrofit.create(TestApi.class);
                api.getBlog().enqueue(new Callback<ResponseBody>() {
                    @Override
                    public void onResponse
                            (Call<ResponseBody> call, Response<ResponseBody> response) {

                        try {
                            LogUtils.d(response.body().string());
                        } catch (IOException e) {
                            e.printStackTrace();
                        }

                    }

                    @Override
                    public void onFailure(Call<ResponseBody> call, Throwable t) {
                        LogUtils.e(t.getMessage());
                    }
                });*/
            }
        });

        binding.tv1.setOnClickListener(new OnSingleClickListener() {
            @Override
            public void onSingleClick(View view) {
                //if (isBind) {
                //    unbindService(serviceConnection);
                //    ToastUtils.showShort("解绑服务");
                //    isBind = false;
                //} else {
                //    ToastUtils.showShort("还没绑定服务");
                //}

                //ARouter.getInstance().build("/one/AAA")
                //        .navigation();

            }
        });
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