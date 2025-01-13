const appContainer = document.querySelector('.weather-app__inner')
const welcomeForm = document.querySelector('.search-group__form--welcome')
const welcomeInput = document.querySelector('.search-group__field--welcome')
const cityInput = document.querySelector('#city');
const switchBtn = document.querySelector('.switcher__switch');
const cityName = document.querySelector('.search-group__city');
const currentTemperature = document.querySelector('.search-group__temperature');
const currentDate = document.querySelector('.search-group__date');
const currentWeatherImg = document.querySelector('.search-group__weather-img');
const additionalDataItems = document.querySelectorAll('.additional-data__item');
const futureForecastGroup = document.querySelector('.future-forecast')
const switcherOption = document.querySelector('.switcher__option')
const todayForecastGroup = document.querySelector('.today-group__list-wrapper')
const preloaderEl = document.querySelector('.preloader')
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const prevBtn = document.querySelector('.btn--prev')
const nextBtn = document.querySelector('.btn--next')


appContainer.style.display = 'none'


let metricMeasurementSystem = localStorage.getItem('metricMeasurementSystem') ? JSON.parse(localStorage.getItem('metricMeasurementSystem')) : true; // флаг состояния для переключения системы измерения


switcherOption.textContent = metricMeasurementSystem ? `me` : `im`; // устанавливаем текст системы измерения в зависимости от состояния флага


switchBtn.style.animation = metricMeasurementSystem ? `toggleOff var(--animation-duration) linear forwards` : `toggleOn var(--animation-duration) linear forwards`; // устанавливаем анимацию(начально положение переключателя) в зависимости от состояния флага


let currentSlide = 0; // переменная для хранения текущего слайда


async function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getCoordinates, showError) // в случае если поддерживается метод запроса на получение местоположения и если дано согласие вызвать функцию getCoordinates результатом которой будет результат выполнения reverseGeocode
    } else{
        console.log('Geolocation is not welcomed here...');
    }
}


async function getCoordinates(position){
    // получаем координаты из объекта position и передаем в качестве аргументов функции которая эти координаты преобразует в название города
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    

    let actualLocation = await reverseGeocode(lat, lon) // получаем актуальную локацию по координатам    
    let cachedLocation = localStorage.getItem('location') // получаем раннее сохраненный город из localStorage

    let city;
    
    if(actualLocation != cachedLocation || !cachedLocation){ // если актуальная локация не равна сохраненной или сохраненной локации нет, то...
        city = actualLocation; // присваиваем актуальную локацию
    } else {
        city = cachedLocation // присваиваем сохраненную локацию
    }
    
    cityInput.value = city

    if(city){
        await getData(city)
    } else {
        // error handler
    }
}


function showError(error){
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied location request.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Inforamation about position unavailable.");
            break;
        case error.TIMEOUT:
            console.log("Location request timeout.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("0_o unknown error.");
            break;
    }
}


async function reverseGeocode(lat, lon){
    const API_KEY = "8e126ecf7f05478f8f99f0a470279c5b";
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${API_KEY}`;

    preloaderEl.style.cssText = `
        display: inline-flex;
        background-color: rgba(24, 22, 25, .3);
    `

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const dataObj = await response.json();

        const locationCity = dataObj.features[0].properties.city;

        localStorage.setItem('location', locationCity) // сохраняем локацию пользователя в localStorage

        return locationCity;
    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        preloaderEl.style.display = 'none';
    }
}

  
async function getData(cityValue){
    const API_KEY= "38db5cce97194b849e7145718242612";
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityValue}&days=4`;

    preloaderEl.style.cssText = `
        display: inline-flex;
        background-color: rgba(24, 22, 25, .3);
    `

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const dataObj = await response.json();

        await fillEntities(dataObj);

        welcomeForm.style.display = 'none'
        welcomeInput.value = '';  // сделать очистку поля ввода при последующем запросе
        appContainer.style.display = 'flex'

    } catch (error) {
        console.error('Fetch error:', error);
    } finally {
        preloaderEl.style.display = 'none';
    }
} // all good


async function fillEntities(dataObj){ // функция-прокси для передачи объекта с данными для других функций, которые будут заполнять группы элементов данными

    fillCurrent(dataObj); // передаем объект с текущими данными

    fillForecast(dataObj.forecast.forecastday); // передаем массив объектов с прогнозом на 4 дня

    fillHourlyForecast(dataObj); // передаем массив объектов с прогнозом на 24 часа .forecast.forecastday[0].hour, dataObj.location.localtime

    fillAdditionalData(dataObj); // передаем объект с дополнительными данными
}


