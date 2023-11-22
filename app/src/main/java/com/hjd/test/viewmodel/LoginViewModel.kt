package com.hjd.test.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.blankj.utilcode.util.LogUtils
import com.blankj.utilcode.util.ToastUtils

class LoginViewModel : ViewModel() {
    private val _username = MutableLiveData<String>()
    val username: LiveData<String> = _username

    private val _password = MutableLiveData<String>()
    val password: LiveData<String> = _password


    fun login() {
        LogUtils.d("用户名", username.value)
        LogUtils.d("密码", password.value)
        when {
            username.value.toString().isEmpty() -> {
                ToastUtils.showLong("用户名不能为空")
                return
            }

            password.value.toString().isEmpty() -> {
                ToastUtils.showLong("密码不能为空")
                return
            }
        }
    }
}