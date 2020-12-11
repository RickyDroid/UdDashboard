const rootEl = document.getElementById('root');

//STATE object
const store = {
    apod: 'test',
    roverData: ''
}

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

//renders correct HTML to the specified element
const render = async (element, state) => {
    element.innerHTML = app(state);
}

//compile all HTML here
const app = (state) => {
    let {apod, roverData} = state;
    //todo check if data available before trying to use it.
    return `
          ${dataFromRover(roverData)} 
          ${imagesFromRover(roverData)}
    `;
}

// ------------------------------COMPONENTS--------------------------- 
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
    return `
         <p>${roverData.imagesArr[0].camera}</p> 
         <img src=${roverData.imagesArr[0].image}>;
    `;
}

// -----------------------------EVENTS----------------------------------------
window.addEventListener("load", () => {
    getDataFromRover("curiosity");
})

// ------------------------------API CALLS------------------------------------
// rover name, apod image, launch date, landing date, rover status, 
// most recent photos + dates of photos, weather info - wind graph.
// API call to local server
//NOTE :- THE STORE IS UPDATED FIRST THEN THE DATA USED FROM THE STORE

const getDataFromRover = (roverName) => {
    fetch(`http://localhost:3000/rover/${roverName}`)
    .then(res => res.json())
    .then(roverData => updateStore(store, { roverData }));   
}

const getImageOfTheDay = () => {
   fetch(`http://localhost:3000/apod`)
   .then(res => res.json())
   .then(apod => updateStore(store, { apod })) 
}     