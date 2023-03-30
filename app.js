const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

module.exports = app;

let db = null;

const dbPath = path.join(__dirname, "moviesData.db");
//console.log(dbPath);

const convertMovieTable = (objectOf) => {
  return {
    movieId: objectOf.movie_id,
    directorId: objectOf.director_id,
    movieName: objectOf.movie_name,
    leadActor: objectOf.lead_actor,
  };
};

const convertDirectorTable = (objectOf) => {
  return {
    directorId: objectOf.director_id,
    directorName: objectOf.director_name,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB ERROR : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API_1

app.get("/movies/", async (request, response) => {
  const dbQuery = `
        SELECT movie_name
        FROM movie ; `;
  let movieNames = await db.all(dbQuery);
  let reqNames = movieNames.map((eachObject) => convertMovieTable(eachObject));
  response.send(reqNames);
});

//API_2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postQuery = `
    INSERT INTO movie
        (director_id,movie_name,lead_actor)
    VALUES 
        (
        ${directorId},
        '${movieName}',
        '${leadActor}'    
        );`;
  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

//API_3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const reqQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId} ;`;
  let reqMovie = await db.get(reqQuery);
  reqMovie = convertMovieTable(reqMovie);
  response.send(reqMovie);
});

//API_4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const { directorId, movieName, leadActor } = request.body;
  const reqQuery = `
    UPDATE movie
    SET
        director_id='${directorId}',

        movie_name='${movieName}',

        lead_actor ='${leadActor}'

    WHERE

      movie_id = ${movieId};`;
  await db.run(reqQuery);
  response.send("Movie Details Updated");
});

//API_5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const sqlQuery = `
    DELETE 
    FROM movie 
    WHERE movie_id = ${movieId}; `;
  await db.run(sqlQuery);
  response.send("Movie Removed");
});

//API_6
app.get("/directors/", async (request, response) => {
  const dbQuery = `
        SELECT *
        FROM director ; `;
  let directorsList = await db.all(dbQuery);
  let reqNames = directorsList.map((eachObject) =>
    convertDirectorTable(eachObject)
  );
  response.send(reqNames);
});

//API_7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  console.log(directorId);
  const sqlQuery = `
    SELECT movie_name 
    FROM director 
        LEFT JOIN movie ON 
        movie.director_id = director.director_id AS new_table
    WHERE 
        new_table.director_id = ${directorId};`;
  console.log(sqlQuery);
  let moviesOfDirectorArray = await db.all(sqlQuery);
  moviesOfDirectorArray = moviesOfDirectorArray.map((eachObject) =>
    convertMovieTable(eachObject)
  );
  response.send(moviesOfDirectorArray);
});
