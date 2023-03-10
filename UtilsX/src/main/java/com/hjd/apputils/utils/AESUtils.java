package com.hjd.apputils.utils;

import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * Created by zachary on 18/6/27.
 * 安卓端AES加密
 */
public class AESUtils {

    /**
     * 用秘钥进行加密
     *
     * @param content          明文
     * @param secretKeyEncoded 秘钥Encoded
     * @return byte数组的密文
     * @throws Exception
     */
    public static String encrypt(String content, byte[] secretKeyEncoded) throws Exception {
        // 创建AES秘钥
        SecretKeySpec key = new SecretKeySpec(secretKeyEncoded, "AES");
        // 创建密码器
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        // Cipher cipher = Cipher.getInstance("AES");
        // 初始化加密器
        cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(new byte[cipher.getBlockSize()]));
        // 加密
        byte[] encode = cipher.doFinal(content.getBytes("UTF-8"));
        return new BASE64Encode().encode(encode);
    }


    /**
     * 解密
     *
     * @param content          密文
     * @param secretKeyEncoded 秘钥
     * @return 解密后的明文
     * @throws Exception
     */
    public static String decrypt(String content, byte[] secretKeyEncoded) throws Exception {
        // 创建AES秘钥
        SecretKeySpec key = new SecretKeySpec(secretKeyEncoded, "AES");
        // 创建密码器
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        // 初始化解密器
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(new byte[cipher.getBlockSize()]));
        // 解密
        byte[] base64Decode = new BASE64Decode().decodeBuffer(content);
        byte[] encode = cipher.doFinal(base64Decode);
        return new String(encode);
    }





    /**
     * AES-128数据加密
     */
    public static String Encrypt128(String src, String key) {
        try{
            KeyGenerator kgen = KeyGenerator.getInstance("AES");
            kgen.init(128);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key.getBytes(), "AES"));



            //            SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes(),"AES");
//            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS7Padding","BC");
//            cipher.init(Cipher.ENCRYPT_MODE,skeySpec);
            byte[] encrypted = cipher.doFinal(src.getBytes());
            return new BASE64Encode().encode(encrypted);
        }catch (Exception e) {
            return null;
        }
    }

    /**
     * AES-128数据解密
     */
    public static String Decrypt128(String src, String key){
        try{
            SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes(),"AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS7Padding");
            cipher.init(Cipher.DECRYPT_MODE,skeySpec);
            byte[] base64Decode = new BASE64Decode().decodeBuffer(src);
            byte[] dncrypted = cipher.doFinal(base64Decode);
            return new String(dncrypted);
        }catch (Exception e){
            return null;
        }
    }




    //补充字典
    private final static String DIC = "1231g81f5456hhssg84h1f9q3f2x789s";

    // 加密
    @RequiresApi(api = Build.VERSION_CODES.O)
    public static String encrypt(String str, String key) {
        if (str == null || "".equals(str)) {
            return null;
        }
        if (key == null || "".equals(key)) {
            return null;
        }
        try {
            byte[] enCodeFormat = generateKey(key);// 返回基本编码格式的密钥，如果此密钥不支持编码，则返回
            SecretKeySpec skey = new SecretKeySpec(enCodeFormat, "AES");// 转换为AES专用密钥
            Cipher cipher = Cipher.getInstance("AES");// 创建密码器
            cipher.init(Cipher.ENCRYPT_MODE, skey);// 初始化为加密模式的密码器
            byte[] result = cipher.doFinal(str.getBytes("UTF-8"));// 加密
            return Base64.getUrlEncoder().encodeToString(result);
        } catch (Exception e) {
            Log.e("error",e.toString());
            return null;
        }
    }

    // 解密
    @RequiresApi(api = Build.VERSION_CODES.O)
    public static String decrypt(String str, String key) {
        if (str == null || "".equals(str)) {
            return null;
        }
        if (key == null || "".equals(key)) {
            return null;
        }
        try {
            byte[] enCodeFormat = generateKey(key);// 返回基本编码格式的密钥
            SecretKeySpec skey = new SecretKeySpec(enCodeFormat, "AES");// 转换为AES专用密钥
            Cipher cipher = Cipher.getInstance("AES");// 创建密码器
            cipher.init(Cipher.DECRYPT_MODE, skey);// 初始化为解密模式的密码器
            byte[] base64 = Base64.getUrlDecoder().decode(str.getBytes("UTF-8"));
            byte[] result = cipher.doFinal(base64);
            return new String(result, "UTF-8"); // 明文
        } catch (Exception e) {
            Log.e("error",e.getMessage());
            return null;
        }
    }

    /**
     * 自定义 秘钥补充
     *
     * @param key
     * @return
     * @throws Exception
     */
    private static byte[] generateKey(String key) throws Exception {
        byte[] dics = DIC.getBytes("UTF-8");
        byte[] bkeys = key.getBytes("UTF-8");
        byte[] keys = bkeys;
        int keylength = bkeys.length;
        if (keylength > 0 && keylength < 16) {
            keys = new byte[16];
            System.arraycopy(bkeys, 0, keys, 0, keylength);
            for (int i = keylength; i < 16; i++) {
                keys[i] = dics[i];
            }
        }

        if (keylength > 16 && keylength < 24) {
            keys = new byte[24];
            System.arraycopy(bkeys, 0, keys, 0, keylength);
            for (int i = keylength; i < 24; i++) {
                keys[i] = dics[i];
            }
        }

        if (keylength > 24 && keylength < 32) {
            keys = new byte[32];
            System.arraycopy(bkeys, 0, keys, 0, keylength);
            for (int i = keylength; i < 32; i++) {
                keys[i] = dics[i];
            }
        }

        if (keylength > 32) {
            keys = new byte[32];
            System.arraycopy(bkeys, 0, keys, 0, 32);
        }

        return keys;
    }

}
