package com.example.backend.discard.Week;

public class Week {

    private int id;
    private int semesterid;
    private int weeknumber;

    public Week(int id, int semesterid, int weeknumber) {
        this.id = id;
        this.semesterid = semesterid;
        this.weeknumber = weeknumber;
    }

    public int getId() {
        return id;
    }

    public int getSemesterid() {
        return semesterid;
    }

    public int getWeeknumber() {
        return weeknumber;
    }
}
