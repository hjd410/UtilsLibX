package com.hjd.apputils.custom;

import com.hjd.apputils.R;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.IdRes;

/**
 * 提现时显示的密码输入dialog
 */
public class PayDialog extends BaseDialog {

    private PayPwdEditText payPwdEditText;
    private ImageView ivClose;
    private TextView tvMoney, tvFuWuFei, tvFeiLv;

    private String money;

    private Activity activity;

    private onTextFinishListener listener;
    private int contentViewResId;

    /**
     * 输入框结束的监听
     * @param listener
     */
    public void setOnTextFinishListener(onTextFinishListener listener) {
        this.listener = listener;
    }

    public interface onTextFinishListener {
        void onFinish(String str);
    }

    public PayDialog(Context context) {
        super(context);
    }

    public PayDialog(Context context, @IdRes int resId) {
        super(context);
        this.contentViewResId = resId;
    }

    public int getContentViewResId() {
        if (contentViewResId == 0) {
            throw new RuntimeException("contentViewResId is null--布局ID不能为空");
        }
        return contentViewResId;
    }



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(getContentViewResId());



//        payPwdEditText.initStyle(R.drawable.shap_loading_dialog, 6, 3f, R.color.white, R.color.black, 20);
//        payPwdEditText.setOnTextFinishListener(new PayPwdEditText.OnTextFinishListener() {
//            @Override
//            public void onFinish(String str) {//密码输入完后的回调
//                if (listener != null) {
//                    listener.onFinish(str);
//                }
////                Toast.makeText(context, str, Toast.LENGTH_SHORT).show();
////                先关闭密码的Dialog 再弹出加载的Dialog  延时两秒后关闭加载的Dialog 同时跳转对应的页面
//
//            }
//        });
//关闭输入支付密码的Dialog
//        ivClose.setOnClickListener(v -> {
//            dismiss();
//        });

//        new Handler().postDelayed(new Runnable() {
//            @Override
//            public void run() {
//                payPwdEditText.setFocus();
//            }
//        }, 100);

    }
}
