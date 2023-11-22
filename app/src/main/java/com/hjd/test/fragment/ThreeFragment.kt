package com.hjd.test.fragment

import com.hjd.apputils.base.BaseBindingKtFragment
import com.hjd.test.databinding.FragmentThreeBinding

class ThreeFragment : BaseBindingKtFragment<FragmentThreeBinding>() {
    override fun getViewBinding(): FragmentThreeBinding =
        FragmentThreeBinding.inflate(layoutInflater)

    override fun initView() {

    }

    override fun initData() {

    }

}