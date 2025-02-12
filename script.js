document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("getWeatherBtn");
    button.addEventListener("click", getWeather);
});

async function getWeather() {
    const city = document.getElementById('city').value;

    if (!city) {
        document.getElementById('weather-info').innerHTML = "<p>Please enter a city name!</p>";
        return;
    }

    try {
        // Step 1: Get latitude & longitude for the city
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            document.getElementById('weather-info').innerHTML = "<p>City not found. Try again!</p>";
            return;
        }

        const { latitude, longitude, name, country } = geoResponse.data.results[0];

        // Step 2: Get weather data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode&timezone=GMT`;
        const weatherResponse = await axios.get(weatherUrl);

        if (weatherResponse.data && weatherResponse.data.hourly) {
            const temperature = weatherResponse.data.hourly.temperature_2m[0]; // Current temperature
            const humidity = weatherResponse.data.hourly.relativehumidity_2m[0]; // Current humidity
            const windSpeed = weatherResponse.data.hourly.windspeed_10m[0]; // Current wind speed
            const weatherCode = weatherResponse.data.hourly.weathercode[0]; // Weather condition code

            // Calculate feels-like temperature
            const feelsLike = (13.12 + 0.6215 * temperature - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * Math.pow(windSpeed, 0.16) * temperature).toFixed(2);

            // Weather icons and condition descriptions
            const weatherIcons = {
                0: "☀️", // Clear sky
                1: "🌤️", // Mainly clear
                2: "⛅", // Partly cloudy
                3: "☁️", // Overcast
                45: "🌫️", // Foggy
                48: "🌫️", // Rime fog
                51: "🌦️", // Light drizzle
                53: "🌧️", // Moderate drizzle
                55: "🌧️", // Heavy drizzle
                61: "🌦️", // Light rain
                63: "🌧️", // Moderate rain
                65: "🌧️", // Heavy rain
                71: "❄️", // Light snow
                73: "❄️", // Moderate snow
                75: "❄️", // Heavy snow
                95: "⛈️", // Thunderstorm
            };

            const weatherDescription = weatherIcons[weatherCode] || "❓";

            // Step 3: Update the UI
            document.getElementById('weather-info').innerHTML = `
                <div class="weather-icon">${weatherDescription}</div>
                <h2>${name}, ${country}</h2>
                <p>🌡️ Temperature: ${temperature}°C</p>
                <p>🤔 Feels Like: ${feelsLike}°C</p>
                <p>💧 Humidity: ${humidity}%</p>
                <p>🌬️ Wind Speed: ${windSpeed} m/s</p>
            `;

            // Step 4: Change the background color based on the weather
            let backgroundColor = "#f0f8ff"; // Default (Clear Sky)
            if ([51, 53, 55, 61, 63, 65].includes(weatherCode)) {
                backgroundColor = "#a6dcef"; // Rainy
            } else if ([71, 73, 75].includes(weatherCode)) {
                backgroundColor = "#d0e8f2"; // Snowy
            } else if (weatherCode === 3) {
                backgroundColor = "#d3d3d3"; // Overcast
            }

            // Step 5: Apply Day/Night Mode (based on time of day)
            const currentHour = new Date().getHours();
            if (currentHour >= 18 || currentHour < 6) {
                backgroundColor = darkenColor(backgroundColor); // Darker shades for night
            }

            // Apply the background color
            document.body.style.backgroundColor = backgroundColor;
        } else {
            document.getElementById('weather-info').innerHTML = "<p>Weather data not available.</p>";
        }
    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        document.getElementById('weather-info').innerHTML = "<p>Error fetching data. Check the console for details.</p>";
    }
}

// Helper function to darken a color (for night mode)
function darkenColor(color) {
    return "#505050"; // You can further calculate darker shades here
}
