// Vejr Dashboard - Open-Meteo API (Ingen API-nøgle nødvendig!)
// Bruger den gratis Open-Meteo API: https://open-meteo.com/

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

// Weather Icons mapping baseret på WMO koder
// Open-Meteo bruger WMO vejrkoder: https://www.nco.ncep.noaa.gov/pmb/docs/on388/table2.html
const weatherIconMap = {
    // 0: Clear sky
    0: 'wi-day-sunny',
    // 1: Mainly clear
    1: 'wi-day-sunny',
    // 2: Partly cloudy
    2: 'wi-day-cloudy',
    // 3: Overcast
    3: 'wi-cloudy',
    // 45: Fog
    45: 'wi-fog',
    // 48: Depositing rime fog
    48: 'wi-fog',
    // 51: Light drizzle
    51: 'wi-day-sprinkle',
    // 53: Moderate drizzle
    53: 'wi-day-sprinkle',
    // 55: Dense drizzle
    55: 'wi-day-sprinkle',
    // 56: Light freezing drizzle
    56: 'wi-day-sleet',
    // 57: Dense freezing drizzle
    57: 'wi-day-sleet',
    // 61: Slight rain
    61: 'wi-day-rain',
    // 63: Moderate rain
    63: 'wi-day-rain',
    // 65: Heavy rain
    65: 'wi-day-rain',
    // 66: Light freezing rain
    66: 'wi-day-sleet',
    // 67: Heavy freezing rain
    67: 'wi-day-sleet',
    // 71: Slight snow
    71: 'wi-day-snow',
    // 73: Moderate snow
    73: 'wi-day-snow',
    // 75: Heavy snow
    75: 'wi-day-snow',
    // 77: Snow grains
    77: 'wi-day-snow',
    // 80: Slight rain showers
    80: 'wi-day-showers',
    // 81: Moderate rain showers
    81: 'wi-day-showers',
    // 82: Violent rain showers
    82: 'wi-day-showers',
    // 85: Slight snow showers
    85: 'wi-day-snow',
    // 86: Heavy snow showers
    86: 'wi-day-snow',
    // 95: Thunderstorm
    95: 'wi-day-thunderstorm',
    // 96: Thunderstorm with slight hail
    96: 'wi-day-thunderstorm',
    // 99: Thunderstorm with heavy hail
    99: 'wi-day-thunderstorm'
};

// Danske vejrbeskrivelser baseret på WMO koder
const weatherDescriptions = {
    0: 'Klar himmel',
    1: 'Overvejende klart',
    2: 'Delvis skyet',
    3: 'Overskyet',
    45: 'Tåge',
    48: 'Rimtåge',
    51: 'Let styrregn',
    53: 'Moderat styrregn',
    55: 'Kraftig styrregn',
    56: 'Let underkølet styrregn',
    57: 'Kraftig underkølet styrregn',
    61: 'Let regn',
    63: 'Moderat regn',
    65: 'Kraftig regn',
    66: 'Let underkølet regn',
    67: 'Kraftig underkølet regn',
    71: 'Let sne',
    73: 'Moderat sne',
    75: 'Kraftig sne',
    77: 'Snekorn',
    80: 'Let regnbyge',
    81: 'Moderat regnbyge',
    82: 'Kraftig regnbyge',
    85: 'Let snebyge',
    86: 'Kraftig snebyge',
    95: 'Tordenvejr',
    96: 'Tordenvejr med let hagl',
    99: 'Tordenvejr med kraftig hagl'
};

// Nat ikoner (tilføj 'n' for nat version)
const nightIconMap = {
    0: 'wi-night-clear',
    1: 'wi-night-alt-cloudy',
    2: 'wi-night-alt-cloudy',
    3: 'wi-night-alt-cloudy',
    45: 'wi-night-fog',
    51: 'wi-night-alt-sprinkle',
    53: 'wi-night-alt-sprinkle',
    55: 'wi-night-alt-sprinkle',
    61: 'wi-night-alt-rain',
    63: 'wi-night-alt-rain',
    65: 'wi-night-alt-rain',
    71: 'wi-night-alt-snow',
    73: 'wi-night-alt-snow',
    75: 'wi-night-alt-snow',
    80: 'wi-night-alt-showers',
    81: 'wi-night-alt-showers',
    82: 'wi-night-alt-showers',
    85: 'wi-night-alt-snow',
    86: 'wi-night-alt-snow',
    95: 'wi-night-alt-thunderstorm',
    96: 'wi-night-alt-thunderstorm',
    99: 'wi-night-alt-thunderstorm'
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

// Hent vejrdata fra Open-Meteo
async function fetchWeatherData(lat, lon) {
    try {
        // Hent nuværende vejr og 5-dages prognose
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,pressure_msl&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Kunne ikke hente vejrdata');
        }
        
        const data = await response.json();
        
        displayCurrentWeather(data, lat, lon);
        displayForecast(data);
        updateLastUpdated();
        
    } catch (error) {
        showError(`Fejl: ${error.message}`);
        console.error('Error fetching weather:', error);
    }
}

