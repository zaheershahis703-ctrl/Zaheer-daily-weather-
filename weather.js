const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail"
};

async function getWeather() {
  const lat = process.env.WEATHER_LAT || "31.7131";
  const lon = process.env.WEATHER_LON || "73.9783";
  const timezone = process.env.TIMEZONE || "Asia/Karachi";
  const location = process.env.WEATHER_LOCATION || "Sheikhupura, Pakistan";

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone,
    forecast_days: "7",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
      "weather_code"
    ].join(",")
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo returned HTTP ${response.status}`);
  }
  const data = await response.json();

  return {
    service: "ZAHEER DAILY WEATHER API",
    location,
    timezone: data.timezone,
    updated_at: data.current.time,
    current: {
      temperature_c: data.current.temperature_2m,
      feels_like_c: data.current.apparent_temperature,
      humidity_percent: data.current.relative_humidity_2m,
      precipitation_mm: data.current.precipitation,
      wind_speed_kmh: data.current.wind_speed_10m,
      condition: WEATHER_CODES[data.current.weather_code] || "Unknown",
      weather_code: data.current.weather_code
    },
    forecast: data.daily.time.map((date, i) => ({
      date,
      condition: WEATHER_CODES[data.daily.weather_code[i]] || "Unknown",
      high_c: data.daily.temperature_2m_max[i],
      low_c: data.daily.temperature_2m_min[i],
      rain_probability_percent: data.daily.precipitation_probability_max[i],
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i]
    })),
    source: "Open-Meteo"
  };
}

module.exports = { getWeather, WEATHER_CODES };
