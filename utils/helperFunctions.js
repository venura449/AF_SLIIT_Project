function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.com$/;
    return re.test(email);
}

function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
}

function validateUserPresent(user) {
    return user != null;
}

function updateUsername(user, username) {
    if (username) {
        user.username = username;
    }
}

function fetchweather(lat, lon) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    // Using Current Weather API 2.5 (free tier, widely available)
    // One Call API 3.0 requires a paid subscription
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if API returned an error
            if (data.cod && data.cod !== 200) {
                throw new Error(`Weather API error: ${data.message || data.cod}`);
            }
            // Validate that data contains expected fields
            if (!data.main || data.main.temp === undefined) {
                throw new Error('Invalid weather data: missing temperature data');
            }
            const currentTemp = data.main.temp;
            const weatherDescription = data.weather?.[0]?.description || 'Unknown';
            return {
                currentTemp,
                weatherDescription,
                // Return additional useful data from current weather
                humidity: data.main.humidity,
                windSpeed: data.wind?.speed || 0,
                feelsLike: data.main.feels_like,
                clouds: data.clouds?.all || 0,
                pressure: data.main.pressure,
                visibility: data.visibility
            };
        })
        .catch(error => {
            console.error('Error fetching weather data:', error.message);
            throw error;
        });
}


module.exports = { validateEmail, validatePassword, validateUserPresent, updateUsername, fetchweather };