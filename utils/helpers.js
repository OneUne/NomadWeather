export function processCurrentData(data, locale, setDays) {
  const {
    weather,
    main: { temp, temp_min, temp_max },
    wind: { speed },
    dt,
  } = data;

  const date = new Date(dt * 1000).toISOString().split("T")[0];
  const curWeather = {
    [date]: {
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
  };
  setDays(curWeather);
  return curWeather;
}

export function processForecastData(data, locale, days, setDays) {
  const dataByDate = new Map();
  const today = new Date(data.list[0].dt * 1000).toISOString().split("T")[0];

  for (let i of data.list) {
    const date = new Date(i.dt * 1000).toISOString().split("T")[0];
    const weatherObject = {
      temp: Math.floor(i.main.temp),
      wind_speed: i.wind.speed,
      rainfall: i.rain ? i.rain["3h"] : 0,
      day: new Intl.DateTimeFormat(locale, {
        weekday: "long",
      }).format(i.dt * 1000),
      md: new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
      }).format(i.dt * 1000),
      desc: i.weather[0].description,
    };
    dataByDate.set(
      date,
      dataByDate.get(date)
        ? [...dataByDate.get(date), weatherObject]
        : [weatherObject]
    );
  }

  dataByDate.forEach((value, key) => {
    if (key === today) {
      let [temp_min, temp_max] = [days[today].temp_min, days[today].temp_max];
      for (i of value) {
        temp_min = Math.min(temp_min, i.temp);
        temp_max = Math.max(temp_max, i.temp);
      }
      setDays((prevDays) => ({
        ...prevDays,
        [today]: {
          ...prevDays[today],
          temp_min: temp_min,
          temp_max: temp_max,
        },
      }));
    } else {
      const vlen = value.length;
      if (vlen > 4) {
        let [temp_min, temp_max] = [value[0].temp, value[0].temp];
        const descCounts = {};
        let [temp, wind_speed, rainfall] = [0, 0, 0];
        for (i of value) {
          temp_min = Math.min(temp_min, i.temp);
          temp_max = Math.max(temp_max, i.temp);
          temp += i.temp;
          wind_speed += i.wind_speed;
          rainfall += i.rainfall;
          const desc = i.desc;
          descCounts[desc] = (descCounts[desc] || 0) + 1;
        }

        const sortedDesc = Object.entries(descCounts).sort(
          (a, b) => b[1] - a[1]
        );

        setDays((prevDays) => ({
          ...prevDays,
          [key]: {
            temp: Math.floor(temp / vlen),
            temp_min: temp_min,
            temp_max: temp_max,
            wind_speed: (wind_speed / vlen).toFixed(2),
            rainfall: (rainfall / vlen).toFixed(2),
            day: value[0].day,
            md: value[0].md,
            desc: sortedDesc[0][0],
          },
        }));
      }
    }
  });
}
