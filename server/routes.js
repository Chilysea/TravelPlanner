const mysql = require("mysql");
const config = require("./config.json");
const { connect } = require("./server");

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
});

connection.connect((err) => err && console.log(err));

// Find out how many Airbnb houes in a given city
const numberOfCity = async function (req, res) {
  const city = req.params.city;

  connection.query(
    `
    SELECT COUNT(*) AS number
    FROM BASIC_INFO
    WHERE city = '${city}'
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};


const resultPageSearch = async function(req, res){
    const city = req.query.city ?? 'Toronto';
    const people = req.query.people ?? 2;
    const airbnbRating = req.query.airbnbRating ?? 0;
    const priceLow = req.query.priceLow ?? 10;
    const priceHigh = req.query.priceHigh ?? 1000;
    const superHost = req.query.superHost ?? 'f';
    const locationScore = req.query.locationScore ?? 1;

  connection.query(
    `
    SELECT *
    FROM BASIC_INFO bi JOIN HOUSE_INFO hi ON bi.id = hi.id
    JOIN REVIEW_INFO ri ON hi.id = ri.id
    JOIN HOST_INFO hosti ON bi.id = hosti.id
    WHERE city LIKE '${city}' AND hi.accommodates = ${people} AND
    ri.review_scores_rating > ${airbnbRating} AND
    bi.price >= ${priceLow} AND bi.price <= ${priceHigh} AND
    hosti.host_is_superhost LIKE '${superHost}' AND
    ri.review_scores_location >= ${locationScore}
    `,

    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

const yelpSearch = async function(req, res){
    const city = req.query.city ?? 'Toronto';
    const preference = req.query.preference ?? 'Bars';
    const yelpRating = req.query.yelpRating ?? 1;
    const yelpReviewCount = req.query.yelpReviewCount ?? 1;
    connection.query(`
    WITH business AS (SELECT
        business_id,
        Name,
        Address,
        City,
        Latitude,
        Longitude,
        stars,
        Review_Count,
        GROUP_CONCAT(categories SEPARATOR ', ') AS All_cat -- Combines all categories into a single string
    FROM
        YELP
    WHERE City LIKE '${city}' AND
        stars >= ${yelpRating} AND
        Review_Count > ${yelpReviewCount}
    GROUP BY
        business_id, Name, Address, City, Latitude, Longitude, stars, Review_Count)
    SELECT *
    FROM business
    WHERE All_cat LIKE '%${preference}%';
    `,
    (err, data) => {
        if (err || data.length === 0){
            console.log(err);
            res.json({})
        } else{
            res.json(data)
        }
    });
}

const finalSearch = async function(req, res){
    const city = req.query.city ?? 'Toronto';
    const people = req.query.people ?? 2;
    const airbnbRating = req.query.airbnbRating ?? 4.9;
    const priceLow = req.query.priceLow ?? 1;
    const priceHigh = req.query.priceHigh ?? 1000;
    const superHost = req.query.superHost ?? 't';
    const locationScore = req.query.locationScore ?? 4;
    const preference = req.query.preference ?? 'Bars';
    const yelpRating = req.query.yelpRating ?? 1;
    const yelpReviewCount = req.query.yelpReviewCount ?? 1;
    const distance = req.query.distance ?? 5000;

    connection.query(`
    WITH GreatHouse AS (
        SELECT Basic.id,
               Basic.listing_url,
               Basic.picture_url,
               Basic.latitude, Basic.longitude,
               Basic.price,
               Basic.city,
               Basic.name,
               House.beds,
               House.bathrooms,
               Review.review_scores_rating,
               Review.review_scores_cleanliness,
               Review.review_scores_location,
               Review.reviews_per_month,
               Review.review_scores_communication
        FROM BASIC_INFO Basic
        LEFT JOIN HOST_INFO Host ON Basic.id = Host.id
        LEFT JOIN HOUSE_INFO House ON Host.id = House.id
        LEFT JOIN REVIEW_INFO Review ON House.id = Review.id
        WHERE House.accommodates = ${people} AND
              Host.host_is_superhost = '${superHost}' AND
              Review.review_scores_rating >= ${airbnbRating} AND
              Review.review_scores_location >= ${locationScore} AND
              Basic.city LIKE '${city}' AND
              Basic.price >= ${priceLow} AND Basic.price <= ${priceHigh}
    ),
    temp1 AS (
        SELECT gh.id,
               gh.listing_url,
               gh.picture_url,
               gh.latitude, gh.longitude,
               gh.price,
               gh.city,
               gh.name,
               gh.beds,
               gh.bathrooms,
               gh.review_scores_rating,
               gh.review_scores_cleanliness,
               gh.review_scores_location,
               gh.reviews_per_month,
               gh.review_scores_communication,
           ROUND(6378.138*2*ASIN(SQRT(POW(SIN((gh.latitude*PI()/180-y.latitude*PI()/180)/2),2)+COS(gh.latitude*PI()/180)*COS(y.latitude*PI()/180)*POW(SIN((gh.longitude*PI()/180-y.longitude*PI()/180)/2),2)))*1000)
               AS distance
    FROM GreatHouse gh
        LEFT JOIN YELP y on gh.city = y.city
    WHERE y.categories LIKE '%${preference}%' AND
          y.stars >= ${yelpRating} AND
          y.review_count >= ${yelpReviewCount}
    HAVING distance <= ${distance}),
    temp2 AS (
        SELECT t.id,
               t.listing_url,
               t.picture_url,
               t.latitude, t.longitude,
               t.price,
               t.city,
               t.name,
               t.beds,
               t.bathrooms,
               t.review_scores_rating,
               t.review_scores_cleanliness,
               t.review_scores_location,
               t.reviews_per_month,
               t.review_scores_communication,
               COUNT(*) AS number_of_restaurant
    FROM temp1 t
    GROUP BY t.id)
    SELECT *
    FROM temp2 t
    GROUP BY t.id
    ORDER BY number_of_restaurant desc ;
    `,
    (err, data) => {
        if (err || data.length === 0){
            console.log(err);
            res.json({})
        } else{
            res.json(data)
        }
    })
}

// Get /top_airbnb_by_location returns the top 10 airbnb in a city is close to the most # of desired yelp
// businesses within certain distance, satisfying stars + review counts
// For a given location with longtitude and latitude, search all the business within the given distance.
const top_airbnb_by_location = async function (req, res) {
    const city = req.query.city ?? "Toronto";
    const distance = req.query.distance ?? 8000;
    const people = req.query.people ?? 1;
    const superhost = req.query.superhost ?? "f"; // default to not superhost unless specified
    const review_scores_location = req.query.review_scores_location ?? 1;
    const review_scores_rating = req.query.review_scores_rating ?? 1;
    const business_type = req.query.business_type ?? "Restaurants"; 
    const business_review_count = req.query.business_review_count ?? 1;
    const business_star = req.query.business_star ?? 1;
    const low_price = req.query.low_price || 0;
    const high_price = req.query.high_price || 760; //Default high is 760+, where when high_price is 760, we get listings > 760 as well
    const min_bed = req.query.min_bed || 0;
    const min_bathroom = req.query.min_bathroom || 0;
    const min_bedroom = req.query.min_bedroom || 0;
  
    connection.query(
      `WITH GreatHouse AS (
          SELECT Basic.id,
                 Basic.listing_url,
                 Basic.picture_url,
                 Basic.latitude, Basic.longitude,
                 Basic.price,
                 Basic.city,
                 Review.review_scores_rating
          FROM BASIC_INFO Basic
          LEFT JOIN HOUSE_INFO House ON Basic.id = House.id
          LEFT JOIN HOST_INFO Host ON House.id = Host.id
          LEFT JOIN REVIEW_INFO Review ON Host.id = Review.id
          WHERE House.accommodates >= ${people} AND
          (${superhost} = 'f' OR Host.host_is_superhost = 't') AND
                Review.review_scores_rating >= ${review_scores_rating} AND
                Review.review_scores_location >= ${review_scores_location} AND Basic.city = ${city}
                AND Basic.price >= ${low_price} AND (${high_price} >= 760 OR Basic.price <= ${high_price})
                AND House.bedrooms >= ${min_bedroom} AND House.bathrooms >= ${min_bathroom} AND House.beds >= ${min_bed}
      ),
      temp1 AS (
          SELECT gh.id,
             gh.listing_url,
             gh.picture_url,
             gh.price,
             gh.city,
             gh.review_scores_rating,
             ROUND(6378.138*2*ASIN(SQRT(POW(SIN((gh.latitude*PI()/180-y.latitude*PI()/180)/2),2)+COS(gh.latitude*PI()/180)*COS(y.latitude*PI()/180)*POW(SIN((gh.longitude*PI()/180-y.longitude*PI()/180)/2),2)))*1000)
                 AS distance
      FROM GreatHouse gh
          LEFT JOIN YELP y on gh.city = y.city
      WHERE y.categories LIKE '%${business_type}%' AND y.review_count >= ${business_review_count} AND y.stars >= ${business_star}
      HAVING distance <= ${distance})
      SELECT t.id,
          t.listing_url,
          t.picture_url,
          t.price,
          COUNT(*) AS num_business
      FROM temp1 t
      GROUP BY t.id
      ORDER BY num_business DESC, t.review_scores_rating DESC
      LIMIT 10;
      `,
      (err, data) => {
        if (err || data.length === 0) {
          console.log(err);
          res.json({});
        } else {
          res.json(data);
        }
      }
    );
  };

// Find the top 10 hosts with most reviews and has at least 4.95 scores in cleanliness
const top_hosts = async function (req, res) {
  connection.query(
    `
    SELECT hi.host_id, hi.host_name, ri.review_scores_cleanliness, number_of_reviews
    FROM BASIC_INFO bi
    JOIN HOST_INFO hi ON bi.id = hi.id
    JOIN REVIEW_INFO ri ON bi.id = ri.id
    WHERE bi.city IN (
        SELECT city
        FROM BASIC_INFO
        GROUP BY city
        HAVING COUNT(*) > 1000
    ) AND
    number_of_reviews > 50 AND
    review_scores_cleanliness > 4.95
    GROUP BY hi.host_id, hi.host_name
    ORDER BY ri.number_of_reviews DESC
    LIMIT 10;
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// For a given location with longtitude and latitude, search all the business within the given distance.
const search_yelp_by_distance = async function (req, res) {
  const long = req.query.longitude ?? -86.7681696;
  const lati = req.query.latitude ?? 36.2081024;
  const distance = req.query.distance ?? 5000;

  connection.query(
    `
    SELECT name, address, stars, review_count, categories, 
    ROUND(6378.138*2*ASIN(SQRT(POW(SIN((${lati}*PI()/180-latitude*PI()/180)/2),2)+COS(${lati}*PI()/180)*COS(latitude*PI()/180)*POW(SIN((${long}*PI()/180-longitude*PI()/180)/2),2)))*1000) AS distance
    FROM YELP
    HAVING distance <= ${distance}
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Find out the TOP 3 cities with the highest average number of reviews per business
const highest_review_city = async function (req, res) {
  connection.query(
    `
    SELECT city,
       AVG(review_count) AS avg_reviews_per_business
    FROM YELP
    WHERE review_count > 100
    GROUP BY city
    ORDER BY avg_reviews_per_business DESC
    LIMIT 3;
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Firstly find qualified house for 2 people that have more than 500 reviews and location score is greater than 4.9, then join with YELP data and compute the distance of
// each business to the qualified houses and filter them by max distance 5000 meters. Finally find the greatest house that have most restaurants within 5km for each city.
const best_house_by_restaurants = async function (req, res) {
  connection.query(
    `
    WITH GreatHouse AS (
        SELECT Basic.id,
               Basic.listing_url,
               Basic.picture_url,
               Basic.latitude, Basic.longitude,
               Basic.price,
               Basic.city,
               Review.review_scores_rating
        FROM BASIC_INFO Basic
        LEFT JOIN HOST_INFO Host ON Basic.id = Host.id
        LEFT JOIN HOUSE_INFO House ON Host.id = House.id
        LEFT JOIN REVIEW_INFO Review ON House.id = Review.id
        WHERE House.accommodates = 2 AND
              Host.host_is_superhost = 't' AND
              Review.number_of_reviews >= 500 AND
              Review.review_scores_location >= 4.9
    ),
    temp1 AS (
        SELECT gh.id,
           gh.listing_url,
           gh.picture_url,
           gh.price,
           gh.city,
           gh.review_scores_rating,
           ROUND(6378.138*2*ASIN(SQRT(POW(SIN((gh.latitude*PI()/180-y.latitude*PI()/180)/2),2)+COS(gh.latitude*PI()/180)*COS(y.latitude*PI()/180)*POW(SIN((gh.longitude*PI()/180-y.longitude*PI()/180)/2),2)))*1000)
               AS distance
    FROM GreatHouse gh
        LEFT JOIN YELP y on gh.city = y.city
    WHERE y.categories LIKE '%Restaurants%'
    HAVING distance <= 5000),
    temp2 AS (
        SELECT t.id,
           t.listing_url,
           t.picture_url,
           t.price,
           t.city,
           COUNT(*) AS number_of_restaurant
    FROM temp1 t
    GROUP BY t.id)
    SELECT t.id,
        t.listing_url,
        t.picture_url,
        t.price,
        t.city,
        MAX(t.number_of_restaurant AS max_num_restaurants)
    FROM temp2 t
    GROUP BY t.city;
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

//GET get_airbnb/:city returns the desirable airbnb in a certain city that satisfies the price range and the reviews
const get_airbnb = async function (req, res) {
  const city = req.params.city; //city is required
  const low_price = req.query.low_price || 0;
  const high_price = req.query.high_price || 999999999;
  const review_score = req.query.review_score || 0;
  const num_reviews = req.query.num_reviews || 0;
  const num_people = req.query.people || 0; //the least of ppl needed to be accommodated
  const min_bed = req.query.min_bed || 0;
  const max_bed = req.query.max_bed || 99;
  const min_bathroom = req.query.min_bathroom || 0;
  const max_bathroom = req.query.max_bathroom || 99;
  const min_bedroom = req.query.min_bedroom || 0;
  const max_bedroom = req.query.max_bedroom || 99;

  connection.query(
    `
    WITH B AS (
        SELECT id, listing_url, name, price, picture_url
        FROM BASIC_INFO
        WHERE city = '${city}' AND price >= ${low_price} AND price <= ${high_price}
    ),
    House AS (
        SELECT H.id, room_type
        FROM HOUSE_INFO H JOIN B ON H.id = B.id
        WHERE accommodates >= ${num_people} AND bedrooms >= ${min_bedroom} AND bedrooms <= ${max_bedroom} 
        AND bathrooms >= ${min_bathroom} AND bathrooms <= ${max_bathroom} AND beds >= ${min_bed} AND beds <= ${max_bed}
    ),
    Review AS (
        SELECT R.id, review_scores_rating, number_of_reviews
        FROM REVIEW_INFO R JOIN House ON R.id = House.id
        WHERE review_scores_rating >= ${review_score} AND number_of_reviews >= ${num_reviews}
    )
    SELECT B.id, listing_url, picture_url, name, price, room_type, review_scores_rating, number_of_reviews
    FROM B, House, Review
    WHERE B.id = House.id AND B.id = Review.id
    ORDER BY review_scores_rating DESC, price
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

//find the number of a certain type of cusine available in each zip code
const rest_per_zip = async function (req, res) {
  const cuisine = req.params.cuisine.toLowerCase();
  connection.query(
    `
    WITH Res AS (
        SELECT business_id, postal_code, stars, review_count, categories
        FROM YELP
        WHERE categories LIKE '%Restaurants%' AND LOWER(categories) LIKE '%${cuisine}%'
    )
    SELECT postal_code, COUNT(*) AS num_restaurants, AVG(stars) AS avg_stars, AVG(review_count) AS avg_review_count
    FROM Res
    GROUP BY postal_code
    ORDER BY num_restaurants DESC, avg_stars DESC
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

//Popular Airbnbs in Areas with High-Density Top-Rated Restaurants
const popularAirbnbsInTopDiningAreas = async function (req, res) {
  const minRestaurants = req.query.minRestaurants || 10; // Minimum number of top-rated restaurants to define a high-density area
  const minRating = req.query.minRating || 4; // Minimum average rating to consider a restaurant top-rated

  connection.query(
    `
    WITH TopDiningCities AS (
        SELECT y.city, COUNT(y.business_id) AS restaurant_count
        FROM YELP y
        WHERE y.stars >= ${minRating}
        GROUP BY y.city
        HAVING COUNT(y.business_id) >= ${minRestaurants}
    ),
    PopularAirbnbs AS (
        SELECT bi.city, bi.id, bi.name, ri.review_scores_rating, ri.number_of_reviews
        FROM BASIC_INFO bi
        JOIN REVIEW_INFO ri ON bi.id = ri.id
        WHERE bi.city IN (SELECT city FROM TopDiningCities)
        ORDER BY ri.review_scores_rating DESC, ri.number_of_reviews DESC
        LIMIT 10
    )
    SELECT pa.city, pa.name, pa.review_scores_rating, pa.number_of_reviews
    FROM PopularAirbnbs pa
    ORDER BY pa.review_scores_rating DESC, pa.number_of_reviews DESC
    `,
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Top Airbnbs Near Cultural Hotspots
const topAirbnbsNearCulturalHotspots = async function (req, res) {
  const minCulturalSpots = req.query.minCulturalSpots || 10; // Minimum number of cultural spots to define a cultural hotspot area
  const categoryFilters = "'museums', 'galleries'"; // Categories to define cultural spots, changable

  connection.query(
    `
    WITH CulturalCities AS (
        SELECT y.city, COUNT(y.business_id) AS cultural_count
        FROM YELP y
        WHERE y.categories LIKE '%museum%' OR 
        y.categories LIKE '%gallery%' 
        GROUP BY y.city
        HAVING COUNT(y.business_id) >= ${minCulturalSpots}
    ),
    TopCulturalAirbnbs AS (
        SELECT bi.city, bi.id, bi.name, bi.latitude, bi.longitude, ri.review_scores_rating, ri.number_of_reviews, bi.picture_url
        FROM BASIC_INFO bi
        INNER JOIN REVIEW_INFO ri ON bi.id = ri.id
        WHERE bi.city IN (SELECT city FROM CulturalCities) AND
        bi.city <> 'Nashville'
        AND ri.review_scores_rating IS NOT NULL AND ri.number_of_reviews IS NOT NULL AND
        ri.review_scores_location > 4.9
        ORDER BY ri.review_scores_rating DESC, ri.number_of_reviews DESC
        LIMIT 14
    )
    SELECT tca.city, tca.id, tca.name, tca.latitude, tca.longitude, tca.review_scores_rating AS rating, tca.number_of_reviews, tca.picture_url
    FROM TopCulturalAirbnbs tca
    ORDER BY tca.review_scores_rating DESC, tca.number_of_reviews DESC
    LIMIT 14;
    `, 
    (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.json(data);
      }
    }
  );
};

// Top 5 Airbnbs Near Most Outdoor Activities in a Specific Area
const topAirbnbsNearMostOutdoorActivities = async function(req, res) {
    const area = req.params.area; 
    const outdoorCategories = "'parks', 'beaches', 'hiking'"; // Define the outdoor categories

    connection.query(`
    WITH AreaOutdoorSpots AS (
    SELECT
        y.business_id,
        y.name AS spot_name,
        y.latitude,
        y.longitude
    FROM YELP y
    WHERE
        y.city = 'Nashville'
        AND (
            y.categories LIKE '%park%' OR
            y.categories LIKE '%beach%' OR
            y.categories LIKE '%hiking%'
        )
),
AirbnbListings AS (
    SELECT
        bi.id,
        bi.name,
        bi.latitude,
        bi.longitude,
        ri.review_scores_rating
    FROM BASIC_INFO bi
    JOIN REVIEW_INFO ri ON bi.id = ri.id
    WHERE
        bi.city = 'Nashville'
        AND ri.review_scores_rating IS NOT NULL
)
SELECT
    al.id,
    al.name,
    al.latitude,
    al.longitude,
    al.review_scores_rating,
    COUNT(aos.business_id) AS outdoor_activity_count
FROM AirbnbListings al
JOIN AreaOutdoorSpots aos ON ST_Distance_Sphere(
        POINT(aos.longitude, aos.latitude),
        POINT(al.longitude, al.latitude)
    ) <= 5000
GROUP BY
    al.id,
    al.name,
    al.latitude,
    al.longitude,
    al.review_scores_rating
ORDER BY
    outdoor_activity_count DESC,
    al.review_scores_rating DESC
LIMIT 5;
    `, 
    (err, data) => {
        if (err || data.length === 0){
            console.log(err);
            res.json({})
        } else{
            res.json(data)
        }
    })
}

// added for home page suggestion
const top_listings = async function (req, res) {
  connection.query(
    `
    SELECT bi.id, bi.listing_url, bi.name, bi.picture_url, ri.review_scores_rating AS rating
    FROM BASIC_INFO bi
    JOIN REVIEW_INFO ri ON bi.id = ri.id
    WHERE ri.review_scores_rating >= 5
    AND bi.city IN (
        SELECT city
        FROM YELP
        WHERE categories LIKE '%restaurant%' AND stars >= 4
        GROUP BY city
        HAVING COUNT(*) >= 10
    )
    AND bi.city IN (
        SELECT city
        FROM YELP
        WHERE categories LIKE '%museum%' OR categories LIKE '%gallery%'
        GROUP BY city
        HAVING COUNT(*) >= 3
    )
    ORDER BY ri.review_scores_rating DESC, RAND()
    LIMIT 14;
    `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      } else if (data.length === 0) {
        res.status(404).json({ message: "No listings found" });
      } else {
        res.status(200).json(data);
      }
    }
  );
};

module.exports = {
  numberOfCity,
  top_hosts,
  search_yelp_by_distance,
  highest_review_city,
  best_house_by_restaurants,
  get_airbnb,
  rest_per_zip,
  popularAirbnbsInTopDiningAreas,
  topAirbnbsNearCulturalHotspots,
  topAirbnbsNearMostOutdoorActivities,
  top_listings,
  resultPageSearch,
  yelpSearch,
  top_airbnb_by_location,
  finalSearch
};
