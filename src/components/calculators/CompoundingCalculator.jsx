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

function CompoundingCalculator() {

  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);

  const [futureValue, setFutureValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [wealthGained, setWealthGained] = useState(0);
  const [growthData, setGrowthData] = useState([]);

  useEffect(() => {

    const monthlyRate = annualReturn / 12 / 100;
    const months = years * 12;

    let corpus = initialInvestment;

    const chartData = [];

    for (let month = 1; month <= months; month++) {

      corpus =
        corpus * (1 + monthlyRate) +
        monthlyContribution;

      if (month % 12 === 0) {
        chartData.push({
          year: `Year ${month / 12}`,
          corpus: Math.round(corpus)
        });
      }
    }

    const invested =
      initialInvestment +
      monthlyContribution * months;

    setFutureValue(corpus);
    setTotalInvested(invested);
    setWealthGained(corpus - invested);
    setGrowthData(chartData);

  }, [
    initialInvestment,
    monthlyContribution,
    annualReturn,
    years
  ]);

  const pieData = [
    {
      name: 'Amount Invested',
      value: Math.round(totalInvested)
    },
    {
      name: 'Wealth Gained',
      value: Math.round(wealthGained)
    }
  ];

  const COLORS = ['#ea580c', '#000000'];

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        🪙 BrickByBrick Compounding Calculator
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Initial Investment</label>

        <p>
          ₹ {initialInvestment.toLocaleString()}
        </p>

        <input
          type="range"
          min="0"
          max="1000000"
          step="10000"
          value={initialInvestment}
          onChange={(e) =>
            setInitialInvestment(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Monthly Contribution</label>

        <p>
          ₹ {monthlyContribution.toLocaleString()}
        </p>

        <input
          type="range"
          min="1000"
          max="100000"
          step="1000"
          value={monthlyContribution}
          onChange={(e) =>
            setMonthlyContribution(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Expected Annual Return</label>

        <p>{annualReturn}%</p>

        <input
          type="range"
          min="1"
          max="20"
          step="0.5"
          value={annualReturn}
          onChange={(e) =>
            setAnnualReturn(
              Number(e.target.value)
            )
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Investment Duration</label>

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

        <h2 className="text-xl font-bold mb-3">Results</h2>

        <p>
          Total Invested:
          <strong>
            ₹ {Math.round(totalInvested).toLocaleString()}
          </strong>
        </p>

        <p>
          Wealth Gained:
          <strong>
            ₹ {Math.round(wealthGained).toLocaleString()}
          </strong>
        </p>

        <p>
          Final Corpus:
          <strong>
            ₹ {Math.round(futureValue).toLocaleString()}
          </strong>
        </p>

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

        <h3 className="text-lg font-bold mb-2">Wealth Growth Over Time</h3>

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

export default CompoundingCalculator;