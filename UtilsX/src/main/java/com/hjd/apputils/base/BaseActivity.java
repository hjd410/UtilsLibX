package com.hjd.apputils.base;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.IBinder;
import android.os.PersistableBundle;
import android.os.SystemClock;
import android.text.TextUtils;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.hjd.apputils.R;
import com.hjd.apputils.custom.LoadingDialog;
import com.hjd.apputils.utils.AppManager;
import com.hjd.apputils.utils.CommonUtils;


import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;


public abstract class                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          BaseActivity extends FragmentActivity {
    private TextView tvTitle;
    private boolean toastAutoCancel = true;
    private static final String TAG = "uploadImage";
    public static final Map<String, String> param = new HashMap<>();

    private LoadingDialog loadingDialog;
    /**
     * activity??????tag
     */
    private String mActivityJumpTag;
    /**
     * activity????????????
     */
    private long mClickTime;

    /**
     * ???activity pause??????  toast??????????????????
     *
     * @param toastAutoCancel
     */
    public void setToastAutoCancel(boolean toastAutoCancel) {
        this.toastAutoCancel = toastAutoCancel;
    }

    /**
     * ???oncreate????????? ????????????
     *
     * @param title
     */
    public void setTitle(String title) {
        tvTitle.setText(title);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(returnLayoutResID());
        /*??????????????????????????????????????????????????????*/
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN);
        CommonUtils.initState(this, R.color.contract_bar_col);
        loadingDialog = new LoadingDialog(this);

        AppManager.getInstance().addActivity(this);

        tvTitle = (TextView) findViewById(R.id.head_title);
        if (tvTitle != null) {
            setTitle(setTitleInitLayout());
        } else {
            setTitleInitLayout();
        }
        initView(savedInstanceState);
        initData();
    }


    @Override
    public void onSaveInstanceState(Bundle outState, PersistableBundle outPersistentState) {
    }


    /**
     * ????????????????????????????????????????????????????????????true
     */
    protected boolean checkDoubleClick(Intent intent) {

        // ??????????????????
        boolean result = true;
        // ????????????
        String tag;
        if (intent.getComponent() != null) { // ????????????
            tag = intent.getComponent().getClassName();
        } else if (intent.getAction() != null) { // ????????????
            tag = intent.getAction();
        } else {
            return true;
        }

        if (tag.equals(mActivityJumpTag) && mClickTime >= SystemClock.uptimeMillis() - 500) {
            // ???????????????
            result = false;
        }

        // ???????????????????????????
        mActivityJumpTag = tag;
        mClickTime = SystemClock.uptimeMillis();
        return result;
    }

    /**
     * ????????????????????????initVIew ??????
     */
    public void initView(Bundle savedInstanceState) {
    }

    public void initData() {

    }

    /**
     * return?????????????????? ?????????????????????activity
     *
     * @return
     */
    public abstract int returnLayoutResID();

    /**
     * ??????????????????
     *
     * @return
     */
    public abstract String setTitleInitLayout();

    /**
     * ????????????String
     */
    public String getTitleString() {
        return tvTitle.getText().toString();
    }

    /**
     * activity????????????
     *
     * @param view
     */
    public void back(View view) {
        finish();
    }


    public void setRightButton(int Resid) {
        ImageView rightButton = (ImageView) findViewById(R.id.head_right_button);
        rightButton.setImageResource(Resid);
        rightButton.setVisibility(View.VISIBLE);
    }

    public void setRightButtonText(String s) {
        TextView rightButton = (TextView) findViewById(R.id.head_right_text_button);
        rightButton.setText(s);
        rightButton.setVisibility(View.VISIBLE);
    }

    public void setRightButtonTextColor(int color) {
        TextView rightButton = (TextView) findViewById(R.id.head_right_text_button);
        rightButton.setTextColor(color);
        rightButton.setVisibility(View.VISIBLE);
    }

