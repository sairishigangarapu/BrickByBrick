"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function FIRECalculator() {

  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const [annualExpenses, setAnnualExpenses] = useState(0);
  const [requiredCorpus, setRequiredCorpus] = useState(0);

  useEffect(() => {

    const annual = monthlyExpenses * 12;

    const corpus = annual / (withdrawalRate / 100);

    setAnnualExpenses(annual);
    setRequiredCorpus(corpus);

  }, [monthlyExpenses, withdrawalRate]);

  const pieData = [
    {
      name: 'Annual Expenses',
      value: Math.round(annualExpenses)
    },
    {
      name: 'Required FIRE Corpus',
      value: Math.round(requiredCorpus)
    }
  ];

  const COLORS = ['#f59e0b', '#ea580c'];

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">🔥 BrickByBrick FIRE Calculator</h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Desired Monthly Expenses in Retirement</label>

        <p>
          ₹ {monthlyExpenses.toLocaleString()}
        </p>

        <input
          type="range"
          min="10000"
          max="500000"
          step="5000"
          value={monthlyExpenses}
          onChange={(e) =>
            setMonthlyExpenses(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Safe Withdrawal Rate</label>

        <p>{withdrawalRate}%</p>

        <input
          type="range"
          min="2"
          max="6"
          step="0.5"
          value={withdrawalRate}
          onChange={(e) =>
            setWithdrawalRate(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Your FIRE Number</h2>

        <p>
          Annual Expenses:
          <strong>
            ₹ {Math.round(annualExpenses).toLocaleString()}
          </strong>
        </p>

        <p>
          Required Retirement Corpus:
          <strong>
            ₹ {Math.round(requiredCorpus).toLocaleString()}
          </strong>
        </p>

        <hr />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          🚀 To sustain expenses of
          <strong>
            ₹ {monthlyExpenses.toLocaleString()}
          </strong>
           per month, you need approximately
          <strong>
            ₹ {Math.round(requiredCorpus).toLocaleString()}
          </strong>
          invested.
        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">FIRE Breakdown</h3>

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

export default FIRECalculator;