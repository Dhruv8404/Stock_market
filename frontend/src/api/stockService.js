import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchStockData } from '../api/fetchStockData';

const parseData = (data, interval) => {
  let timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
  if (!timeSeriesKey) return [];

  const raw = data[timeSeriesKey];
  const parsed = Object.entries(raw).map(([time, values]) => ({
    time,
    price: parseFloat(values['1. open']),
  }));

  if (interval === '1D') {
    return parsed.slice(0, 8).reverse(); // last 24h data in 3h gaps
  } else if (interval === '5D') {
    return parsed.slice(0, 5).reverse();
  } else if (interval === '1M') {
    return parsed.filter((_, i) => i % 6 === 0).reverse(); // every 6 days
  } else if (interval === '6M') {
    return parsed.reverse().slice(0, 26); // weekly, 6 months
  } else if (interval === '1Y') {
    return parsed.reverse().slice(0, 12); // monthly
  }

  return parsed.reverse();
};

const StockChart = ({ symbol = 'RELIANCE' }) => {
  const [interval, setInterval] = useState('1D');
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetchStockData(symbol, interval);
      const parsed = parseData(res, interval);
      setData(parsed);
    };
    load();
  }, [symbol, interval]);

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        {['1D', '5D', '1M', '6M', '1Y'].map(type => (
          <button key={type} onClick={() => setInterval(type)} className="px-3 py-1 border rounded">
            {type}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="time" hide={interval === '1D' || interval === '5D'} />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
