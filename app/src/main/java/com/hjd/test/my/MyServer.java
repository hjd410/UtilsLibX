package com.hjd.test.my;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;

import androidx.annotation.CallSuper;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.LifecycleService;
import androidx.lifecycle.ServiceLifecycleDispatcher;

import java.security.Provider;

/**
 * @author Hou
 * @date 2022/6/23 10:46.
 * @apiNote
 */
public class MyServer extends Service implements LifecycleOwner {

    private final ServiceLifecycleDispatcher dispatcher = new ServiceLifecycleDispatcher(this);

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @CallSuper
    @Override
    public void onCreate() {
        dispatcher.onServicePreSuperOnCreate();
        super.onCreate();
    }

    @NonNull
    @Override
    public Lifecycle getLifecycle() {
        return null;
    }
}
