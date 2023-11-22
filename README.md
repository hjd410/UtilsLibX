[![](https://jitpack.io/v/hjd410/hjdutilx.svg)](https://jitpack.io/#hjd410/hjdutilx)

## 此版本为AndroidX

	dependencies {
	        implementation 'com.github.hjd410:hjdutilx:Tag'
	}

#**使用**
开始使用之前一定要初始化
```
 MyLib.getInstance().init(this);
```

## 0.0.2
>1、修改Activity、Fragment的基类为kotlin，并删除了一些不必要的代码和方法
> 2、CrashHandler修复了不能保存报错日志的问题
