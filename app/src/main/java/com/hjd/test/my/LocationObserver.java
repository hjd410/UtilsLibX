package com.hjd.test.my;

import android.content.Context;

import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.OnLifecycleEvent;

import com.blankj.utilcode.util.LogUtils;

/**
 * @author Hou
 * @date 2022/6/15 10:13.
 * @apiNote
 */
public class LocationObserver implements LifecycleObserver {
    private static final String TGA = "LocationObserver";

    public LocationObserver(Context activity) {
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    void onCreate(LifecycleOwner owner) {
        LogUtils.d(TGA, "创建onCreate");
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    void onStart(LifecycleOwner owner) {
        LogUtils.d(TGA, "开始onStart");

    }

    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    void onResume(LifecycleOwner owner) {
        LogUtils.d(TGA, "恢复onResume");

    }

    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    void onPause(LifecycleOwner owner) {
        LogUtils.d(TGA, "暂停onPause");

    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    void onStop(LifecycleOwner owner) {
        LogUtils.d(TGA, "停止onStop");

    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    void onDestroy(LifecycleOwner owner) {
        LogUtils.d(TGA, "销毁onDestroy");

    }

    @OnLifecycleEvent(Lifecycle.Event.ON_ANY)
    void onAny(LifecycleOwner owner, Lifecycle.Event event) {
        LogUtils.d(TGA, "onAny任何时候都会响应");

    }

}
