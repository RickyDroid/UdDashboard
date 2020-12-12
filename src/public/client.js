const dateEl = document.getElementById('date');
const setUp = document.getElementById('setup');
const rootEl = document.getElementById('root');
const buttonC = document.getElementById('curiosity');
const buttonO = document.getElementById('opportunity');
const buttonS = document.getElementById('spirit');

//STATE object
const store = {
    apod: '',
    roverData: ''
}

const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    //if roverData is a string then apod has been updated
    if (typeof store.roverData === "string"){
         render(setUp, store) //display apod
    }else{
         render(rootEl, store) //display rover
    }
}
   

//renders correct HTML to the specified element
const render = async (element, state) => {
    element.innerHTML = app(element, state);
}

//compile all HTML here
const app = (element, state) => {
    let {apod, roverData} = state;
    
    switch(element){
        case setup : {
            return `
            <img src="${apod.image.url}" height="100px" width="50%" />
            <p>${apod.image.explanation}</p>
            `
        }
        case root : {
            //populate date picker
            populateDatePicker(roverData, dateEl);
           
            //check if data is available before trying to use it.
            if (typeof roverData === 'string'){
                return `
                    <H1>Error, no data</H1>
                `
            };
            return ` 
               <header></header>
                <main>
                    <section>
                        <p>
                            ${dataFromRover(roverData)} 
                        </p>
        
                        <p>
                            ${imagesFromRover(roverData)}
                        </p>
                    </section>
                </main>
                <footer></footer>
            `;
        }//case
    }//switch 
}

// ------------------------------COMPONENTS--------------------------- 
const populateDatePicker = (roverData) => {
    let dateOption = document.createElement('option');
    dateOption.text = roverData.photosArr[0].earth_date;
    dateOption.value = roverData.photosArr[0].earth_date;
    dateEl.add(dateOption);
}    

const dataFromRover = (roverData) => {
    return `
        <h3>Current rover is ${roverData.roverName}</h3>
        <h3>Current status is ${roverData.status}</h3>
        <h3>Launch date was ${roverData.launchDate}</h3>
        <h3>Landing date was ${roverData.landingDate}</h3>
        <h3>Date of pictures ${roverData.maxDate}</h3>
    `;
}

 const imagesFromRover = (roverData) => {
    let strHTML = ''; 
    roverData.imagesArr.forEach((img) => {
        strHTML += oneImageFromRover(img);
    })
    return strHTML;
 }

const oneImageFromRover = (img) => {
    return `
         <p>${img.camera}</p> 
         <img src=${img.image} height="100px" width="25%"> 
    `;
}

// -----------------------------EVENTS----------------------------------------
window.addEventListener("load", () => {
    getImageOfTheDay();
})

//TODO - pass in selected date
buttonC.addEventListener("click", () => {
    getDataFromRover("curiosity"); 
})

buttonO.addEventListener("click", () => {
    getDataFromRover("opportunity"); 
})

buttonS.addEventListener("click", () => {
    getDataFromRover("spirit"); 
})

// ------------------------------API CALLS------------------------------------
// rover name, apod image, launch date, landing date, rover status, 
// most recent photos + dates of photos, weather info - wind graph.
// API call to local server
//NOTE :- THE STORE IS UPDATED FIRST THEN THE DATA USED FROM THE STORE

const getDataFromRover = (roverName, date) => {
    fetch(`http://localhost:3000/rover/${roverName}`)
    .then(res => res.json())
    .then(roverData => updateStore(store, { roverData }));   
}

const getImageOfTheDay = () => {
   fetch(`http://localhost:3000/apod`)
   .then(res => res.json())
   .then(apod => updateStore(store, { apod })) 
}     