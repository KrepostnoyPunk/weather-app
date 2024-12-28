const API_KEY= "38db5cce97194b849e7145718242612";
const cityInput = document.querySelector('#city');
const switchBtn = document.querySelector('.switcher__switch');
const cityName = document.querySelector('.search-group__city');
const currentTemperature = document.querySelector('.search-group__temperature');
const currentDate = document.querySelector('.search-group__date');
const currentWeatherImg = document.querySelector('.search-group__weather-img');
const additionalDataItems = document.querySelectorAll('.additional-data__item');


const date = new Date()
const day = date.getDay();
const hour = date.getHours()
const minutes = date.getMinutes();
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ampm = hour < 12 ? 'AM' : 'PM';
const hourTwelveish = hour % 12;


let metricMeasurementSystem = true;


currentDate.textContent = `${days[day]}, ${hourTwelveish < 10 ? `0${hourTwelveish}` : hourTwelveish}:${minutes} ${ampm}` // установит текущее время соответствующее времени часовой зоны пользователя

function getData(cityValue){
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityValue}&days=4`;

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
        <i class="fa-solid fa-location-arrow"></i> ${dataObj.location.region}
    `
    currentTemperature.textContent = `${Math.round(dataObj.current.temp_c)} ${metricMeasurementSystem ? '°C' : '°F'} `
    additionalDataItems.forEach(item => {
        switch (true) {
            case item.classList.contains('additional-data__item--uv'):{
                item.textContent = `UV Index - ${Math.round(dataObj.current.uv)}`
                break;
            }
            case item.classList.contains('additional-data__item--wind-speed'):{
                item.textContent = `Wind Speed - ${Math.round(dataObj.current.wind_kph)} ${metricMeasurementSystem ? 'Km/h' : 'M/h'}`
                break;
            }
            case item.classList.contains('additional-data__item--visibility'):{
                item.textContent = `Visibility - ${Math.round(dataObj.current.vis_km)}`
                break;
            }
            case item.classList.contains('additional-data__item--humidity'):{
                item.textContent = `Humidity - ${Math.round(dataObj.current.humidity)}%`
                break;
            }
            case item.classList.contains('additional-data__item--sunrise'):{
                item.textContent = `Sunrise - ${dataObj.forecast.forecastday[0].astro.sunrise}`
                break;
            }
            case item.classList.contains('additional-data__item--sunset'):{
                item.textContent = `Sunset - ${dataObj.forecast.forecastday[0].astro.sunset}`
                break;
            }
            case item.classList.contains('additional-data__item--pressure'):{
                item.textContent = `Pressure - ${Math.round(dataObj.current.pressure_mb * 0.75006156)} mmHg`
                break;
            }
            case item.classList.contains('additional-data__item--moon-phase'):{
                item.textContent = `Moon Phase - ${dataObj.forecast.forecastday[0].astro.moon_phase}`
                break;
            }
        }
    })
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