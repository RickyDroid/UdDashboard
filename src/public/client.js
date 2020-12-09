//get the root instance
const root = document.getElementById('root');

let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
}

const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}

const App = (state) => {
    let { rovers, apod } = state; //destructuring the store for use.
    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}



//-------------------------------EVENTS---------------------------------------- 
window.addEventListener('load', () => {
    render(root, store)
})



// -----------------------------COMPONENTS--------------------------------------

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------API CALLS------------------------------------
// rover name, apod image, launch date, landing date, rover status, 
// most recent photos + dates of photos, weather info - wind graph.
// API call to local server
//NOTE :- THE STORE IS UPDATED FIRST THEN THE DATA USED FROM THE STORE


const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
    .then(res => res.json())
    .then(apod => updateStore(store, { apod })) 
}     
    
const getImageFromRover = (state) => {
    let test = "curiosity"
    fetch(`http://localhost:3000/${test}`)
    .then(res => res.json())
    .then(rover => updateStore(store, { rover }))
}
