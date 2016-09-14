## Angular JWT App

This app is designed to demonstrate route-based authentication & authorization within Angular.js and ui-Router.

As a demo, the app consists of two users; an admin and a user.

The user has access to public routes but not 'admin' routes.

The admin has access to all routes.



To implement this app, fork & clone this repo, then:

```shell
$ npm install
```

The app requires a dotfile to store JWT secret. To configure, see <https://www.npmjs.com/package/dotenv>.
To configure .env:

```shell
$ touch .env
$ echo 'SECRET="your_secret_here"' >> .env
```

and replace 'your_secret_here' with your own private secret. In accordance with dotenv, do not share this secret with ANYONE.

To start a server, run

```shell
$ nodemon
```

Then navigate browser to: http://localhost:3000/
