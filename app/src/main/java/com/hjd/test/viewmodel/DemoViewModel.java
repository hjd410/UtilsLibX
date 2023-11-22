package com.hjd.test.viewmodel;

import android.provider.ContactsContract;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Transformations;
import androidx.lifecycle.ViewModel;

import com.hjd.test.bean.DataDemo;

public class DemoViewModel  extends ViewModel {

    //    private DataDemo dataDemo = new DataDemo();
    private MutableLiveData<DataDemo> dataDemo = new MutableLiveData<>();


    public MutableLiveData<DataDemo> getDataDemo() {
        return dataDemo;
    }

    public void setDataDemo(DataDemo dataDemo) {
        this.dataDemo.setValue(dataDemo);
    }


//    public DataDemo getDataDemo() {
//        return dataDemo;
//    }
}
