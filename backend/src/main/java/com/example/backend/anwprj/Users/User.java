package com.example.backend.anwprj.Users;

//user data class
public class User
{
    private int id;
    private String firstName;
    private String lastName;
    private String mail;
    private String password;
    private int permissions;

    public User(int id, String firstName, String lastName, String mail, String password, int permissions)
    {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.mail = mail;
        this.password = password;
        this.permissions = permissions;
    }

    public int getId()
    {
        return id;
    }

    public String getFirstName()
    {
        return firstName;
    }

    public String getLastName()
    {
        return lastName;
    }

    public String getMail()
    {
        return mail;
    }

    public String getPassword()
    {
        return password;
    }

    public int getPermissions()
    {
        return permissions;
    }

    public void clearOutPassword()
    {
        password = "****";
    }
}
