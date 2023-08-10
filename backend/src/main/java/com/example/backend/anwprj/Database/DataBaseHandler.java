package com.example.backend.anwprj.Database;

import com.example.backend.discard.Encryption.RSA;
import com.example.backend.anwprj.Entries.Entry;
import com.example.backend.anwprj.Semesters.Semester;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Module.Module;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//kleiner hinweis zur Datenbank:
//die datenkbank H2 benötigt die beiden dateien database.mv.db und database.trace.db
//um die datenbank verwenden zu können muss der jdbc driver in das projekt eingebunden sein.
//dieser driver liegt im ordner als h2jdbcdriver als .jar datei
//der nutzername für die datenbank ist: adm
//das passwort für die datenbank ist: 73bgjfdsfJ!934
//die datenbank als einzelnes kann entweder über die h2console (windows) oder jetbrains datagrip (alle systeme) editiert werden.
//oder über jedes weitere tool welches h2 datenbanken unterstützt.
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
public class DataBaseHandler {
    //singleton instance of database handler
    private static DataBaseHandler instance = null;

    public static DataBaseHandler getInstance() {
        if (instance == null) {
            instance = new DataBaseHandler();
        }

        return instance;
    }

    //connection to the database
    private Connection connection;
    //sql statement
    private Statement st;
    private boolean encrypted = false;

