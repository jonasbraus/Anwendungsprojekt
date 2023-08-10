Projekt von Amira, Ali, Jonas, Alex, Mike

Website can be accessed under: http://lectureplanner.de/ (caution no https, only http)






Hinweise für Lokale Installation:


Hinweis: Alles ist auf Windows getestet, sollte aber auch auf Mac und Linux funktionieren

1. es sollte java in einer der neusten Versionen installiert sein. (Empfehlung Java 20)
Downloadlink: https://www.oracle.com/de/java/technologies/downloads/
Eventuell müssen Sie nach der Installation den PC neu Starten.
Im Terminal können Sie mit "java -version" Ihre aktuelle Java version überprüfen.

2. Für das Frontend muss zusätzlich npm auf dem Computer installiert sein. (Weiteres siehe z.B. hier: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

3. Es sollte feiertagejs installiert sein "npm install feiertagejs" (weiters: https://github.com/sfakir/feiertagejs)





Ausführen des Backends (nicht im "backend" ordner):

1. Öffnen Sie ein Terminal, dort wo die datei "backend.jar" liegt. Achten Sie darauf, dass die Dateien "database.mv.db" und "database.trace.db" im gleichen Ordner
wie die ".jar" Datei liegen.

2. Geben sie im Terminal ein: "java -jar backend.jar"





Ausführen des Frontends:

1. Gehen Sie in den Ordner "anwendung"

2. Öffnen Sie hier ein Terminal und führen den Command "npm run build" aus. (Bitte beachten, dass Feiertagejs vorher hier installiert sein sollte)

3. Führen Sie nun im gleichen Terminal den Command "npm run start" aus.

4. Gehen Sie im Browser auf "http://localhost:3000" oder einem davon abeweichenden Link der im Terminal angezeigt wird.

5. Einloggen können Sie sich mit folgenden User-Daten: 


Sollte das ausführen lokal nicht funktionieren, können Sie das Projekt immer noch über die website http://www.lectureplanner.de betrachten.

Admins:
Email -------------------- Passwort
braus@gmail.com            123
fistik@gmail.com           123

Dozenten:
Email -------------------- Passwort
gloessner@gmail.com        123
birn@mail.com              123
behrends@gmx.de            123
