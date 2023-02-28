package com.hjd.test

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.Column
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.view.WindowCompat
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.blankj.utilcode.util.ActivityUtils
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import com.hjd.test.test.TwoActivity

/**
 * Created by HJD on 2021/1/18 0018 and 14:50.
 */

class Test : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_test)
        var cont = 0
        val anyStringh: String = if (cont == 0) {
            "sdfsdf"
        } else {
            "dfdf"
        }
        println(anyStringh)
        findViewById<TextView>(R.id.tv_title).setOnClickListener(View.OnClickListener {
            ActivityUtils.startActivity(TwoActivity::class.java)
        })

        var age = 22
        var studen = when (age) {
            0 -> "dfsf"
            in 1..10 -> "没有"
            in 11..22 -> "一个"
            else -> "kkkkk"
        }
        println(studen)

        WindowCompat.setDecorFitsSystemWindows(window, false)
        setContent { Navigator() }
    }

    @Preview
    @Composable
    fun Navigator() {
        val navController = rememberNavController()
        NavHost(navController = navController, startDestination = "第一个") {
            composable("第一个") { LoginPage(navController = navController) }
        }
    }

    @Composable
    fun LoginPage(navController: NavController) {
        val systemUiController = rememberSystemUiController()
        systemUiController.setStatusBarColor(
            Color.Transparent,
            darkIcons = MaterialTheme.colors.isLight
        )

    }
}
