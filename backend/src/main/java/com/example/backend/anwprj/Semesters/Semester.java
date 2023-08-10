package com.example.backend.anwprj.Semesters;

//klasse für die interne darstellung von semestern.
public class Semester
{
    private int id;
    private int startday;
    private int endday;
    private String name;
    private int startyear;
    private int endyear;
    private int number;

    public Semester(int id, int startday, int endday, String name, int startyear, int endyear, int number) {
        this.id = id;
        this.startday = startday;
        this.endday = endday;
        this.name = name;
        this.startyear = startyear;
        this.endyear = endyear;
        this.number = number;
    }

    public int getId() {
        return id;
    }

    public int getStartday() {
        return startday;
    }

    public int getEndday() {
        return endday;
    }

    public String getName() {
        return name;
    }

    public int getStartyear() {
        return startyear;
    }

    public int getEndyear() {
        return endyear;
    }

    public int getNumber(){return number; }
}
