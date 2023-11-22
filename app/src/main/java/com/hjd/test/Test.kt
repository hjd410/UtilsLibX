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
import com.ashokvarma.bottomnavigation.BottomNavigationBar
import com.ashokvarma.bottomnavigation.BottomNavigationItem
import com.blankj.utilcode.util.ActivityUtils
import com.blankj.utilcode.util.ToastUtils
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import com.hjd.apputils.base.BaseBindingActivity
import com.hjd.test.adapter.MyFragmentAdapter
import com.hjd.test.databinding.ActivityTestBinding
import com.hjd.test.fragment.FirstFragment
import com.hjd.test.fragment.SecondFragment
import com.hjd.test.test.TwoActivity
import java.lang.reflect.Modifier

/**
 * Created by HJD on 2021/1/18 0018 and 14:50.
 */

class Test : BaseBindingActivity<ActivityTestBinding>(),
    BottomNavigationBar.OnTabSelectedListener {

    var first: FirstFragment? = null
    var second: SecondFragment? = null
    var adapter: MyFragmentAdapter? = null
    private var currentFragment: Fragment? = null
    val fragmentList: MutableList<Fragment> = mutableListOf()

    override fun initView(bundle: Bundle?) {
        binding.bottomBar.setMode(BottomNavigationBar.MODE_FIXED)
        binding.bottomBar.setBarBackgroundColor(R.color.main_color)
        binding.bottomBar.setTabSelectedListener(this)
        binding.bottomBar.addItem(BottomNavigationItem(R.mipmap.icon_logo, "主页"))
            .addItem(BottomNavigationItem(R.mipmap.ic_launcher, "第二"))
            .setFirstSelectedPosition(0)
            .initialise()
        first = FirstFragment()
        second = SecondFragment()
        fragmentList.add(first!!)
        fragmentList.add(second!!)
        switchFragment(0)
    }

    override fun initData() {
        adapter = MyFragmentAdapter(supportFragmentManager, 0, fragmentList)
        binding.vpView.adapter = adapter
    }

    fun switchFragment(index: Int) {
        val fragment = when (index) {
            0 -> {
                if (first == null) {
                    first = FirstFragment()
                }
                first
            }

            1 -> {
                if (second == null) {
                    second = SecondFragment()
                }
                second
            }

            else -> return
        } ?: return
        val ft = supportFragmentManager.beginTransaction()
        if (!fragment.isAdded) {
            if (first != null) {
                ft.hide(currentFragment!!).add(binding.vpView.id, fragment)
            } else {
                ft.add(binding.vpView.id, fragment)
            }
        } else {
            ft.hide(currentFragment!!).show(fragment)
        }
        currentFragment = fragment
        ft.commit()
    }


    override fun onTabSelected(position: Int) {
        switchFragment(position)
    }

    override fun onTabUnselected(position: Int) {

    }

    override fun onTabReselected(position: Int) {

    }
}


