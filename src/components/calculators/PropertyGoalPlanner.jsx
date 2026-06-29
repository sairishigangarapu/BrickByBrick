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

function PropertyGoalPlanner() {

  const [targetAmount, setTargetAmount] = useState(1000000);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(15000);
  const [annualReturn, setAnnualReturn] = useState(7);

  const [monthsRequired, setMonthsRequired] = useState(0);
  const [goalDate, setGoalDate] = useState('');
  const [growthData, setGrowthData] = useState([]);
  const [finalCorpus, setFinalCorpus] = useState(0);

  useEffect(() => {

    const monthlyRate = annualReturn / 12 / 100;

    let corpus = currentSavings;
    let months = 0;

    const chartData = [];

    while (corpus < targetAmount && months < 600) {

      corpus =
        corpus * (1 + monthlyRate) + monthlyContribution;

      months++;

      if (months % 12 === 0) {
        chartData.push({
          year: `Year ${months / 12}`,
          corpus: Math.round(corpus)
        });
      }
    }

    setMonthsRequired(months);
    setFinalCorpus(corpus);
    setGrowthData(chartData);

    const futureDate = new Date();

    futureDate.setMonth(
      futureDate.getMonth() + months
    );

    setGoalDate(
      futureDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      })
    );

  }, [
    targetAmount,
    currentSavings,
    monthlyContribution,
    annualReturn
  ]);

  const years = Math.floor(monthsRequired / 12);
  const remainingMonths = monthsRequired % 12;

  const progressPercentage = Math.min(
    (currentSavings / targetAmount) * 100,
    100
  ).toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        🏢 BrickByBrick Property Goal Planner
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Target Amount</label>

        <p>
          ₹ {targetAmount.toLocaleString()}
        </p>

        <input
          type="range"
          min="500000"
          max="5000000"
          step="50000"
          value={targetAmount}
          onChange={(e) =>
            setTargetAmount(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">

        <label>Current Savings</label>

        <p>
          ₹ {currentSavings.toLocaleString()}
        </p>

        <input
          type="range"
          min="0"
          max="1000000"
          step="10000"
          value={currentSavings}
          onChange={(e) =>
            setCurrentSavings(
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

        <label>Expected Return</label>

        <p>{annualReturn}%</p>

        <input
          type="range"
          min="1"
          max="15"
          step="0.5"
          value={annualReturn}
          onChange={(e) =>
            setAnnualReturn(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Your Journey</h2>

        <p>
          Goal Amount:
          <strong>
            ₹ {targetAmount.toLocaleString()}
          </strong>
        </p>

        <p>
          Current Savings:
          <strong>
            ₹ {currentSavings.toLocaleString()}
          </strong>
        </p>

        <p>
          Progress:
          <strong>
            {progressPercentage}%
          </strong>
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-orange-600 h-2.5 rounded-full"
            style={{
              width: `${progressPercentage}%`
            }}
          ></div>
        </div>

        <hr />

        <p>
          Time to Goal:
          <strong>
            {years} Years {remainingMonths} Months
          </strong>
        </p>

        <p>
          Goal Date:
          <strong>{goalDate}</strong>
        </p>

        <p>
          Projected Corpus:
          <strong>
            ₹ {Math.round(finalCorpus).toLocaleString()}
          </strong>
        </p>

        <hr />

        <h3 className="text-lg font-bold mb-2">Corpus Growth</h3>

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

export default PropertyGoalPlanner;