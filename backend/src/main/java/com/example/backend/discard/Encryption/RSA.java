package com.example.backend.discard.Encryption;

import javax.crypto.Cipher;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.*;

public class RSA {

    private PublicKey publicKey;
    private PrivateKey privateKey;

    private static RSA instance = null;

    public static RSA getInstance()
    {
        if(instance == null)
        {
            instance = new RSA();
        }

        return instance;
    }

    private RSA(){}

    public String decrypt(byte[] text) throws Exception
    {
        readKeyPairs();
        var cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        var plainText = cipher.doFinal(text);
        return new String(plainText, StandardCharsets.US_ASCII);
    }

    private void readKeyPairs() throws Exception
    {
        var publicInput = new ObjectInputStream(new FileInputStream(new File("./public.kfs")));
        publicKey = (PublicKey) publicInput.readObject();
        publicInput.close();

        var privateInput = new ObjectInputStream(new FileInputStream(new File("./private.kfs")));
        privateKey  = (PrivateKey) privateInput.readObject();
        privateInput.close();
    }

    public byte[] loadByteArray(String text)
    {
        String[] split = text.split(",");
        byte[] output = new byte[split.length];
        for(int i = 0; i < split.length; i++)
        {
            output[i] = Byte.parseByte(split[i]);
        }

        return output;
    }
}
