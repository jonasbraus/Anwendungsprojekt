package com.example.backend.discard;

import com.example.backend.anwprj.Database.DataBaseHandler;
import com.example.backend.discard.Days.Day;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Users.UserPermissions;
import com.example.backend.anwprj.Users.UserSessionIDHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class DayController
{

//    private DataBaseHandler db;
//
//    {
//        db = DataBaseHandler.getInstance();
//    }
//
//    @CrossOrigin
//    @GetMapping("/days")
//    public ResponseEntity<Day> getDay(
//            @RequestParam(name="sessionid") String sessionID,
//            @RequestParam(name="dayinyear") int dayinyear,
//            @RequestParam(name="yearnumber") int yearnumber,
//            @RequestParam(name="semesterid") int semesterID)
//    {
//        User u = UserSessionIDHandler.getUserBySessionID(sessionID);
//
//        if(u != null)
//        {
//            Day d = db.getDay(dayinyear, yearnumber, semesterID);
//
//            if (d != null)
//            {
//                return new ResponseEntity<>(d, HttpStatus.OK);
//            }
//
//            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
//        }
//
//        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
//    }
//
//    @CrossOrigin
//    @PostMapping("/days")
//    public ResponseEntity<Day> addDay(@RequestBody Day day, @RequestParam(name="sessionid") String sessionID)
//    {
//        User u = UserSessionIDHandler.getUserBySessionID(sessionID);
//
//        if(u != null && u.getPermissions() == UserPermissions.admin.getValue())
//        {
//            return new ResponseEntity<>(db.addDay(day), HttpStatus.OK);
//        }
//
//        return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
//    }
}
