package com.hjd.test.test

import androidx.lifecycle.LifecycleService
import com.hjd.test.my.MyLocationObserver

/**
 * @author Hou
 * @date 2022/6/23 16:33.
 * @apiNote
 */
class MyLocationServer : LifecycleService() {
    init {
        val observer = MyLocationObserver(this)
        lifecycle.addObserver(observer)
    }
}