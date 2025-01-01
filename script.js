const API_KEY= "38db5cce97194b849e7145718242612";
const cityInput = document.querySelector('#city');
const switchBtn = document.querySelector('.switcher__switch');
const cityName = document.querySelector('.search-group__city');
const currentTemperature = document.querySelector('.search-group__temperature');
const currentDate = document.querySelector('.search-group__date');
const currentWeatherImg = document.querySelector('.search-group__weather-img');
const additionalDataItems = document.querySelectorAll('.additional-data__item');
const futureForecastList = document.querySelector('.future-forecast__list')
const hourlyForecastList = document.querySelector('.today-group__list')
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


function fillEntities(dataObj){ // функция-прокси для передачи объекта с данными для других функций, которые будут заполнять группы элементов данными

    fillCurrent(dataObj); // передаем объект с текущими данными

    fillForecast(dataObj.forecast.forecastday); // передаем массив объектов с прогнозом на 4 дня

    fillHourlyForecast(dataObj); // передаем массив объектов с прогнозом на 24 часа .forecast.forecastday[0].hour, dataObj.location.localtime

    fillAdditionalData(dataObj); // передаем объект с дополнительными данными
}


function fillCurrent(dataObj) {
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
}


function fillForecast(forecastArray){
    
    forecastArray.slice(1).forEach(element => { // срезаем первый элемент, т.к. он является текущим днем
        if(document.querySelectorAll('.future-forecast__item').length < 3){ // если длина списка прогноза меньше 3, то...

            let futureForecastItem = document.createElement('li')
            futureForecastItem.classList.add('future-forecast__item')

            let forecastDate = new Date(element.date);
            let forecastDay = forecastDate.getDay();
            let forecastMonthDay = forecastDate.getDate();
            let forecastMonth = forecastDate.getMonth() + 1; // почему то месяц получался на -1 

            // создаем шаблон внутренней разметки на основе данных из объекта для динамического создания элементов
            futureForecastItem.innerHTML = ` 
                <img src="./assets/icons/${element.day.condition.text}.svg" alt="#" class="future-forecast__img weather-img"
                width="80"
                height="80"
                >
                <div class="future-forecast__day-data">
                    <p class="future-forecast__day">
                        ${days[forecastDay]}, ${forecastMonthDay < 10 ? `0${forecastMonthDay}` : forecastMonthDay}.${forecastMonth < 10 ? `0${forecastMonth}` : forecastMonth}
                    </p> 
                    <p class="future-forecast__weather">
                        ${element.day.condition.text}
                    </p> 
                    <p class="future-forecast__temperature">
                        ${Math.round(element.day.avgtemp_c)} ${metricMeasurementSystem ? '°C' : '°F'} 
                    </p>
                </div>
            `
            futureForecastList.append(futureForecastItem) // добавляем элементы в список-прогноз
        }   
    })
}


function fillHourlyForecast(dataObj){

    let hourlyForecastArray = dataObj.forecast.forecastday[0].hour;
    let hourTime = new Date(hourlyForecastArray[0].time).getHours();
    let localTime = new Date(dataObj.location.localtime).getHours();
    
    console.log(hourlyForecastArray);

    // slice from el.time.getH() === localTime.getH()
    
    hourlyForecastArray.forEach(element => {
        if(document.querySelectorAll('.today-group__item').length < 4){ // если длина списка прогноза меньше 4, то...

            let hourlyForecastItem = document.createElement('li')
            hourlyForecastItem.classList.add('today-group__item')

            let forecastDate = new Date(element.time);
            let forecastHours = forecastDate.getHours();
            let forecastMinutes = forecastDate.getMinutes();

            // создаем шаблон внутренней разметки на основе данных из объекта для динамического создания элементов
            hourlyForecastItem.innerHTML = ` 
                <p class="today-group__time">${forecastHours < 10 ? `0${forecastHours}` : forecastHours}:${forecastMinutes < 10 ? `0${forecastMinutes}` : forecastMinutes}</p>
                <img src="./assets/icons/${element.condition.text}.svg" alt="#" class="today-group__img weather-img"
                width="80"
                height="80"
                >
                <p class="today-group__temperature">
                ${metricMeasurementSystem ? // в зависимости от состояние флага, изменяются отображаемые единицы измерения
                    Math.round(element.temp_c) 
                    : 
                    Math.round(element.temp_f)} 
                ${metricMeasurementSystem ? 
                    '°C' 
                    : 
                    '°F'}</p>
            `
            hourlyForecastList.append(hourlyForecastItem) // добавляем элементы в список-прогноз
        }   
    })
}


function fillAdditionalData(dataObj){
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


document.addEventListener('submit', e => {
    e.preventDefault()

    getData(cityInput.value)
})


setTimeout(() => {
    getData(cityInput.value)
}, 100000);