package com.hjd.test.my

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import androidx.core.app.ActivityCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import com.blankj.utilcode.util.LogUtils

/**
 * @author Hou
 * @date 2022/6/23 16:17.
 * @apiNote
 */
class MyLocationObserver(private val mContext: Context) : LifecycleObserver {
    private lateinit var locationManager: LocationManager
    private lateinit var locationListener: MyLocationListener

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    private fun startLocation() {
        locationListener = MyLocationListener()
        locationManager = mContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        if (ActivityCompat.checkSelfPermission(
                mContext,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                mContext,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        locationManager.requestLocationUpdates(
            LocationManager.GPS_PROVIDER,
            3000, 1f, locationListener
        )
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    private fun stopLocation() {
        LogUtils.d(TAG, "停止了")
        locationManager.removeUpdates(locationListener)
    }


    internal class MyLocationListener : LocationListener {

        override fun onLocationChanged(location: Location) {
            LogUtils.d(TAG, location.toString())
        }

        @Deprecated("Deprecated in Java")
        override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
        override fun onProviderDisabled(provider: String) {}
        override fun onProviderEnabled(provider: String) {}
    }

    companion object {
        private const val TAG = "MyLocationObserver"
    }
}