package com.hjd.apputils.base;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Bundle;
import android.os.IBinder;
import android.os.PersistableBundle;
import android.os.StrictMode;
import android.os.SystemClock;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewbinding.ViewBinding;

import com.hjd.apputils.custom.LoadingDialog;
import com.hjd.apputils.utils.AppManager;


import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;


/**
 * @author hjd
 */
public abstract class BaseBindingActivity<T extends ViewBinding> extends AppCompatActivity {

    protected T binding;


    public static final Map<String, String> PARAM = new HashMap<>();
    /**
     * 是否允许旋转屏幕
     */
    private boolean isAllowScreenRotation = true;
    /**
     * Loading加载
     */
    private LoadingDialog loadingDialog;
    /**
     * activity跳转tag
     */
    private String mActivityJumpTag;
    /**
     * activity跳转时间
     */
    private long mClickTime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Type superClass = getClass().getGenericSuperclass();
        try {
            Class<?> aClass = (Class<?>) ((ParameterizedType) superClass).getActualTypeArguments()[0];
            Method method = aClass.getDeclaredMethod("inflate", LayoutInflater.class);
            binding = (T) method.invoke(null, getLayoutInflater());
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
        setContentView(binding.getRoot());
        /*这行防止软键盘弹出时上面的空间错乱套*/
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
        AppManager.getInstance()
                .addActivity(this);
        //这里的context只能是当前的Activity
        loadingDialog = new LoadingDialog(this);
        initView(savedInstanceState);
        initData();
        initPhotoError();//解决7.0上相机问题
        //设置屏幕是否可旋转
        if (!isAllowScreenRotation) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.e("app",
              this.getClass()
                      .getSimpleName() + " is starting");
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.e("app",
              this.getClass()
                      .getSimpleName() + " is restart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.e("app",
              this.getClass()
                      .getSimpleName() + " is resumed");
    }

    public Activity getActivity() {
        return this;
    }

    @Override
    public void onSaveInstanceState(Bundle outState, PersistableBundle outPersistentState) {
        super.onSaveInstanceState(outState);
        Log.e("app",
              this.getClass()
                      .getSimpleName() + " is onSaveInstanceState");
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.e("app",
              this.getClass()
                      .getSimpleName() + " is pause");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.e("app",
              this.getClass()
                      .getSimpleName() + "is stop");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.e("app",
              this.getClass()
                      .getSimpleName() + " is destroyed");
        AppManager.getInstance()
                .finishActivity(this);
    }


    /**
     * 初始化控件
     */
    protected abstract void initView(@Nullable Bundle bundle);

    /**
     * 设置数据
     */
    protected abstract void initData();


    @Override
    public void startActivityForResult(Intent intent, int requestCode, @Nullable Bundle options) {
        if (checkDoubleClick(intent)) {
            super.startActivityForResult(intent, requestCode, options);
        }
    }

    /**
     * 是否允许屏幕旋转
     *
     * @param allowScreenRotation true or false
     */
    public void setAllowScreenRotation(boolean allowScreenRotation) {
        isAllowScreenRotation = allowScreenRotation;
    }

    /**
     * 检查是否重复跳转，不需要则重写方法并返回true
     */
    protected boolean checkDoubleClick(Intent intent) {
        // 默认检查通过
        boolean result = true;
        // 标记对象
        String tag;
        // 显式跳转
        if (intent.getComponent() != null) {
            tag = intent.getComponent()
                    .getClassName();
            // 隐式跳转
        } else if (intent.getAction() != null) {
            tag = intent.getAction();
        } else {
            return true;
        }
        if (tag.equals(mActivityJumpTag) && mClickTime >= SystemClock.uptimeMillis() - 500) {
            // 检查不通过
            result = false;
        }
        // 记录启动标记和时间
        mActivityJumpTag = tag;
        mClickTime = SystemClock.uptimeMillis();
        return result;
    }


    /**
     * android 7.0系统解决拍照的问题
     */
    private void initPhotoError() {
        StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
        StrictMode.setVmPolicy(builder.build());
        builder.detectFileUriExposure();
    }

    /**
     * 保证同一按钮在1秒内只会响应一次点击事件
     */
    public abstract static class OnSingleClickListener implements View.OnClickListener {
        //两次点击按钮之间的间隔，目前为1000ms
        private static final int MIN_CLICK_DELAY_TIME = 1000;
        private long lastClickTime;

