'use strict';

//========== Dependencies ========== //
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superAgent = require('superagent');

// ========== Environment Variable ========== //
require('dotenv').config();

// ========== Server ========== //
const app = express();
const PORT = process.env.PORT || 3000

// ========== App Middleware ========== //
app.use(cors());

// ========== Database Setup ========== //
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', errorHandler);

// ========== Routes ========== //
app.get('/location', dbLocation);
app.get('/weather', getWeather);
app.get('/events', getEventBrite);
app.get('/movies', getMovies);
// app.get('/yelp', getYelp);

app.use('*', (request, response) => response.status(404).send('Something is not showing up'));

// ========== Constructor Function - Locations ========== //
function Location(searchQuery, formatted_address, lat, long) {
  this.search_query = searchQuery;
  this.formatted_address = formatted_address;
  this.latitude = lat;
  this.longitude = long;
}

// ========== Constructor Function - Weather ========== //
function Forecast(summary, time) {
  this.forecast = summary;
  this.time = new Date(time *1000).toDateString();
}

// ========== Constructor Function - Events ========== //
function Event(eventBriteStuff) {
  this.link = eventBriteStuff.url;
  this.name = eventBriteStuff.name.text;
  this.event_date = new Date(eventBriteStuff.local).toDateString();
  this.summary = eventBriteStuff.summary;
}

// ========== Constructor Function - Yelp ========== //
function Yelp(yelpData) {
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
}

// ========== Constructor Function - Movie ========== //
function Movies(movieData) {
  this.title = movieData.title;
  this.overview = movieData.overview;
  this.votes_average = movieData.vote_average;
  this.votes_total = movieData.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${movieData.poster_path}`;
  this.popularity = movieData.popularity;
  this.released = movieData.release_date;
}

let currentLocation = '';
let lat = 0;
let long = 0;

// ========== Get Location from Database ========== //
function dbLocation(request, response) {
  let searchQuery = request.query.data;
  console.log('SEARCH QUERY:', searchQuery);
  let sql = 'SELECT * FROM locations WHERE search_query = $1;';
  console.log(sql);
  let values = [searchQuery];
  console.log(values);
  client.query(sql, values)
    .then(pgResults => {
      if (pgResults.rowCount === 0) {
        console.log('new search')
        googleAPILocation(searchQuery, response);
      }
      else {
        console.log('already exists')
        const row = pgResults.rows[0];
        const location = new Location(row.searchQuery, row.formatted_query, row.latitude, row.longitude);
        response.send(location);
      }
    })
    .catch(error => errorHandler(error, response));
}

// ========== Get Google Location API ========== //
function googleAPILocation(searchQuery, response) {
  let geocodeurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}`;

  superAgent.get(geocodeurl)
    .then(responsefromAgent => {
      const formatted_address = responsefromAgent.body.results[0].formatted_address;
      const lat = responsefromAgent.body.results[0].geometry.location.lat;
      const long = responsefromAgent.body.results[0].geometry.location.lng;

      const newLocation = new Location(searchQuery, formatted_address, lat, long)
      console.log('NEW LOCATION:', newLocation);
      let sql = `INSERT INTO location (search_query, formatted_address, latitude, longitude) VALUES ($1, $2, $3, $4);`;
      let value = [newLocation.search_query, newLocation.formatted_address, newLocation.latitude, newLocation.longitude];
      client.query(sql, value)
        .then(response.send(newLocation))
        .catch(error => errorHandler(error, response));
    });
}

// ========== Get Weather API ========== //
function getWeather(request, response) {
  let locationDataObj = request.query.data;
  let latitude = locationDataObj.latitude;
  let longitude = locationDataObj.longitude;
  let weatherURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  superAgent.get(weatherURL)
    .then(dataFromWeather => {
      let weatherDataResults = dataFromWeather.body.daily.data;
      const dailyArray = weatherDataResults.map(day => new Forecast(day.summary, day.time));
      response.send(dailyArray);
    })
    .catch(error => errorHandler(error, response));
}

// ========= Get EventBrite API ========== //
function getEventBrite(request, response) {
  let locationObj = request.query.data;
  const eventUrl = `http://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENTBRITE_API_KEY}&location.address=${locationObj.formatted_address}`;

  superAgent.get(eventUrl)
    .then(eventBriteData => {
      const eventBriteInfo = eventBriteData.body.events.map(eventData => new Event(eventData));

      response.send(eventBriteInfo);
    })
    .catch(error => errorHandler(error, response));
}

// ========== Get Movies API ========== //
function getMovies(request, response) {
  let movieURL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${currentLocation}&page=1&include_adult=false`;

  superAgent.get(movieURL)
    .then(moviesData => {
      const movieResults = moviesData.body;
      const movieArr = movieResults.results.slice(0, 10).map(movie =>{
        let currentMovie = new Movies(movie);
        return currentMovie;
      })
      return movieArr;
    })
    .catch(error => errorHandler(error, response));
}

// ========== Error Function ========== //
function errorHandler(error, request, response){
  console.error(error);
  response.status(500).send('Sorry, something went wrong');
}

// ========== Listen on PORT ========== //
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
