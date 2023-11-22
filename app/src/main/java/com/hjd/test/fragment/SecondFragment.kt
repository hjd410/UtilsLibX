package com.hjd.test.fragment

import com.blankj.utilcode.util.LogUtils
import com.hjd.apputils.base.BaseBindingFragment
import com.hjd.test.databinding.FragmentSecondBinding

class SecondFragment: BaseBindingFragment<FragmentSecondBinding>() {

    override fun initView() {

    }


    override fun onFirstUserInvisible() {
        super.onFirstUserInvisible()
        LogUtils.d("SecondFragment第一次对用户不可见")
    }

    override fun onFirstUserVisible() {
        super.onFirstUserVisible()
        LogUtils.d("SecondFragment第一次对用户可见")
    }

    override fun onUserVisible() {
        super.onUserVisible()
        LogUtils.d("SecondFragment用户可见")
    }

    override fun onUserInvisible() {
        super.onUserInvisible()
        LogUtils.d("SecondFragment用户不可见")

    }

}