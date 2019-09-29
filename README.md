# lab-09-back-end

# Project Name: City-Explorer

**Author**: Karina Chen
**Version**: 1.0.0 (increment the patch/fix version number if you make more commits past your first submission)

## Overview
This application is called City Explorer, which allows users to come to the website and type in a location in anywhere without knowing the location's latitude and longitude. Then the website will return API information including current weather of the location, EventBrite, Yelp, and Movies. If the location the user entered is not found or if anything goes wrong on the website, the user will be notified the error situation.

## Getting Started
When users want to build this app on their own machine, they first go to the GitHub page and git clone the app to their local repo. Then, in their local repo, create a file called .env and inside .env file, put the exact wording that is inside the single quotes 'PORT=3000' into the file. The users will also need their own APIs to access Google Locations, Yelp, EventBrite, and Movies. Then in their terminal, run npm -init -y, npm i -S express cors superagent pg dotenv. This will install all the dependencies with the same versions I used on the app. The required dependencies are also listed in the package.json file.

## Architecture
In this app, we used JavaScript, Express.js, cors, pg, superagent, and dotenv. Express is the library that lets us set up a server. Cors initializes our express server. It tells the browser it is ok to communicate with the domain that the JavaScript isn't running on and tells the browser that you want the client domain to be able to make server requests. PG is to connect our code base to database. Superagent is used to get information from APIs to server. Dotenv is the library that lets us talk to our .env file.

## Change Log
09-17-2019 11:00am - Repository of app is set up with all the folder structure and files required. A GitHub repo is created and a collaborator is added to the repo. 

09-17-2019 11:25am - App is now successfully running on the express server and is deployed through Heroku. The app has the first feature 'Location', which has a route of /location and shows the location's search query, formatted address, latitude, and longitude.

09-17-2019 12:40pm - The second feature 'Weather' of the app is now available and is deployed on Heroku. This feature allows the users to know the upcoming 8 days of weather conditions of the location they input.

09-18-2019 12:00pm - The third feature 'EventBrite' of the app is completed and is deployed on Heroku. The feature allows the users to see all the events on EventBrite near the location they serached.

09-29-2019 4:50pm - The Google location data is saved to local database and can be retrieved and used to get all the APIs that require location information.

09-29-2019 5:20pm - The Movies and Yelp features are now available in the app to get users information regarding Yelp restaurants and Movies filmed at the location.

## Credits and Collaborations
<!-- Give credit (and a link) to other people or resources that helped you build this application. -->
-->