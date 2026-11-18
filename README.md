# ZAHEER DAILY WEATHER API

A Node.js API for Sheikhupura, Punjab, Pakistan, plus a scheduled WhatsApp weather report at **7:00 AM Pakistan time**.

## What it does

- `GET /api/weather` returns current conditions and a 7-day forecast as JSON.
- A separate scheduled job sends the morning WhatsApp report.
- Weather data comes from Open-Meteo; no weather API key is required.
- Location/timezone defaults: Sheikhupura (31.7131, 73.9783), `Asia/Karachi`.

## 1. WhatsApp setup (required)

Use Meta's official WhatsApp Business Platform / Cloud API. You need a WhatsApp Business Account, a business phone number, an access token, and the phone number ID.

1. Open Meta for Developers and create/configure an app with the WhatsApp product.
2. In WhatsApp > API Setup, obtain the access token and Phone Number ID.
3. Add and verify the recipient number in the required test-recipient flow, if you are using a test setup.
4. Create a WhatsApp message template named `daily_weather_report`, set its language to `en`, and submit it for approval.
5. The template body must contain exactly these 12 placeholders in this order:

   `Good morning! Daily weather for {{1}} on {{2}}. Current temperature: {{3}} C (feels like {{4}} C). Humidity: {{5}}%. Wind: {{6}} km/h. Today's high/low: {{7}} C / {{8}} C. Rain chance: {{9}}%. Sunrise: {{10}}; sunset: {{11}}. Forecast: {{12}}. Have a safe day!`

   Choose the appropriate template category in WhatsApp Manager and follow Meta's review process. The scheduled sender uses a template because business-initiated messages outside the 24-hour customer-service window generally require an approved template.
6. Set `GRAPH_API_VERSION` to a currently supported version shown in your Meta app before deploying.

The recipient must have agreed to receive these daily weather messages. Do not send to people who have not opted in.

## 2. Deploy on Render

1. Put this project in a GitHub repository.
2. Sign in to Render and choose **New > Blueprint**.
3. Connect the repository containing `render.yaml`.
4. Render will create:
   - a web service for the JSON API
   - a cron job for the daily WhatsApp message
5. In the cron service's Environment settings, add:
   - `WA_ACCESS_TOKEN`
   - `WA_PHONE_NUMBER_ID`
   - `WA_RECIPIENT` (international format, digits only; e.g. `923001234567`)
6. Confirm the remaining settings in `render.yaml`. In particular, set `GRAPH_API_VERSION` to a version currently supported by Meta.
7. Deploy. The cron expression is `0 2 * * *` UTC, which is **7:00 AM in Pakistan (UTC+5)**.

Render cron jobs use UTC. The `starter` cron plan may incur a charge; check current Render pricing before enabling it. The web service's free plan availability and limits can change.

## 3. Test the API

After deployment, open:

`https://YOUR-RENDER-SERVICE.onrender.com/api/weather`

You should receive JSON with current weather and seven forecast days.

## 4. Test the WhatsApp sender locally

```bash
npm install
cp .env.example .env
# Fill in the WhatsApp credentials and recipient in .env
npm run send
```

Do not publish `.env`, access tokens, or phone-number credentials in GitHub or share them in chat.

## Local API

```bash
npm install
cp .env.example .env
npm start
```

Then visit `http://localhost:3000/api/weather`.

## Notes

- The report is a forecast, not an official emergency warning service.
- Weather values can change; use official local alerts for urgent weather decisions.
- Open-Meteo's free service is subject to its terms and usage limits.
