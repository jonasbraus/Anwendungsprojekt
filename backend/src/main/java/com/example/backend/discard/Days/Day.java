package com.example.backend.discard.Days;

public class Day
{
    private int id;
    private int dayinyear;
    private int yearnumber;
    private int semesterid;

    public Day(int id, int dayinyear, int yearnumber, int semesterid) {
        this.id = id;
        this.dayinyear = dayinyear;
        this.yearnumber = yearnumber;
        this.semesterid = semesterid;
    }

    public int getId() {
        return id;
    }

    public int getDayinyear() {
        return dayinyear;
    }

    public int getYearnumber() {
        return yearnumber;
    }

    public int getSemesterid() {
        return semesterid;
    }
}
