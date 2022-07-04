# Node.js REST API

Implementation of an Identity Management System using Node.js, Express.js, MongoDB, and Redis.

## Install Dependencies

```shell
$ cd /path/to/project
$ npm install
```

## Requirements

Install MongoDB and Redis on your system.

## Configure MongoDB

```shell
$ cd /path/to/project
$ npm run start-mongodb-server
```

## Start REST API

```shell
$ cd /path/to/project
$ npm start
```

## API Routes

The implemented routes for the REST API are as follows:

- POST `/api/register`: User sign-up (not jwt auth is required)
- POST `/api/authenticate`: User sign-in (generates jwt token and stores it in Redis, no jwt auth is required)
- PUT `/api/users/:email`: Users can edit their credentials (jwt auth is required)
- DELETE `/api/users/:email`: Users sign-out (jwt auth is required)
- GET `/admin/users/:email`: Admin can get one user (jwt auth is required)
- POST `/admin/users`: Admin can get all users (limit is supported, jwt auth is required)
- PUT `/admin/users/:email`: Admin can update a user (jwt auth is required)
- DELETE `/admin/users/:email`: Admin can delete a user (jwt auth is required)

One sample admin user will be created on the first run.