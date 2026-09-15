"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function RealEstateExposureAnalyzer() {

  const [stocks, setStocks] = useState(500000);
  const [mutualFunds, setMutualFunds] = useState(300000);
  const [realEstate, setRealEstate] = useState(1000000);
  const [cash, setCash] = useState(200000);

  const [realEstateExposure, setRealEstateExposure] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {

    const totalPortfolio =
      stocks +
      mutualFunds +
      realEstate +
      cash;

    const exposure =
      (realEstate / totalPortfolio) * 100;

    setRealEstateExposure(exposure);

    if (exposure < 20)
      setMessage(
        '🏢 Your real estate allocation is low. Consider increasing exposure for diversification.'
      );

    else if (exposure <= 50)
      setMessage(
        '✅ Your portfolio appears reasonably diversified.'
      );

    else
      setMessage(
        '⚠️ A significant portion of your portfolio is concentrated in real estate.'
      );

  }, [
    stocks,
    mutualFunds,
    realEstate,
    cash
  ]);

  const pieData = [
    {
      name: 'Stocks',
      value: stocks
    },
    {
      name: 'Mutual Funds',
      value: mutualFunds
    },
    {
      name: 'Real Estate',
      value: realEstate
    },
    {
      name: 'Cash',
      value: cash
    }
  ];

  const COLORS = [
    '#ea580c',
    '#000000',
    '#f59e0b',
    '#ef4444'
  ];

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        🏢 WelNex Real Estate Exposure Analyzer
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Stocks</label>

        <p>
          ₹ {stocks.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="10000000"
          step="50000"
          value={stocks}
          onChange={(e) =>
            setStocks(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="10000000"
          step="50000"
          value={stocks}
          onChange={(e) =>
            setStocks(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Mutual Funds</label>

        <p>
          ₹ {mutualFunds.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="10000000"
          step="50000"
          value={mutualFunds}
          onChange={(e) =>
            setMutualFunds(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="10000000"
          step="50000"
          value={mutualFunds}
          onChange={(e) =>
            setMutualFunds(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Real Estate</label>

        <p>
          ₹ {realEstate.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="50000000"
          step="100000"
          value={realEstate}
          onChange={(e) =>
            setRealEstate(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="50000000"
          step="100000"
          value={realEstate}
          onChange={(e) =>
            setRealEstate(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Cash</label>

        <p>
          ₹ {cash.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="5000000"
          step="50000"
          value={cash}
          onChange={(e) =>
            setCash(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="5000000"
          step="50000"
          value={cash}
          onChange={(e) =>
            setCash(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Portfolio Analysis</h2>

        <p>
          Real Estate Exposure:
          <strong>
            {realEstateExposure.toFixed(1)}%
          </strong>
        </p>

        <hr />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          {message}
        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">Portfolio Allocation</h3>

        <div className="flex justify-center w-full overflow-x-auto my-4 py-4">

          <PieChart width={400} height={300}>

            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >

              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip
              formatter={(value) =>
                `₹ ${Number(value).toLocaleString()}`
              }
            />

            <Legend />

          </PieChart>

        </div>

      </div>

    </div>
  );
}

export default RealEstateExposureAnalyzer;