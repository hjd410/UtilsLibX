package com.hjd.test;

import android.app.Application;
import android.content.Context;
import android.os.Environment;

import com.alibaba.android.arouter.launcher.ARouter;
import com.hjd.apputils.app.MyLib;
import com.hjd.apputils.utils.CrashHandler;


/**
 * Created by HJD on 2021/1/4 0004 and 16:22.
 */
public class APP extends Application {
    static Context context;
    public static final String IS_FIRST_START = "is_first_start";


    @Override
    public void onCreate() {
        super.onCreate();
        MyLib.getInstance().init(this);
        CrashHandler.getInstance(this);
        ARouter.openDebug();
        ARouter.openLog();
        ARouter.init(this);
        context = getApplicationContext();

    }

    public static Context getContext() {
        return context;
    }
}
