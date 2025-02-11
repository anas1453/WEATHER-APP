document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("getWeatherBtn");
    button.addEventListener("click", getWeather);
});

async function getWeather() {
    const city = document.getElementById('city').value;
    const apiKey = 'TITBUWNPoeL3brUyHRAgfrMuB2RZXT9p'; // Tomorrow.io API Key

    if (!city) {
        document.getElementById('weather-info').innerHTML = "<p>Please enter a city name!</p>";
        return;
    }

    try {
        // Step 1: Get latitude & longitude using Open-Meteo Geocoding API
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        console.log('Geo Response:', geoResponse.data);  // Log the full response

        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            document.getElementById('weather-info').innerHTML = "<p>City not found. Try again!</p>";
            return;
        }

        const { latitude, longitude, name, country } = geoResponse.data.results[0];

        // Step 2: Get weather data from Tomorrow.io API
        const weatherUrl = `https://api.tomorrow.io/v4/timelines?location=${latitude},${longitude}&fields=temperature,humidity,windSpeed&apikey=${apiKey}`;
        console.log('Weather API URL:', weatherUrl); // Log the request URL

        const weatherResponse = await axios.get(weatherUrl);
        console.log('Weather Response:', weatherResponse.data); // Log the weather API response

        if (weatherResponse.data && weatherResponse.data.data && weatherResponse.data.data.timelines) {
            const { temperature, humidity, windSpeed } = weatherResponse.data.data.timelines[0].intervals[0].values;

            document.getElementById('weather-info').innerHTML = `
                <h2>${name}, ${country}</h2>
                <p>🌡️ Temperature: ${temperature}°C</p>
                <p>💧 Humidity: ${humidity}%</p>
                <p>🌬️ Wind Speed: ${windSpeed} m/s</p>
            `;
        } else {
            document.getElementById('weather-info').innerHTML = "<p>Weather data not available.</p>";
        }
    } catch (error) {
        console.error("API Error:", error);  // Log the error details
        document.getElementById('weather-info').innerHTML = "<p>Error fetching data.</p>";
    }
}
