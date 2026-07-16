'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SalesTrendChart,
  ProductionChart,
  CostTrendChart,
  ExpenseBreakdownChart,
  CashFlowChart,
  COGSBreakdownChart,
  IncomeWaterfallChart,
  CashFlowActivitiesChart,
  BalanceSheetChart,
} from '@/components/charts';

// Simple KPI Card Component
function KPICard({
  title,
  value,
  subtitle,
  trend,
  darkMode,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  darkMode: boolean;
}) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: darkMode ? 'text-gray-400' : 'text-gray-500',
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
      </h4>
      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {subtitle && (
        <p className={`text-sm mt-1 ${trend ? trendColors[trend] : trendColors.neutral}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Sample data generator for demo
function generateSampleData() {
  return {
    // Sales data
    salesUnits: { q1: 3500, q2: 4200, q3: 4800, q4: 5500, yearly: 18000 },
    salesRevenue: { q1: 175000, q2: 210000, q3: 240000, q4: 275000, yearly: 900000 },

    // Production data
    productionUnits: { q1: 3800, q2: 4300, q3: 4900, q4: 5200, yearly: 18200 },
    endingInventory: { q1: 420, q2: 520, q3: 620, q4: 320, yearly: 320 },

    // Cost data
    materialCost: { q1: 52500, q2: 63000, q3: 72000, q4: 82500, yearly: 270000 },
    laborCost: { q1: 38000, q2: 45600, q3: 52080, q4: 59800, yearly: 195480 },
    overheadCost: { q1: 28500, q2: 34200, q3: 39060, q4: 44850, yearly: 146610 },
    sgaCost: { q1: 22000, q2: 26400, q3: 30160, q4: 34650, yearly: 113210 },

    // Cash data
    cashReceipts: { q1: 157500, q2: 189000, q3: 216000, q4: 247500, yearly: 810000 },
    cashDisbursements: { q1: 130000, q2: 156000, q3: 178200, q4: 204750, yearly: 668950 },
    endingCash: { q1: 62500, q2: 95500, q3: 133300, q4: 176050, yearly: 176050 },
    operatingCashFlow: { q1: 27500, q2: 33000, q3: 37800, q4: 42750, yearly: 141050 },
    freeCashFlow: { q1: 17500, q2: 23000, q3: 27800, q4: 32750, yearly: 101050 },

    // Income statement data
    grossMargin: 630000,
    operatingIncome: 516790,
    netIncome: 361753,

    // COGS breakdown
    directMaterial: 270000,
    directLabor: 195480,
    manufacturingOverhead: 146610,

    // Cash flow activities
    netCashFromOperating: 141050,
    netCashFromInvesting: -40000,
    netCashFromFinancing: -15000,

    // Balance sheet
    totalCurrentAssets: 326050,
    netFixedAssets: 280000,
    otherAssets: 15000,
    totalCurrentLiabilities: 85000,
    longTermDebt: 120000,
    totalEquity: 416050,

    // Key metrics
    grossMarginPercent: 70,
    operatingMarginPercent: 57.4,
    netMarginPercent: 40.2,
    currentRatio: 3.84,
    debtToEquity: 0.49,
    returnOnEquity: 86.9,
  };
}

export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<ReturnType<typeof generateSampleData> | null>(null);

  // Load preferences and data from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);

    // In a real app, this would load saved budget data from localStorage or an API
    // For now, we generate sample data
    setData(generateSampleData());
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
  };

  const headingColor = darkMode ? 'text-white' : 'text-black';
  const textColor = darkMode ? 'text-gray-300' : 'text-gray-600';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const hrColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (!data) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#111]' : 'bg-gray-50'}`}>
        <p className={textColor}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#111] text-gray-100' : 'bg-gray-50 text-[#454545]'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className={`text-xl font-semibold ${headingColor}`}>
              Budget Automation
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/input" className={`text-sm ${textColor} hover:underline`}>
                Input
              </Link>
              <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Dashboard
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Inverted Mode
            </span>
            <button
              onClick={toggleDarkMode}
              className={`text-sm hover:underline ${textColor}`}
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${headingColor}`}>
            Executive Dashboard
          </h1>
          <p className={`text-lg ${textColor}`}>
            Budget overview for FY 2025 - ABC Manufacturing Co.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(data.salesRevenue.yearly)}
            subtitle="+12% vs prior year"
            trend="up"
            darkMode={darkMode}
          />
          <KPICard
            title="Gross Margin"
            value={`${data.grossMarginPercent}%`}
            subtitle={formatCurrency(data.grossMargin)}
            trend="up"
            darkMode={darkMode}
          />
          <KPICard
            title="Net Income"
            value={formatCurrency(data.netIncome)}
            subtitle={`${data.netMarginPercent}% margin`}
            trend="up"
            darkMode={darkMode}
          />
          <KPICard
            title="Operating Cash Flow"
            value={formatCurrency(data.netCashFromOperating)}
            subtitle="Strong cash generation"
            trend="up"
            darkMode={darkMode}
          />
          <KPICard
            title="Current Ratio"
            value={data.currentRatio.toFixed(2)}
            subtitle="Excellent liquidity"
            trend="up"
            darkMode={darkMode}
          />
          <KPICard
            title="ROE"
            value={`${data.returnOnEquity.toFixed(1)}%`}
            subtitle="Strong returns"
            trend="up"
            darkMode={darkMode}
          />
        </div>

        <hr className={`my-8 ${hrColor}`} />

        {/* Sales & Production Section */}
        <h2 className={`text-2xl font-semibold mb-6 ${headingColor}`}>
          Sales & Production
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SalesTrendChart
            salesUnits={data.salesUnits}
            salesRevenue={data.salesRevenue}
            darkMode={darkMode}
            height={300}
          />
          <ProductionChart
            salesUnits={data.salesUnits}
            production={data.productionUnits}
            endingInventory={data.endingInventory}
            darkMode={darkMode}
            height={300}
          />
        </div>

        <hr className={`my-8 ${hrColor}`} />

        {/* Cost Analysis Section */}
        <h2 className={`text-2xl font-semibold mb-6 ${headingColor}`}>
          Cost Analysis
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <COGSBreakdownChart
            directMaterial={data.directMaterial}
            directLabor={data.directLabor}
            manufacturingOverhead={data.manufacturingOverhead}
            darkMode={darkMode}
            height={300}
          />
          <ExpenseBreakdownChart
            expenses={[
              { name: 'Materials', value: data.directMaterial },
              { name: 'Labor', value: data.directLabor },
              { name: 'Overhead', value: data.manufacturingOverhead },
              { name: 'SG&A', value: data.sgaCost.yearly },
            ]}
            title="Total Cost Breakdown (Yearly)"
            darkMode={darkMode}
            height={300}
          />
        </div>

        <hr className={`my-8 ${hrColor}`} />

        {/* Cash Flow Section */}
        <h2 className={`text-2xl font-semibold mb-6 ${headingColor}`}>
          Cash Flow Analysis
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <CashFlowChart
            receipts={data.cashReceipts}
            disbursements={data.cashDisbursements}
            endingCash={data.endingCash}
            darkMode={darkMode}
            height={300}
          />
          <div className="grid grid-cols-1 gap-6">
            <CostTrendChart
              data={data.operatingCashFlow}
              label="Operating Cash Flow by Quarter"
              color="#3B82F6"
              darkMode={darkMode}
              height={140}
            />
            <CostTrendChart
              data={data.freeCashFlow}
              label="Free Cash Flow by Quarter"
              color="#10B981"
              darkMode={darkMode}
              height={140}
            />
          </div>
        </div>

        <hr className={`my-8 ${hrColor}`} />

        {/* Financial Statements Section */}
        <h2 className={`text-2xl font-semibold mb-6 ${headingColor}`}>
          Financial Statements
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <IncomeWaterfallChart
            salesRevenue={data.salesRevenue.yearly}
            cogs={data.directMaterial + data.directLabor + data.manufacturingOverhead}
            sgaExpenses={data.sgaCost.yearly}
            interestExpense={15000}
            taxes={data.netIncome * 0.21 / 0.79}
            darkMode={darkMode}
            height={350}
          />
          <div className="space-y-6">
            <CashFlowActivitiesChart
              operating={data.netCashFromOperating}
              investing={data.netCashFromInvesting}
              financing={data.netCashFromFinancing}
              darkMode={darkMode}
              height={160}
            />
            <BalanceSheetChart
              assets={{
                current: data.totalCurrentAssets,
                fixed: data.netFixedAssets,
                other: data.otherAssets,
              }}
              liabilities={{
                current: data.totalCurrentLiabilities,
                longTerm: data.longTermDebt,
              }}
              equity={data.totalEquity}
              darkMode={darkMode}
              height={160}
            />
          </div>
        </div>

        <hr className={`my-8 ${hrColor}`} />

        {/* Summary Cards */}
        <h2 className={`text-2xl font-semibold mb-6 ${headingColor}`}>
          Key Performance Indicators
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-sm ${cardBg}`}>
            <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>Profitability</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={textColor}>Gross Margin</span>
                <span className={`font-medium ${headingColor}`}>{data.grossMarginPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Operating Margin</span>
                <span className={`font-medium ${headingColor}`}>{data.operatingMarginPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Net Margin</span>
                <span className={`font-medium ${headingColor}`}>{data.netMarginPercent}%</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-sm ${cardBg}`}>
            <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>Liquidity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={textColor}>Current Ratio</span>
                <span className={`font-medium ${headingColor}`}>{data.currentRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Cash Position</span>
                <span className={`font-medium ${headingColor}`}>{formatCurrency(data.endingCash.yearly)}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Free Cash Flow</span>
                <span className={`font-medium ${headingColor}`}>{formatCurrency(data.freeCashFlow.yearly)}</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-sm ${cardBg}`}>
            <h3 className={`text-lg font-semibold mb-4 ${headingColor}`}>Leverage & Returns</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={textColor}>Debt-to-Equity</span>
                <span className={`font-medium ${headingColor}`}>{data.debtToEquity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Return on Equity</span>
                <span className={`font-medium ${headingColor}`}>{data.returnOnEquity.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Total Assets</span>
                <span className={`font-medium ${headingColor}`}>{formatCurrency(data.totalCurrentAssets + data.netFixedAssets + data.otherAssets)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12 mb-8">
          <Link
            href="/input"
            className={`inline-block ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-medium px-8 py-3 text-base`}
          >
            Edit Budget Data
          </Link>
          <button
            onClick={() => window.print()}
            className={`inline-block ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} border font-medium px-8 py-3 text-base`}
          >
            Print Dashboard
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className={`max-w-7xl mx-auto px-6 py-12 border-t ${hrColor} text-sm ${textColor}`}>
        <p>Built with Next.js, TypeScript, Tailwind CSS, and Recharts</p>
        <p className="mt-2">Budget Automation System - Executive Dashboard</p>
      </footer>
    </div>
  );
}