/*
    public void setTitleLineColor(int color) {
        View view = findViewById(R.id.view_title_line);
        view.setBackgroundColor(color);
    }*/

    public void rightClick(View v) {

    }

    public void rightIVClick(View v) {

    }

    public void rightTVClick(View v) {

    }

    /**
     * ?????????????????????activi
     *
     * @author guoyi
     * @title ????????????????????????
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
     * ??????????????????activi
     *
     * @author guoyi
     * @params ??????
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

    /*???????????????????????????*/
    public void setLeftDrawable(int resid) {
        TextView leftButton = (TextView) findViewById(R.id.head_left_text_button);
        Drawable leftDrawable = ContextCompat.getDrawable(this, resid);
        leftDrawable.setBounds(0, 0, leftDrawable.getMinimumWidth(), leftDrawable.getMinimumHeight());
        leftButton.setCompoundDrawables(leftDrawable, null, null, null);
    }

    /*???????????????????????????*/
    public void setTopDrawable(int resid) {
        TextView leftButton = (TextView) findViewById(R.id.head_left_text_button);
        Drawable leftDrawable = ContextCompat.getDrawable(this, resid);
        leftDrawable.setBounds(0, leftDrawable.getMinimumWidth(), 0, leftDrawable.getMinimumHeight());
        leftButton.setCompoundDrawables(leftDrawable, null, null, null);
    }

    public void setLeftDrawableAndTextColor(int resid, int color) {
        TextView leftButton = (TextView) findViewById(R.id.head_left_text_button);
        leftButton.setTextColor(color);
        leftButton.setTextColor(color);
        Drawable leftDrawable = ContextCompat.getDrawable(this, resid);
        leftDrawable.setBounds(0, 0, leftDrawable.getMinimumWidth(), leftDrawable.getMinimumHeight());
        leftButton.setCompoundDrawables(leftDrawable, null, null, null);
    }

    public String getIntentStringExtra(String key) {
        String result = this.getIntent().getStringExtra(key);
        if (result == null) {
            throw new NullPointerException("???????????????,???????????????");
        }
        return result;
    }

    /*   ?????????????????????   -------------------------------------------------------------------------  */

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        if (ev.getAction() == MotionEvent.ACTION_DOWN) {
            View v = getCurrentFocus();
            if (isShouldHideKeyboard(v, ev)) {
                hideKeyboard(v.getWindowToken());
                v.clearFocus();//??????????????????????????????
            }
        }
        return super.dispatchTouchEvent(ev);
    }

    /**
     * ??????EditText????????????????????????????????????????????????
     * ???????????????????????????????????????????????????EditText??????????????????
     */
    private boolean isShouldHideKeyboard(View v, MotionEvent event) {
        if (v != null && (v instanceof EditText)) {
            ((EditText) v).setCursorVisible(false);
            int[] l = {0, 0};
            v.getLocationInWindow(l);
            int left = l[0],
                    top = l[1],
                    bottom = top + v.getHeight(),
                    right = left + v.getWidth();
            if (event.getX() > left && event.getX() < right
                    && event.getY() > top && event.getY() < bottom) {
                // ??????EditText????????????????????????
                return false;
            } else {
                return true;
            }
        }
        // ??????????????????EditText?????????????????????????????????????????????????????????????????????EditText????????????????????????????????????????????????
        return false;
    }

    /**
     * ??????InputMethodManager??????????????????
     */
    private void hideKeyboard(IBinder token) {
        if (token != null) {
            InputMethodManager im = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            im.hideSoftInputFromWindow(token, InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }
    /*     ----------------------------------------------------------------------------------*/

    public LoadingDialog showLoadingDialog() {
        if (loadingDialog == null) {
            loadingDialog = new LoadingDialog(this);
        }
        if (!loadingDialog.isShowing()) {
            loadingDialog.setCanceledOnTouchOutside(false);
            loadingDialog.setCancelable(false);
            loadingDialog.show();
        }
        return loadingDialog;
    }

    public void dismissLoading() {
        if (loadingDialog != null && loadingDialog.isShowing()) {
            loadingDialog.dismiss();
        }
    }

    @Override
    protected void onDestroy() {
        if (loadingDialog != null && loadingDialog.isShowing()) {
            loadingDialog.dismiss();
        }
        super.onDestroy();
        AppManager.getInstance().removeActivity(this);
    }


    @Override
    public void startActivity(Intent intent) {
        super.startActivity(intent);
    }
}
