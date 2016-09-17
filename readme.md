# Angular JWT App

This app is designed to demonstrate route-based authentication & authorization within Angular.js and Node.js using ui-Router.

As a demo, the app consists of two users; an admin and a user.

The user has access to public states but not 'admin' states.

The admin has access to all states.



To implement this app, fork & clone this repo, then:

```shell
$ npm install
```

The app requires a dotfile to store JWT secret. To configure, see <https://www.npmjs.com/package/dotenv>.
To configure .env:

```shell
$ touch .env
$ echo SECRET="your_secret_here" >> .env
```

and replace "your_secret_here" with your own private secret.

To start a server, run

```shell
$ nodemon
```

Then navigate browser to: http://localhost:3000/

##API Endpoints

GET /users/signin - public route - returns dummy user object and signed JWT token

GET,POST /api/protected - protected route - returns array of dummy user data

The protected route is only accessible if the JWT is included in the request and verified.
