package com.hjd.test.activity

import android.app.AlertDialog
import android.os.Bundle
import android.os.Environment
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.TextPaint
import android.text.method.LinkMovementMethod
import android.text.style.ClickableSpan
import android.text.style.ForegroundColorSpan
import android.view.View
import com.blankj.utilcode.util.ActivityUtils
import com.blankj.utilcode.util.LogUtils
import com.blankj.utilcode.util.SPUtils
import com.hjd.apputils.base.BaseBindingActivity.OnSingleClickListener
import com.hjd.apputils.base.BaseBindingKtActivity
import com.hjd.apputils.utils.StatusBarUtil
import com.hjd.apputils.utils.ToastUtils
import com.hjd.test.APP
import com.hjd.test.R
import com.hjd.test.databinding.ActivityOooooBinding
import com.hjd.test.databinding.DialogPrivacyBinding
import kotlin.system.exitProcess

class One : BaseBindingKtActivity<ActivityOooooBinding>() {
    val string1 = "点击查看"
    var string2 = "《隐私协议》"
    val string3 = "，了解详细信息。"
    var START_SECRET = 0 //隐私开始文字位置
    var END_SECRET = 0 //结束
    override fun getViewBinding(): ActivityOooooBinding {
        return ActivityOooooBinding.inflate(layoutInflater)
    }

    override fun initDate() {
        val argContent: String = "点击查看《隐私协议》，了解详细信息。"
        val privateStr: String = "《隐私协议》"

        START_SECRET = argContent.indexOf(privateStr)
        END_SECRET = START_SECRET + privateStr.length
        var str = getIntentExtra("bundK").run {
            this as Bundle
            get("key1")
        }
//        var str = getIntentExtra("bund")

//        val ss = str.get("key1")
        LogUtils.d("中缀", "中缀函数" customExtensionFun "显示")

//        LogUtils.d("传过来的值::_____ ${str}")
        binding.btnOooo.setOnClickListener(object : OnSingleClickListener() {
            override fun onSingleClick(view: View?) {
                LogUtils.d(getHostResources().getString(R.string.agentweb_click_open))
                LogUtils.d("One—" + this::class.java.simpleName + "initData--" + System.currentTimeMillis())

            }
        })
        var stringBuild = SpannableStringBuilder()

        var spannableString = SpannableString(argContent)
        val clickbleSpan = object : ClickableSpan() {
            override fun onClick(widget: View) {
                ToastUtils.showLong("这是点击事件")
            }

            override fun updateDrawState(ds: TextPaint) {
                ds.isUnderlineText = false
            }
        }
        var foregroundColorSpan = ForegroundColorSpan(resources.getColor(R.color.colorAccent))
        spannableString.setSpan(
            clickbleSpan,
            START_SECRET,
            END_SECRET,
            SpannableString.SPAN_INCLUSIVE_EXCLUSIVE
        )
        spannableString.setSpan(
            foregroundColorSpan,
            START_SECRET,
            END_SECRET,
            SpannableString.SPAN_INCLUSIVE_EXCLUSIVE
        )
//        stringBuild.append(string1)
//        stringBuild.append(spannableString)
//        stringBuild.append(string3)
        binding.tvName.text =   spannableString
        binding.tvName.movementMethod = LinkMovementMethod.getInstance()
    }

    infix fun String.customExtensionFun(name: String): String {

        return name + "中缀函数"
    }

    override fun adaptVirtualNavigation(): Boolean {
        return true
    }

    override fun initView(bundle: Bundle?) {
//        val isFirst = SPUtils.getInstance().getBoolean(APP.IS_FIRST_START, true)
//        when (isFirst) {
//            true -> {
//                showPrivacyDialog()
//            }
//
//            false -> {
//            }
//        }
    }

    override fun onImmersion(): Boolean {
        return StatusBarUtil.setImmersion(this, false, true, R.color.bar_color)
    }

    /*    fun showPrivacyDialog() {
            val dialogBinding = DialogPrivacyBinding.inflate(layoutInflater)
            var dialog = AlertDialog.Builder(this, R.style.MyMiddleDialogStyle).create()
            dialog.setView(dialogBinding.root)
            dialog.setCancelable(false)

            var spannableString = SpannableString("《隐私协议》")
            val clickbleSpan = object : ClickableSpan() {
                override fun onClick(widget: View) {
                    ToastUtils.showLong("这是点击事件")
                }

                override fun updateDrawState(ds: TextPaint) {
                    ds.isUnderlineText = false
                }
            }
            var foregroundColorSpan = ForegroundColorSpan(resources.getColor(R.color.colorAccent))
            spannableString.setSpan(
                clickbleSpan,
                0,
                string2.length,
                SpannableString.SPAN_INCLUSIVE_INCLUSIVE
            )
            spannableString.setSpan(
                foregroundColorSpan,
                0,
                4,
                SpannableString.SPAN_INCLUSIVE_INCLUSIVE
            )
            var stringBuild = StringBuilder()
            stringBuild.append(string1)
            stringBuild.append(spannableString)
            stringBuild.append(string3)


            dialogBinding.tvDialogContent.text = stringBuild.toString()
    //        同意
            dialogBinding.tvAgree.setOnClickListener {
                SPUtils.getInstance().put(APP.IS_FIRST_START, true)
                dialog.dismiss()
            }
    //        不同意
            dialogBinding.tvClose.setOnClickListener {
                dialog.dismiss()
                SPUtils.getInstance().put(APP.IS_FIRST_START, false)
                exitProcess(0)
            }
            dialog.show()

        }*/
}