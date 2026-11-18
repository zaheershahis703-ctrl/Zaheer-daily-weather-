require("dotenv").config();
const { getWeather } = require("./weather");

function required(name) {
  const value = process.env[name];
  if (!value || value.startsWith("PASTE_")) {
    throw new Error(`Missing configuration: ${name}`);
  }
  return value;
}

async function main() {
  const token = required("WA_ACCESS_TOKEN");
  const phoneNumberId = required("WA_PHONE_NUMBER_ID");
  const recipient = required("WA_RECIPIENT").replace(/[^\d]/g, "");
  const version = required("GRAPH_API_VERSION");
  const templateName = process.env.WA_TEMPLATE_NAME || "daily_weather_report";
  const language = process.env.WA_TEMPLATE_LANGUAGE || "en";

  const report = await getWeather();
  const today = report.forecast[0];
  const current = report.current;

  // This must match the order of {{1}} ... {{12}} in your approved template.
  const values = [
    report.location,
    today.date,
    String(current.temperature_c),
    String(current.feels_like_c),
    String(current.humidity_percent),
    String(current.wind_speed_kmh),
    String(today.high_c),
    String(today.low_c),
    String(today.rain_probability_percent),
    today.sunrise.slice(11, 16),
    today.sunset.slice(11, 16),
    today.condition
  ];

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
      components: [{
        type: "body",
        parameters: values.map(value => ({
          type: "text",
          text: value
        }))
      }]
    }
  };

  const response = await fetch(
    `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`WhatsApp API error ${response.status}: ${JSON.stringify(result)}`);
  }
  console.log("Weather report accepted by WhatsApp:", JSON.stringify(result));
}

main().catch(error => {
  console.error("Daily weather send failed:", error.message);
  process.exitCode = 1;
});
