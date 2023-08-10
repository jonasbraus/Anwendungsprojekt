package com.example.backend.anwprj.controller;

import com.example.backend.anwprj.Database.DataBaseHandler;
import com.example.backend.anwprj.Semesters.Semester;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Users.UserPermissions;
import com.example.backend.anwprj.Users.UserSessionIDHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class SemesterController
{
    //reference to the database handler
    private DataBaseHandler db;

    {
        db = DataBaseHandler.getInstance();
    }

    //get a semester object by its name
    @CrossOrigin
    @GetMapping("/semester")
    public ResponseEntity<Semester> getSemester(@RequestParam(name="name") String name, @RequestParam(name="sessionid") String sessionID)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionID);

        if(u != null)
        {
            Semester s = db.getSemester(name);
            if (s != null)
            {
                return new ResponseEntity<>(s, HttpStatus.OK);
            }

            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    //get a semester object by its id
    @CrossOrigin
    @GetMapping("/semester/id")
    public ResponseEntity<Semester> getSemester(@RequestParam(name="id") int id, @RequestParam(name="sessionid") String sessionID)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionID);

        if(u != null)
        {
            Semester s = db.getSemester(id);
            if(s != null)
            {
                return new ResponseEntity<>(s, HttpStatus.OK);
            }

            return new ResponseEntity<>(null, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    //takes in a list of semester ids seperatet by an a as list seperator
    @CrossOrigin
    @GetMapping("/semester/id/all")
    public ResponseEntity<Semester[]> getSemestersAll(@RequestParam(name="ids") String ids, @RequestParam(name="sessionid") String sessionid)
    {
        String[] idsSplit = ids.split("a");

        List<Semester> resultList = new ArrayList<>();

        for(int i = 0; i < idsSplit.length; i++)
        {
            int currentID = Integer.parseInt(idsSplit[i]);
            resultList.add(db.getSemester(currentID));
        }

        return new ResponseEntity<>(resultList.toArray(new Semester[0]), HttpStatus.OK);
    }

    //gibt alle semester zurück
    @CrossOrigin
    @GetMapping("/semester/all")
    public ResponseEntity<Semester[]> getSemester(@RequestParam(name="sessionid") String sessionid)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionid);

        if(u != null)
        {
            if(u.getPermissions() == UserPermissions.admin.getValue())
            {
                return new ResponseEntity<>(db.getAllSemesters(), HttpStatus.OK);
            }
        }

        return null;
    }


    //a new semester add is requested (only allowed for admin users)
    @CrossOrigin
    @PostMapping("/semester")
    public ResponseEntity<Semester> addSemester(@RequestBody Semester semester, @RequestParam(name="sessionid") String sessionID)
    {
        User user = UserSessionIDHandler.getUserBySessionID(sessionID);

        if(user.getPermissions() == UserPermissions.admin.getValue())
        {
            Semester s = db.addSemester(semester);
            if(s != null)
            {

                return new ResponseEntity<>(s, HttpStatus.OK);
            }

            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }


        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }


    //updatet ein semester
    @CrossOrigin
    @PutMapping("/semester")
    public ResponseEntity<Semester> updateSemester(@RequestBody Semester semester, @RequestParam(name="sessionid") String sessionID)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionID);
        if(u != null && u.getPermissions() == UserPermissions.admin.getValue())
        {
            Semester s = db.updateSemester(semester);

            if(s != null)
            {
                return new ResponseEntity<>(s, HttpStatus.OK);
            }

            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    //löscht ein semester anhand seiner id
    @CrossOrigin
    @DeleteMapping("/semester")
    public void deleteSemester(@RequestParam(name="sessionid") String sessionid, @RequestParam(name="id") int id)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionid);
        if(u != null && u.getPermissions() == UserPermissions.admin.getValue())
        {
            db.deleteSemester(id);
        }

    }
}
