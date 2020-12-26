require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const { isDate } = require('util')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', express.static(path.join(__dirname, '../public'))) //send static content 

//returns either the most recent date of photos or a user selected date
function getDate(data, date){
    if (date === "no date"){
        return data.photo_manifest.max_date; //most recent date
    }
    return date; //selected date  
}

function makeObj(data, date){
    return {
        roverName : data.photo_manifest.name,
        landingDate : data.photo_manifest.landing_date,
        launchDate : data.photo_manifest.launch_date,
        status : data.photo_manifest.status,
        dateOfPhotos : getDate(data, date),
        photosArr : data.photo_manifest.photos 
        //imagesArr : this is added later -- 
        //selected date image URL and camera description
    }
}

// ----------------------------Rover----------------------------
app.get('/rover/:name/date/:date', async (req, res) => {
    try {
        const roverName = req.params.name;
        const date = req.params.date;
        
        //manifest url
        const manURL = "https://api.nasa.gov/mars-photos/api/v1/manifests/" + roverName + "/?api_key=" + process.env.API_KEY;
        let data = await fetch(manURL)
                  .then(response => {
                      return response.json()
                   });
        const dataObj = makeObj(data, date); 

        //main url
        const mainURL = "https://api.nasa.gov/mars-photos/api/v1/rovers/" + roverName + "/photos?earth_date=" + dataObj.dateOfPhotos + "&api_key=" + process.env.API_KEY;  
        let images = await fetch(mainURL)
                     .then(response => {
                         return response.json()
                     });
                    
        const imgs = images.photos.map(image => {
            return {
                camCode : image.camera.name,
                camera : image.camera.full_name,
                image : image.img_src
               }
        })   

        //add images to dataObj and send
        dataObj.imagesArr = imgs; 
        res.send(dataObj); 

    } catch (err) {
        console.log('error:', err);
    }
})


//----------------------------------APOD-----------------------------
app.get('/apod', async (req, res) => {
    try {
        const url = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;  
        let image = await fetch(url).then(response => response.json())
        res.send(image) 
    } catch (err) {
        console.log('error:', err);
    }
})

//https://api.nasa.gov/insight_weather/?api_key=DEMO_KEY&feedtype=json&ver=1.0

// run server
app.listen(port, () => console.log(`Server listening on port ${port}!`))