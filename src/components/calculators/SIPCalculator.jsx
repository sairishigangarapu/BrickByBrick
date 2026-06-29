"use client";

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [years, setYears] = useState(5);

  const [futureValue, setFutureValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [wealthGained, setWealthGained] = useState(0);

  const targetGoal = 1000000; // ₹10 Lakhs

  const calculateSIP = () => {
    const monthlyRate = annualReturn / 12 / 100;
    const months = years * 12;

    const fv =
      monthlyInvestment *
      (((Math.pow(1 + monthlyRate, months) - 1) /
        monthlyRate) *
        (1 + monthlyRate));

    const invested = monthlyInvestment * months;
    const gain = fv - invested;

    setFutureValue(fv);
    setTotalInvested(invested);
    setWealthGained(gain);
  };

  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, annualReturn, years]);

  const progressPercentage = Math.min(
    (futureValue / targetGoal) * 100,
    100
  ).toFixed(1);

  // Pie Chart Data
  const pieData = [
    {
      name: 'Amount Invested',
      value: Math.round(totalInvested),
    },
    {
      name: 'Returns Earned',
      value: Math.round(wealthGained),
    },
  ];

  const COLORS = ['#ea580c', '#000000'];

  // Growth Chart Data
  const growthData = [];

  const monthlyRate = annualReturn / 12 / 100;

  for (let year = 1; year <= years; year++) {
    const months = year * 12;

    const fv =
      monthlyInvestment *
      (((Math.pow(1 + monthlyRate, months) - 1) /
        monthlyRate) *
        (1 + monthlyRate));

    growthData.push({
      year: `Year ${year}`,
      corpus: Math.round(fv),
    });
  }

  // Goal Timeline
  let monthsRequired = 0;
  let corpus = 0;

  while (corpus < targetGoal && monthsRequired < 1000) {
    monthsRequired++;

    corpus =
      monthlyInvestment *
      (((Math.pow(1 + monthlyRate, monthsRequired) - 1) /
        monthlyRate) *
        (1 + monthlyRate));
  }

  const yearsToGoal = Math.floor(monthsRequired / 12);
  const remainingMonths = monthsRequired % 12;

  const goalDate = new Date();
  goalDate.setMonth(goalDate.getMonth() + monthsRequired);

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="text-2xl font-bold mb-4">🏢 BrickByBrick Property SIP Calculator</h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Monthly Investment</label>
        <p>₹ {monthlyInvestment.toLocaleString()}</p>

        <input
          type="range"
          min="1000"
          max="100000"
          step="1000"
          value={monthlyInvestment}
          onChange={(e) =>
            setMonthlyInvestment(Number(e.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Expected Annual Return</label>
        <p>{annualReturn}%</p>

        <input
          type="range"
          min="1"
          max="15"
          step="0.5"
          value={annualReturn}
          onChange={(e) =>
            setAnnualReturn(Number(e.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Investment Duration</label>
        <p>{years} Years</p>

        <input
          type="range"
          min="1"
          max="30"
          step="1"
          value={years}
          onChange={(e) =>
            setYears(Number(e.target.value))
          }
        />
      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">
        <h2 className="text-xl font-bold mb-3">Results</h2>

        <p>
          Total Invested:
          <strong>
            ₹ {Number(totalInvested).toLocaleString()}
          </strong>
        </p>

        <p>
          Wealth Gained:
          <strong>
            ₹ {Number(wealthGained).toLocaleString()}
          </strong>
        </p>

        <p>
          Final Corpus:
          <strong>
            ₹ {Number(futureValue).toLocaleString()}
          </strong>
        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">SM REIT Goal Progress</h3>

        <p>Goal Amount: ₹10,00,000</p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-orange-600 h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <p>Progress: {progressPercentage}%</p>

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          🎯 You can reach your first SM REIT in{' '}
          <strong>
            {yearsToGoal} years {remainingMonths} months
          </strong>
        </p>

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          📅 Estimated Goal Date:{' '}
          <strong>
            {goalDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </strong>
        </p>

        {futureValue >= targetGoal ? (
          <p className="text-sm text-green-800 bg-green-100 p-3 rounded">
            🎉 Congratulations! You have reached
            your first SM REIT investment goal.
          </p>
        ) : (
          <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
            Keep investing to reach your ₹10L goal.
          </p>
        )}

        <hr />

        <h3 className="text-lg font-bold mb-2">Investment Breakdown</h3>

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

        <hr />

        <h3 className="text-lg font-bold mb-2">Corpus Growth Over Time</h3>

        <div className="flex justify-center w-full overflow-x-auto my-4 py-4">
          <LineChart
            width={500}
            height={300}
            data={growthData}
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
              dataKey="corpus"
              stroke="#ea580c"
              strokeWidth={3}
            />
          </LineChart>
        </div>
      </div>
    </div>
  );
}

export default SIPCalculator;