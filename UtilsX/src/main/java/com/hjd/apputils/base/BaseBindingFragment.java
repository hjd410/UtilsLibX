package com.hjd.apputils.base;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.StrictMode;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewbinding.ViewBinding;

import com.hjd.apputils.custom.LoadingDialog;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Created by HJD on 2021/1/4 0004 and 11:29.
 */


public abstract class BaseBindingFragment<T extends ViewBinding> extends Fragment {
    protected T binding;
    /**
     * 贴附的activity
     */
    protected FragmentActivity affixActivity;
    public static final Map<String, String> map = new HashMap<>();

    /**
     * 根view
     */
    protected View mRootView;

    /**
     * 第一次onResume中的调用onUserVisible避免操作与onFirstUserVisible操作重复
     */
    protected boolean isFirstResume = true;
    private boolean isFirstVisible = true;
    private boolean isFirstInvisible = true;
    /**
     * 是否加载完成
     * 当执行完oncreatview,View的初始化方法后方法后即为true
     */
    protected boolean mIsPrepare;

    private boolean clickable = true;


    private LoadingDialog loadingDialog;

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is onAttach");

        affixActivity = getActivity();
    }

    @Override
    @Nullable
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        Type superClass = getClass().getGenericSuperclass();
        Class<?> aClass = (Class<?>) ((ParameterizedType) superClass).getActualTypeArguments()[0];
        Class[] parameterTypes;
        try {
            Method method = aClass.getDeclaredMethod("inflate", LayoutInflater.class, ViewGroup.class, boolean.class);
            binding = (T) method.invoke(null, getLayoutInflater(), container, false);
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is onCreateView");

        initPhotoError();//解决7.0相机问题
        loadingDialog = new LoadingDialog(affixActivity);
        initData(getArguments());
        initView();
        initPrepare();
        return binding.getRoot();
    }

    /**
     * 初始化数据
     *
     * @param arguments 接收到的从其他地方传递过来的参数
     */
    protected void initData(Bundle arguments) {
    }

    /**
     * 初始化View
     */
    protected void initView() {
    }

    //获取贴附的Activity
    public FragmentActivity getMainActivity() {
        return affixActivity;
    }

    private void initPhotoError() {
        // android 7.0系统解决拍照的问题
        StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
        StrictMode.setVmPolicy(builder.build());
        builder.detectFileUriExposure();
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState) {
    }

    @Override
    public void onStart() {
        super.onStart();
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is start");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is onResume");
        clickable = true;
        if (isFirstResume) {
            isFirstResume = false;
            return;
        }
        if (getUserVisibleHint()) {
            onUserVisible();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is onPause");
    }

    @Override
    public void onStop() {
        super.onStop();
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is onStop");
    }

    @Override
    public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);
        if (isVisibleToUser) {
            if (isFirstVisible) {
                isFirstVisible = false;
                initPrepare();
            } else {
                onUserVisible();
            }
        } else {
            if (isFirstInvisible) {
                isFirstInvisible = false;
                onFirstUserInvisible();
            } else {
                onUserInvisible();
            }
        }
    }

    public synchronized void initPrepare() {
        if (mIsPrepare) {
            onFirstUserVisible();
        } else {
            mIsPrepare = true;
        }
    }

    /**
     * 第一次fragment可见（进行初始化工作）
     */
    public void onFirstUserVisible() {

    }

    /**
     * fragment可见（切换回来或者onResume）
     */
    public void onUserVisible() {

    }

    /**
     * fragment不可见（切换掉或者onPause）
     */
    public void onUserInvisible() {

    }

    /**
     * 第一次fragment不可见（不建议在此处理事件）
     */
    public void onFirstUserInvisible() {

    }


    /**
     * 无参数打开一个activity
     *
     * @author hjd
     * @title 修改跳转页的标题
     */
    public static <T> void gotoActivity(Context context, Class<T> clazz, String... title) {
        Intent intent = new Intent(context, clazz);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        if (title != null) {
            intent.putExtra("titleString", title);
        }
        context.startActivity(intent);
        intent = null;
    }


    /**
     * 参数打开一个activi
     *
     * @author hjd
     * @params 参数
     */
    public static <T> void gotoActivity(Context context, Class<T> clazz, HashMap<String, Object> params) {
        Intent intent = new Intent(context, clazz);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        Iterator iterator = params.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry entry = (Map.Entry) iterator.next();
            intent.putExtra((String) entry.getKey(), String.valueOf(entry.getValue()));
        }
        context.startActivity(intent);
    }


    public LoadingDialog showLoadingDialog() {
        if (loadingDialog == null) {
            loadingDialog = new LoadingDialog(affixActivity);
        }
        if (!loadingDialog.isShowing()) {
            loadingDialog.setCancelable(false);
            loadingDialog.setCanceledOnTouchOutside(false);
            loadingDialog.show();
        }
        return loadingDialog;
    }

    public void dismissLoading() {
        if (loadingDialog != null && loadingDialog.isShowing()) {
            loadingDialog.dismiss();
        }
    }


    protected boolean isClicked() {
        return clickable;
    }

    protected void lookClick() {
        clickable = false;
    }

    @Override
    public void startActivityForResult(Intent intent, int requestCode, @Nullable Bundle options) {
        if (isClicked()) {
            lookClick();
            super.startActivityForResult(intent, requestCode, options);
        }
    }


    @Override
    public void onDestroyView() {
        if (loadingDialog != null && loadingDialog.isShowing()) {
            loadingDialog.dismiss();
        }
        //        OkGo.getInstance().cancelTag(this);
        super.onDestroyView();
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is  onDestroyView");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is onDestroy");
    }

    @Override
    public void onDetach() {
        super.onDetach();
        Log.e("appFragment",
                this.getClass()
                        .getSimpleName() + " is onDetach");
    }
}
