package com.hjd.test.my;

import androidx.annotation.NonNull;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleEventObserver;
import androidx.lifecycle.LifecycleOwner;

import com.blankj.utilcode.util.LogUtils;

/**
 * @author Hou
 * @date 2022/6/15 15:58.
 * @apiNote
 */
public class EventObserver implements LifecycleEventObserver {
    @Override
    public void onStateChanged(@NonNull LifecycleOwner source, @NonNull Lifecycle.Event event) {
        switch (event) {
            case ON_CREATE:
                LogUtils.d("ON_CREATE");
                break;
            case ON_START:
                LogUtils.d("ON_START");
                break;
            case ON_RESUME:
                LogUtils.d("ON_RESUME");
                break;
            case ON_PAUSE:
                LogUtils.d("ON_PAUSE");
                break;
            case ON_STOP:
                LogUtils.d("ON_STOP");
                break;
            case ON_DESTROY:
                LogUtils.d("ON_DESTROY");
                break;
            default:
                break;
        }
    }
}
