package com.hjd.test.activity

import android.content.Context
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import androidx.constraintlayout.widget.Constraints
import com.blankj.utilcode.util.LogUtils
import com.hjd.apputils.base.BaseBindingActivity
import com.hjd.test.R
import com.hjd.test.databinding.ActivityWebBinding
import com.just.agentweb.AgentWeb
import com.just.agentweb.DefaultWebClient
import com.just.agentweb.WebViewClient
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.InputStream

/**
 * @author Hou
 * @date 2022/6/30 14:39.
 * @apiNote
 */
class WebActivity : BaseBindingActivity<ActivityWebBinding>() {
    private lateinit var agentWeb: AgentWeb
    var url = "file:///android_asset/loca/index.html"
    var webView: WebView? = null

    override fun initView(bundle: Bundle?) {
//        agentWeb = AgentWeb.with(this)
//            .setAgentWebParent(binding.llView, Constraints.LayoutParams(-1, -1))
//            .useDefaultIndicator()
//            .setWebViewClient(webViewClient)
//            .setOpenOtherPageWays(DefaultWebClient.OpenOtherPageWays.DISALLOW)
//            .createAgentWeb()
//            .ready()
//            .go(url)
//        agentWeb.agentWebSettings.webSettings.javaScriptEnabled = true
        webView = findViewById(R.id.ll_view)
        webView!!.settings.javaScriptEnabled = true
        webView!!.loadUrl(url)
    }

    override fun initData() {

    }


    private var webViewClient: WebViewClient = object : WebViewClient() {

//        override fun onPageFinished(view: WebView?, url: String?) {
//            super.onPageFinished(view, url)
//            onJsLocal()
//        }

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
            super.onPageStarted(view, url, favicon)
//            onJsLocal()
        }
    }

    fun onJsLocal(): Unit {

        val builder = StringBuilder(getJS(this, "huayun/init.js"))
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
            agentWeb.webCreator?.webView?.loadUrl("javascript:" + builder.toString())
        } else {
            agentWeb.webCreator?.webView?.evaluateJavascript("javascript:") {
                LogUtils.i("onReceiveValue: $it")
            }
        }

    }

    private fun getJS(context: Context, fileName: String): String? {
        lateinit var inputStream: InputStream
        val outputStream: ByteArrayOutputStream by lazy { ByteArrayOutputStream() }

        try {
            inputStream = context.assets.open(fileName)
            var len: Int
            var buffer = ByteArray(2048)
            do {
                len = inputStream.read(buffer)
                if (len != -1) {
                    outputStream.write(buffer, 0, len)
                }
            } while (true)
            return String(outputStream.toByteArray())
        } catch (e: IOException) {
            e.printStackTrace()
        } finally {
            try {
                outputStream.close()
            } catch (e: IOException) {
                e.printStackTrace()
            }
            if (inputStream != null) {
                try {
                    inputStream.close()
                } catch (e: IOException) {
                    e.printStackTrace()
                }
            }
        }
        return null
    }
}
