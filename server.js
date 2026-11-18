require("dotenv").config();
const express = require("express");
const { getWeather } = require("./weather");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "ZAHEER DAILY WEATHER API",
    location: process.env.WEATHER_LOCATION || "Sheikhupura, Pakistan",
    endpoints: {
      weather: "/api/weather",
      health: "/health"
    }
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/weather", async (_req, res) => {
  try {
    const weather = await getWeather();
    res.json(weather);
  } catch (error) {
    console.error("Weather API error:", error.message);
    res.status(502).json({ error: "Weather provider unavailable" });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`ZAHEER weather API listening on ${port}`));
