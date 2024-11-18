import React from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, CardActions } from '@mui/material';
import Button from '@mui/material/Button';


// The card table on in /ResultPage, mainly shows the result with conditions users inputed
function AirbnbCardTable({ airbnbData, map }) {
    
    //The function of buttons on each card.
    const handleFlyTo = (e) => {
        if (map) {
          map.flyTo({
            center: [e.longitude, e.latitude], // destination is an array [lng, lat]
            essential: true, // this animation is considered essential with respect to prefers-reduced-motion
            zoom: 20
          });
          console.log('CLICK')
        } else {
          console.log("Map is not initialized yet.");
        }
    };


    return (
        <Grid container spacing={2}>
            {airbnbData.map(item => (
                <Grid item xs={12} key={item.id}>
                    <Card sx={{ display: 'flex', width: 800, border: '5px solid #E0E0E0', borderRadius: '6px', margin: 'auto' }}>
                        <CardMedia
                            sx={{
                            width: '500px',         // Set a fixed width
                            height: '250px',        // Set a fixed height
                            borderRadius: '6px',  // Round corners
                            border: '1px solid #ccc', // Add a border
                            objectFit: 'cover',
                            display: 'flex'
                            // Cover the area without stretching the image
                            }}
                            image={item.picture_url}
                            
                        />
                        <CardContent >  
                            <Typography gutterBottom variant="h5" component="div">
                            {item.name}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Typography variant="body1" color="text.secondary">
                                        Prices: <b>${item.price}</b> 
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body1" color="text.secondary">
                                        Number of Beds: <b >{item.beds}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body1" color="text.secondary">
                                        Rating: <b>{item.review_scores_rating}</b> 
                                    </Typography>
                                </Grid>
                                
                                
                                <Grid item xs={4}>
                                    <Typography variant="body1" color="text.secondary">
                                        Cleanliness: <b>{item.review_scores_cleanliness}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body1" color="text.secondary">
                                        Location: <b>{item.review_scores_location}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body1" color="text.secondary">
                                        Communication: <b>{item.review_scores_communication}</b>
                                    </Typography>
                                </Grid>

                                <Grid item xs={5}>
                                    <Typography variant="body1" color="text.secondary">
                                        Number of Bathrooms: <b>{item.bathrooms}</b> 
                                    </Typography>
                                </Grid>
                                <Grid item xs={7}>
                                    <Typography variant="body1" color="text.secondary">
                                        Number of Reviews per Month: <b>{item.reviews_per_month}</b>
                                    </Typography>
                                </Grid>
                            </Grid>
                            <CardActions>
                            <Button onClick={() => handleFlyTo(item)} sx={{ width: '250px', fontSize: '16px'}} variant="contained" size="medium">Details</Button> &ensp;
                            <Button href={item.listing_url} sx={{ width: '250px', fontSize: '16px'}} variant="contained" size="medium">Learn More</Button>
                            </CardActions>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}


export default AirbnbCardTable;
