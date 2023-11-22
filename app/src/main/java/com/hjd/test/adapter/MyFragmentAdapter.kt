package com.hjd.test.adapter

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentPagerAdapter

class MyFragmentAdapter :
    FragmentPagerAdapter {
    var fragmentList: MutableList<Fragment> = mutableListOf()

    constructor(
        fragmentManager: FragmentManager,
        behoicr: Int,
        fmList: MutableList<Fragment>
    ) : super(
        fragmentManager
    ) {
        fragmentList = fmList
    }

    override fun getCount(): Int {
        return fragmentList.size
    }

    override fun getItem(position: Int): Fragment {
        return fragmentList.get(position)
    }


}