        /**
         * 防止连点
         *
         * @param view 传入view
         */
        public abstract void onSingleClick(View view);

        @Override
        public void onClick(View view) {
            long curClickTime = System.currentTimeMillis();
            if ((curClickTime - lastClickTime) >= MIN_CLICK_DELAY_TIME) {
                lastClickTime = curClickTime;
                onSingleClick(view);
            }
        }
    }

    /**
     * @param clazz
     * @param <T>
     */
    public <T> void gotoActivity(Class<T> clazz) {
        Intent intent = new Intent(getActivity(), clazz);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        this.startActivity(intent);
    }

    /**
     * 携带一个参数打开一个activity
     *
     * @author hjd
     * {@code @title} 修改跳转页的标题
     */
    public <T> void gotoActivity(Class<T> clazz, @Nullable String... title
    ) {
        Intent intent = new Intent(getActivity(), clazz);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        if (title != null) {
            intent.putExtra("title", title);
        }
        this.startActivity(intent);
    }

    /**
     * 参数打开一个activity
     *
     * @author hjd
     * {@code @params} 参数
     */
    public <T> void gotoActivity(Class<T> clazz, Map<String, Object> params
    ) {
        Intent intent = new Intent(getActivity(), clazz);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        for (Map.Entry<String, Object> stringObjectEntry : params.entrySet()) {
            intent.putExtra((String) ((Map.Entry<?, ?>) stringObjectEntry).getKey(),
                            String.valueOf(stringObjectEntry.getValue()));
        }
        this.startActivity(intent);
    }

    /**
     * 判断字符串是否为空
     */
    public boolean isEmp(CharSequence charSequence) {
        return TextUtils.isEmpty(charSequence);
    }

    @Override
    public Resources getResources() {
        Resources res = super.getResources();
        Configuration config = new Configuration();
        config.setToDefaults();
        res.updateConfiguration(config, res.getDisplayMetrics());
        return res;
    }

    /**
     * 获取Intent传值
     */
    public String getIntentStringExtra(String key) {
        String result = this.getIntent()
                .getStringExtra(key);
        if (result == null) {
            throw new NullPointerException("参数空指针,请检查传参");
        }
        return result;
    }

    /*   隐藏软键盘方法   -------------------------------------------------------------------------  */

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        if (ev.getAction() == MotionEvent.ACTION_DOWN) {
            View v = getCurrentFocus();
            if (isShouldHideKeyboard(v, ev)) {
                hideKeyboard(v.getWindowToken());
                v.clearFocus();//点击空白处时清除焦点
            }
        }
        return super.dispatchTouchEvent(ev);
    }

    /**
     * 根据EditText所在坐标和用户点击的坐标相对比，
     * 来判断是否隐藏键盘，因为当用户点击EditText时则不能隐藏
     */
    private boolean isShouldHideKeyboard(View v, MotionEvent event) {
        if ((v instanceof EditText)) {
            ((EditText) v).setCursorVisible(false);
            int[] l = {0, 0};
            v.getLocationInWindow(l);
            int left = l[0], top = l[1], bottom = top + v.getHeight(), right = left + v.getWidth();
            if (event.getX() > left && event.getX() < right && event.getY() > top &&
                event.getY() < bottom) {
                // 点击EditText的事件，忽略它。
                return false;
            } else {
                return true;
            }
        }
        // 如果焦点不是EditText则忽略，这个发生在视图刚绘制完，第一个焦点不在EditText上，和用户用轨迹球选择其他的焦点
        return false;
    }

    /**
     * 获取InputMethodManager，隐藏软键盘
     */
    private void hideKeyboard(IBinder token) {
        if (token != null) {
            InputMethodManager im =
                    (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            im.hideSoftInputFromWindow(token, InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }
    /*     ----------------------------------------------------------------------------------*/

    public void showLoadingDialog() {
        if (loadingDialog == null) {
            loadingDialog = new LoadingDialog(this);
        }
        if (!loadingDialog.isShowing()) {
            loadingDialog.setCanceledOnTouchOutside(false);
            loadingDialog.setCancelable(false);
            loadingDialog.show();
        }
    }

    public void dismissLoading() {
        if (loadingDialog != null && loadingDialog.isShowing()) {
            loadingDialog.dismiss();
        }
    }
}
