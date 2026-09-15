"use client";

import React, { useState, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import CalculatorWrapper from "@/components/calculators/shared/CalculatorWrapper";

const SIPCalculator = dynamic(() => import("@/components/calculators/SIPCalculator"), { ssr: false });
const PropertyGoalPlanner = dynamic(() => import("@/components/calculators/PropertyGoalPlanner"), { ssr: false });
const REITDividendCalculator = dynamic(() => import("@/components/calculators/REITDividendCalculator"), { ssr: false });
const FIRECalculator = dynamic(() => import("@/components/calculators/FIRECalculator"), { ssr: false });
const InflationCalculator = dynamic(() => import("@/components/calculators/InflationCalculator"), { ssr: false });
const REITReadinessCalculator = dynamic(() => import("@/components/calculators/REITReadinessCalculator"), { ssr: false });
const RentVsInvestCalculator = dynamic(() => import("@/components/calculators/RentVsInvestCalculator"), { ssr: false });
const NetWorthTracker = dynamic(() => import("@/components/calculators/NetWorthTracker"), { ssr: false });
const RiskProfiler = dynamic(() => import("@/components/calculators/RiskProfiler"), { ssr: false });
const CompoundingCalculator = dynamic(() => import("@/components/calculators/CompoundingCalculator"), { ssr: false });
const AffordabilityCalculator = dynamic(() => import("@/components/calculators/AffordabilityCalculator"), { ssr: false });
const RetirementCorpusCalculator = dynamic(() => import("@/components/calculators/RetirementCorpusCalculator"), { ssr: false });
const RealEstateExposureAnalyzer = dynamic(() => import("@/components/calculators/RealEstateExposureAnalyzer"), { ssr: false });

const calculatorsList = [
  { id: "sip", name: "SIP Calculator", Component: SIPCalculator },
  { id: "property-goal", name: "Property Goal Planner", Component: PropertyGoalPlanner },
  { id: "reit-dividend", name: "REIT Dividend", Component: REITDividendCalculator },
  { id: "fire", name: "FIRE Calculator", Component: FIRECalculator },
  { id: "inflation", name: "Inflation", Component: InflationCalculator },
  { id: "reit-readiness", name: "REIT Readiness", Component: REITReadinessCalculator },
  { id: "rent-vs-invest", name: "Rent vs Invest", Component: RentVsInvestCalculator },
  { id: "net-worth", name: "Net Worth Tracker", Component: NetWorthTracker },
  { id: "risk-profiler", name: "Risk Profiler", Component: RiskProfiler },
  { id: "compounding", name: "Compounding", Component: CompoundingCalculator },
  { id: "affordability", name: "Affordability", Component: AffordabilityCalculator },
  { id: "retirement", name: "Retirement Corpus", Component: RetirementCorpusCalculator },
  { id: "exposure", name: "RE Exposure", Component: RealEstateExposureAnalyzer },
];

function CalcSkeleton() {
  return <div className="animate-pulse space-y-4"><div className="h-64 bg-gray-100 rounded" /></div>;
}

export default function CalculatorsPage() {
  const [activeCalc, setActiveCalc] = useState(calculatorsList[0].id);

  const ActiveComponent = calculatorsList.find(c => c.id === activeCalc)?.Component || SIPCalculator;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Financial & Property Calculators</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 sticky top-24 overflow-y-auto max-h-[80vh]">
            <h2 className="text-lg font-bold mb-4 px-2">Tools</h2>
            <ul className="space-y-1">
              {calculatorsList.map((calc) => (
                <li key={calc.id}>
                  <button
                    onClick={() => setActiveCalc(calc.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                      activeCalc === calc.id 
                        ? "bg-orange-100 text-orange-800" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {calc.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="w-full lg:w-3/4">
          <div className="bg-white rounded-lg p-4 lg:p-8 shadow-sm border border-gray-200">
            <CalculatorWrapper title={calculatorsList.find(c => c.id === activeCalc)?.name || "Report"}>
              <Suspense fallback={<CalcSkeleton />}>
                <ActiveComponent />
              </Suspense>
            </CalculatorWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
