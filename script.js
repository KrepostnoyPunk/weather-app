const API_KEY= "38db5cce97194b849e7145718242612";
const cityInput = document.querySelector('#city');
const switchBtn = document.querySelector('.switcher__switch');
const cityName = document.querySelector('.search-group__city');
const currentTemperature = document.querySelector('.search-group__temperature');
const currentDate = document.querySelector('.search-group__date');
const currentWeatherImg = document.querySelector('.search-group__weather-img');
const additionalDataItems = document.querySelectorAll('.additional-data__item');
const futureForecastList = document.querySelector('.future-forecast__list')
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


let metricMeasurementSystem = true; // флаг состояния для переключения системы измерения


function getData(cityValue){
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityValue}&days=4`;

    fetch(url)
        .then(response => {
            console.log(response);

            if(!response.ok){
                throw new Error(error.stack)
            }
            
            return response.json()
        })
        .then(dataObj => {
            console.log(dataObj);

            if(!dataObj){
                throw new Error(error.stack)
            }
            
            return fillEntities(dataObj);
        })
        .catch(error => {
            console.log(error);
        })
} // all good

function fillEntities(dataObj){
    currentWeatherImg.src = `./assets/icons/${dataObj.current.condition.text}.svg`
    cityName.innerHTML = `<i class="fa-solid fa-location-arrow"></i> ${dataObj.location.name}`
    currentTemperature.textContent = `
    ${metricMeasurementSystem ? // в зависимости от состояние флага, изменяются отображаемые единицы измерения
        Math.round(dataObj.current.temp_c) 
        : 
        Math.round(dataObj.current.temp_f)} 
    ${metricMeasurementSystem ? 
        '°C' 
        : 
        '°F'}
    `

    let localTime = new Date(dataObj.location.localtime); // получаем локальное время
    let locationHours = localTime.getHours();
    let locationMinutes = localTime.getMinutes();
    let locationDay = localTime.getDay();

    const amOrPm = locationHours < 12 ? 'AM' : 'PM';
    const hourTwelveish = locationHours % 12;
    const hourGaranteed = hourTwelveish ? hourTwelveish : 12;  // из-за того что получался ноль при делении по остатку, получалось неправильное время и т.к. 0 - false, его можно заменить 


    currentDate.textContent = `${days[locationDay]}, ${hourGaranteed < 10 ? `0${hourGaranteed}` : hourGaranteed}:${locationMinutes < 10 ? `0${locationMinutes}` : locationMinutes} ${amOrPm}`

    let forecastArray = dataObj.forecast.forecastday; // получаем массив объектов с прогнозом на 4 дня

    forecastArray.forEach((element, index) => {
        if(document.querySelectorAll('.future-forecast__item').length < 3){ // если длина списка прогноза меньше 3, то...

            let futureForecastItem = document.createElement('li')
            futureForecastItem.classList.add('future-forecast__item')

            let forecastDate = new Date(dataObj.forecast.forecastday[index+1].date); // +1 чтобы скипнуть первый день, который является текущим
            let forecastDay = forecastDate.getDay();
            let forecastMonthDay = forecastDate.getDate();
            let forecastMonth = forecastDate.getMonth() + 1; // почему то месяц получался на -1 

            // создаемшаблон внутренней разметки на основе данных из объекта для динамического создания элементов
            futureForecastItem.innerHTML = ` 
                <img src="./assets/icons/${dataObj.forecast.forecastday[index+1].day.condition.text}.svg" alt="#" class="future-forecast__img weather-img"
                width="80"
                height="80"
                >
                <div class="future-forecast__day-data">
                    <p class="future-forecast__day">
                        ${days[forecastDay]}, ${forecastMonthDay < 10 ? `0${forecastMonthDay}` : forecastMonthDay}.${forecastMonth < 10 ? `0${forecastMonth}` : forecastMonth}
                    </p> 
                    <p class="future-forecast__weather">
                        ${dataObj.forecast.forecastday[index+1].day.condition.text}
                    </p> 
                    <p class="future-forecast__temperature">
                    ${Math.round(dataObj.forecast.forecastday[index+1].day.avgtemp_c)} ${metricMeasurementSystem ? '°C' : '°F'} 
                    </p>
                </div>
            `
            futureForecastList.append(futureForecastItem) // добавляем элементы в список-прогноз
        }   
    })

    
    
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