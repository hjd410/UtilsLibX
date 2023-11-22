package com.hjd.test.activity

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.hjd.apputils.base.BaseActivity
import com.hjd.test.R
import com.hjd.test.databinding.ActivityLoginBinding
import com.hjd.test.viewmodel.LoginViewModel

class LoginActivity : AppCompatActivity() {
    private lateinit var viewModel: LoginViewModel
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
//        binding =
//            DataBindingUtil.setContentView<ActivityLoginBinding>(this@LoginActivity, R.layout.activity_login)
        initView(savedInstanceState)
        initData()
    }

    fun initView(bundle: Bundle?) {
//        viewModel = ViewModelProvider(this).get(LoginViewModel::class.java)
//        binding.vm = viewModel
    }

    fun initData() {

    }

}