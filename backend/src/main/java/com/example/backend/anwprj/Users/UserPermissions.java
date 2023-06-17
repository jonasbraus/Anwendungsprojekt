package com.example.backend.anwprj.Users;

//mapping of the integer rights to enum
public enum UserPermissions
{
    self(0),
    admin(1);

    private final int value;

    public int getValue()
    {
        return value;
    }

    private UserPermissions(int value)
    {
        this.value = value;
    }
}
