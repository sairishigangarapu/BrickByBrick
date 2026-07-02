"use client";

import React, { useState, useEffect } from 'react';

function REITReadinessCalculator() {

  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [monthlySavings, setMonthlySavings] = useState(10000);
  const [emergencyFund, setEmergencyFund] = useState(300000);
  const [investmentExperience, setInvestmentExperience] = useState(2);

  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {

    let totalScore = 0;

    // Income Score (25)
    if (monthlyIncome >= 100000)
      totalScore += 25;
    else if (monthlyIncome >= 50000)
      totalScore += 18;
    else
      totalScore += 10;

    // Savings Score (30)
    if (monthlySavings >= 30000)
      totalScore += 30;
    else if (monthlySavings >= 15000)
      totalScore += 20;
    else
      totalScore += 10;

    // Emergency Fund Score (25)
    if (emergencyFund >= 500000)
      totalScore += 25;
    else if (emergencyFund >= 200000)
      totalScore += 18;
    else
      totalScore += 10;

    // Experience Score (20)
    totalScore += investmentExperience * 5;

    setScore(totalScore);

    if (totalScore >= 80)
      setMessage(
        '🎉 Excellent! You are highly prepared to begin your SM REIT journey.'
      );
    else if (totalScore >= 60)
      setMessage(
        '👍 You are moderately prepared. Continue saving and investing.'
      );
    else
      setMessage(
        '📚 Focus on building savings and financial discipline before investing.'
      );

  }, [
    monthlyIncome,
    monthlySavings,
    emergencyFund,
    investmentExperience
  ]);

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">
        🏢 BrickByBrick REIT Readiness Score
      </h1>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Monthly Income</label>

        <p>
          ₹ {monthlyIncome.toLocaleString()}
        </p>

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
        <label>Monthly Savings</label>

        <p>
          ₹ {monthlySavings.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="1000"
          max="100000"
          step="1000"
          value={monthlySavings}
          onChange={(e) =>
            setMonthlySavings(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="1000"
          max="100000"
          step="1000"
          value={monthlySavings}
          onChange={(e) =>
            setMonthlySavings(Number(e.target.value))
          }
        />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Emergency Fund</label>

        <p>
          ₹ {emergencyFund.toLocaleString()}
        </p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="2000000"
          step="50000"
          value={emergencyFund}
          onChange={(e) =>
            setEmergencyFund(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="2000000"
          step="50000"
          value={emergencyFund}
          onChange={(e) =>
            setEmergencyFund(Number(e.target.value))
          }
        />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <label>Investment Experience (Years)</label>

        <p>{investmentExperience} Years</p>

        <div className="flex items-center gap-4 w-full">
          <input
            type="range"
            className="flex-grow accent-orange-600"

          min="0"
          max="10"
          step="1"
          value={investmentExperience}
          onChange={(e) =>
            setInvestmentExperience(Number(e.target.value))
          }
        />
          <input
            type="number"
            className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"

          min="0"
          max="10"
          step="1"
          value={investmentExperience}
          onChange={(e) =>
            setInvestmentExperience(Number(e.target.value))
          }
        />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h2 className="text-xl font-bold mb-3">Your Readiness Score</h2>

        <h1 style={{ color: '#ea580c' }}>
          {score}/100
        </h1>

        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-orange-600 h-2.5 rounded-full"
            style={{ width: `${score}%` }}
          ></div>
        </div>

        <br />

        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          {message}
        </p>

      </div>

    </div>
  );
}

export default REITReadinessCalculator;