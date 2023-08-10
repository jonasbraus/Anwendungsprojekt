package com.example.backend.anwprj.Users;

// zuweisung der zahlen 0 für normaler user / dozenten und 1 für admin.
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
