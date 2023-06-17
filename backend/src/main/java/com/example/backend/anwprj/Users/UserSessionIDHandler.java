package com.example.backend.anwprj.Users;

import com.example.backend.anwprj.Database.DataBaseHandler;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;

public class UserSessionIDHandler
{
    //stores mapping of session ids to users
    public static HashMap<String, User> mapping = new HashMap<>();

    //returns a user object by its session id (ONLY FOR SERVER INTERNAL USE!)
    public static User getUserBySessionID(String sessionID)
    {
        return mapping.get(sessionID);
    }

    public static boolean removeUser(String sessionID)
    {
        try
        {
            mapping.remove(sessionID);
            return true;
        }
        catch(Exception e)
        {
            return false;
        }
    }

    public static String addUser(String mail, String password)
    {
        //try to get user from database
        User user = DataBaseHandler.getInstance().getUser(mail, password);

        //if user exists
        if(user != null)
        {
            //generate random session id based on ascii table
            byte[] id = new byte[100];

            for(int i = 0; i < id.length; i++)
            {
                id[i] = (byte) (Math.random() * 26 + 64);
            }

            String generatedString = new String(id, StandardCharsets.US_ASCII);

            mapping.put(generatedString, user);

            //makes user session expire after ca. 2h
            new java.util.Timer().schedule(new java.util.TimerTask(){

                @Override
                public void run()
                {
                    mapping.remove(generatedString);
                    return;
                }
            }, 7500000);

            return generatedString;
        }

        return "failed";
    }
}
