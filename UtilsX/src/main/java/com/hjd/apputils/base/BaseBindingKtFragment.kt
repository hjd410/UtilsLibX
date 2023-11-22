package com.hjd.apputils.base

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewbinding.ViewBinding

abstract class BaseBindingKtFragment<T : ViewBinding> : Fragment() {
    private lateinit var mBinding: T
    private lateinit var mBaseActivity: Context
    private var isFirstResume = true
    private var isFirstVisible = true
    private var isFirstInvisible = true
    private var mIsPrepare = false

    private var affixActivity: FragmentActivity? = null

    override fun onAttach(context: Context) {
        super.onAttach(context)
        mBaseActivity = context
        affixActivity = activity
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        mBinding = getViewBinding()
        return mBinding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initView()
        initData()
    }

    protected abstract fun getViewBinding(): T

    protected abstract fun initView()

    protected abstract fun initData()

    override fun onResume() {
        super.onResume()

        if (isFirstResume) {
            isFirstResume = false
            return
        }
        if (userVisibleHint) {
            onUserVisible()
        }
    }

    fun getAffixActivity(): FragmentActivity? = affixActivity

    override fun setUserVisibleHint(isVisibleToUser: Boolean) {
        super.setUserVisibleHint(isVisibleToUser)
        if (isVisibleToUser) {
            if (isFirstVisible) {
                isFirstVisible = false
                initPrepare()
            } else {
                onUserVisible()
            }
        } else {
            if (isFirstInvisible) {
                isFirstInvisible = false
                onFirstUserInvisible()
            } else {
                onUserInvisible()
            }
        }
    }

    @Synchronized
    open fun initPrepare() {
        if (mIsPrepare) {
            onFirstUserVisible()
        } else {
            mIsPrepare = true
        }
    }

    /**
     * 第一次fragment可见（进行初始化工作）
     */
    open fun onFirstUserVisible() {

    }

    /**
     * fragment可见(切换回来或者onResume)
     */
    open fun onUserVisible() {

    }

    /**
     * fragment不可见 (切换掉或者onPause)
     */
    open fun onUserInvisible() {

    }

    /**
     * 第一次fragment不可见 （不建议在此处理事件）
     */
    open fun onFirstUserInvisible() {

    }

}