    public DataBaseHandler() {
        try {
            //connect to the local database
            connection = DriverManager.getConnection("jdbc:h2:./database", "adm", "73bgjfdsfJ!934");
            st = connection.createStatement();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    /**
     * ENTRIES
     */
    public void addEntry(Entry entry)
    {
        try
        {
            st.executeUpdate("insert into entries (daynumber, yearnumber, semesterid, usercreatedbyid, timestart, timeend, moduleid, info) values (" +
                    entry.getDaynumber() + ", " + entry.getYearnumber() + ", " + entry.getSemesterid() + ", " +
                    entry.getUsercreatedbyid() + ", " + entry.getTimestart() + ", " + entry.getTimeend() + ", " + entry.getModuleid() + " ,'" + entry.getInfo() + "')"
            ); //Datenbank Eintrag eines neu erstellten Entry mit allen nötigen Informationen
        }
        catch(Exception e)
        {
            e.printStackTrace();
        }
    }

    public Entry[][] getEntries(int semesterid, int daynumber, int yearnumber) {
        try {
            ResultSet rs = st.executeQuery("select * from entries where " +
                    "semesterid=" + semesterid +
                    " and yearnumber=" + yearnumber +
                    " and daynumber between " + daynumber + " and " + daynumber + 6);

            List<Entry> entryList = new ArrayList<>();
            Entry current = null;
            while ((current = resultSetToEntry(rs)) != null) {
                entryList.add(current);
            } //Datenbankanfrage für alle Entries bei denen die Semesterid, das Jahr und der Tag mit den übergebenen Paramtern übereinstimmt

            Entry[][] entries = new Entry[6][20];
            for (int i = 0; i < 6; i++) //durchlaufe die Anzahl der Tage einer Vorlesungswoche (Montag,...,Samstag)
            {
                int f = 0;

                for (int j = 0; j < entryList.size(); j++)
                {
                    if (entryList.get(j).getDaynumber() == i + daynumber) {
                        entries[i][f] = entryList.get(j); //belade das Array "entries" mit dem entries einer woche
                        f++;
                    }
                }
            }

            return entries; //gib das Array "entries" zurück
        } catch (Exception e) {
            return null;
        }
    }


    public Entry[][] getAllEntrys(int semesterid, int daynumber, int yearnumber, int userid) //Datenbankanfrage für alle Entries eines Users in einem Semester
    {
        try {
            ResultSet rs = st.executeQuery("select * from entries where " +
                    "semesterid<>" + semesterid +
                    " and yearnumber=" + yearnumber +
                    " and usercreatedbyid=" + userid +
                    " and daynumber between " + daynumber + " and " + daynumber + 6);
            List<Entry> entryList = new ArrayList<>();
            Entry current = null;
            while ((current = resultSetToEntry(rs)) != null) {
                entryList.add(current);
            }
            Entry[][] entries = new Entry[6][20];
            for (int i = 0; i < 6; i++) {
                int f = 0;

                for (int j = 0; j < entryList.size(); j++) {
                    if (entryList.get(j).getDaynumber() == i + daynumber) {
                        entries[i][f] = entryList.get(j);
                        f++;
                    }
                }
            }
            return entries;
        } catch (Exception e) {
            return null;
        }
    }


    public Entry[] getAllEntries() //Datenbankanfrage für alle Entries
    {
        try {
            ResultSet rs = st.executeQuery("select * from entries");
            List<Entry> entriestate = new ArrayList<>();
            Entry current  = null;
            while((current = resultSetToEntry(rs)) != null)
            {
                entriestate.add(current);
            }
            return entriestate.toArray(new Entry[0]);
        }catch (Exception e){
            System.out.println(e.getMessage());

            return null;
        }
    }

    public Entry[] getAllEntriesModule(int moduleid) //Datenbankanfrage für alle Entries eines spezifischen Moduls
    {
        try {
            ResultSet rs = st.executeQuery("select * from entries where moduleid=" + moduleid);
            List<Entry> result = new ArrayList<>();
            Entry current = null;
            while((current = resultSetToEntry(rs)) != null)
            {
                result.add(current);
            }

            return result.toArray(new Entry[0]);
        }
        catch(Exception e)
        {
            return new Entry[]{};
        }
    }

    public void deleteEntry(int id) //Löschung eines spezifischen entries
    {
        try {
            st.executeUpdate("delete from entries where id=" + id);
        } catch (Exception e) {

        }
    }

    public void updateEntry(Entry entry) //Aktualisiere Einträge eines Entry falls es verändert wurde
    {
        try {
            st.executeUpdate("update entries set timeend=" + entry.getTimeend() + ", timestart=" + entry.getTimestart() + " where id=" + entry.getId());
        } catch (Exception e) {

        }
    }

    public Entry resultSetToEntry(ResultSet rs)
    {
        try
        {
            rs.next();
            return new Entry(
                    rs.getInt("id"),
                    rs.getInt("daynumber"),
                    rs.getInt("yearnumber"),
                    rs.getInt("usercreatedbyid"),
                    rs.getInt("timestart"),
                    rs.getInt("timeend"),
                    rs.getInt("semesterid"),
                    rs.getInt("moduleid"),
                    rs.getString("info")
            );
        }
        catch(Exception e)
        {
            return null;
        }
    }


    /**
     * SEMESTER
     */
    //get a semester object by its name
    public Semester getSemester(String name) {
        try {
            ResultSet rs = st.executeQuery("select * from SEMESTER where name = '" + name + "'");
            return resultSetToSemester(rs);
        } catch (Exception e) {
            return null;
        }
    }

    public Semester getSemester(int id)
    {
        try {
            ResultSet rs = st.executeQuery("select * from semester where id=" + id);
            return resultSetToSemester(rs);
        } catch (Exception e) {
            return null;
        }
    }

    //write a new semester to the database returns if process was successful
    public Semester addSemester(Semester s) {
        try {
            st.executeUpdate("insert into SEMESTER (startday, endday, name, startyear, endyear, number) values (" + s.getStartday() + ", " + s.getEndday() + ", '" + s.getName() + "', " + s.getStartyear() + ", " + s.getEndyear() + ", " + s.getNumber() + ")");
            return getSemester(s.getName());

        } catch (Exception e) {
            return null;
        }
    }

    public Semester[] getAllSemesters() {
        try {
            ResultSet rs = st.executeQuery("select * from semester");
            List<Semester> semestersList = new ArrayList<>();
            Semester s = null;
            while ((s = resultSetToSemester(rs)) != null) {
                semestersList.add(s);
            }

            return semestersList.toArray(new Semester[0]);
        } catch (Exception e) {
            return null;
        }
    }

    public Semester updateSemester(Semester semester) //Aktualisiere die Einträge eines Semesters bei Veränderungen durch editier Funktion
    {
        try {
            st.executeUpdate("update semester set startday=" + semester.getStartday() + ", " +
                    "endday=" + semester.getEndday() + ", " +
                    "name='" + semester.getName() + "', " +
                    "startyear=" + semester.getStartyear() + ", " +
                    "number=" + semester.getNumber() + ", " +
                    "endyear=" + semester.getEndyear() + " where id=" + semester.getId());

            return getSemester(semester.getId());
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    //ist dafür da, um ein semester anhand seiner id aus der datenbank zu löschen
    public void deleteSemester(int id) {
        try {
            st.executeUpdate("DELETE FROM modules WHERE semesterid=" + id);
            st.executeUpdate("delete from semester where id=" + id);
            st.executeUpdate("delete from entries where semesterid=" + id);
        } catch (Exception e) {

        }
    }

    //kann ein resultset der datenbank in ein internes semester objekt umwandeln.
    public Semester resultSetToSemester(ResultSet rs) {
        try {
            rs.next();
            return new Semester(
                    rs.getInt("id"),
                    rs.getInt("startday"),
                    rs.getInt("endday"),
                    rs.getString("name"),
                    rs.getInt("startyear"),
                    rs.getInt("endyear"),
                    rs.getInt("number")
            );
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * MODULE
     */

    //get a module object by its id
    public Module getModule(int id) {
        try {
            ResultSet rs = st.executeQuery("SELECT * FROM modules WHERE id=" + id);
            return resultSetToModule(rs);
        } catch (Exception ex) {
            return null;
        }
    }

    //ein modul anhand der zuweisung von dozent und semester bekommen.
    public Module getModule(int userid, int semesterid) {
        try {
            ResultSet rs = st.executeQuery("select * from modules where userid=" + userid + " and semesterid=" + semesterid);

            return resultSetToModule(rs);
        } catch (Exception e) {
            return null;
        }
    }

    //bekomme alle modulzuweisungen, die zu einem dozenten gehören.
    public Module[] getModules(int userid) {
        try {
            ResultSet rs = st.executeQuery("SELECT * FROM modules WHERE userid = " + userid);
            List<Module> moduleList = new ArrayList<>();
            Module m = null;
            while ((m = resultSetToModule(rs)) != null) {
                moduleList.add(m);
            }

            return moduleList.toArray(new Module[0]);

        } catch (Exception ex) {
            return null;
        }
    }

    //füge eine neue modulzuweisung zwischen dozenten und fächern hinzu
    public Module addModule(Module m) {
        try {
            st.executeUpdate("insert into modules (userid, semesterid, name, activated) " +
                    "Values (" + m.getUserid() + ", " + m.getsemesterid() + ", '" + m.getName() + "', " + m.getActivated() + ")");
            return getModule(m.getUserid(), m.getsemesterid());

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    //gibt alle zuweisungen zurück.
    public Module[] getAllModules() {
        try {
            ResultSet rs = st.executeQuery("SELECT * FROM modules");
            List<Module> moduleList = new ArrayList<>();
            Module m = null;
            while ((m = resultSetToModule(rs)) != null) {
                moduleList.add(m);
            }

            return moduleList.toArray(new Module[0]);
        } catch (Exception e) {
            return null;
        }
    }

    //updatet eine zuweisung anhand ihrer id
    public Module updateModule(Module m) {

        try {


            st.executeUpdate("update modules set activated=" + m.getActivated() + ", userid=" + m.getUserid() + " where id=" + m.getid());


            return getModule(m.getid());
        } catch (SQLException ex) {
            ex.printStackTrace();
            return null;
        }
    }

    //setzt die aktivierung einer modulzuweisung zurück.
    public void submitModule(int id)
    {
        try
        {
            st.executeUpdate("update modules set activated=0 where id=" + id);
        }
        catch(Exception e)
        {

        }
    }

    //kann alle modulzuweisungen innerhalb eines semesters löschen.
    //hierbei werden auch alle termine mit gelöscht.
    public boolean deleteModuleBySemesterID(int id) {
        try {
            st.executeUpdate("delete from modules where semesterid=" + id);
            st.executeUpdate("delete from entries where semesterid=" + id);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    //kann eine einzelne modulzuweisung anhand ihrer id löschen.
    //hierbei werden auch alle zu dieser zuweisung gehörigen termine gelöscht
    public boolean deleteModule(int id) {
        try {
            st.executeUpdate("delete from modules where id=" + id);
            st.executeUpdate("delete from entries where moduleid=" + id);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    //kann ein result set der datenbank in ein internes modul objekt umwandeln.
    public Module resultSetToModule(ResultSet rs) {
        try {
            rs.next();
            return new Module(
                    rs.getInt("id"),
                    rs.getInt("userid"),
                    rs.getInt("semesterid"),
                    rs.getString("name"),
                    rs.getInt("activated"));
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * USER
     */

    //Alle User, die nicht admin sind
    public User[] getAllUsers() {
        try {
            ResultSet rs = st.executeQuery("select * from users where permission=0");

            User u = null;

            List<User> output = new ArrayList<>();

            while ((u = resultSetToUser(rs)) != null) {
                u.clearOutPassword();
                output.add(u);
            }

            return output.toArray(new User[0]);
        } catch (Exception e) {
            return null;
        }
    }

    //einen User anhand seiner email und passwort zurückgeben.
    public User getUser(String mail, String password) {

        try {
            ResultSet rs = st.executeQuery("select * from users where mail = '" + mail + "' and password = '" + password + "'");
            return resultSetToUser(rs);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    //einen nutzer andhand seiner id zurückgeben.
    //diese funktion sollte nur für admins verfügbar sein.
    public User getUser(int id) {
        try {
            ResultSet rs = st.executeQuery("select * from users where id=" + id);
            return resultSetToUser(rs);
        } catch (Exception e) {
            return null;
        }
    }

    //ein nutzer anhand seiner mail zurückgeben. diese funktion sollte nur für admins erreichbar sein.
    public User getUser(String mail) {
        try {
            ResultSet rs = st.executeQuery("select * from users where mail='" + mail + "'");
            User u = resultSetToUser(rs);
            if (u != null) u.clearOutPassword();

            return u;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    //kann ein result set der datenbank in ein internes nutzer objekt umwandeln.

    public User resultSetToUser(ResultSet rs) {
        try {
            rs.next();
            return new User(
                    rs.getInt("id"),
                    rs.getString("firstname"),
                    rs.getString("lastname"),
                    rs.getString("mail"),
                    rs.getString("password"),
                    rs.getInt("permission")
            );
        } catch (Exception e) {
            return null;
        }
    }

    //add a new user object to the database returns if process was successful
    public User addUser(User user) {
        //check if mail and passwort (key user information) is given
        if (user.getMail() == null || user.getPassword() == null) {
            return null;
        }

        try {
            String password = user.getPassword();
            if (encrypted) {
                RSA rsa = RSA.getInstance();
                byte[] psw = rsa.loadByteArray(password);
                try {
                    password = rsa.decrypt(psw);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            st.executeUpdate("insert into users (firstname, lastname, mail, password, permission) values (" + "'" + user.getFirstName() + "', '" + user.getLastName() + "', '" + user.getMail() + "', '" + password + "', " + 0 + ")");
            return getUser(user.getMail(), user.getPassword());
        } catch (Exception e) {
            return null;
        }

    }

    //kann einen nutzer updaten, aber auch dessen rechte verändern, hierbei werden die rechte nur angepasst,
    //wenn der boolean elevationRequestByAdmin true ist
    public User updateUser(User user, int id, boolean elevationRequestByAdmin) {
        try {
            String password = user.getPassword();
            if (encrypted) {
                RSA rsa = RSA.getInstance();
                byte[] psw = rsa.loadByteArray(password);
                try {
                    password = rsa.decrypt(psw);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            if (!elevationRequestByAdmin) {
                st.executeUpdate("update users set " +
                        "firstname='" + user.getFirstName() + "', " +
                        "lastname='" + user.getLastName() + "', " +
                        "mail='" + user.getMail() + "', " +
                        "password='" + password + "' " +
                        "where id=" + id);
            } else {
                st.executeUpdate("update users set " +
                        "firstname='" + user.getFirstName() + "', " +
                        "lastname='" + user.getLastName() + "', " +
                        "mail='" + user.getMail() + "', " +
                        "password='" + password + "'," +
                        "permission=" + user.getPermissions() +
                        "where id=" + id);
            }

            return getUser(id);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    //hier kann ein nutzer anhand seiner email addresse gelöscht werden.
    //diese funktion sollte nur für den eigenen nutzer oder für admins verfügbar sein.
    public boolean deleteUser(String mail) {
        try {
            ResultSet rs = st.executeQuery("SELECT id FROM user WHERE mail='" + mail + "'");
            rs.next();
            int id = rs.getInt("id");
            st.executeUpdate("DELETE FROM modules WHERE lecturerId = " + id);

            st.executeUpdate("delete from users where mail='" + mail + "'");
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
