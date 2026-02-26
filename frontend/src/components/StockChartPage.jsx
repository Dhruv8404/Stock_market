import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, TrendingDown, Search, Activity, DollarSign, Calendar, BarChart3, RefreshCw, Star, StarOff } from "lucide-react";

const ranges = ["1D", "5D", "1M", "6M", "1Y", "MAX"];

const formatXAxis = (tick) => {
  return tick.length > 10 ? tick.slice(11, 16) : tick;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const calculateChange = (data) => {
  if (data.length < 2) return { change: 0, changePercent: 0 };
  const first = data[0]?.price || 0;
  const last = data[data.length - 1]?.price || 0;
  const change = last - first;
  const changePercent = first !== 0 ? (change / first) * 100 : 0;
  return { change, changePercent };
};

const StockChartPage = () => {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [companyInput, setCompanyInput] = useState("Reliance Industries");
  const [suggestions, setSuggestions] = useState([]);
  const [range, setRange] = useState("1D");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState("line");
  const [favorites, setFavorites] = useState(["RELIANCE.NS", "TCS.NS", "INFY.NS"]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock current price and stats (replace with real data from your backend)
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1]?.price : 0;
  const { change, changePercent } = calculateChange(chartData);
  const isPositive = change >= 0;

  // Get API URL from environment variable or use default
  const API_URL = import.meta.env.VITE_API_URL || 'https://stock-market-ju6c.onrender.com';

  // Fetch chart data based on selected symbol
  const fetchChartData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/stock_chart/?symbol=${symbol}&range=${range}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setChartData(data);
      } else {
        setChartData([]);
        console.error("API returned error:", data);
      }
    } catch (err) {
      console.error("Error fetching chart data", err);
      setChartData([]);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChartData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchChartData();
  }, [symbol, range]);

  // Fetch suggestions as user types
  const handleCompanyInput = async (e) => {
    const input = e.target.value;
    setCompanyInput(input);

    if (input.length >= 2) {
      try {
        const res = await fetch(`${API_URL}/api/search/?q=${input}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (company) => {
    setCompanyInput(`${company.name}`);
    setSymbol(`${company.symbol}.NS`);
    setSuggestions([]);
  };
const formatXAxis = (tick, index, ticks) => {
  const date = new Date(tick);

 if (range === "1D") {
  // Show every 15 minutes
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
else if (range === "5D") {
  // Cache last labeled day (scoped outside function if needed)
  if (!window.lastLabeledDate5D) {
    window.lastLabeledDate5D = null;
  }

  const currentDateStr = date.toISOString().split("T")[0]; // e.g. "2025-07-22"

  if (window.lastLabeledDate5D !== currentDateStr) {
    window.lastLabeledDate5D = currentDateStr;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }); // e.g., "22 Jul"
  }

  return ""; // Skip label if same day
}
else if (range === "1M") {
  if (!index) return "";

  // Show label every 6th point
  if (index % 6 === 0) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }); // e.g., "06 Jul"
  }

  return "";
}
 else if (range === "6M") {
  if (!index) return "";

  // Show label every 10th point (adjust if needed based on your data density)
  if (index % 10 === 0) {
    return date.toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    }); // e.g., "Jul 25"
  }

  return "";
}
 else if (range === "1Y") {
    // Every 4 months
    const month = date.getMonth();
    return month % 4 === 0
      ? date.toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      : "";
  } else if (range === "Max") {
    // Every 4 years
    const year = date.getFullYear();
    return year % 4 === 0 ? year.toString() : "";
  } else {
    return date.getFullYear().toString();
  }
};

  const toggleFavorite = () => {
    if (favorites.includes(symbol)) {
      setFavorites(favorites.filter(fav => fav !== symbol));
    } else {
      setFavorites([...favorites, symbol]);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Stock Market Dashboard
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={companyInput}
                onChange={handleCompanyInput}
                className="w-full pl-10 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                placeholder="Search for stocks (e.g., Reliance, TCS, Infosys)"
              />
              <button
                onClick={toggleFavorite}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {favorites.includes(symbol) ? 
                  <Star className="h-6 w-6 text-yellow-500 fill-current" /> : 
                  <StarOff className="h-6 w-6 text-gray-400" />
                }
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto mt-2">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(item)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 text-sm">({item.symbol})</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Favorites:</p>
              <div className="flex gap-2 flex-wrap">
                {favorites.map((fav) => (
                  <button
                    key={fav}
                    onClick={() => {
                      setSymbol(fav);
                      setCompanyInput(fav.replace('.NS', ''));
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      symbol === fav 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {fav.replace('.NS', '')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stock Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{companyInput}</h2>
              <p className="text-gray-500">{symbol}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(currentPrice)}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {formatCurrency(Math.abs(change))} ({Math.abs(changePercent).toFixed(2)}%)
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">High</span>
              </div>
              <div className="font-semibold">
                {chartData.length > 0 ? formatCurrency(Math.max(...chartData.map(d => d.price))) : '-'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">Low</span>
              </div>
              <div className="font-semibold">
                {chartData.length > 0 ? formatCurrency(Math.min(...chartData.map(d => d.price))) : '-'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">Range</span>
              </div>
              <div className="font-semibold text-sm">{range}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">Updated</span>
              </div>
              <div className="font-semibold text-sm">Live</div>
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Range</h3>
              <div className="flex gap-2 flex-wrap">
                {ranges.map((r) => (
                  <button
                    key={r}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      r === range 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setRange(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chart Type</h3>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === "line" 
                      ? "bg-purple-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setChartType("line")}
                >
                  Line
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === "area" 
                      ? "bg-purple-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setChartType("area")}
                >
                  Area
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Price Chart</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isPositive ? '↗' : '↘'} {Math.abs(changePercent).toFixed(2)}%
            </div>
          </div>
          
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No data available</p>
                <p className="text-gray-400 text-sm">Try selecting a different time range or stock</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              {chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
                      <stop offset="100%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatXAxis}
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={["auto", "auto"]}
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#10B981" : "#EF4444"}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ 
                      r: 6, 
                      stroke: isPositive ? "#10B981" : "#EF4444",
                      strokeWidth: 2,
                      fill: "white"
                    }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatXAxis}
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={["auto", "auto"]}
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value.toFixed(0)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#10B981" : "#EF4444"}
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Real-time stock data • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default StockChartPage;