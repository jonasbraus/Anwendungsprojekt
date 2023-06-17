package com.example.backend.anwprj.Database;

import com.example.backend.discard.Encryption.RSA;
import com.example.backend.anwprj.Entries.Entry;
import com.example.backend.anwprj.Semesters.Semester;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Module.Module;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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
            );
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


    public Entry[][] getAllEntrys(int semesterid, int daynumber, int yearnumber, int userid) {
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


    public Entry[] getAllEntries()
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

    public Entry[] getAllEntriesModule(int moduleid)
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

    public void deleteEntry(int id) {
        try {
            st.executeUpdate("delete from entries where id=" + id);
        } catch (Exception e) {

        }
    }

    public void updateEntry(Entry entry) {
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

    public Semester getSemester(int id) {
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

    public Semester updateSemester(Semester semester) {
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

    public void deleteSemester(int id) {
        try {
            st.executeUpdate("DELETE FROM modules WHERE semesterid=" + id);
            st.executeUpdate("delete from semester where id=" + id);
            st.executeUpdate("delete from entries where semesterid=" + id);
        } catch (Exception e) {

        }
    }

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

    public Module getModule(int userid, int semesterid) {
        try {
            ResultSet rs = st.executeQuery("select * from modules where userid=" + userid + " and semesterid=" + semesterid);

            return resultSetToModule(rs);
        } catch (Exception e) {
            return null;
        }
    }

    //get module objects by its semester and its lecturer
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

    public Module updateModule(Module m) {

        try {


            st.executeUpdate("update modules set activated=" + m.getActivated() + ", semesterid=" + m.getsemesterid() + ", name='" + m.getName() + "' where id=" + m.getid());


            return getModule(m.getid());
        } catch (SQLException ex) {
            ex.printStackTrace();
            return null;
        }
    }

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

    public boolean deleteModule(int id) {
        try {
            st.executeUpdate("delete from modules where id=" + id);
            st.executeUpdate("delete from entries where moduleid=" + id);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

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

    //einen User
    public User getUser(String mail, String password) {

        try {
            ResultSet rs = st.executeQuery("select * from users where mail = '" + mail + "' and password = '" + password + "'");
            return resultSetToUser(rs);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public User getUser(int id) {
        try {
            ResultSet rs = st.executeQuery("select * from users where id=" + id);
            return resultSetToUser(rs);
        } catch (Exception e) {
            return null;
        }
    }

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
