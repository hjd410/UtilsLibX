package com.hjd.test.test

import android.content.Context
import android.os.SystemClock
import android.util.AttributeSet
import android.widget.Chronometer
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent

/**
 * @author Hou
 * @date 2022/6/23 15:22.
 * @apiNote
 */
class MyChronometer(context: Context, attributeSet: AttributeSet) :
    Chronometer(context, attributeSet), LifecycleObserver {
        private var exitTime :Long = 0



    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    private fun startTime() {
        base = SystemClock.elapsedRealtime() - exitTime
        start()
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    private fun pauseTime() {
        exitTime = SystemClock.elapsedRealtime() -base
        stop()
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    private fun onRelease() {
//        onRelease()
    }
}