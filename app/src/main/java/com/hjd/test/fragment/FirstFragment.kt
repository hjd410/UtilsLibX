package com.hjd.test.fragment

import com.blankj.utilcode.util.LogUtils
import com.hjd.apputils.base.BaseBindingFragment
import com.hjd.apputils.base.BaseBindingKtFragment
import com.hjd.test.databinding.FragmentFirstBinding

class FirstFragment : BaseBindingKtFragment<FragmentFirstBinding>() {
    override fun getViewBinding(): FragmentFirstBinding {
        return FragmentFirstBinding.inflate(layoutInflater)
    }

    override fun initView() {

    }

    override fun initData() {

    }


    /*
        override fun onFirstUserInvisible() {
            super.onFirstUserInvisible()
            LogUtils.d("FirstFragment第一次对用户不可见")
        }

        override fun onFirstUserVisible() {
            super.onFirstUserVisible()
            LogUtils.d("FirstFragment第一次对用户可见")
        }

        override fun onUserVisible() {
            super.onUserVisible()
            LogUtils.d("FirstFragment用户可见")
        }

        override fun onUserInvisible() {
            super.onUserInvisible()
            LogUtils.d("FirstFragment用户不可见")

        }*/

}