// Vis nuværende vejr
function displayCurrentWeather(data, lat, lon) {
    const { current_weather, hourly, daily, timezone } = data;
    const { temperature, weathercode, windspeed } = current_weather;
    
    // Get location name from reverse geocoding (using Nominatim)
    getLocationName(lat, lon, timezone).then(locationName => {
        locationElement.textContent = locationName;
    }).catch(() => {
        // Fallback: show coordinates
        locationElement.textContent = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
    });
    
    // Temperatur
    temperatureElement.textContent = Math.round(temperature);
    
    // Vejrikon (dag/nat baseret på solopgang/nedgang - estimat)
    const now = new Date();
    const hours = now.getHours();
    const isDay = hours >= 6 && hours < 18;
    const iconCode = isDay ? weatherIconMap[weathercode] : nightIconMap[weathercode];
    const iconClass = iconCode || (isDay ? 'wi-day-cloudy' : 'wi-night-alt-cloudy');
    weatherIconElement.className = `wi ${iconClass}`;
    
    // Beskrivelse
    const description = weatherDescriptions[weathercode] || 'Ukendt vejr';
    descriptionElement.textContent = description;
    
    // Føles som (approximation: use current temp for now, or calculate from humidity/wind)
    // For simplicity, we'll use the current temperature
    feelsLikeElement.textContent = `${Math.round(temperature)}°C`;
    
    // Luftfugtighed (get current hourly value)
    const currentHour = now.getHours();
    const hourlyIndex = hourly.time.findIndex(t => {
        const date = new Date(t);
        return date.getHours() === currentHour;
    });
    
    const humidity = hourlyIndex !== -1 ? hourly.relativehumidity_2m[hourlyIndex] : 0;
    humidityElement.textContent = `${Math.round(humidity)}%`;
    
    // Vind (km/t - Open-Meteo gives m/s, convert to km/h)
    windElement.textContent = `${Math.round(windspeed * 3.6)} km/t`;
    
    // Lufttryk (hPa)
    const pressure = hourlyIndex !== -1 ? hourly.pressure_msl[hourlyIndex] : 0;
    pressureElement.textContent = `${Math.round(pressure)} hPa`;
}

// Hent stednavn fra koordinater (reverse geocoding)
async function getLocationName(lat, lon, timezone) {
    try {
        // Extract timezone info (e.g., "Europe/Copenhagen")
        const timezoneParts = timezone.split('/');
        if (timezoneParts.length >= 2) {
            const city = timezoneParts[1].replace('_', ' ');
            const country = timezoneParts[0];
            return `${city}, ${country}`;
        }
        
        // Fallback: use Nominatim (OpenStreetMap)
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=da`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
                // Extract city and country from display_name
                const parts = data.display_name.split(', ');
                if (parts.length >= 2) {
                    return `${parts[0]}, ${parts[parts.length - 1]}`;
                }
                return data.display_name;
            }
        }
        
        // Final fallback
        return `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
    } catch (error) {
        console.error('Error getting location name:', error);
        return `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
    }
}

// Vis 5-dages prognose
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    const { daily, timezone } = data;
    const { time, weathercode, temperature_2m_max, temperature_2m_min } = daily;
    
    // Vis de næste 5 dage (undgå i dag hvis muligt)
    const forecastsToShow = Math.min(5, time.length);
    
    for (let i = 0; i < forecastsToShow; i++) {
        const date = new Date(time[i]);
        const dayName = daysOfWeek[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        
        const code = weathercode[i];
        const maxTemp = temperature_2m_max[i];
        const minTemp = temperature_2m_min[i];
        
        // Determine if it's day or night for the forecast icon
        // For simplicity, assume day for forecast
        const iconClass = weatherIconMap[code] || 'wi-cloud';
        const desc = weatherDescriptions[code] || 'Ukendt';
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="day">${dayName} ${day}. ${month}</div>
            <div class="forecast-icon"><i class="wi ${iconClass}"></i></div>
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(maxTemp)}°</span>
                <span class="min-temp">${Math.round(minTemp)}°</span>
            </div>
            <div class="forecast-desc" style="font-size: 0.8rem; color: #666; margin-top: 5px;">${desc}</div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    }
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
