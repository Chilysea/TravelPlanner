import React, { useState, useEffect } from 'react';
import '../css/SearchBar.css'; 
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import { useLocation } from 'react-router-dom';



function SearchBar() {
  const [city, setCity] = useState('');
  const [people, setPeople] = useState(1);
  const [preference, setPreference] = useState('');

  const [airbnbRating, setAirbnbRating] = useState(0);
  const [priceLow, setPriceLow] = useState(0);
  const [priceHigh, setPriceHigh] = useState(1000);
  const [superHost, setSuperHost] = useState('f');
  const [locationScore, setLocationScore] = useState(0);

  const [yelpRating, setYelpRating] = useState(1);
  const [yelpReviewCount, setYelpReviewCount] = useState(1);
  const [distance, setDistance] = useState(5000);

  const navigate = useNavigate(); 

  const location = useLocation();

  useEffect(() => {
    // Check if the current page is the homepage
    if (location.pathname === '/') {
      setCity('');
      setPeople(1);
      setPreference('');
    }
  }, [location]);

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handlePeopleChange = (event) => {
    setPeople(event.target.value);
  };

  const handlePreferenceChange = (event) => {
    setPreference(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // alert(`City: ${city}, People: ${people}`);
    if (city === "") {
        alert("Please select a city.");  
        return;  
    }

    if (preference === "") {
      alert("Please select a preference.");  
      return;  
  }

    navigate(`/result?city=${city}&people=${people}&preference=${preference}&airbnbRating=${airbnbRating}
    &priceLow=${priceLow}&priceHigh=${priceHigh}&superHost=${superHost}&locationScore=${locationScore}
    &yelpRating=${yelpRating}&yelpReviewCount=${yelpReviewCount}&distance=${distance}`);
  };

  return (
    <div className='search-bar-container'>
        <Link to='/'  className='bar-name'>AIRBNB FINDER</Link>
        <div className="search-bar">
            <div className="title">Find Destination</div>
            <form onSubmit={handleSubmit}>
                <label>
                <div className="sTitle">City: </div>
                <select value={city} onChange={handleCityChange}>
                    <option value="">Select a city</option>
                    <option value="Nashville">Nashville</option>
                    <option value="New Orleans">New Orleans</option>
                    <option value="Montreal">Montreal</option>
                    <option value="Edinburgh">Edinburgh</option>
                    <option value="Toronto">Toronto</option>
                </select>
                </label>
                <label>
                <div className="sTitle">People:</div>
                <input type="number" value={people} onChange={handlePeopleChange} min="1" />
                </label>

                <label>
                <div className="sTitle">Preference: </div>
                <select value={preference} onChange={handlePreferenceChange}>
                    <option value="">Select a preference</option>
                    <option value="Restaurants">Restaurants</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Beauty & Spas">Beauty & Spas</option>
                    <option value="Bars">Bars</option>
                    <option value="Nightlife">Nightlife</option>
                    <option value="Coffee & Tea">Coffee & Tea</option>
                    <option value="Fashion">Fashion</option>
                </select>
                </label>
                <button type="submit">Search</button>
            </form>
        </div>
    </div>
  );
}

export default SearchBar;
