export function processCurrentData(data, locale, days, setDays) {
  const {
    weather,
    main: { temp, temp_min, temp_max },
    wind: { speed },
    dt,
  } = data;

  console.log(days);
  setDays([
    ...days,
    {
      temp: Math.floor(temp),
      temp_min: Math.floor(temp_min),
      temp_max: Math.floor(temp_max),
      wind_speed: speed,
      rainfall: data.rain ? data.rain["1h"] : 0,
      day: new Intl.DateTimeFormat(locale, {
        weekday: "long",
      }).format(dt * 1000),
      md: new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
      }).format(dt * 1000),
      desc: weather[0].description,
    },
  ]);
}

export function processForecastData(data, days, setDays) {}
