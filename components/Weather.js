// components/Weather.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function Weather({ city }) {
  const [temperature, setTemperature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const url2 =
          "https://api.openweathermap.org/data/2.5/weather?q=Monterrey&units=metric&appid=1de4eee60a14cbbf9250b0d337f81206";

        const response = await axios.get(url2);
        setTemperature(response.data.main.temp);
        setLoading(false);
      } catch (err) {
        setError("Error fetching weather data");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

  if (loading) return <p>Loading weather...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="fixed bottom-0 left-0 z-50 bg-white p-4">
      <p className="text-2xl ">{Math.round(temperature)}°</p>
      <h2 className="text-xl font-bold mt-2">{city}</h2>
    </div>
  );
}
