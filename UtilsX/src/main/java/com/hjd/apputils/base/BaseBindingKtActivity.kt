package com.hjd.apputils.base

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Bundle
import android.os.StrictMode
import android.text.TextUtils
import android.util.Log
import android.view.KeyEvent
import android.view.View
import androidx.fragment.app.FragmentActivity
import androidx.viewbinding.ViewBinding
import com.hjd.apputils.utils.StatusBarUtil
import com.hjd.apputils.utils.ToastUtils
import com.hjd.apputils.utils.VirtualNavigationUtil


abstract class BaseBindingKtActivity<T : ViewBinding> : FragmentActivity() {
    protected lateinit var binding: T
    private var exitTime: Long = 0
    private var openKeyBack: Boolean = false
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = getViewBinding()
        setContentView(binding.root)

//        设计状态栏主题
        if (!onFullscreen() && !onImmersion()) {
            StatusBarUtil.setStatusLightTheme(this, true)
        }
//虚拟导航栏
        if (adaptVirtualNavigation()) {
            if (VirtualNavigationUtil.checkDeviceHasNavigationBar(this)) {
                VirtualNavigationUtil.assistActivity(findViewById(android.R.id.content))
            }
        }
        initPhotoError()
        initView(savedInstanceState)
        initDate()
    }

    //    获取布局文件
    protected abstract fun getViewBinding(): T

    protected abstract fun initDate()

    protected abstract fun initView(bundle: Bundle?)

    /**
     * 指定用于窗口的显式软输入模式的调整
     */
    open fun onSoftInputMode(mode: Int) {
        window.setSoftInputMode(mode)
    }

    /**
     * 开启全屏
     */
    open fun onFullscreen(): Boolean = false

    /**
     * 开启沉浸式
     */
    open fun onImmersion(): Boolean = false

    /**
     * 适配虚拟导航栏
     */
    open fun adaptVirtualNavigation(): Boolean = false

    private fun getHostActivity(): Activity {
        return this
    }

    /**
     * 是否开启按两次退出应用
     */
    open fun isOpenKeyBack(): Boolean = openKeyBack

    override fun onStart() {
        super.onStart()
        Log.e("APP", this::class.java.simpleName + "is onStart")
    }

    override fun onResume() {
        super.onResume()
        Log.e("APP", this::class.java.simpleName + "is onResume")
    }

    override fun onPause() {
        super.onPause()
        Log.e("APP", this::class.java.simpleName + "is onPause")
    }

    override fun onStop() {
        super.onStop()
        Log.e("APP", this::class.java.simpleName + "is onStop")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.e("APP", this::class.java.simpleName + "is Destroy")
    }

    override fun onRestart() {
        super.onRestart()
        Log.e("APP", this::class.java.simpleName + "is OnRestart")
    }

    open fun gotoActivity(context: Context, cls: Class<*>) {
        gotoActivity(context, cls, null, null, null)
    }

    open fun gotoActivity(context: Context, cls: Class<*>, action: String?) {
        gotoActivity(context, cls, action, null, null)
    }

    open fun gotoActivity(context: Context, cls: Class<*>, bundleKey: String?, bundle: Bundle?) {
        gotoActivity(context, cls, null, bundleKey, bundle)
    }

    open fun gotoActivity(
        context: Context,
        cls: Class<*>,
        action: String?,
        bundleKey: String?,
        bundle: Bundle?
    ) {
        val intent = Intent(context, cls)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        if (action != null) {
            intent.action = action
        }
        if (bundle != null) {
            intent.putExtra(bundleKey, bundle)
        }
        startActivity(intent)
    }

    open fun finishStartActivity(context: Context, cls: Class<*>) {
        gotoActivity(context, cls, null, null, null)
        finish()
    }

    open fun finishStartActivity(context: Context, cls: Class<*>, action: String?) {
        gotoActivity(context, cls, action, null, null)
        finish()
    }

    open fun finishStartActivity(
        context: Context,
        cls: Class<*>,
        bundleKey: String?,
        bundle: Bundle?
    ) {
        gotoActivity(context, cls, null, bundleKey, bundle)
        finish()
    }

    /***
     * android 7.0 拍照问题
     */
    private fun initPhotoError() {
        val builder = StrictMode.VmPolicy.Builder()
        StrictMode.setVmPolicy(builder.build())
        builder.detectFileUriExposure()
    }

    /**
     * 防止多次点击
     */
    fun OnSingleClickListener() = object : View.OnClickListener {
        private val MIN_CLICK_DELAY_TIME = 1000
        private var lastClickTime: Long = 0

        fun onSingleClick(view: View) {}

        override fun onClick(v: View) {
            var curClickTime = System.currentTimeMillis()
            if ((curClickTime - lastClickTime) >= MIN_CLICK_DELAY_TIME) {
                lastClickTime = curClickTime
                onSingleClick(view = v)
            }
        }
    }

    fun getHostResources(): Resources {
        val res = super.getResources()
        val config = Configuration()
        config.setToDefaults()
        res.updateConfiguration(config, res.displayMetrics)
        return res
    }

    /**
     * 判断字符是否相等
     */
    fun isCharEmp(charSequence: CharSequence): Boolean {
        return TextUtils.isEmpty(charSequence)
    }

    /**
     * 获取Intent传值
     */
    fun getIntentExtra(key: String): Any {
        return intent.extras?.get(key) ?: throw NullPointerException("参数为空，请检查传参")
    }

    /**
     * 返回键退出应用
     */
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (isOpenKeyBack()) {
            if (keyCode == KeyEvent.KEYCODE_BACK && event?.action == KeyEvent.ACTION_DOWN) {
                if ((System.currentTimeMillis() - exitTime) > 2000) {
                    ToastUtils.showLong("在按一次退出程序")
                    exitTime = System.currentTimeMillis()
                } else {
                    System.exit(0)
                }
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }
}

