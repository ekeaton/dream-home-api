# DreamHome

Description
-----------
DreamHome is for the dreamer, the builder and the visionary. Ideal for home builders and remodelers, DreamHome brings 
the most popular home plans to you and provides a convenient section to leave notes on your favorites. 
 
Coming soon to DreamHome, virtual home vision boards at your fingertips. Each board is conveniently separated, allowing you  to keep your images organized per room. Found the perfect flooring for your kitchen? Save it to your kitchen board, it's that easy. Ideal for anyone who wants to create a vision board of what their ideal dream home would look like. 

Live Demo
----------
* [Live Demo](https://dream-home-app.ekeaton.now.sh/)

### Link to Front-end
------------------
* [Front-end GitHub](https://github.com/ekeaton/dream-home-app)

### Installing
Install the dependencies and devDependencies and start the server.
```
npm install  
npm start
```
### Testing
To run back-end tests run `npm test` in terminal.

### Schema
#### User
``` 
(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    email CHAR(255) NOT NULL,
    password CHAR(10) NOT NULL
);
```
   

#### Notes
```
(
  CREATE TABLE notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  sq_ft INTEGER,
  note TEXT
);
```

#### API Overview
```
/api
.
|__ /notes
|   |__ GET
|   |    |__ /
|   |    |__ /:note_id
|   |__ POST
|   |   |__ /
|   |__ DELETE
|   |   |__ /:note_id   
|__ /users
|    |__ POST
|    |    |__ /
|    |__ GET
|    |    |__ /
|    |    |__ /user
|    |__PATCH
|    |  |__ /user
|    |__ DELETE
|        |__ /user
```

#### GET /api/notes
```
// res.body
[
  {
    id: Number,
    name: String,
    bedrooms: Number,
    bathrooms: Number,
    sq_ft: Number,
    note: String
  }  
]
``` 

#### GET /api/notes/:note_id
```

// req.params
  note_id: Number

// res.body
[
  {
    id: Number,
    name: String,
    bedrooms: Number,
    bathrooms: Number,
    sq_ft: Number,
    note: String
  }  
]
```

#### POST /api/notes
```
// req.body
{
   name: String,
   bedrooms: Number,
   bathrooms: Number,
   sq_ft: Number,
   note: String
}
```

#### DELETE /api/notes/:note_id
```
// req.params
  note_id: Number
```

#### GET /api/users
```
// res.body
[
  {
    name: String,
    email: String,
    password: String
  }
]
```

#### GET /api/users/user
```
// req.user
id: Number

// res.body
[
  {
    name: String,
    email: String,
    password: String
  }
]
```

#### POST /api/users
```
// req.body
{
  name: String,
  email: String,
  password: String
}

// res.body
[
  {
    id: Number,
    name: String,
    email: String,
    password: String
  }
]
```

#### DELETE /api/users/user
```
// req.user
id: Number
```

#### PATCH /api/plants/user
```
// req.body
{
  name: String,
  email: String,
  password: String
}
```
