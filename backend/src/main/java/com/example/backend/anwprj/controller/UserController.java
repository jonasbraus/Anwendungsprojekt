package com.example.backend.anwprj.controller;

import com.example.backend.discard.Encryption.RSA;
import com.example.backend.anwprj.Database.DataBaseHandler;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Users.UserPermissions;
import com.example.backend.anwprj.Users.UserSessionIDHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


/*
Hier sind einige nutzer funktionen mehr, als für das tool benötigt werden. Diese dienen nur testzwecken
zum verwalten von nutzer z.b. über postman.
 */
@RestController
public class UserController {
    //reference to the database handler
    private DataBaseHandler db;

    {
        db = DataBaseHandler.getInstance();
    }

    //hole alle user, nur erlaubt für admins
    @CrossOrigin
    @GetMapping("/users/all")
    public ResponseEntity<User[]> getAllUsers(@RequestParam(name = "sessionid") String sessionid)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionid);

        if(u != null && u.getPermissions() == UserPermissions.admin.getValue())
        {
            User[] output = db.getAllUsers();
            return new ResponseEntity<>(output, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }


    //a user wants to login
    @CrossOrigin
    @GetMapping("/users")
    public ResponseEntity<String> login(@RequestParam(name = "mail") String mail, @RequestParam(name = "password") String password) {
        //generate a session id for the user trying to login
        boolean isEncrypted = false;
        if(isEncrypted)
        {
            RSA rsa = RSA.getInstance();
            byte[] psw = rsa.loadByteArray(password);
            try {
                password = rsa.decrypt(psw);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        mail = mail.toLowerCase();
        String sessionID = UserSessionIDHandler.addUser(mail, password);

        return new ResponseEntity<>(sessionID, HttpStatus.OK);
    }

    //ein nutzer möchte sich ausloggen, damit sollte seinen sessionid entfernt werden.
    @CrossOrigin
    @GetMapping("/users/logout")
    public ResponseEntity<Boolean> logout(@RequestParam(name = "sessionid") String sessionID) {
        boolean success = UserSessionIDHandler.removeUser(sessionID);
        return new ResponseEntity<>(success, HttpStatus.OK);
    }

    //admins können hier die daten eiens nutzer anfordern.
    @CrossOrigin
    @GetMapping("/users/data")
    public ResponseEntity<User> getUserData(
            @RequestParam(name = "sessionid") String sessionID,
            @RequestParam(name = "mail") String mail) {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionID);

        if (sessionUser != null) {
            System.out.println(sessionUser.getMail() + " " + mail);

            if (sessionUser.getMail().equals(mail) || sessionUser.getPermissions() == UserPermissions.admin.getValue()) {
                User searchedUser = db.getUser(mail);
                return new ResponseEntity<>(searchedUser, HttpStatus.OK);
            }
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    @CrossOrigin
    @GetMapping("/users/check")
    public ResponseEntity<User> checkLogin(@RequestParam(name="sessionid") String sessionid)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionid);

        if(u != null)
        {
            return new ResponseEntity<>(db.getUser(u.getId()), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    //adds a new user to the database (cannot create an admin user)
    @CrossOrigin
    @PostMapping("/users")
    public ResponseEntity<String> addUser(@RequestBody User user) {
        User checkUser = db.getUser(user.getMail());

        if (checkUser != null) {
            return new ResponseEntity<>("mail", HttpStatus.FORBIDDEN);
        }

        //if user was successfully added to database
        User u = db.addUser(user);

        if (u != null) {
            //generate a session id
            return new ResponseEntity<String>(UserSessionIDHandler.addUser(user.getMail(), user.getPassword()), HttpStatus.OK);
        }

        return new ResponseEntity<String>(HttpStatus.BAD_REQUEST);
    }

    @CrossOrigin
    @PutMapping("/users")
    public ResponseEntity<Boolean> updateUser(@RequestParam(name = "sessionid") String sessionID, @RequestBody User u, @RequestParam(name = "mail") String mail) {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionID);

        if (sessionUser != null) {
            if (sessionUser.getMail().equals(mail) || sessionUser.getPermissions() == UserPermissions.admin.getValue()) {
                System.out.println(sessionUser.getId());

                User resultingUser = db.updateUser(u, sessionUser.getId(), false);

                if (resultingUser != null) {
                    UserSessionIDHandler.removeUser(sessionID);
                    return new ResponseEntity<>(true, HttpStatus.OK);
                }

                return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
            }
        }

        return new ResponseEntity<>(false, HttpStatus.FORBIDDEN);
    }

    //rechte eines nutzers erhöhen, kann nur von admins ausgeführt werden.
    @CrossOrigin
    @PutMapping("/users/elevate")
    public ResponseEntity<Boolean> elevateUser(
            @RequestParam(name = "sessionid") String sessionID,
            @RequestParam(name = "mail") String mail,
            @RequestParam(name = "permission") int permission)
    {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionID);

        if(sessionUser != null && sessionUser.getPermissions() == UserPermissions.admin.getValue())
        {
            System.out.println("test");
            User userToUpdateTemplate = db.getUser(mail);
            User userToUpdate = new User(userToUpdateTemplate.getId(), userToUpdateTemplate.getFirstName(), userToUpdateTemplate.getLastName(),
                    userToUpdateTemplate.getMail(), userToUpdateTemplate.getPassword(), permission);

            User resultingUser = db.updateUser(userToUpdate, userToUpdate.getId(), true);

            if(resultingUser == null)
            {
                return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(true, HttpStatus.OK);
        }

        return new ResponseEntity<>(false, HttpStatus.FORBIDDEN);
    }

    @CrossOrigin
    @DeleteMapping("/users")
    public ResponseEntity<Boolean> deleteUser(@RequestParam(name = "sessionid") String sessionID, @RequestParam(name = "mail") String mail) {
        User sessionUser = UserSessionIDHandler.getUserBySessionID(sessionID);

        if (sessionUser != null && sessionUser.getPermissions() == UserPermissions.admin.getValue()) {
            return new ResponseEntity<>(db.deleteUser(mail), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

}
