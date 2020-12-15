const buttonC = document.getElementById('curiosity');
const buttonO = document.getElementById('opportunity');
const buttonS = document.getElementById('spirit');
const buttonTest = document.getElementById('test-cam');

const dateC = document.getElementById('curiosity-dates');
const dateO = document.getElementById('opportunity-dates');
const dateS = document.getElementById('spirit-dates');

const camC = document.getElementById('curiosity-cams');
const camO = document.getElementById('opportunity-cams');
const camS = document.getElementById('spirit-cams');

const setUp = document.getElementById('setup');
const rootEl = document.getElementById('root');

//STATE store object
let store = Immutable.Map({
    apod: '',
    roverData: ''
})

const updateStore = (oldState, newState) => {
    store = oldState.merge(Immutable.Map(newState))
    let state = {apod : store.get('apod'), 
                 roverData :store.get('roverData') 
                }
    //if no roverData then display apod            
    if (typeof state.roverData === "string"){
        render(setUp, state, "displayApod") //display apod
    }else{
        render(rootEl, state, "displayRover") //display rover
    }
}

//renders correct HTML to the specified element
const render = async (element, state, myEvent) => {
    element.innerHTML = app(element, state, myEvent);
}

//return required HTML 
const app = (element, state, myEvent) => {
    let {apod, roverData} = state;
    switch(element){
        case setup : {
            return `
                <header>
                  ${imageOfTheDay(apod)}
                </header>
            `    
        }; break;

        case root : {
            //setup navigation controls
            if (myEvent === "displayRover"){
                 populateDropdowns(roverData); 
            }
           
            return ` 
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

// -----------------COMPONENTS TO SETUP NAV--------------------------- 

 //check which is the current rover and reference correct drop downs
const populateDropdowns = (roverData) => {
    dateDropdown(selectDateDropdown(roverData), roverData);
    camDropdown(selectCamDropdown(roverData), roverData); 
}  

//returns correct date element for rover 
const selectDateDropdown = (roverData) => {
    switch (roverData.roverName){
       case "Curiosity" : return dateC; 
       case "Opportunity" : return dateO; 
       case "Spirit" : return dateS; 
   }
}

//returns correct camera element for rover
const selectCamDropdown = (roverData) => {
   switch (roverData.roverName){
       case "Curiosity" : return camC; 
       case "Opportunity" : return camO; 
       case "Spirit" : return camS; 
   }
}

//adds all available image dates for selected rover
const dateDropdown = (dateEl, roverData) => {
    //only need to do once
    if (dateEl.style.visibility === "hidden"){
        const arr = roverData.photosArr; 
        let dateOption;

        arr.slice().reverse().forEach(obj => {
            dateOption = document.createElement("option");
            dateOption.text = obj.earth_date;
            dateOption.value = obj.earth_date;
            dateEl.add(dateOption);
        })
        dateEl.style.visibility = "visible";
    }
}

//adds all cams for the selected date for the rover
const camDropdown = (camEl, roverData) => {
    const date = roverData.dateOfPhotos; //current selected date
    const arr = roverData.photosArr; //array of photo data
    //find the object for this date and get the cameras array
    const camerasArr = arr.find(obj => obj.earth_date === date).cameras;
    camerasArr.unshift("ALLCAMS"); //add default option
    //clear for new content 
    camEl.innerHTML = null;
    //populate the dropdown with the camerasArr
    camerasArr.forEach(camStr => {
        camOption = document.createElement("option");
        camOption.text = camStr;
        camOption.value = camStr;
        camEl.add(camOption);
    }) 
    camEl.style.visibility = "visible"; 
} 

//--------------------COMPONENTS TO RENDER HTML------------------------
const imageOfTheDay = (apod) => {
    if (apod.media_type === "video"){
       return`
           <p>${apod.title}</p>
           <p>See today's featured video <a href="${apod.url}">here</a></p>
           <p>${apod.explanation}</p>
       `;
   }else{
       return `
           <p>${apod.title}</p>
           <img src="${apod.url}" height="100px" width="50%" />
           <p>${apod.explanation}</p>
       `;
   }
}

const dataFromRover = (roverData) => {
    return `
        <h3>Current rover is ${roverData.roverName}</h3>
        <h3>Current status is ${roverData.status}</h3>
        <h3>Launch date was ${roverData.launchDate}</h3>
        <h3>Landing date was ${roverData.landingDate}</h3>
        <h3>Date of photos ${roverData.dateOfPhotos} </h3>
    `;
}

 const imagesFromRover = (roverData) => {
    let images; 
    let strHTML = ''; 
    if (camC.value === "ALLCAMS"){
        images = roverData.imagesArr;
    }else{
        images = roverData.imagesArr.filter(obj => obj.camCode === camC.value);       
    }
    images.forEach((img) => {
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

buttonC.addEventListener("click", () => {
    getDataFromRover("curiosity", dateC.value); 
})

buttonO.addEventListener("click", () => {
    getDataFromRover("opportunity", dateO.value); 
})

buttonS.addEventListener("click", () => {
    getDataFromRover("spirit", dateS.value); 
})

camC.addEventListener("change", () => {
    let s = {apod : store.get('apod'), 
                 roverData :store.get('roverData') 
                }
    render(rootEl, s, "dispRoverByCam");         
}) 

// ------------------------------API CALLS------------------------------------
const getDataFromRover = (roverName, date) => {
    if (date === ""){
        date = "no date"; //can't send empty string
    }
    fetch(`http://localhost:3000/rover/${roverName}/date/${date}`)
    .then(res => res.json())
    .then(roverData => updateStore(store, { roverData }));   
}

const getImageOfTheDay = () => {
   fetch(`http://localhost:3000/apod`)
   .then(res => res.json())
   .then(apod => updateStore(store, { apod })) 
}     


//https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=m1g0UAblQZbOJx27R6H1lOJaKIMYTfj88RLyg1K4