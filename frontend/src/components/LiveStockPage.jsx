import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Zap
} from 'lucide-react';

const LiveStockPage = () => {
  const [stocks, setStocks] = useState([
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      price: 2934.85,
      change: 12.45,
      changePercent: 0.43,
      volume: '3.1M',
      marketCap: '19.8T'
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd.',
      price: 3921.60,
      change: -24.20,
      changePercent: -0.61,
      volume: '1.9M',
      marketCap: '14.4T'
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd.',
      price: 1598.45,
      change: 10.10,
      changePercent: 0.64,
      volume: '4.3M',
      marketCap: '6.8T'
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd.',
      price: 1654.30,
      change: 5.75,
      changePercent: 0.35,
      volume: '5.2M',
      marketCap: '12.5T'
    },
    {
      symbol: 'ICICIBANK',
      name: 'ICICI Bank Ltd.',
      price: 1120.25,
      change: -8.30,
      changePercent: -0.74,
      volume: '6.7M',
      marketCap: '8.3T'
    },
    {
      symbol: 'ITC',
      name: 'ITC Ltd.',
      price: 456.80,
      change: 2.15,
      changePercent: 0.47,
      volume: '7.1M',
      marketCap: '5.7T'
    }
  ]);

  const [selectedStock, setSelectedStock] = useState(stocks[0]);
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState('1D');
  const [marketStatus, setMarketStatus] = useState('OPEN');
  const [currentTime, setCurrentTime] = useState(new Date());

  const generateInitialChartData = (basePrice, range) => {
    const now = new Date();
    const data = [];
    let price = basePrice;
    let intervals = 0;
    let step = 60000;

    switch (range) {
      case '1D': intervals = 8; step = 3 * 60 * 60 * 1000; break;
      case '5D': intervals = 5; step = 24 * 60 * 60 * 1000; break;
      case '1M': intervals = 5; step = 6 * 24 * 60 * 60 * 1000; break;
      case '6M': intervals = 12; step = 15 * 24 * 60 * 60 * 1000; break;
      case '1Y': intervals = 4; step = 4 * 30 * 24 * 60 * 60 * 1000; break;
      case '5Y': intervals = 5; step = 12 * 30 * 24 * 60 * 60 * 1000; break;
      case 'MAX': intervals = 10; step = 12 * 30 * 24 * 60 * 60 * 1000; break;
      default: intervals = 8; step = 3 * 60 * 60 * 1000;
    }

    for (let i = intervals; i >= 0; i--) {
      const time = new Date(now - i * step);
      price += (Math.random() - 0.5) * 2;
      let label = '';

      if (range === '1D') label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      else if (range === '5D') label = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      else if (range === '1M') label = `Week ${Math.ceil((intervals - i + 1))}`;
      else if (range === '1Y') label = time.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      else label = time.getFullYear().toString();

      data.push({
        time: label,
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000)
      });
    }

    return data;
  };

  useEffect(() => {
    setChartData(generateInitialChartData(selectedStock.price, selectedRange));
  }, [selectedStock.symbol, selectedRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());

      setStocks(prevStocks =>
        prevStocks.map(stock => {
          const priceChange = (Math.random() - 0.5) * 0.5;
          const newPrice = Math.max(stock.price + priceChange, 0.01);
          const change = newPrice - (stock.price - stock.change);
          const changePercent = (change / (newPrice - change)) * 100;

          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2))
          };
        })
      );

      // Update the chart data only for selected stock
      setChartData(prevData => {
        const lastData = prevData[prevData.length - 1];
        const priceChange = (Math.random() - 0.5) * 0.5;
        const newPrice = parseFloat((lastData.price + priceChange).toFixed(2));
        const newEntry = {
          ...lastData,
          price: newPrice,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          volume: Math.floor(Math.random() * 1000000)
        };

        const updated = [...prevData, newEntry];
        if (updated.length > 20) updated.shift(); // Keep max 20 points
        return updated;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [selectedStock.symbol]);

  const formatCurrency = value =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);

  const getChangeColor = change => (change >= 0 ? 'text-green-400' : 'text-red-400');
  const getChangeBg = change => (change >= 0 ? 'bg-green-500/10 border-green-400/20' : 'bg-red-500/10 border-red-400/20');

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white px-4 py-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Live Stock Tracker</h1>
        <p className="text-sm text-gray-400">
          Market Status: <span className={`font-semibold ${marketStatus === 'OPEN' ? 'text-green-400' : 'text-red-400'}`}>{marketStatus}</span>
        </p>
        <p className="text-xs text-gray-400">
          {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-4">
          {stocks.map(stock => (
            <div
              key={stock.symbol}
              onClick={() => setSelectedStock(stock)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedStock.symbol === stock.symbol
                  ? 'bg-blue-500/10 border-blue-400'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{stock.symbol}</h2>
                  <p className="text-sm text-gray-400 truncate">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(stock.price)}</p>
                  <p className={`text-xs ${getChangeColor(stock.change)}`}>
                    {stock.change >= 0 ? '+' : ''}
                    {stock.change} ({stock.changePercent >= 0 ? '+' : ''}
                    {stock.changePercent}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-2/3 bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold mb-4">{selectedStock.name}</h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            {['1D', '5D', '1M', '6M', '1Y', '5Y', 'MAX'].map(range => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={value => [formatCurrency(value), 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-xs text-gray-400">Volume</p>
              <p className="font-semibold">{selectedStock.volume}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Market Cap</p>
              <p className="font-semibold">{selectedStock.marketCap}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Day High</p>
              <p className="font-semibold">{formatCurrency(selectedStock.price * 1.02)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Day Low</p>
              <p className="font-semibold">{formatCurrency(selectedStock.price * 0.98)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStockPage;
