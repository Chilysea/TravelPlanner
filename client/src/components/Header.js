import React from 'react';

function Header() {
  return (
    <div style={{
      backgroundImage: 'linear-gradient(to bottom, rgba(255, 223, 105, 0.8) 0%, rgba(105, 180, 255, 0.8) 100%)', // Warm yellow to bright blue with transparency
      backgroundSize: 'cover', // Ensures the background covers the entire div
      backgroundPosition: 'center center', // Centers the background
      padding: '20px',
      textAlign: 'center',
      fontFamily: "'Pacifico', cursive",
      color: '#ffffff', 
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', 
      borderRadius: '5px', 
      marginBottom: '0px',
      marginTop: '0px' 
    }}>
      <h1>Welcome to your next vacation</h1>
      <p>Find the best Airbnb tailored to your exact needs!</p>
    </div>
  );
}

export default Header;




