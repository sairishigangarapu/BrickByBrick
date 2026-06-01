'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface CalculatorInputs {
  monthlyInvestment: number;
  age: number;
  retirementAge: number;
  expectedReturn: number;
  inflationRate: number;
}

export function InvestmentCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyInvestment: 5000,
    age: 25,
    retirementAge: 60,
    expectedReturn: 12,
    inflationRate: 6,
  });

  const years = inputs.retirementAge - inputs.age;

  const chartData = useMemo(() => {
    const data = [];
    let futureValue = 0;
    let futureValueInflation = 0;

    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        futureValue = (futureValue + inputs.monthlyInvestment * 12) * (1 + inputs.expectedReturn / 100);
        futureValueInflation = (futureValueInflation + inputs.monthlyInvestment * 12) * (1 + inputs.inflationRate / 100);
      }
      data.push({
        year: inputs.age + year,
        'With Investment': Math.round(futureValue / 100000),
        'Without (Inflation only)': Math.round(futureValueInflation / 100000),
      });
    }
    return data;
  }, [inputs, years]);

  const finalValue = chartData[chartData.length - 1]?.['With Investment'] || 0;
  const inflationValue = chartData[chartData.length - 1]?.['Without (Inflation only)'] || 0;
  const difference = finalValue - inflationValue;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Your Inputs</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Investment (₹)
            </label>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={inputs.monthlyInvestment}
              onChange={(e) => setInputs({ ...inputs, monthlyInvestment: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-right font-semibold text-orange-600">₹{inputs.monthlyInvestment.toLocaleString()}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Age: {inputs.age} years
            </label>
            <input
              type="range"
              min="18"
              max="60"
              value={inputs.age}
              onChange={(e) => setInputs({ ...inputs, age: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retirement Age: {inputs.retirementAge} years
            </label>
            <input
              type="range"
              min="40"
              max="80"
              value={inputs.retirementAge}
              onChange={(e) => setInputs({ ...inputs, retirementAge: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Return: {inputs.expectedReturn}%
            </label>
            <input
              type="range"
              min="4"
              max="20"
              step="1"
              value={inputs.expectedReturn}
              onChange={(e) => setInputs({ ...inputs, expectedReturn: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inflation Rate: {inputs.inflationRate}%
            </label>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={inputs.inflationRate}
              onChange={(e) => setInputs({ ...inputs, inflationRate: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Your Future Wealth</h3>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white"
          >
            <div className="text-sm opacity-80">Future Value</div>
            <div className="text-3xl font-bold">₹{(finalValue * 100000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Without Investing</div>
              <div className="text-xl font-semibold text-gray-900">₹{(inflationValue * 100000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              <div className="text-xs text-gray-500">(Lost to inflation)</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-sm text-emerald-700">Your Gain</div>
              <div className="text-xl font-semibold text-emerald-700">₹{(difference * 100000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              <div className="text-xs text-emerald-600">Power of compounding!</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Insight:</strong> At {inputs.expectedReturn}% return, your money grows <span className="text-blue-600 font-semibold">{(inputs.expectedReturn / inputs.inflationRate).toFixed(1)}x</span> faster than inflation!
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `₹${value}L`} />
            <Tooltip 
              formatter={(value) => [`₹${(Number(value) / 10).toFixed(1)}L`, '']}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="With Investment" stroke="#dc2626" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Without (Inflation only)" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}