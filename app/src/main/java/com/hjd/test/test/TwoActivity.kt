package com.hjd.test.test

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.blankj.utilcode.util.LogUtils
import com.hjd.test.databinding.ActivityTwoBinding
import com.hjq.permissions.Permission
import com.hjq.permissions.XXPermissions

/**
 * @author Hou
 * @date 2022/6/23 15:30.
 * @apiNote
 */
class TwoActivity : AppCompatActivity() {
    private lateinit var binding: ActivityTwoBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTwoBinding.inflate(layoutInflater)
        setContentView(binding.root)
        lifecycle.addObserver(binding.tvChronometer)
        initView()

        XXPermissions.with(this)
            .permission(Permission.ACCESS_FINE_LOCATION, Permission.ACCESS_COARSE_LOCATION)
            .request { permissions, all ->
                if (all) {
                    LogUtils.d("有权限了")
                }
            }
    }

    private fun initView() {
        binding.btn1.setOnClickListener {
            startService(Intent(this, MyLocationServer::class.java))
        }
        binding.btn2.setOnClickListener {
            stopService(Intent(this, MyLocationServer::class.java))
        }
    }

    override fun onNightModeChanged(mode: Int) {

    }
}