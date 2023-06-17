package com.example.backend.anwprj.Module;

//module data class
public class Module {
    private int id;
    private int userid;
    private int semesterid;
    private String name;
    private int activated;


    public Module(int id, int userid, int semesterid, String name, int activated)
    {
        this.id = id;
        this.userid = userid;
        this.semesterid = semesterid;
        this.name = name;
        this.activated = activated;
    }

    public int getid() { return id; }

    public int getUserid() { return userid; }

    public int getsemesterid() { return semesterid; }

    public String getName() { return name; }

    public int getActivated() { return activated; }

}
