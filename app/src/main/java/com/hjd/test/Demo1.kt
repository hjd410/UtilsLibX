package com.hjd.test

import java.io.ObjectOutputStream.PutField

fun main() {

    val name = "jaksdjflkajsdlf"
    println("name is $name")
    test(aa = "sdfsdf", ss = "kfkfkf")
    val isDD = true
    val dd = if (isDD) "nikk" else "不是"
    println(dd)
    fun nameLe(ss: String?): Int = ss?.length ?: -1

//    for (i in 100..400 step 3) {
//        println(i)
//    }
//    先有输入  再有输出
    val method01: (String) -> Int = { str: String ->
        str.length
    }
    val method02 = { str: String ->
        Unit
        true
    }
    println(method01("jfjfjfjfj"))
    println(method02("jfjfjfjfj"))

    val method03 = { sex: Char ->
        println(if (sex == '男') "男士你好" else if (sex == '女') "女式你好" else "啥也不是")
    }

    method03('男')

    val method04 = { name: String, pwd: String, a: (Boolean) -> Unit ->
        if (name == "qq" && pwd == "123") {
            a(true)
        } else {
            a(false)
        }
    }
    method04("qq", "123") {
        println(if (it) "登录成功" else "登录失败")
    }

    val method05 = { name: String, b: (String) -> Unit, a: (Boolean) -> Unit ->
        if (name == "qq" && b("123") == null) {
            a(true)
        } else {
            a(false)
        }
    }

    method05("qq", {}, {})

    val method06 = { str: String ->
        { i: Int ->
            ""
        }

    }
}

fun test(aa: String, dd: Int = -1, ss: String) {
    println("$aa,$ss,$dd")
}