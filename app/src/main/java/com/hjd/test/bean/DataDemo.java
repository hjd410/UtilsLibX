package com.hjd.test.bean;

import androidx.lifecycle.LiveData;

import com.blankj.utilcode.util.LogUtils;

public class DataDemo extends LiveData<DataDemo> {
    private int tag1;
    private int tag2;

    @Override
    protected void onActive() {
        super.onActive();
        LogUtils.d("正在被调用");
    }

    @Override
    protected void onInactive() {
        super.onInactive();
        LogUtils.d("失去了前台活动");
    }

    public int getTag1() {
        return tag1;
    }

    public void setTag1(int tag1) {
        this.tag1 = tag1;
        postValue(this);
    }

    public int getTag2() {
        return tag2;
    }

    public void setTag2(int tag2) {
        this.tag2 = tag2;
        postValue(this);
    }
}
