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

function RetirementCorpusCalculator() {

  const [currentAge, setCurrentAge] = useState(25);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [inflationRate, setInflationRate] = useState(6);

  const [futureExpenses, setFutureExpenses] = useState(0);
  const [requiredCorpus, setRequiredCorpus] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {

    const yearsLeft = retirementAge - currentAge;

    const inflatedMonthlyExpense =
      monthlyExpenses *
      Math.pow(
        1 + inflationRate / 100,
        yearsLeft
      );

    setFutureExpenses(inflatedMonthlyExpense);

    const annualExpense =
      inflatedMonthlyExpense * 12;

    // Using 4% withdrawal rule
    const corpus =
      annualExpense / 0.04;

    setRequiredCorpus(corpus);

    const data = [];

    for (let i = 0; i <= yearsLeft; i++) {

      data.push({
        age: currentAge + i,
        expense: Math.round(
          monthlyExpenses *
          Math.pow(
            1 + inflationRate / 100,
            i
          )
        )
      });

    }

    setChartData(data);

  }, [
    currentAge,
    retirementAge,
    monthlyExpenses,
    inflationRate
  ]);

  return (

    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        👴 BrickByBrick Retirement Corpus Calculator
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Current Age</label>

        <p>{currentAge} Years</p>

        <input
          type="range"
          min="18"
          max="60"
          step="1"
          value={currentAge}
          onChange={(e) =>
            setCurrentAge(Number(e.target.value))
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Retirement Age</label>

        <p>{retirementAge} Years</p>

        <input
          type="range"
          min="40"
          max="80"
          step="1"
          value={retirementAge}
          onChange={(e) =>
            setRetirementAge(Number(e.target.value))
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Current Monthly Expenses</label>

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
            setMonthlyExpenses(Number(e.target.value))
          }
        />

      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Expected Inflation Rate</label>

        <p>{inflationRate}%</p>

        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={inflationRate}
          onChange={(e) =>
            setInflationRate(Number(e.target.value))
          }
        />

      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Retirement Projection</h2>

        <p>
          Monthly Expenses At Retirement:
          <strong>
            ₹ {Math.round(futureExpenses).toLocaleString()}
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

          🎯 To maintain your lifestyle after retirement,
          you may require approximately

          <strong>
            ₹ {Math.round(requiredCorpus).toLocaleString()}
          </strong>

          invested by age {retirementAge}.

        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">
          Inflation Impact On Monthly Expenses
        </h3>

        <div className="flex justify-center w-full overflow-x-auto my-4 py-4">

          <LineChart
            width={500}
            height={300}
            data={chartData}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="age" />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                `₹ ${Number(value).toLocaleString()}`
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={3}
            />

          </LineChart>

        </div>

      </div>

    </div>

  );
}

export default RetirementCorpusCalculator;