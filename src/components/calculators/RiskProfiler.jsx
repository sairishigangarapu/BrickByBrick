"use client";

import React, { useState } from 'react';

function RiskProfiler() {

  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  });

  const [result, setResult] = useState('');

  const handleChange = (question, value) => {
    setAnswers({
      ...answers,
      [question]: value
    });
  };

  const calculateRisk = () => {

    let score = 0;

    Object.values(answers).forEach((answer) => {
      score += Number(answer);
    });

    if (score <= 8)
      setResult('🟢 Conservative Investor');

    else if (score <= 15)
      setResult('🟡 Moderate Investor');

    else
      setResult('🔴 Aggressive Investor');
  };

  return (
    <div className="flex flex-col gap-6 w-full">

      <h1 className="text-2xl font-bold mb-4">🎯 BrickByBrick Risk Profiler</h1>

      <div className="flex flex-col gap-4 p-6 bg-orange-50 border border-orange-200 rounded-lg mt-6">

        <h3 className="text-lg font-bold mb-2">
          1. How long can you stay invested?
        </h3>

        <select
          onChange={(e) =>
            handleChange('q1', e.target.value)
          }
        >
          <option value="">Select</option>
          <option value="1">Less than 3 years</option>
          <option value="3">3 - 7 years</option>
          <option value="5">More than 7 years</option>
        </select>

        <h3 className="text-lg font-bold mb-2">
          2. How would you react if your investment fell 20%?
        </h3>

        <select
          onChange={(e) =>
            handleChange('q2', e.target.value)
          }
        >
          <option value="">Select</option>
          <option value="1">Sell immediately</option>
          <option value="3">Wait and observe</option>
          <option value="5">Invest more</option>
        </select>

        <h3 className="text-lg font-bold mb-2">
          3. What is your investment experience?
        </h3>

        <select
          onChange={(e) =>
            handleChange('q3', e.target.value)
          }
        >
          <option value="">Select</option>
          <option value="1">Beginner</option>
          <option value="3">Intermediate</option>
          <option value="5">Advanced</option>
        </select>

        <h3 className="text-lg font-bold mb-2">
          4. What percentage of your income do you save?
        </h3>

        <select
          onChange={(e) =>
            handleChange('q4', e.target.value)
          }
        >
          <option value="">Select</option>
          <option value="1">Less than 10%</option>
          <option value="3">10% - 30%</option>
          <option value="5">More than 30%</option>
        </select>

        <h3 className="text-lg font-bold mb-2">
          5. Your primary goal is:
        </h3>

        <select
          onChange={(e) =>
            handleChange('q5', e.target.value)
          }
        >
          <option value="">Select</option>
          <option value="1">Capital Preservation</option>
          <option value="3">Balanced Growth</option>
          <option value="5">Maximum Growth</option>
        </select>

        <br />
        <br />

        <button onClick={calculateRisk}>
          Calculate Profile
        </button>

        {result && (
          <>
            <hr />

            <h2 className="text-xl font-bold mb-3">{result}</h2>

            <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">

              {result.includes('Conservative') &&
                'You prioritize safety and stable returns.'}

              {result.includes('Moderate') &&
                'You seek balanced growth with moderate risk.'}

              {result.includes('Aggressive') &&
                'You are comfortable taking risks for higher returns.'}

            </p>
          </>
        )}

      </div>

    </div>
  );
}

export default RiskProfiler;