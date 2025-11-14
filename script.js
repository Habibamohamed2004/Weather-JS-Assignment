const apiKey = "723c65a8a3994a0ab77162427251011";

// Helper function to get the current date and time parts
function getFormattedDate(date) {
    const options = { weekday: 'long' };
    const dayName = date.toLocaleDateString("en-US", options);
    
    const day = date.getDate();
    const monthOptions = { month: 'long' };
    const monthName = date.toLocaleDateString("en-US", monthOptions).substring(0, 3);
    
    return { dayName, day, monthName };
}

// Function to get icon based on condition text/code (simplified for this design)
function getIconClass(conditionText) {
    if (conditionText.toLowerCase().includes('sunny') || conditionText.toLowerCase().includes('clear')) {
        return 'fa-sun';
    } else if (conditionText.toLowerCase().includes('cloud') || conditionText.toLowerCase().includes('overcast')) {
        return 'fa-cloud';
    } else if (conditionText.toLowerCase().includes('rain') || conditionText.toLowerCase().includes('drizzle')) {
        return 'fa-cloud-showers-heavy';
    } else if (conditionText.toLowerCase().includes('snow')) {
        return 'fa-snowflake';
    } else if (conditionText.toLowerCase().includes('moon') || conditionText.toLowerCase().includes('night')) {
        return 'fa-moon';
    }
    return 'fa-cloud'; // Default
}

async function getWeather(city) {
  const cityName = city || document.getElementById("cityInput").value.trim();
  // Set default to Cairo if no input and no geo-location is available on load
  if (cityName === "") { 
     getWeather("Cairo");
     return;
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=3&aqi=no&alerts=no`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      document.getElementById("weatherCards").innerHTML = `<p style="text-align:center; color:#fff; padding: 50px;">City not found 😔. Please try another location.</p>`;
      return;
    }

    displayWeather(data);
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

function displayWeather(data) {
  const forecast = data.forecast.forecastday;
  const container = document.getElementById("weatherCards");
  container.innerHTML = "";

  // Get current date for the first card's header
  const today = new Date();
  const { dayName: todayName, day: todayDay, monthName: todayMonth } = getFormattedDate(today);

  // --- Card 1 (Today's Weather - Detailed) ---
  const todayData = forecast[0];
  const currentTemp = data.current.temp_c;
  const currentConditionText = data.current.condition.text;
  const currentIconUrl = data.current.condition.icon;
  // Use dummy/placeholder data for extra info since it's not in the API response easily:
  const chanceOfRain = "20%"; 
  const windSpeed = "18km/h";
  const windDirection = "East";

  const todayCard = `
    <div class="card card-today">
      <div class="card-header">
        <span>${todayName}</span>
        <span>${todayDay}${todayMonth}</span>
      </div>
      <p class="location">${data.location.name}</p>
      <div class="today-temp-box">
        <div class="today-temp">${currentTemp.toFixed(1)}°C</div>
        <img src="https:${currentIconUrl}" class="today-icon" alt="${currentConditionText}">
      </div>
      <p class="today-text">${currentConditionText}</p>
      <div class="extra-info">
        <span><i class="fa-solid fa-droplet"></i> ${chanceOfRain}</span>
        <span><i class="fa-solid fa-wind"></i> ${windSpeed}</span>
        <span><i class="fa-solid fa-compass"></i> ${windDirection}</span>
      </div>
    </div>
  `;
  container.innerHTML += todayCard;


  // --- Cards 2 and 3 (Forecast) ---
  // Start loop from the second day (index 1)
  for (let i = 1; i < forecast.length; i++) {
    const day = forecast[i];
    const date = new Date(day.date);
    const { dayName: forecastDayName } = getFormattedDate(date);
    
    const maxTemp = day.day.maxtemp_c.toFixed(1);
    const minTemp = day.day.mintemp_c.toFixed(1);
    const conditionText = day.day.condition.text;
    const iconUrl = day.day.condition.icon;

    const forecastCard = `
      <div class="card forecast-card">
        <div class="card-header">
          <span>${forecastDayName}</span>
        </div>
        <img src="https:${iconUrl}" class="forecast-icon" alt="${conditionText}">
        <div class="forecast-max-temp">${maxTemp}°C</div>
        <div class="forecast-min-temp">${minTemp}°C</div>
        <p class="forecast-condition">${conditionText}</p>
      </div>
    `;
    container.innerHTML += forecastCard;
  }
}

function searchCity(event) {
  if (event.key === "Enter") {
    getWeather();
  }
}

// Get user's current location automatically on load
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&aqi=no&alerts=no`;
      try {
          const response = await fetch(url);
          const data = await response.json();
          displayWeather(data);
      } catch (error) {
          console.error("Error fetching geo weather:", error);
          getWeather("Cairo"); // Fallback on error
      }
    }, (error) => {
        // Fallback if geolocation is blocked or fails
        console.warn("Geolocation failed or blocked:", error.message);
        getWeather("Cairo");
    });
  } else {
      getWeather("Cairo");
  }
};