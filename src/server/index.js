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

function makeObj(data, date){
    let dop;
    if (date === "no date"){
        dop = data.photo_manifest.max_date;
    }else{
        dop = date;
    }   

    return {
        roverName : data.photo_manifest.name,
        landingDate : data.photo_manifest.landing_date,
        launchDate : data.photo_manifest.launch_date,
        status : data.photo_manifest.status,
        dateOfPhotos : dop, 
        photosArr : data.photo_manifest.photos 
        //imagesArr : this is added later -- chosen days image URL and camera description
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
                camera : image.camera.full_name,
                image : image.img_src
               }
        })      
        
        dataObj.imagesArr = imgs; //add images to dataObj
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