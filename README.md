# Authors of this project: Etienne Caronan & Abhiram Sinnarajah

Login as:
username: _rfortier_
password: _windsor_

to run, first run the mongodb server:
```
mongod --dbpath data/db
```
then on a different terminal:
```
nodemon app.js
```
This WebApp is called HoopHub, a online forum for basketball fans.
Upon reaching the home page user has the option to navigate through
different pages: *NBA*, *COLLEGE* and *INTERNATIONAL* each representing a subgenre of basketball. Each page contains "article cards" that previews an article. 

Preview info pertains to:
1. Author
2. Article Title
3. Article Tags
4. Date Posted

Clicking on a article card directs the user to a article page. 

If a user wants to create an article they must create/use an account to do so.

Enjoy!

