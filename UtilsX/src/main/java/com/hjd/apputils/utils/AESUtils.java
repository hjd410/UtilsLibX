package com.hjd.apputils.utils;

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

}
