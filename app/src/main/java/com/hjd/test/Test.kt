package com.hjd.test

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.view.View.OnClickListener
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.view.WindowCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentTransaction
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.blankj.utilcode.util.ActivityUtils
import com.blankj.utilcode.util.ToastUtils
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import com.hjd.apputils.base.BaseBindingActivity
import com.hjd.test.databinding.ActivityTestBinding
import com.hjd.test.fragment.FirstFragment
import com.hjd.test.fragment.SecondFragment
import com.hjd.test.test.TwoActivity
import java.lang.reflect.Modifier

/**
 * Created by HJD on 2021/1/18 0018 and 14:50.
 */

class Test : BaseBindingActivity<ActivityTestBinding>(), OnClickListener {

    var first = FirstFragment()
    var second = SecondFragment()

    override fun initView(bundle: Bundle?) {

    }

    override fun initData() {
        checkFragment(0)
        binding.tvOne.setOnClickListener(this)
        binding.tvTwo.setOnClickListener(this)
    }


    override fun onClick(v: View?) {
        when (v?.id) {
            binding.tvOne.id -> {
                ToastUtils.showLong("第一个")
                checkFragment(0)
            }
            binding.tvTwo.id -> {
                ToastUtils.showLong("第二个")
                checkFragment(1)
            }
        }
    }


    fun hideFragment() {

    }

    fun checkFragment(index: Int) {
        var ft: FragmentTransaction = supportFragmentManager.beginTransaction()
       
        when (index) {
            0 -> {
                if (first == null) {
                    first = FirstFragment()
                    ft.add(binding.llContent.id, first)
                } else {
                    ft.show(first)
                }
            }
            1 -> {
                if (second == null) {
                    second = SecondFragment()
                    ft.add(binding.llContent.id, second)
                } else {
                    ft.show(second)
                }
            }
        }
        ft.commit()
    }
}


