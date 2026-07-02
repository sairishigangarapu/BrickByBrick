"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

function RentVsInvestCalculator() {

  const [monthlyRent, setMonthlyRent] = useState(30000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(30000);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [years, setYears] = useState(10);

  const [rentSpent, setRentSpent] = useState(0);
  const [investmentCorpus, setInvestmentCorpus] = useState(0);

  useEffect(() => {

    const totalRent = monthlyRent * 12 * years;
    setRentSpent(totalRent);

    const monthlyRate = annualReturn / 12 / 100;
    const months = years * 12;

    const corpus =
      monthlyInvestment *
      (((Math.pow(1 + monthlyRate, months) - 1) /
        monthlyRate) *
        (1 + monthlyRate));

    setInvestmentCorpus(corpus);

  }, [
    monthlyRent,
    monthlyInvestment,
    annualReturn,
    years
  ]);

  const chartData = [
    {
      category: 'Rent',
      amount: Math.round(rentSpent)
    },
    {
      category: 'Invest',
      amount: Math.round(investmentCorpus)
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        🏠 BrickByBrick Rent vs Invest Calculator
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Monthly Rent</label>

        <p>
          ₹ {monthlyRent.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="5000"
          max="100000"
          step="1000"
          value={monthlyRent}
          onChange={(e) =>
            setMonthlyRent(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="5000"
          max="100000"
          step="1000"
          value={monthlyRent}
          onChange={(e) =>
            setMonthlyRent(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Monthly Investment</label>

        <p>
          ₹ {monthlyInvestment.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="5000"
          max="100000"
          step="1000"
          value={monthlyInvestment}
          onChange={(e) =>
            setMonthlyInvestment(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="5000"
          max="100000"
          step="1000"
          value={monthlyInvestment}
          onChange={(e) =>
            setMonthlyInvestment(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Expected Annual Return</label>

        <p>{annualReturn}%</p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="1"
          max="15"
          step="0.5"
          value={annualReturn}
          onChange={(e) =>
            setAnnualReturn(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="1"
          max="15"
          step="0.5"
          value={annualReturn}
          onChange={(e) =>
            setAnnualReturn(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Time Horizon</label>

        <p>{years} Years</p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="1"
          max="30"
          step="1"
          value={years}
          onChange={(e) =>
            setYears(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="1"
          max="30"
          step="1"
          value={years}
          onChange={(e) =>
            setYears(Number(e.target.value))
          }
        />
        </div>

      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Comparison</h2>

        <p>
          Total Rent Paid:
          <strong>
            ₹ {Math.round(rentSpent).toLocaleString()}
          </strong>
        </p>

        <p>
          Investment Corpus:
          <strong>
            ₹ {Math.round(investmentCorpus).toLocaleString()}
          </strong>
        </p>

        <hr />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">

          🚀 By investing ₹
          {monthlyInvestment.toLocaleString()}
          every month for {years} years, you could
          potentially build a corpus of ₹
          {Math.round(investmentCorpus).toLocaleString()}.

        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">Rent vs Invest</h3>

        <div className="flex justify-center w-full overflow-x-auto my-4 py-4">

          <BarChart
            width={500}
            height={300}
            data={chartData}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="category" />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                `₹ ${Number(value).toLocaleString()}`
              }
            />

            <Legend />

            <Bar dataKey="amount" />

          </BarChart>

        </div>

      </div>

    </div>
  );
}

export default RentVsInvestCalculator;