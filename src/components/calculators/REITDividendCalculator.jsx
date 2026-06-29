"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function REITDividendCalculator() {

  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [dividendYield, setDividendYield] = useState(7);

  const [annualIncome, setAnnualIncome] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {

    const annual = investmentAmount * (dividendYield / 100);
    const monthly = annual / 12;

    setAnnualIncome(annual);
    setMonthlyIncome(monthly);

  }, [investmentAmount, dividendYield]);

  const pieData = [
    {
      name: 'Annual Dividend Income',
      value: Math.round(annualIncome)
    },
    {
      name: 'Remaining Capital',
      value: Math.round(investmentAmount - annualIncome)
    }
  ];

  const COLORS = ['#000000', '#ea580c'];

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">🏢 BrickByBrick REIT Dividend Calculator</h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Investment Amount</label>

        <p>
          ₹ {investmentAmount.toLocaleString()}
        </p>

        <input
          type="range"
          min="100000"
          max="5000000"
          step="50000"
          value={investmentAmount}
          onChange={(e) =>
            setInvestmentAmount(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Expected Dividend Yield</label>

        <p>{dividendYield}%</p>

        <input
          type="range"
          min="1"
          max="12"
          step="0.5"
          value={dividendYield}
          onChange={(e) =>
            setDividendYield(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Passive Income Estimate</h2>

        <p>
          Annual Dividend Income:
          <strong>
            ₹ {Math.round(annualIncome).toLocaleString()}
          </strong>
        </p>

        <p>
          Monthly Dividend Income:
          <strong>
            ₹ {Math.round(monthlyIncome).toLocaleString()}
          </strong>
        </p>

        <hr />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          💰 Your investment could generate approximately
          <strong>
            ₹ {Math.round(monthlyIncome).toLocaleString()}
          </strong>
          per month in passive income.
        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">Income Breakdown</h3>

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

export default REITDividendCalculator;