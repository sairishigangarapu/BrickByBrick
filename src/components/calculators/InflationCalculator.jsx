"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

function InflationCalculator() {

  const [currentAmount, setCurrentAmount] = useState(1000000);
  const [inflationRate, setInflationRate] = useState(6);
  const [years, setYears] = useState(10);

  const [futureAmount, setFutureAmount] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {

    const futureValue =
      currentAmount *
      Math.pow(1 + inflationRate / 100, years);

    setFutureAmount(futureValue);

    const data = [];

    for (let i = 1; i <= years; i++) {

      data.push({
        year: `Year ${i}`,
        amount: Math.round(
          currentAmount *
          Math.pow(1 + inflationRate / 100, i)
        )
      });

    }

    setChartData(data);

  }, [currentAmount, inflationRate, years]);

  return (

    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">📈 BrickByBrick Inflation Calculator</h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Current Amount</label>

        <p>
          ₹ {currentAmount.toLocaleString()}
        </p>

        <input
          type="range"
          min="100000"
          max="10000000"
          step="100000"
          value={currentAmount}
          onChange={(e) =>
            setCurrentAmount(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Inflation Rate</label>

        <p>{inflationRate}%</p>

        <input
          type="range"
          min="1"
          max="12"
          step="0.5"
          value={inflationRate}
          onChange={(e) =>
            setInflationRate(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Time Period</label>

        <p>{years} Years</p>

        <input
          type="range"
          min="1"
          max="40"
          step="1"
          value={years}
          onChange={(e) =>
            setYears(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Future Cost</h2>

        <p>
          Amount Today:
          <strong>
            ₹ {currentAmount.toLocaleString()}
          </strong>
        </p>

        <p>
          Required After {years} Years:
          <strong>
            ₹ {Math.round(futureAmount).toLocaleString()}
          </strong>
        </p>

        <hr />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">

          📉 Due to inflation, an amount of

          <strong>
            ₹ {currentAmount.toLocaleString()}
          </strong>

          today will require approximately

          <strong>
            ₹ {Math.round(futureAmount).toLocaleString()}
          </strong>

          after {years} years.

        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">Inflation Impact Over Time</h3>

        <div className="flex justify-center w-full overflow-x-auto my-4 py-4">

          <LineChart
            width={500}
            height={300}
            data={chartData}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="year" />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                `₹ ${Number(value).toLocaleString()}`
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#ef4444"
              strokeWidth={3}
            />

          </LineChart>

        </div>

      </div>

    </div>

  );
}

export default InflationCalculator;