function fillCurrent(dataObj) {
    currentWeatherImg.src = `${dataObj.current.condition.icon}`
    cityName.innerHTML = `<i class="fa-solid fa-location-arrow"></i> ${dataObj.location.name}`
    currentTemperature.textContent = `${dataObj.current.condition.text}, ${metricMeasurementSystem ?  `${Math.round(dataObj.current.temp_c)} °C` : `${Math.round(dataObj.current.temp_f)} °F`}`

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

        let  futureForecastList = document.createElement('ul')
        futureForecastList.classList.add('future-forecast__list')
        futureForecastGroup.append(futureForecastList)

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
                    <img src="${element.day.condition.icon}" alt="${element.day.condition.text}" class="future-forecast__img weather-img"
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
                            ${metricMeasurementSystem ? `${Math.round(element.day.avgtemp_c)} °C` : `${Math.round(element.day.avgtemp_f)} °F`} 
                        </p>
                    </div>
                `
                futureForecastList.append(futureForecastItem) // добавляем элементы в список-прогноз
            }   
        })
}


function fillHourlyForecast(dataObj){

        let  hourlyForecastList = document.createElement('ul')
        hourlyForecastList.classList.add('today-group__list')
        todayForecastGroup.append(hourlyForecastList)

        let localTime = new Date(dataObj.location.localtime).getHours();
        let hourlyForecastArray = dataObj.forecast.forecastday[0].hour.slice(localTime); // берем массив элементов начинающийся с текущего часа локального времени
        
        hourlyForecastArray.forEach(element => {
            if(document.querySelectorAll('.today-group__item').length < hourlyForecastArray.length){ // если длина списка прогноза меньше длины массива почасового прогноза, то...

                let hourlyForecastItem = document.createElement('li')
                hourlyForecastItem.classList.add('today-group__item')

                let forecastDate = new Date(element.time);
                let forecastHours = forecastDate.getHours();
                let forecastMinutes = forecastDate.getMinutes();

                // создаем шаблон внутренней разметки на основе данных из объекта для динамического создания элементов
                hourlyForecastItem.innerHTML = ` 
                    <p class="today-group__time">${forecastHours < 10 ? `0${forecastHours}` : forecastHours}:${forecastMinutes < 10 ? `0${forecastMinutes}` : forecastMinutes}</p>
                    <img src="${element.condition.icon}" alt="${element.condition.text}" class="today-group__img weather-img"
                    width="80"
                    height="80"
                    >
                    <p class="today-group__temperature">
                    ${metricMeasurementSystem ? `${Math.round(element.temp_c)} °C` : `${Math.round(element.temp_f)} °F`}
                    </p>
                `
                hourlyForecastList.append(hourlyForecastItem) // добавляем элементы в список-прогноз
            }   
        })
}


function updateSlider(){
    const slideWidth = document.querySelector('.today-group__item').offsetWidth; // получаем ширину слайда которая равна ширине элемента списка
    const todayGroupList = document.querySelector('.today-group__list'); // получаем список элементов слайдера
    
    todayGroupList.style.transform = `translateX(-${(slideWidth + 30) * currentSlide}px)` // перемещаем список на длину элемента слайда умноженную на текущий слайд + смещение
}


function fillAdditionalData(dataObj){
    additionalDataItems.forEach(item => {
        switch (true) {
            case item.classList.contains('additional-data__item--uv'):{
                item.textContent = `UV Index - ${Math.round(dataObj.current.uv)}`
                break;
            }
            case item.classList.contains('additional-data__item--wind-speed'):{
                item.textContent = `Wind Speed - ${metricMeasurementSystem ? `${Math.round(dataObj.current.wind_kph)} Km/h` : `${Math.round(dataObj.current.wind_mph)} M/ph`}`
                break;
            }
            case item.classList.contains('additional-data__item--visibility'):{
                item.textContent = `Visibility - ${metricMeasurementSystem ? `${Math.round(dataObj.current.vis_km)} Km` : `${Math.round(dataObj.current.vis_miles)} Mi`}`
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
                item.textContent = `Pressure - ${metricMeasurementSystem ? `${Math.round(dataObj.current.pressure_mb * 0.75006156)} mmHg` : `${dataObj.current.pressure_in} inHg60`}`
                break;
            }
            case item.classList.contains('additional-data__item--moon-phase'):{
                item.textContent = `Moon Phase - ${dataObj.forecast.forecastday[0].astro.moon_phase}`
                break;
            }
        }
    })
}


function clearPreviousResult(){
    preloaderEl.style.cssText = `
        display: inline-flex;
        background-color: rgba(24, 22, 25, .3);
    `
    if(document.querySelector('.future-forecast__list')){
        document.querySelector('.future-forecast__list').remove()
    }
    if(document.querySelector('.today-group__list')){
        document.querySelector('.today-group__list').remove()
    }
    preloaderEl.style.display = 'none'
}


function toggleMeasurementSystem(e){

    clearPreviousResult()

    if(e.target === switchBtn || e.target.closest('.switcher__option')){
        if(metricMeasurementSystem){
            switchBtn.style.animation = `toggleOn var(--animation-duration) linear forwards`;
            switcherOption.textContent = `im`;
            metricMeasurementSystem = false;
            localStorage.setItem('metricMeasurementSystem', metricMeasurementSystem)
        } else{
            switchBtn.style.animation = `toggleOff var(--animation-duration) linear forwards`;
            switcherOption.textContent = `me`;
            metricMeasurementSystem = true;
            localStorage.setItem('metricMeasurementSystem', metricMeasurementSystem)
        }
    } 

    getData(cityInput.value)
}


window.addEventListener('load', e => {
    preloaderEl.style.display = 'none';
    getLocation()
})


document.addEventListener('submit', e => {
    e.preventDefault()

    clearPreviousResult()
    getData(cityInput.value)
})


switchBtn.addEventListener('click', e => {
    if(cityInput.value){
        toggleMeasurementSystem(e)
    }
})


prevBtn.addEventListener('click', () => {
    if(currentSlide > 0){
        currentSlide--;
    } else {
        currentSlide = document.querySelectorAll('.today-group__item').length - 3; // Возвращаемся к последнему элементу
    }
    updateSlider();
})


nextBtn.addEventListener('click', () => {
    if(currentSlide < document.querySelectorAll('.today-group__item').length - 3){
        currentSlide++;
    } else {
        currentSlide = 0; // Возвращаемся к первому элементу
    }
    updateSlider();
})


setTimeout(() => {
    clearPreviousResult()
    if(cityInput.value){
        getData(cityInput.value)
    } else{
        getLocation()
    }
}, 100000);