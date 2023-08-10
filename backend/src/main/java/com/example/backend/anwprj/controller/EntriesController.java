package com.example.backend.anwprj.controller;

import com.example.backend.anwprj.Database.DataBaseHandler;
import com.example.backend.anwprj.Entries.Entry;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Users.UserPermissions;
import com.example.backend.anwprj.Users.UserSessionIDHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class EntriesController
{
    private DataBaseHandler db;

    {
        db = DataBaseHandler.getInstance();
    }

    /**
     GET
     a set of entries for a week, based on the semester, the startdaynumber of the week and the year
     Every user is allowed
     */
    @CrossOrigin
    @GetMapping("/entries")
    public ResponseEntity<Entry[][]> getEntries(@RequestParam(name = "semesterid") int semesterid,
                                                @RequestParam(name = "daynumber") int daynumber,
                                                @RequestParam(name = "yearnumber") int yearnumber,
                                                @RequestParam(name = "sessionid") String sessionid)
    {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionid);

        if (sessionUser != null)
        {
            var lonelyEntry = db.getEntries(semesterid, daynumber, yearnumber);
            var happyEntry = db.getAllEntrys(semesterid, daynumber, yearnumber, sessionUser.getId());
            var combinedEntry = new Entry[6][20];
            for (int i = 0; i < 6; i++) {
                var idx = 0;
                for (int j = 0; j < 20; j++) {
                    if (lonelyEntry != null && lonelyEntry[i][j] != null){
                        combinedEntry[i][idx] = lonelyEntry[i][j];
                        idx++;
                    }
                    if (happyEntry != null && happyEntry[i][j] != null){
                        combinedEntry[i][idx] = happyEntry[i][j];
                        idx++;
                    }
                }
            }


            return new ResponseEntity<>(combinedEntry, HttpStatus.OK);
        }

        return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
    }

    @CrossOrigin
    @GetMapping("/entries/all")
    public ResponseEntity<Entry[]> getAllEntries(@RequestParam(name = "sessionid") String sessionid)
    {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionid);
        if (sessionUser != null)
        {
            var entries = db.getAllEntries();

            return new ResponseEntity<>(entries, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    @CrossOrigin
    @GetMapping("/entries/all/module")
    public ResponseEntity<Entry[]> getAllEntriesModule(@RequestParam(name="sessionid") String sessionid, @RequestParam(name="moduleid") int moduleid)
    {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionid);
        if (sessionUser != null)
        {
            return new ResponseEntity<>(db.getAllEntriesModule(moduleid), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

//    @CrossOrigin
//    @GetMapping("/entries")
//    public ResponseEntity<Integer[]> getEntries(@RequestParam(name = "semesterid") int semesterid,
//                                                @RequestParam(name = "sessionid") String sessionid)
//    {
//        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionid);
//        if (sessionUser != null)
//        {
//            var entries = db.getAllEntries(semesterid, sessionUser.getId());
//            var count = 0;
//            for (int i = 0; i < entries.length; i++) {
//                count += entries[i].getTimeend()-entries[i].getTimestart();
//            }
//            return new ResponseEntity<>(new Integer[]{count}, HttpStatus.OK);
//        }
//        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
//    }

    /**
     POST
     A new entry to the database. Every user except of admins is allowed
     */

    @CrossOrigin
    @PostMapping("/entries")
    public ResponseEntity<Boolean> postEntry(@RequestBody Entry entry, @RequestParam(name = "sessionid") String sessionid)
    {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionid);

        if (sessionUser != null && sessionUser.getPermissions() == UserPermissions.self.getValue())
        {
            db.addEntry(entry);
            return new ResponseEntity<>(true, HttpStatus.OK);
        }

        return new ResponseEntity<>(false, HttpStatus.FORBIDDEN);
    }


    /**
     PUT
     Update the endTime of an existing entry in the database. Every user except of admins is allowed
     */

    @CrossOrigin
    @PutMapping("/entries")
    public ResponseEntity<Boolean> updateEntry(@RequestParam(name="sessionid") String sessionid, @RequestBody Entry entry)
    {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionid);
        if (sessionUser != null)
        {
            db.updateEntry(entry);
            return new ResponseEntity<>(true, HttpStatus.OK);
        }

        return new ResponseEntity<>(false, HttpStatus.FORBIDDEN);
    }


    /**
     Delete
     an existing entry from the database
     */
    @CrossOrigin
    @DeleteMapping("/entries")
    public ResponseEntity<Boolean> deleteEntry(@RequestParam(name = "id") int id, @RequestParam(name = "sessionid") String sessionid)
    {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionid);

        if (sessionUser != null)
        {
            db.deleteEntry(id);
            return new ResponseEntity<>(true, HttpStatus.OK);
        }

        return new ResponseEntity<>(false, HttpStatus.FORBIDDEN);
    }

}
