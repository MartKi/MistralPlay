# 🌤️ Vejr Dashboard

Et simpelt og smukt vejr dashboard, der viser det nuværende vejr og en 5-dages prognose for din nuværende lokalitet.

## 📁 Filer

- `index.html` - Hovedsiden
- `style.css` - Styling
- `script.js` - JavaScript funktioner

## 🚀 Hurtig start

### 1. Få en OpenWeatherMap API-nøgle

Dashboardet bruger OpenWeatherMap API til at hente vejrdata.

1. Gå til [OpenWeatherMap](https://openweathermap.org/api)
2. Opret en gratis konto
3. Gå til "API Keys" fanen
4. Kopier din API-nøgle

### 2. Konfigurer dashboardet

Åbn `script.js` og udskift:

```javascript
const API_KEY = 'DIN_OPENWEATHERMAP_API_NOEGLE';
```

med din faktiske API-nøgle:

```javascript
const API_KEY = 'din_api_noegle_here';
```

### 3. Åbn dashboardet

Du kan åbne `index.html` direkte i din browser, eller hoste det på en webserver.

## 🌍 Funktioner

- ✅ Automatik positionering via browserens geolocation
- ✅ Nuværende vejr med temperatur, vejrbeskrivelse og ikon
- ✅ Føles som temperatur
- ✅ Luftfugtighed
- ✅ Vindhastighed (km/t)
- ✅ Lufttryk
- ✅ 5-dages vejrprognose
- ✅ Dansk sprog og formatering
- ✅ Responsive design (virker på mobil og desktop)
- ✅ Smukke ikoner fra Weather Icons
- ✅ Automatik opdatering hver 10. minut

## 📱 Browsersupport

- Chrome (anbefalet)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome for Android)

## ⚠️ Vigtige bemærkninger

1. **API-nøgle**: Uden en valid API-nøgle vil dashboardet ikke virke.
2. **Geolocation**: Browseren vil spørge om tilladelse til at bruge din position.
3. **Gratis API**: OpenWeatherMap's gratis plan har begrænsninger (60 kald pr. minut).
4. **Privacy**: Din position bruges kun til at hente vejrdata og gemmes ikke.

## 🎨 Tilpasning

Du kan nemt tilpasse:
- Farver i `style.css`
- Layout og design
- Hvilke vejrdata der vises
- Opdateringsinterval (ændre `setInterval` i script.js)

## 📝 Licens

Dette projekt er frit til personlig brug.

---

Nyd dit nye vejr dashboard! ☀️🌧️❄️
