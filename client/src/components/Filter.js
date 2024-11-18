import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Slider,
  TextField,
  Radio,
  RadioGroup,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import "../css/ResultPage.css";
import { useNavigate } from 'react-router-dom'; 

// const config = require("../config.json");


// Design the filters of the ResultPage, help users to pensonlize their experience by their requirement
export default function Filter({ city, people }) {


  const [price, setPrice] = useState([10, 500]);
  const [bedroom, setBedroom] = useState([0, 10]);
  const [bed, setBed] = useState([0, 10]);
  const [bathroom, setBathroom] = useState([0, 10]);
  const [superhost, setSuperHost] = useState('f');
  const [airbnbRating, setAirbnbRating] = useState(1);
  const [locationScore, setLocationScore] = useState(1);
  const [distance, setDistance] = useState(5000); //distance is in meters (not km)
  const [yelpRating, setYelpRating] = useState(1);
  const [yelpReviewCount, setYelpReviewCount] = useState(1);
  const [yelpCategory, setYelpCategory] = useState("");
  const [host, setHost] = useState('f');
  const navigate = useNavigate(); 

  const handleFilterChange = () => {
    console.log(
      "Filter component's filter values:",
      price[0],
      bedroom,
      bed,
      bathroom,
      superhost,
      airbnbRating,
      locationScore,
      distance,
      yelpRating,
      yelpReviewCount,
      yelpCategory
    ); 
    
    navigate(`/result?city=${encodeURIComponent(city)}&people=${people}&preference=${yelpCategory}&airbnbRating=${airbnbRating}
    &priceLow=${price[0]}&priceHigh=${price[1]}&superHost=${host}&locationScore=${locationScore}
    &yelpRating=${yelpRating}&yelpReviewCount=${yelpReviewCount}&distance=${distance}`);
  };

  useEffect(()=> {
    if(superhost === true){
      setHost('t')
    }
    else{
      setHost('f')
    }

  }, [superhost]);


  return (
    <div
      className="filter"
      style={{
        width: "80%",
        height: "100%",
        margin: "5px",
        padding: "10px",
        backgroundColor: "white",
      }}
    >
      <Grid
        className="grid-filter"
        item
        container
        direction="column"
        alignItems="flex-start"
      >
        <h3>Price</h3>
        <Slider
          value={price}
          min={10}
          max={500} //TODO: this is intended to be 500+
          step={10}
          onChange={(e, newValue) => setPrice(newValue)}
          valueLabelDisplay="auto"
          //   onChangeCommitted={handleFilterChange}
        />
        
        <h3>Superhost</h3>
        <FormControlLabel
          label="Hosted by Superhost"
          control={
            <Checkbox
              checked={superhost}
              onChange={(e) => setSuperHost(e.target.checked)}
            />
          }
        />
        <div style={{ marginTop: "20px" }}>
          <TextField
            id="airbnb-rating"
            label="Airbnb Rating (at least)"
            type="number"
            value={airbnbRating}
            onChange={(e) => setAirbnbRating(e.target.value)}
          />
        </div>
        <div style={{ marginTop: "20px" }}>
          <TextField
            id="location-score"
            label="Location Score (at least)"
            type="number"
            value={locationScore}
            onChange={(e) => setLocationScore(e.target.value)}
          />
        </div>
        <h2>Yelp Info</h2>
        <div>
          <h3>Distance:</h3>
          <RadioGroup
            aria-label="distance"
            name="distance"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          >
            {/* <FormControlLabel value="500" control={<Radio />} label="500m" />
            <FormControlLabel value="2000" control={<Radio />} label="2km" />
            <FormControlLabel value="4000" control={<Radio />} label="4km" />
            <FormControlLabel value="8000" control={<Radio />} label="8km" /> */}

            <Grid container spacing={2}>
              <Grid item xs ={5}>
              <FormControlLabel value="500" control={<Radio />} label="500m" />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel value="2000" control={<Radio />} label="2km" />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel value="4000" control={<Radio />} label="4km" />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel value="8000" control={<Radio />} label="8km" />
              </Grid>
            </Grid>
          </RadioGroup>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h3>Rating:</h3>
          <RadioGroup
            aria-label="yelp-rating"
            name="yelp-rating"
            value={yelpRating}
            onChange={(e) => setYelpRating(e.target.value)}
          >
            {/* <FormControlLabel value="0" control={<Radio />} label="Any" />
            <FormControlLabel
              value="3.5"
              control={<Radio />}
              label={
                <span>
                  <span>3.5</span>
                  <span style={{ color: "gold" }}> ★</span>
                </span>
              }
            />
            <FormControlLabel
              value="4"
              control={<Radio />}
              label={
                <span>
                  <span>4</span>
                  <span style={{ color: "gold" }}> ★</span>
                </span>
              }
            />
            <FormControlLabel
              value="4.5"
              control={<Radio />}
              label={
                <span>
                  <span>4.5</span>
                  <span style={{ color: "gold" }}> ★</span>
                </span>
              }
            /> */}
            <Grid container spacing={2}>
              <Grid item xs ={5}>
              <FormControlLabel value="0" control={<Radio />} label="Any" />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel
              value="3.5"
              control={<Radio />}
              label={
                <span>
                  <span>3.5</span>
                  <span style={{ color: "gold" }}> ★</span>
                </span>
              }
              />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel
              value="4"
              control={<Radio />}
              label={
                <span>
                  <span>4</span>
                  <span style={{ color: "gold" }}> ★</span>
                </span>
              }
              />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel
              value="4.5"
              control={<Radio />}
              label={
                <span>
                  <span>4.5</span>
                  <span style={{ color: "gold" }}> ★</span>
                </span>
              }
              />
              </Grid>
            </Grid>

            
          </RadioGroup>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h3>Number of Reviews:</h3>
          <RadioGroup
            aria-label="yelp-review-count"
            name="yelp-review-count"
            value={yelpReviewCount}
            onChange={(e) => setYelpReviewCount(e.target.value)}
          >
            {/* <FormControlLabel value="0" control={<Radio />} label="Any" />
            <FormControlLabel value="50" control={<Radio />} label="50+" />
            <FormControlLabel value="100" control={<Radio />} label="100+" />
            <FormControlLabel value="500" control={<Radio />} label="500+" /> */}

            <Grid container spacing={2}>
              <Grid item xs ={5}>
              <FormControlLabel value="0" control={<Radio />} label="Any" />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel value="50" control={<Radio />} label="50+" />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel value="100" control={<Radio />} label="100+" />
              </Grid>
              <Grid item xs ={5}>
              <FormControlLabel value="500" control={<Radio />} label="500+" />
              </Grid>
            </Grid>
          </RadioGroup>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h3>Category:</h3>
          <ToggleButtonGroup
            value={yelpCategory}
            exclusive
            aria-label="category-selector"
            onChange={(e, newValue) => setYelpCategory(newValue)}
            style={{ display: 'flex', flexWrap: 'wrap' }} 
          >
            <ToggleButton value="Restaurants">Restaurants</ToggleButton>
            <ToggleButton value="Food">Food</ToggleButton>
            <ToggleButton value="Shopping">Shopping</ToggleButton>
            <ToggleButton value="Nightlife">Nightlife</ToggleButton>
            <ToggleButton value="Bars">Bars</ToggleButton>
            <ToggleButton value="Beauty-and-spas">Beauty & Spas</ToggleButton>
            <ToggleButton value="Coffee-and-tea">Coffee & Tea</ToggleButton>
            <ToggleButton value="Event-planning-and-services">
              Event Planning & Services
            </ToggleButton>
            <ToggleButton value="Fashion">Fashion</ToggleButton>
            <ToggleButton value="Hotels-and-travel">Hotels & Travel</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Grid>
      <Button
        onClick={() => handleFilterChange()}
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "20px",
          borderRadius: "10px",
          border: "2px solid lightblue",
        }}
      >
        Search
      </Button>
    </div>
  );
}
