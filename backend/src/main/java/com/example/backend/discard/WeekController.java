package com.example.backend.discard;

import com.example.backend.anwprj.Database.DataBaseHandler;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Users.UserPermissions;
import com.example.backend.anwprj.Users.UserSessionIDHandler;
import org.springframework.http.HttpStatus;
import com.example.backend.discard.Week.Week;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;

@RestController
public class WeekController
{

//    private DataBaseHandler db;
//
//    {
//        db = DataBaseHandler.getInstance();
//    }
//
//    @CrossOrigin
//    @GetMapping("/weeks")
//    public ResponseEntity<Week> getWeek(
//            @RequestParam(name="sessionid") String sessionID,
//            @RequestParam(name="semesterid") int semesterID,
//            @RequestParam(name="weeknumber") int weekNumber) throws SQLException {
//        User u = UserSessionIDHandler.getUserBySessionID(sessionID);
//
//        if(u != null)
//        {
//            Week w = db.getWeek(semesterID,weekNumber);
//
//            if(w != null)
//            {
//                return new ResponseEntity<>(w, HttpStatus.OK);
//            }
//            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
//        }
//        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
//    }
//
//    @CrossOrigin
//    @PostMapping("/weeks")
//    public ResponseEntity<Week> addWeek(@RequestBody Week week, @RequestParam(name="sessionid") String sessionID)
//    {
//        User u = UserSessionIDHandler.getUserBySessionID(sessionID);
//
//        if(u !=null && u.getPermissions() == UserPermissions.admin.getValue())
//        {
//            return new ResponseEntity<>(db.addWeek(week), HttpStatus.OK);
//        }
//
//        return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
//    }
}

