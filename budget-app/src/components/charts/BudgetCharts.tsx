'use client';

import {
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// Helper to safely convert value to number for formatters
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (Array.isArray(value) && value.length > 0) return safeNumber(value[0]);
  return 0;
};

// Color palette for charts
const COLORS = {
  primary: '#3B82F6',    // Blue
  secondary: '#10B981',  // Green
  tertiary: '#F59E0B',   // Amber
  quaternary: '#EF4444', // Red
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  gray: '#6B7280',
};

const PIE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280'
];

interface QuarterlyData {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  yearly: number;
}

interface ChartProps {
  darkMode?: boolean;
  height?: number;
}

// Format currency for tooltips
const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatNumber = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ============================================
// Schedule 1: Sales Budget Charts
// ============================================

interface SalesChartProps extends ChartProps {
  salesUnits: QuarterlyData;
  salesRevenue: QuarterlyData;
  historicalUnits?: QuarterlyData;
}

export function SalesTrendChart({ salesUnits, salesRevenue, historicalUnits, darkMode, height = 300 }: SalesChartProps) {
  const data = [
    { quarter: 'Q1', units: salesUnits.q1, revenue: salesRevenue.q1, historical: historicalUnits?.q1 },
    { quarter: 'Q2', units: salesUnits.q2, revenue: salesRevenue.q2, historical: historicalUnits?.q2 },
    { quarter: 'Q3', units: salesUnits.q3, revenue: salesRevenue.q3, historical: historicalUnits?.q3 },
    { quarter: 'Q4', units: salesUnits.q4, revenue: salesRevenue.q4, historical: historicalUnits?.q4 },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Sales Trend by Quarter
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="quarter" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis yAxisId="left" stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatNumber} />
          <YAxis yAxisId="right" orientation="right" stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value, name) => {
              const numValue = typeof value === 'number' ? value : 0;
              if (name === 'revenue') return [formatCurrency(numValue), 'Revenue'];
              return [formatNumber(numValue), name === 'units' ? 'Forecast Units' : 'Historical Units'];
            }}
          />
          <Legend />
          {historicalUnits && (
            <Bar yAxisId="left" dataKey="historical" name="Historical Units" fill={COLORS.gray} opacity={0.5} />
          )}
          <Bar yAxisId="left" dataKey="units" name="Forecast Units" fill={COLORS.primary} />
          <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.secondary} strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalesComparisonChart({ salesUnits, historicalUnits, darkMode, height = 250 }: SalesChartProps) {
  if (!historicalUnits) return null;

  const data = [
    { quarter: 'Q1', forecast: salesUnits.q1, historical: historicalUnits.q1, growth: ((salesUnits.q1 - historicalUnits.q1) / historicalUnits.q1 * 100) },
    { quarter: 'Q2', forecast: salesUnits.q2, historical: historicalUnits.q2, growth: ((salesUnits.q2 - historicalUnits.q2) / historicalUnits.q2 * 100) },
    { quarter: 'Q3', forecast: salesUnits.q3, historical: historicalUnits.q3, growth: ((salesUnits.q3 - historicalUnits.q3) / historicalUnits.q3 * 100) },
    { quarter: 'Q4', forecast: salesUnits.q4, historical: historicalUnits.q4, growth: ((salesUnits.q4 - historicalUnits.q4) / historicalUnits.q4 * 100) },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Year-over-Year Growth
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="quarter" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [`${safeNumber(value).toFixed(1)}%`, 'Growth Rate']}
          />
          <Bar dataKey="growth" name="Growth %" fill={COLORS.secondary}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? COLORS.secondary : COLORS.quaternary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Schedule 2: Production Budget Charts
// ============================================

interface ProductionChartProps extends ChartProps {
  salesUnits: QuarterlyData;
  production: QuarterlyData;
  endingInventory: QuarterlyData;
}

export function ProductionChart({ salesUnits, production, endingInventory, darkMode, height = 300 }: ProductionChartProps) {
  const data = [
    { quarter: 'Q1', sales: salesUnits.q1, production: production.q1, inventory: endingInventory.q1 },
    { quarter: 'Q2', sales: salesUnits.q2, production: production.q2, inventory: endingInventory.q2 },
    { quarter: 'Q3', sales: salesUnits.q3, production: production.q3, inventory: endingInventory.q3 },
    { quarter: 'Q4', sales: salesUnits.q4, production: production.q4, inventory: endingInventory.q4 },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Production vs Sales & Inventory
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="quarter" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatNumber} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [formatNumber(safeNumber(value)), '']}
          />
          <Legend />
          <Bar dataKey="sales" name="Sales Units" fill={COLORS.primary} />
          <Bar dataKey="production" name="Production Units" fill={COLORS.secondary} />
          <Line type="monotone" dataKey="inventory" name="Ending Inventory" stroke={COLORS.tertiary} strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Schedule 3-4: Cost Charts (Materials & Labor)
// ============================================

interface CostTrendChartProps extends ChartProps {
  data: QuarterlyData;
  label: string;
  color?: string;
}

export function CostTrendChart({ data, label, color = COLORS.primary, darkMode, height = 250 }: CostTrendChartProps) {
  const chartData = [
    { quarter: 'Q1', value: data.q1 },
    { quarter: 'Q2', value: data.q2 },
    { quarter: 'Q3', value: data.q3 },
    { quarter: 'Q4', value: data.q4 },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        {label}
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="quarter" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [formatCurrency(safeNumber(value)), label]}
          />
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Schedule 5-6: Expense Breakdown Charts
// ============================================

interface ExpenseBreakdownProps extends ChartProps {
  expenses: { name: string; value: number }[];
  title: string;
}

export function ExpenseBreakdownChart({ expenses, title, darkMode, height = 300 }: ExpenseBreakdownProps) {
  const total = expenses.reduce((sum, e) => sum + e.value, 0);

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={expenses}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {expenses.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [formatCurrency(safeNumber(value)), '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className={`text-center mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <span className="text-lg font-semibold">{formatCurrency(total)}</span>
        <span className="text-sm ml-2">Total</span>
      </div>
    </div>
  );
}

// ============================================
// Schedule 7-9: Cash Flow Charts
// ============================================

interface CashFlowChartProps extends ChartProps {
  receipts: QuarterlyData;
  disbursements: QuarterlyData;
  endingCash?: QuarterlyData;
}

export function CashFlowChart({ receipts, disbursements, endingCash, darkMode, height = 300 }: CashFlowChartProps) {
  const data = [
    {
      quarter: 'Q1',
      receipts: receipts.q1,
      disbursements: -disbursements.q1,
      netFlow: receipts.q1 - disbursements.q1,
      endingCash: endingCash?.q1
    },
    {
      quarter: 'Q2',
      receipts: receipts.q2,
      disbursements: -disbursements.q2,
      netFlow: receipts.q2 - disbursements.q2,
      endingCash: endingCash?.q2
    },
    {
      quarter: 'Q3',
      receipts: receipts.q3,
      disbursements: -disbursements.q3,
      netFlow: receipts.q3 - disbursements.q3,
      endingCash: endingCash?.q3
    },
    {
      quarter: 'Q4',
      receipts: receipts.q4,
      disbursements: -disbursements.q4,
      netFlow: receipts.q4 - disbursements.q4,
      endingCash: endingCash?.q4
    },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Cash Receipts vs Disbursements
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="quarter" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value, name) => {
              const numValue = safeNumber(value);
              const absValue = Math.abs(numValue);
              if (name === 'disbursements') return [formatCurrency(absValue), 'Disbursements'];
              return [formatCurrency(numValue), String(name).charAt(0).toUpperCase() + String(name).slice(1).replace(/([A-Z])/g, ' $1')];
            }}
          />
          <Legend />
          <Bar dataKey="receipts" name="Receipts" fill={COLORS.secondary} stackId="stack" />
          <Bar dataKey="disbursements" name="Disbursements" fill={COLORS.quaternary} stackId="stack" />
          {endingCash && (
            <Line type="monotone" dataKey="endingCash" name="Ending Cash" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Schedule 10-11: COGS & Income Statement Charts
// ============================================

interface COGSBreakdownProps extends ChartProps {
  directMaterial: number;
  directLabor: number;
  manufacturingOverhead: number;
}

export function COGSBreakdownChart({ directMaterial, directLabor, manufacturingOverhead, darkMode, height = 300 }: COGSBreakdownProps) {
  const data = [
    { name: 'Direct Materials', value: directMaterial },
    { name: 'Direct Labor', value: directLabor },
    { name: 'Mfg Overhead', value: manufacturingOverhead },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Cost of Goods Sold Breakdown
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis type="number" stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatCurrency} />
          <YAxis type="category" dataKey="name" stroke={darkMode ? '#9CA3AF' : '#6B7280'} width={120} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [formatCurrency(safeNumber(value)), '']}
          />
          <Bar dataKey="value" fill={COLORS.primary}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface IncomeWaterfallProps extends ChartProps {
  salesRevenue: number;
  cogs: number;
  sgaExpenses: number;
  interestExpense: number;
  taxes: number;
}

export function IncomeWaterfallChart({ salesRevenue, cogs, sgaExpenses, interestExpense, taxes, darkMode, height = 300 }: IncomeWaterfallProps) {
  const grossMargin = salesRevenue - cogs;
  const operatingIncome = grossMargin - sgaExpenses;
  const incomeBeforeTax = operatingIncome - interestExpense;
  const netIncome = incomeBeforeTax - taxes;

  const data = [
    { name: 'Revenue', value: salesRevenue, fill: COLORS.secondary },
    { name: 'COGS', value: -cogs, fill: COLORS.quaternary },
    { name: 'Gross Margin', value: grossMargin, fill: COLORS.primary },
    { name: 'SG&A', value: -sgaExpenses, fill: COLORS.quaternary },
    { name: 'Operating Inc', value: operatingIncome, fill: COLORS.primary },
    { name: 'Interest', value: -interestExpense, fill: COLORS.tertiary },
    { name: 'Taxes', value: -taxes, fill: COLORS.tertiary },
    { name: 'Net Income', value: netIncome, fill: netIncome >= 0 ? COLORS.secondary : COLORS.quaternary },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Income Statement Breakdown
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="name" stroke={darkMode ? '#9CA3AF' : '#6B7280'} tick={{ fontSize: 11 }} />
          <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => {
              const numValue = safeNumber(value);
              return [formatCurrency(Math.abs(numValue)), numValue < 0 ? 'Expense' : 'Amount'];
            }}
          />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Schedule 12-13: Cash Flow Statement & Balance Sheet
// ============================================

interface CashFlowActivitiesProps extends ChartProps {
  operating: number;
  investing: number;
  financing: number;
}

export function CashFlowActivitiesChart({ operating, investing, financing, darkMode, height = 250 }: CashFlowActivitiesProps) {
  const data = [
    { name: 'Operating', value: operating, fill: operating >= 0 ? COLORS.secondary : COLORS.quaternary },
    { name: 'Investing', value: investing, fill: investing >= 0 ? COLORS.secondary : COLORS.quaternary },
    { name: 'Financing', value: financing, fill: financing >= 0 ? COLORS.secondary : COLORS.quaternary },
  ];

  const netChange = operating + investing + financing;

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Cash Flow by Activity
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="name" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [formatCurrency(safeNumber(value)), '']}
          />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className={`text-center mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <span className="text-sm">Net Change in Cash: </span>
        <span className={`text-lg font-semibold ${netChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {formatCurrency(netChange)}
        </span>
      </div>
    </div>
  );
}

interface BalanceSheetProps extends ChartProps {
  assets: { current: number; fixed: number; other: number };
  liabilities: { current: number; longTerm: number };
  equity: number;
}

export function BalanceSheetChart({ assets, liabilities, equity, darkMode, height = 300 }: BalanceSheetProps) {
  const totalAssets = assets.current + assets.fixed + assets.other;
  const totalLiabilitiesEquity = liabilities.current + liabilities.longTerm + equity;

  const data = [
    {
      name: 'Assets',
      current: assets.current,
      fixed: assets.fixed,
      other: assets.other,
    },
    {
      name: 'Liab + Equity',
      currentLiab: liabilities.current,
      longTermDebt: liabilities.longTerm,
      equity: equity,
    },
  ];

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Balance Sheet Structure
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis dataKey="name" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [formatCurrency(safeNumber(value)), '']}
          />
          <Legend />
          <Bar dataKey="current" name="Current Assets" stackId="a" fill={COLORS.primary} />
          <Bar dataKey="fixed" name="Fixed Assets" stackId="a" fill={COLORS.secondary} />
          <Bar dataKey="other" name="Other Assets" stackId="a" fill={COLORS.tertiary} />
          <Bar dataKey="currentLiab" name="Current Liabilities" stackId="a" fill={COLORS.quaternary} />
          <Bar dataKey="longTermDebt" name="Long-Term Debt" stackId="a" fill={COLORS.purple} />
          <Bar dataKey="equity" name="Equity" stackId="a" fill={COLORS.cyan} />
        </BarChart>
      </ResponsiveContainer>
      <div className={`flex justify-between mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <span>Total Assets: <strong>{formatCurrency(totalAssets)}</strong></span>
        <span>Total L+E: <strong>{formatCurrency(totalLiabilitiesEquity)}</strong></span>
      </div>
    </div>
  );
}

// ============================================
// Financial Ratios Chart
// ============================================

interface RatiosChartProps extends ChartProps {
  ratios: { name: string; value: number; benchmark?: number }[];
  title: string;
}

export function FinancialRatiosChart({ ratios, title, darkMode, height = 250 }: RatiosChartProps) {
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h4 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={ratios} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis type="number" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
          <YAxis type="category" dataKey="name" stroke={darkMode ? '#9CA3AF' : '#6B7280'} width={100} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: darkMode ? '#F3F4F6' : '#1F2937'
            }}
            formatter={(value) => [safeNumber(value).toFixed(2), '']}
          />
          <Legend />
          <Bar dataKey="value" name="Actual" fill={COLORS.primary} />
          {ratios.some(r => r.benchmark) && (
            <Bar dataKey="benchmark" name="Benchmark" fill={COLORS.gray} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

