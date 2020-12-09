require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', express.static(path.join(__dirname, '../public'))) //send static content 

//Get todays date
const formatYmd = date => {
    return date.toISOString().slice(0, 10); 
}    

app.get('/apod', async (req, res) => {
    try {
        const url = "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;  
        let image = await fetch(url).then(response => response.json())
        res.send({image}) 
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/curiosity', async (req, res) => {
    try {
        //let date = formatYmd(new Date()); 
        let date = "2020-12-07";
        const url = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=" + date + "&api_key=" + process.env.API_KEY;  

        let data = await fetch(url).then(response => response.json())
        res.send(data) 
    } catch (err) {
        console.log('error:', err);
    }
})


// run server
app.listen(port, () => console.log(`Server listening on port ${port}!`))