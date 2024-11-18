const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const path = require('path'); // added

const app = express();
app.use(cors({
  origin: '*',
}));

// // added attempt to activate react app
// app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// // Root route handler added
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html')); 
// });

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/numberOfCity/:city', routes.numberOfCity);
app.get('/top_hosts', routes.top_hosts);
app.get('/search_yelp_by_distance',  routes.search_yelp_by_distance);
app.get('/highest_review_city', routes.highest_review_city);
app.get('/best_house_by_restaurants', routes.best_house_by_restaurants);
app.get('/get_airbnb/:city', routes.get_airbnb);
app.get('/rest_per_zip/:cuisine', routes.rest_per_zip);
app.get('/popularAirbnbsInTopDiningAreas', routes.popularAirbnbsInTopDiningAreas);
app.get('/topAirbnbsNearCulturalHotspots', routes.topAirbnbsNearCulturalHotspots);
app.get('/topAirbnbsNearMostOutdoorActivities', routes.topAirbnbsNearMostOutdoorActivities);
app.get('/top_listings', routes.top_listings);
app.get('/resultPageSearch', routes.resultPageSearch);
app.get('/yelpSearch', routes.yelpSearch);
app.get('/finalSearch', routes.finalSearch);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;