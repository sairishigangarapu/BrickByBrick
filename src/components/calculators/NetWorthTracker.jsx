"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function NetWorthTracker() {

  const [cash, setCash] = useState(100000);
  const [stocks, setStocks] = useState(300000);
  const [realEstate, setRealEstate] = useState(500000);
  const [liabilities, setLiabilities] = useState(200000);

  const [totalAssets, setTotalAssets] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {

    const assets =
      cash +
      stocks +
      realEstate;

    setTotalAssets(assets);
    setNetWorth(assets - liabilities);

  }, [
    cash,
    stocks,
    realEstate,
    liabilities
  ]);

  const pieData = [
    {
      name: 'Cash',
      value: cash
    },
    {
      name: 'Stocks & Mutual Funds',
      value: stocks
    },
    {
      name: 'Real Estate',
      value: realEstate
    }
  ];

  const COLORS = [
    '#ea580c',
    '#000000',
    '#f59e0b'
  ];

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        💰 BrickByBrick Net Worth Tracker
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Cash & Bank Balance</label>

        <p>₹ {cash.toLocaleString()}</p>

        <input
          type="range"
          min="0"
          max="5000000"
          step="50000"
          value={cash}
          onChange={(e) =>
            setCash(Number(e.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Stocks & Mutual Funds</label>

        <p>₹ {stocks.toLocaleString()}</p>

        <input
          type="range"
          min="0"
          max="10000000"
          step="50000"
          value={stocks}
          onChange={(e) =>
            setStocks(Number(e.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Real Estate Investments</label>

        <p>₹ {realEstate.toLocaleString()}</p>

        <input
          type="range"
          min="0"
          max="50000000"
          step="100000"
          value={realEstate}
          onChange={(e) =>
            setRealEstate(Number(e.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Total Liabilities</label>

        <p>₹ {liabilities.toLocaleString()}</p>

        <input
          type="range"
          min="0"
          max="50000000"
          step="100000"
          value={liabilities}
          onChange={(e) =>
            setLiabilities(Number(e.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Your Financial Snapshot</h2>

        <p>
          Total Assets:
          <strong>
            ₹ {totalAssets.toLocaleString()}
          </strong>
        </p>

        <p>
          Total Liabilities:
          <strong>
            ₹ {liabilities.toLocaleString()}
          </strong>
        </p>

        <p>
          Net Worth:
          <strong>
            ₹ {netWorth.toLocaleString()}
          </strong>
        </p>

        <hr />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          📊 Your current net worth is
          <strong>
            ₹ {netWorth.toLocaleString()}
          </strong>
        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">Asset Allocation</h3>

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

export default NetWorthTracker;