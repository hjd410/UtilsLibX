package com.hjd.test.activity

import android.content.Intent
import android.os.Bundle
import com.hjd.apputils.base.BaseBindingKtActivity
import com.hjd.apputils.utils.StatusBarUtil
import com.hjd.test.APP
import com.hjd.test.R
import com.hjd.test.databinding.ActivityTwoBinding
import com.hjq.permissions.OnPermissionCallback
import com.hjq.permissions.Permission
import com.hjq.permissions.XXPermissions
import javax.sql.RowSet

class Two : BaseBindingKtActivity<ActivityTwoBinding>() {
    override fun getViewBinding(): ActivityTwoBinding {
        return ActivityTwoBinding.inflate(layoutInflater)
    }

    override fun initDate() {
        XXPermissions.with(this)
            .permission(Permission.MANAGE_EXTERNAL_STORAGE)
            .request(object : OnPermissionCallback {
                override fun onGranted(permissions: MutableList<String>?, all: Boolean) {

                }
            })
        binding.btn1.setOnClickListener {
//            gotoActivity(One::class.java)
//            val intent = Intent()
//            intent.setClass(this@Two, One::class.java)
//            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            val bundle = Bundle()
            bundle.putBoolean(
                "key1",
                true
            )
//            intent.putExtras(bundle)
            gotoActivity(this@Two, One::class.java, "bundK", bundle)
        }
    }

    override fun initView(bundle: Bundle?) {
        StatusBarUtil.setRootViewFitsSystemWindows(this, true)
    }

    override fun onImmersion(): Boolean {
        return StatusBarUtil.setImmersion(this, true, true, R.color.bar_color)
    }

    override fun adaptVirtualNavigation(): Boolean {
        return true
    }

}