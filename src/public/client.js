const dateC = document.getElementById('curiosity-dates');
const dateO = document.getElementById('opportunity-dates');
const dateS = document.getElementById('spirit-dates');
const camC = document.getElementById('curiosity-cams');
const camO = document.getElementById('opportunity-cams');
const camS = document.getElementById('spirit-cams');
const rootEl = document.getElementById('root');

//STATE store object
let store = Immutable.Map({
    apod: '',
    roverData: ''
})

const updateStore = (oldState, newState) => {
    store = oldState.merge(Immutable.Map(newState))
    let state = getStore();              
    //if no roverData then display apod            
    if (typeof state.roverData === "string"){
        render(rootEl, state, "displayApod") //display apod
    }else{
        render(rootEl, state, "displayRover") //display rover
    }
}

const getStore = () => {
    return {
        apod : store.get('apod'), 
        roverData :store.get('roverData')
    }
}

//renders to the specified element the correct HTML at the correct event
//         parameters:- where, what, when.
const render = async (element, state, myEvent) => {

    element.innerHTML = app(state, myEvent, getHTML);
}

//return required HTML ...Higher Order Function
//parameters:- what, when,    data/HTML- Callback                 
const app = (state, myEvent, getHTML) => { 
     
    let {apod, roverData} = state;

    switch(myEvent){
        case "displayApod" : {
            return `
                ${getHTML("APOD")(apod)}
            `    
        }; 
        //fresh API data here so have to update the correct dropdowns.
        case "displayRover" : {
            //setup navigation controls
            hideDropdowns();
            populateDropdowns(roverData); 
            return ` 
               ${getHTML("DATA")(roverData)} 
               ${getHTML("IMAGES")(getImages, roverData)()}
            `;
        };
        //here the images in roverData have been filtered by the cam dropdown.
        //no need to make another call the the API.
        case "dispRoverByCam" : {
            return ` 
                ${getHTML("DATA")(roverData)} 
                ${getHTML("IMAGES")(getImages, roverData)()}
            `;
        }
    }//switch 
}

// -----------------COMPONENTS TO SETUP NAV---------------------------
//hide all dropdowns 
const hideDropdowns = () => {
  var element = document.getElementsByClassName("drop-down");
  for (let i = 0; i < element.length; i++) {
    element[i].classList.add("hidden");
  }
}

 //check which is the current rover and reference correct drop downs
const populateDropdowns = (roverData) => {
    dateDropdown(selectDateDropdown(roverData), roverData);
    camDropdown(selectCamDropdown(roverData), roverData); 
}  

//returns correct date element for rover 
const selectDateDropdown = (roverData) => {
    switch (roverData.roverName) {
       case "Curiosity" : return dateC;
       case "Opportunity" : return dateO; 
       case "Spirit" : return dateS;
   }
} 

//returns correct cam element for rover 
const selectCamDropdown = (roverData) => {
    switch (roverData.roverName) {
       case "Curiosity" : return camC;
       case "Opportunity" : return camO; 
       case "Spirit" : return camS;
   }
} 

//adds all available image dates for selected rover
const dateDropdown = (dateEl, roverData) => {
    //only need to do once per API call 
    if (dateEl.classList.contains("hidden")){
        const arr = roverData.photosArr; 
        let dateOption;
        arr.slice().reverse().forEach(obj => {
            dateOption = document.createElement("option");
            dateOption.text = obj.earth_date;
            dateOption.value = obj.earth_date;
            dateEl.add(dateOption);
        })
        dateEl.classList.remove("hidden");
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
    camEl.classList.remove("hidden"); 
} 

//--------------------COMPONENTS TO RENDER HTML------------------------
//Higher Order Function
const getHTML = (request) => {
    switch (request) {
        case "APOD"   : return imageOfTheDay;
        case "DATA"   : return dataFromRover;
        case "IMAGES" : return imagesFromRover;
    } 
     
}

const imageOfTheDay = (apod) => {
    if (apod.media_type !== "video"){
        //display new apod
        return`
            <div class="apod-container">
                <h2>Astronomy Picture Of the Day</h2>
                <h3>${apod.title}</h3>
                <p>${apod.explanation}</p>
                <img src="${apod.url}"/> 
            </div> 
       `;
    }else{
        //display a default mars image
        return`
            <div class="apod-container">
                <h2>Select A Rover</h2>
                <img src="assets/images/mars.jpg"/>
            </div> 
       `;  
    }   
}

const dataFromRover = (roverData) => {
    return `
        <div class="rover-data-container">
        <table>
        <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Launch Date</th>
            <th>Landing Date</th>
            <th>Date of Photos</th>  
        </tr>
        <tr>
            <td>${roverData.roverName}</td>
            <td>${roverData.status}</td>
            <td>${roverData.launchDate}</td>
            <td>${roverData.landingDate}</td>
            <td>${roverData.dateOfPhotos}</td>
        </tr>
        </table>
        </div>
    `;
}

//Higher Order Function
const imagesFromRover = (getImages, roverData) => {
    let images = getImages(roverData);

    return function(){
        let html = ''; 
        images.forEach((img) => {
            html += `
                <div class="inner-grid">
                    <div class="rover-image-container">
                        <p>${img.camera}</p>
                        <img src=${img.image}>
                    </div>  
                </div>
            `;
        })
        return `
            <div class="outer-grid">
            ${html}
            </div>
        `;
   };  
}

const getImages = (roverData) => {
    return (selectCamDropdown(roverData).value === "ALLCAMS") ?
        roverData.imagesArr :
        roverData.imagesArr.filter(obj => obj.camCode === camDropdown.value);       
}


// -----------------------------EVENTS----------------------------------------
window.addEventListener("load", () => {
    getImageOfTheDay();
})

document.querySelectorAll('.btn').forEach(item => {
    item.addEventListener('click', event => {
        getDataFromRover(event.target.innerHTML,"no date"); 
    })
})

dateC.addEventListener("change", () => {
    getDataFromRover("curiosity", dateC.value); 
})

dateO.addEventListener("change", () => {
    getDataFromRover("opportunity", dateO.value); 
})

dateS.addEventListener("change", () => {
    getDataFromRover("spirit", dateS.value); 
})

camC.addEventListener("change", () => {
    render(rootEl, getStore(), "dispRoverByCam");         
}) 

camO.addEventListener("change", () => {
    render(rootEl, getStore(), "dispRoverByCam");         
}) 

camS.addEventListener("change", () => {
    render(rootEl, getStore(), "dispRoverByCam");         
}) 


// ------------------------------API CALLS------------------------------------
const getDataFromRover = (roverName, date) => {
    fetch(`http://localhost:3000/rover/${roverName}/date/${date}`)
    .then(res => res.json())
    .then(roverData => updateStore(store, { roverData }));   
}

const getImageOfTheDay = () => {
   fetch(`http://localhost:3000/apod`)
   .then(res => res.json())
   .then(apod => updateStore(store, { apod })) 
}     


