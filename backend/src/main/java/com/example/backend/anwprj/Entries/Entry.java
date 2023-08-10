package com.example.backend.anwprj.Entries;

//interne klasse für die darstellung von terminen
public class Entry
{
    private int id;
    private int daynumber;
    private int yearnumber;
    private int usercreatedbyid;
    private int timestart;
    private int timeend;
    private int semesterid;
    private int moduleid;
    private String info;

    public Entry(int id, int daynumber, int yearnumber, int usercreatedbyid, int timestart, int timeend, int semesterid, int moduleid, String info)
    {
        this.id = id;
        this.daynumber = daynumber;
        this.yearnumber = yearnumber;
        this.usercreatedbyid = usercreatedbyid;
        this.timestart = timestart;
        this.timeend = timeend;
        this.semesterid = semesterid;
        this.moduleid = moduleid;
        this.info = info;
    }

    public int getId()
    {
        return id;
    }

    public int getDaynumber()
    {
        return daynumber;
    }

    public int getYearnumber()
    {
        return yearnumber;
    }

    public int getUsercreatedbyid()
    {
        return usercreatedbyid;
    }

    public int getTimestart()
    {
        return timestart;
    }

    public int getTimeend()
    {
        return timeend;
    }

    public int getSemesterid()
    {
        return semesterid;
    }

    public int getModuleid() {return moduleid;}

    public String getInfo()
    {
        return info;
    }
}
