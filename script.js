const API_KEY= "38db5cce97194b849e7145718242612";
const cityInput = document.querySelector('#city');
const switchBtn = document.querySelector('.switcher__switch');
const cityName = document.querySelector('.search-group__city')
const currentTemperature = document.querySelector('.search-group__temperature')
const currentDate = document.querySelector('.search-group__date')
const currentWeatherImg = document.querySelector('.search-group__weather-img')

const date = new Date()
const day = date.getDay()
const hour = date.getHours()
const minutes = date.getMinutes()
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
console.log(days[day], hour, minutes);


currentDate.textContent = `${days[day]}, ${hour < 10 ? `0${hour}` :  hour}:${minutes < 10 ? `0${minutes}` :  minutes}` // установит текущее время соответствующее времени часовой зоны пользователя

function getData(cityValue){
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityValue}`;

    fetch(url)
        .then(response => {
            console.log(response);

            if(!response.ok){
                throw new Error('Server error')
            }
            
            return response.json()
        })
        .then(dataObj => {
            console.log(dataObj);

            if(!dataObj){
                throw new Error('Response error')
            }
            
            return fillEntities(dataObj);
        })
        .catch(error => {
            console.log(error.message);
        })
}


function fillEntities(dataObj){
    currentWeatherImg.src = `./assets/icons/${dataObj.current.condition.text}.svg`
    cityName.innerHTML = `
        <i class="fa-solid fa-location-arrow"></i> ${dataObj.location.name}
    `
    currentTemperature.textContent = `${Math.round(dataObj.current.temp_c)} °C`
    
}


function updateEntities(){

}


document.addEventListener('submit', e => {
    e.preventDefault()

    getData(cityInput.value)
})


setTimeout(() => {
    updateEntities()
}, 100000);


