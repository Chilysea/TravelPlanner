//import NavBar from '../components/NavBar';
import Header from '../components/Header'; 
import React, { useState, useEffect } from 'react';
const config = require('../config.json');

export default function HomePage() {

  const [listings, setListings] = useState([]);  // State to store the listings
  const [pageTitle, setPageTitle] = useState("Top Recommended Airbnb By Ratings")


  // There are 2 different recommendation queries, we choose them randomly each time we open HomePage
  const queries = [
    { endpoint: '/top_listings', title: 'Top Recommended Airbnbs' },
    { endpoint: '/topAirbnbsNearCulturalHotspots', title: 'Top Airbnbs Near Cultural Hotspots' }
];

    useEffect(() => {
        // Fetch the listings from your API

        const queryIndex = Math.floor(Math.random() * queries.length);
        const selectedQuery = queries[queryIndex];

        setPageTitle(selectedQuery.title);

        fetch(`http://${config.server_host}:${config.server_port}${selectedQuery.endpoint}`)  // new function added at end
            .then(response => {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Failed to fetch listings');
                }
                return response.json();
            })
            .then(data => {
                setListings(data);
            })
            .catch(error => {
                console.log('Error fetching listings:', error);
            });
    }, []);  

    return (
      <div style={{ padding: '20px' }}>
          <Header />  
          <h1>{pageTitle}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
              {listings.map(listing => (
                  <div key={listing.id} style={{
                    margin: '10px',
                    border: '1px solid #ccc',
                    padding: '10px',
                    width: '300px',
                    borderRadius: '8px',  // Rounded corners
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',  // Soft shadow for depth
                    transition: 'transform 0.2s',  
                    ':hover': {
                        transform: 'scale(1.5)', 
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)'  
                    }
                }}>
                    <a href={listing.listing_url} target="_blank" rel="noopener noreferrer" style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',  
                        height: '100%'
                    }}>
                        <img src={listing.picture_url} alt={listing.name} style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderTopLeftRadius: '7px',  
                            borderTopRightRadius: '7px'
                        }} />
                        <h3>{listing.name}</h3>
                        <p>Rating: {listing.rating}</p>
                    </a>
                </div>
              ))}
          </div>
      </div>
  );
};
