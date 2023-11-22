package com.hjd.apputils.network;



public class HttpData<T> {

    /**
     * 返回码
     */
    private int code;
    /**
     * 提示语
     */
    private String msg;
    /**
     * 数据
     */
    private T data;


    public int getCode() {
        return code;
    }

    public String getMessage() {
        return msg;
    }

    public T getData() {
        return data;
    }

    /**
     * 是否请求成功
     */
    public boolean isRequestSuccess() {
        return code == 0;
    }

    /**
     * 是否 Token 失效
     */
    public boolean isTokenFailure() {
        return code != 200;
    }
}

