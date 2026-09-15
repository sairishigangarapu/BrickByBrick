"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function AffordabilityCalculator() {

  const [monthlyIncome, setMonthlyIncome] = useState(60000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);
  const [existingEMIs, setExistingEMIs] = useState(5000);
  const [currentSavings, setCurrentSavings] = useState(200000);

  const [monthlySurplus, setMonthlySurplus] = useState(0);
  const [recommendedSIP, setRecommendedSIP] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {

    const surplus =
      monthlyIncome -
      monthlyExpenses -
      existingEMIs;

    setMonthlySurplus(surplus);

    const sip = surplus * 0.5;

    setRecommendedSIP(sip);

    if (surplus >= 20000 && currentSavings >= 500000)
      setStatus('🟢 Ready');

    else if (surplus >= 10000)
      setStatus('🟡 Almost Ready');

    else
      setStatus('🔴 Build Savings First');

  }, [
    monthlyIncome,
    monthlyExpenses,
    existingEMIs,
    currentSavings
  ]);

  const pieData = [
    {
      name: 'Expenses + EMIs',
      value: monthlyExpenses + existingEMIs
    },
    {
      name: 'Monthly Surplus',
      value: monthlySurplus
    }
  ];

  const COLORS = ['#ef4444', '#000000'];

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        🏠 WelNex Affordability Calculator
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Monthly Income</label>

        <p>₹ {monthlyIncome.toLocaleString()}</p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="10000"
          max="500000"
          step="5000"
          value={monthlyIncome}
          onChange={(e) =>
            setMonthlyIncome(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="10000"
          max="500000"
          step="5000"
          value={monthlyIncome}
          onChange={(e) =>
            setMonthlyIncome(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Monthly Expenses</label>

        <p>₹ {monthlyExpenses.toLocaleString()}</p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="5000"
          max="300000"
          step="5000"
          value={monthlyExpenses}
          onChange={(e) =>
            setMonthlyExpenses(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="5000"
          max="300000"
          step="5000"
          value={monthlyExpenses}
          onChange={(e) =>
            setMonthlyExpenses(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Existing EMIs / SIPs</label>

        <p>₹ {existingEMIs.toLocaleString()}</p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="100000"
          step="1000"
          value={existingEMIs}
          onChange={(e) =>
            setExistingEMIs(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="100000"
          step="1000"
          value={existingEMIs}
          onChange={(e) =>
            setExistingEMIs(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Current Savings</label>

        <p>₹ {currentSavings.toLocaleString()}</p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="5000000"
          step="50000"
          value={currentSavings}
          onChange={(e) =>
            setCurrentSavings(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="5000000"
          step="50000"
          value={currentSavings}
          onChange={(e) =>
            setCurrentSavings(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Affordability Analysis</h2>

        <p>
          Monthly Surplus:
          <strong>
            ₹ {Math.round(monthlySurplus).toLocaleString()}
          </strong>
        </p>

        <p>
          Recommended Property SIP:
          <strong>
            ₹ {Math.round(recommendedSIP).toLocaleString()}
          </strong>
        </p>

        <p>
          Investment Readiness:
          <strong>{status}</strong>
        </p>

        <hr />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">

          Based on your financial profile, we recommend
          a Property SIP of approximately

          <strong>
            ₹ {Math.round(recommendedSIP).toLocaleString()}
          </strong>

          per month.

        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">Monthly Cash Flow</h3>

        <div className="flex justify-center w-full overflow-x-auto my-4 py-4">

          <PieChart width={350} height={300}>

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

export default AffordabilityCalculator;