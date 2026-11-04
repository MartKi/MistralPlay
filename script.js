// Vejr Dashboard - OpenWeatherMap API

// ⚠️ VIGTIGT: Du skal tilføje din egen API-nøgle fra OpenWeatherMap
// Få en gratis nøgle på: https://openweathermap.org/api
const API_KEY = 'DIN_OPENWEATHERMAP_API_NOEGLE'; // Udskift med din nøgle

// DOM elementer
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const weatherIconElement = document.getElementById('weather-icon');
const descriptionElement = document.getElementById('description');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const pressureElement = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast');
const lastUpdatedElement = document.getElementById('last-updated');

// Danske ugedage
const daysOfWeek = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

// Danske måneder
const months = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 
                'Juli', 'August', 'September', 'Oktober', 'November', 'December'];

// Weather Icons mapping
const weatherIconMap = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-night-alt-cloudy',
    '04d': 'wi-cloudy',
    '04n': 'wi-night-alt-cloudy',
    '09d': 'wi-day-showers',
    '09n': 'wi-night-alt-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-day-thunderstorm',
    '11n': 'wi-night-alt-thunderstorm',
    '13d': 'wi-day-snow',
    '13n': 'wi-night-alt-snow',
    '50d': 'wi-day-fog',
    '50n': 'wi-night-fog'
};

// Hent brugerens position
function getLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(latitude, longitude);
            },
            error => {
                showError(`Kunne ikke hente din position: ${getErrorMessage(error)}`);
                // Prøv med en default position (København)
                setTimeout(() => {
                    fetchWeatherData(55.6761, 12.5683);
                }, 2000);
            }
        );
    } else {
        showError('Geolocation er ikke understøttet i din browser');
        // Prøv med en default position (København)
        fetchWeatherData(55.6761, 12.5683);
    }
}

// Hent vejrdata fra OpenWeatherMap
async function fetchWeatherData(lat, lon) {
    try {
        // Hent nuværende vejr
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=da`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=da`;
        
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);
        
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Kunne ikke hente vejrdata. Tjek din API-nøgle.');
        }
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        updateLastUpdated();
        
    } catch (error) {
        showError(`Fejl: ${error.message}`);
        console.error('Error fetching weather:', error);
    }
}

// Vis nuværende vejr
function displayCurrentWeather(data) {
    const { name, sys, weather, main, wind } = data;
    const { temp, feels_like, humidity, pressure } = main;
    const { description, icon } = weather[0];
    
    // By og land
    locationElement.textContent = `${name}, ${sys.country}`;
    
    // Temperatur
    temperatureElement.textContent = Math.round(temp);
    
    // Vejrikon
    const iconClass = weatherIconMap[icon] || 'wi-day-cloudy';
    weatherIconElement.className = `wi ${iconClass}`;
    
    // Beskrivelse
    descriptionElement.textContent = description;
    
    // Føles som
    feelsLikeElement.textContent = `${Math.round(feels_like)}°C`;
    
    // Luftfugtighed
    humidityElement.textContent = `${humidity}%`;
    
    // Vind (konverter fra m/s til km/t)
    windElement.textContent = `${Math.round(wind.speed * 3.6)} km/t`;
    
    // Lufttryk
    pressureElement.textContent = `${pressure} hPa`;
}

// Vis 5-dages prognose
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Filtrer for at få en prognose pr. dag (klokken 12)
    const dailyForecasts = [];
    const seenDays = new Set();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.getDay();
        const hours = date.getHours();
        
        // Tag kun prognoser fra klokken 12 (midday) for hver dag
        if (hours === 12 && !seenDays.has(day)) {
            seenDays.add(day);
            dailyForecasts.push(item);
        }
    });
    
    // Sorter efter dato
    dailyForecasts.sort((a, b) => a.dt - b.dt);
    
    // Vis de næste 5 dage (undgå at vise i dag hvis der allerede er data)
    const forecastsToShow = dailyForecasts.slice(0, 5);
    
    forecastsToShow.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = daysOfWeek[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        
        const { temp_max, temp_min } = item.main;
        const { icon, description } = item.weather[0];
        
        const iconClass = weatherIconMap[icon] || 'wi-cloud';
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="day">${dayName} ${day}. ${month}</div>
            <div class="forecast-icon"><i class="wi ${iconClass}"></i></div>
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(temp_max)}°</span>
                <span class="min-temp">${Math.round(temp_min)}°</span>
            </div>
            <div class="forecast-desc" style="font-size: 0.8rem; color: #666; margin-top: 5px;">${description}</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Opdater sidst opdateret
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('da-DK', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const dateString = now.toLocaleDateString('da-DK', { 
        day: 'numeric', 
        month: 'short' 
    });
    lastUpdatedElement.textContent = `${dateString} kl. ${timeString}`;
}

// Vis fejlmeddelelse
function showError(message) {
    // Skjul loading
    const loading = document.querySelector('.loading');
    if (loading) loading.style.display = 'none';
    
    // Opret eller vis fejlmeddelelse
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        document.querySelector('main').prepend(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    console.error(message);
}

// Vis loading spinner
function showLoading() {
    const main = document.querySelector('main');
    let loading = document.querySelector('.loading');
    
    if (!loading) {
        loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = '<div class="loading-spinner"></div><p style="margin-top: 10px;">Henter vejrdata...</p>';
        main.prepend(loading);
    }
    loading.style.display = 'block';
}

// Hjælpefunktion til at oversætte geolocation fejl
function getErrorMessage(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Position blev afvist. Venligst tillad adgang til din position.';
        case error.POSITION_UNAVAILABLE:
            return 'Position er ikke tilgængelig.';
        case error.TIMEOUT:
            return 'Hentning af position tog for lang tid.';
        default:
            return 'Ukendt fejl ved hentning af position.';
    }
}

// Initialiser når siden er loadet
document.addEventListener('DOMContentLoaded', () => {
    // Tjek om API_KEY er sat
    if (API_KEY === 'DIN_OPENWEATHERMAP_API_NOEGLE' || !API_KEY) {
        showError('⚠️ Indsæt venligst din OpenWeatherMap API-nøgle i script.js filen!');
        return;
    }
    
    // Start med at hente position og vejr
    getLocation();
    
    // Opdater vejret hver 10. minut
    setInterval(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(latitude, longitude);
                }
            );
        }
    }, 10 * 60 * 1000);
});
