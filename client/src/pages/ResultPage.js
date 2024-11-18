// const config = require('../config.json');
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import "../css/ResultPage.css"
import { Grid, Slider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css'; 
import {useSearchParams} from "react-router-dom"
import Filter from '../components/Filter';
// import HCard from '../components/HCard';
import AirbnbCardTable from '../components/CardTable';

const config = require('../config.json')

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGF2b2NjIiwiYSI6ImNsdmtkMXR4ODF3N2Qyb28xejUxaWJoNDAifQ.BsQd7g5rvN7qQ3JgjfbvNw";

export default function ResultPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const city = queryParams.get('city');
  const people = queryParams.get('people');
  const preference = queryParams.get('preference');

  const airbnbRating = queryParams.get('airbnbRating');
  const priceLow = queryParams.get('priceLow');
  const priceHigh = queryParams.get('priceHigh');
  const superHost = queryParams.get('superHost');
  const locationScore = queryParams.get('locationScore');

  const yelpReviewCount = queryParams.get('yelpReviewCount');
  const yelpRating = queryParams.get('yelpRating');
  const distance = queryParams.get('distance');

  console.log("Selected preference:", preference); 


  const cityCoordinates = {
    Nashville: { lat: 36.1627, lng: -86.7816, zoom: 12 },
    "New Orleans": { lat: 29.9511, lng: -90.0715, zoom: 12 },
    Montreal: { lat: 45.5017, lng: -73.5673, zoom: 12 },
    Edinburgh: { lat: 55.9533, lng: -3.1883, zoom: 12 },
    Toronto: { lat: 43.651, lng: -79.347, zoom: 12 },
  };

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-86.7816);
  const [lat, setLat] = useState(36.1627);
  const [zoom, setZoom] = useState(12);

  const [airbnbData, setAirbnbData] = useState([{}]);
  const [yelpData, setYelpData] = useState([{}]);
  const [finalData, setFinalData] = useState([{}]);


  // Get Airbnb Data by Airbnb filters
  useEffect(() => {
    fetch(
      `http://${config.server_host}:${config.server_port}/resultPageSearch?city=${city}&people=${people}&airbnbRating=${airbnbRating}
      &priceLow=${priceLow}&priceHigh=${priceHigh}&superHost=${superHost}&locationScore=${locationScore}`
    )
      
      .then((res) => res.json())
      .then((resJson) => setAirbnbData(resJson));
      console.log(`AirbnbGet`);
  }, [city, people, airbnbRating, priceLow, priceHigh, superHost, locationScore]);

  // Get Yelp Data by Yelp filters
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/yelpSearch?city=${city}&preference=${preference}&yelpRating=${yelpRating}&yelpReviewCount=${yelpReviewCount}
        `)
      .then(res => res.json())
      .then(resJson => setYelpData(resJson));
      console.log(`YelpGet`);

  }, [city, preference, yelpRating, yelpReviewCount]);
  

  // Get search result by combining all the filters
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/finalSearch?city=${city}&people=${people}&airbnbRating=${airbnbRating}
         &priceLow=${priceLow}&priceHigh=${priceHigh}&superHost=${superHost}&locationScore=${locationScore}&preference=${preference}&yelpRating=${yelpRating}&yelpReviewCount=${yelpReviewCount}&distance=${distance}
        `)
    // fetch(`http://${config.server_host}:${config.server_port}/finalSearch`)
      .then(res => res.json())
      .then(resJson => setFinalData(resJson));
  }, [city, people, preference, airbnbRating, priceLow, priceHigh, superHost, locationScore, yelpRating, yelpReviewCount, distance]
  )
  

  // Add map markers and popups each time we have different Airbnb Data and Yelp Data
  useEffect(() => {
    if (airbnbData.length > 0) {
      airbnbData.forEach((listing) => {
        var popupHTML = `
        <div style="width: 240px;">
            <img src="${listing.picture_url}" loading="lazy" alt="Lizard" style="width: 90%; height: auto; border-radius: 4px; margin-bottom: 8px;">
            <h3 style="width: 95%;margin: 0; color: #333; font-size: 18px;">${listing.name}</h3>
            <p style="color: #666; font-size: 14px;">PRICE: <b style="font-size: 20px; float: right; margin-right: 30px;">$${listing.price}</b><br />Number of reviews: <b style="font-size: 20px; float: right; margin-right: 30px;">${listing.number_of_reviews}</b><br />Rating: <b style="font-size: 20px; float: right; margin-right: 30px;">${listing.review_scores_rating}</b><br />
            Cleanliness: <b style="font-size: 20px; float: right; margin-right: 30px;">${listing.review_scores_cleanliness}</b><br />Location: <b style="font-size: 20px; float: right; margin-right: 30px;">${listing.review_scores_location}</b></p>
            <a href="${listing.listing_url}" target="_blank" style="width: 90%;background-color: #28a745; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; text-align: center; display: inline-block;">Learn More</a>
        </div>
        `;
        // console.log(`Latitude: ${listing.latitude}, Longitude: ${listing.longitude}`);
        if (
          typeof listing.latitude === "number" &&
          typeof listing.longitude === "number" &&
          !isNaN(listing.latitude) &&
          !isNaN(listing.longitude)
        ) {
          const popup = new mapboxgl.Popup().setHTML(popupHTML);

          const marker = new mapboxgl.Marker({ scale: 0.5 })
            .setLngLat([listing.longitude, listing.latitude])
            .setPopup(popup)
            .addTo(map.current);
          
        }
      });

      if (yelpData.length > 0){
        yelpData.forEach(listing =>{
          if (typeof listing.Latitude === 'number' && typeof listing.Longitude === 'number' && !isNaN(listing.Latitude) && !isNaN(listing.Longitude)) {
            // const popup = new mapboxgl.Popup().setHTML(popupHTML);
            // console.log(`Latitude: ${listing.Latitude}, Longitude: ${listing.Longitude}`);
            var popupHTML = `
            <div style="width: 240px;">
                <h3 style="width: 95%;margin: 0; color: #333; font-size: 18px;">${listing.Name}</h3>
                <p style="color: #666; font-size: 14px;">Number of reviews: <b style="font-size: 20px; float: right; margin-right: 30px;">${listing.Review_Count}</b><br />Stars: <b style="font-size: 20px; float: right; margin-right: 30px;">${listing.stars}</b></p>
                <p style="color: #99004C; font-size: 12px; width: 90%;"> ${listing.All_cat}</p>
                <p style="color: #009900; font-size: 11px; width: 90%; text-decoration: underline;">${listing.Address} </p> 
            </div>
            `;
            const popup = new mapboxgl.Popup().setHTML(popupHTML);
  
            const marker = new mapboxgl.Marker({scale: 0.3, color: '#FF6666'}).setLngLat([listing.Longitude, listing.Latitude]).setPopup(popup).addTo(map.current);
            
          }
        });
      };
      
    };

  }, [airbnbData, yelpData, finalData]);

  useEffect(() => {
    const { lat, lng, zoom } = cityCoordinates[city];
    setLat(lat);
    setLng(lng);
    setZoom(zoom);
  }, [city, people]);


  // This part mainly initialize the map component
  useEffect(() => {
    // if (map.current) return; // initialize map only once

    // Delete the old map when we get a new one
    if (map.current) {
      map.current.remove();
    }

    const { lat, lng, zoom } = cityCoordinates[city];
    setLat(lat);
    setLng(lng);
    setZoom(zoom);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });


    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, [city, people, preference, airbnbRating, priceLow, priceHigh, superHost, locationScore, yelpRating, yelpReviewCount]);


  return (
    <div className="flex-container">
      <div className="content-container">
         <div className="filter">
            <h1>Filter</h1>
            <Filter city={city} people={people} distance={distance} />
          </div>
          <div className="search-result" style={{ height: '100vh', overflow: 'auto' }}>
            <h1>Results</h1>
            {/* <span>${airbnbData.id}</span> */}
            {/* <House /> */}
            {/* <span>${lat}</span> */}
            <AirbnbCardTable airbnbData={finalData} map={map.current} />
          </div>
      </div>
      <div className="sidebar">
        {/* Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} */}
      </div>
      <div ref={mapContainer} className="map-container"></div>
    </div>
  );
}
