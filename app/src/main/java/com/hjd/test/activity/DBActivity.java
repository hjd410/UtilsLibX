package com.hjd.test.activity;

import android.os.Bundle;

import com.hjd.apputils.base.BaseBindingActivity;
import com.hjd.test.databinding.ActivityDbBinding;
import com.litesuits.orm.LiteOrm;
import com.litesuits.orm.db.DataBaseConfig;

public class DBActivity extends BaseBindingActivity<ActivityDbBinding> {
    LiteOrm liteOrm;

    @Override
    protected void initView(Bundle bundle) {
        if (liteOrm == null) {
            DataBaseConfig config = new DataBaseConfig(this, "testDD.db");
            config.debugged = true;
            config.dbVersion = 1;
            config.onUpdateListener = null;
            liteOrm = LiteOrm.newCascadeInstance(config);
        }
    }

    @Override
    protected void initData() {

    }

    public void testSave() {

    }
}
