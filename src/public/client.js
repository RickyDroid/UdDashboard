const buttonC = document.getElementById('curiosity');
const buttonO = document.getElementById('opportunity');
const buttonS = document.getElementById('spirit');
const dateC = document.getElementById('curiosity-dates');
const dateO = document.getElementById('opportunity-dates');
const dateS = document.getElementById('spirit-dates');

const setUp = document.getElementById('setup');
const rootEl = document.getElementById('root');

//STATE object
let store = Immutable.Map({
    apod: '',
    roverData: ''
})

const updateStore = (state, newState) => {
    store = state.merge(Immutable.Map(newState))
    state = {apod : store.get('apod'), 
             roverData :store.get('roverData') 
            }
    if (typeof state.roverData === "string"){
        render(setUp, state) //display apod
    }else{
        render(rootEl, state) //display rover
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
                <header>
                  ${imageOfTheDay(apod)}
                </header>
            `    
        }; break;

        case root : {
            populateDateDropdown(roverData);
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

// ------------------------------COMPONENTS--------------------------- 
const imageOfTheDay = (apod) => {
   return `
        <img src="${apod.url}" height="100px" width="50%" />
        <p>${apod.explanation}</p>
    `;
}

const populateDateDropdown = (roverData) => {
    //check which is the current rover and reference correct drop down
    let dateEl;
    switch (roverData.roverName){
        case "Curiosity" : dateEl = dateC; break;
        case "Opportunity" : dateEl = dateO; break;
        case "Spirit" : dateEl = dateS; break;
    }
    //if hidden populate and make visible
    if(dateEl.style.visibility === "hidden"){
        const dates = roverData.photosArr; 
        let dateOption;
        dates.reverse().forEach((obj) => {
            dateOption = document.createElement("option");
            dateOption.text = obj.earth_date;
            dateOption.value = obj.earth_date;
            dateEl.add(dateOption);
        })
        dateEl.style.visibility = "visible";
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

"TODO - use same event for every button"
buttonC.addEventListener("click", () => {
    getDataFromRover("curiosity", dateC.value); 
})

buttonO.addEventListener("click", () => {
    getDataFromRover("opportunity", dateO.value); 
})

buttonS.addEventListener("click", () => {
    getDataFromRover("spirit", dateS.value); 
})

// ------------------------------API CALLS------------------------------------
// rover name, apod image, launch date, landing date, rover status, 
// most recent photos + dates of photos, weather info - wind graph.
// API call to local server
//NOTE :- THE STORE IS UPDATED FIRST THEN THE DATA USED FROM THE STORE

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


