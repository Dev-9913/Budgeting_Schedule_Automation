import {
  IncomeStatementOutput,
  IncomeStatementInputs,
  SalesBudgetOutput,
  COGSOutput,
  SellingAdminExpenseOutput
} from '../types/budgets';

/**
 * Schedule 11: Budgeted Income Statement
 *
 * Purpose: Project the company's profitability for the budget period
 *
 * This schedule combines data from all previous schedules to create
 * a comprehensive income statement showing:
 * - Sales Revenue (Schedule 1)
 * - Cost of Goods Sold (Schedule 10)
 * - Gross Margin
 * - Selling & Administrative Expenses (Schedule 6)
 * - Operating Income
 * - Interest Expense
 * - Net Income Before and After Taxes
 *
 * Key Formulas:
 * - Gross Margin = Sales Revenue - Cost of Goods Sold
 * - Gross Margin % = (Gross Margin ÷ Sales Revenue) × 100
 * - Operating Income = Gross Margin - SG&A Expenses
 * - Net Income Before Tax = Operating Income - Interest Expense
 * - Income Tax = Net Income Before Tax × Tax Rate
 * - Net Income = Net Income Before Tax - Income Tax
 * - Net Profit Margin = (Net Income ÷ Sales Revenue) × 100
 *
 * Based on Ronald W. Hilton's Managerial Accounting framework
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates inputs for Income Statement calculation
 */
function validateIncomeStatementInputs(
  salesData: SalesBudgetOutput | null,
  cogsData: COGSOutput | null,
  sgaData: SellingAdminExpenseOutput | null,
  inputs: IncomeStatementInputs
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required schedules
  if (!salesData) {
    errors.push('Sales Budget data (Schedule 1) is required for Income Statement');
  }

  if (!cogsData) {
    errors.push('Cost of Goods Sold data (Schedule 10) is required for Income Statement');
  }

  if (!sgaData) {
    errors.push('Selling & Administrative Expenses data (Schedule 6) is required for Income Statement');
  }

  // Validate optional inputs
  if (inputs.interestExpense && inputs.interestExpense < 0) {
    errors.push('Interest expense cannot be negative');
  }

  if (inputs.incomeTaxRate) {
    if (inputs.incomeTaxRate < 0 || inputs.incomeTaxRate > 1) {
      errors.push('Income tax rate must be between 0 and 1 (0% to 100%)');
    }
  }

  // Warnings
  if (!inputs.interestExpense || inputs.interestExpense === 0) {
    warnings.push('No interest expense - assuming no debt financing');
  }

  if (!inputs.incomeTaxRate || inputs.incomeTaxRate === 0) {
    warnings.push('No income tax rate specified - taxes will not be calculated');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Budgeted Income Statement (Schedule 11)
 */
export function calculateIncomeStatement(
  salesData: SalesBudgetOutput | null,
  cogsData: COGSOutput | null,
  sgaData: SellingAdminExpenseOutput | null,
  inputs: IncomeStatementInputs
): { output: IncomeStatementOutput | null; validation: ValidationResult } {
  const validation = validateIncomeStatementInputs(salesData, cogsData, sgaData, inputs);

  if (!validation.isValid || !salesData || !cogsData || !sgaData) {
    return { output: null, validation };
  }

  // === STEP 1: Sales Revenue ===
  const salesRevenue = salesData.salesRevenue.yearly;

  // === STEP 2: Cost of Goods Sold ===
  const costOfGoodsSold = cogsData.costOfGoodsSold;

  // === STEP 3: Gross Margin ===
  const grossMargin = salesRevenue - costOfGoodsSold;
  const grossMarginPercentage = salesRevenue > 0 ? (grossMargin / salesRevenue) * 100 : 0;

  // === STEP 4: Selling & Administrative Expenses ===
  const sellingAdminExpenses = sgaData.totalSGAExpenses.yearly;

  // === STEP 5: Operating Income ===
  const operatingIncome = grossMargin - sellingAdminExpenses;
  const operatingMarginPercentage = salesRevenue > 0 ? (operatingIncome / salesRevenue) * 100 : 0;

  // === STEP 6: Interest Expense ===
  const interestExpense = inputs.interestExpense || 0;

  // === STEP 7: Net Income Before Tax ===
  const netIncomeBeforeTax = operatingIncome - interestExpense;

  // === STEP 8: Income Tax ===
  const incomeTaxRate = inputs.incomeTaxRate || 0;
  const incomeTax = netIncomeBeforeTax > 0 ? netIncomeBeforeTax * incomeTaxRate : 0;

  // === STEP 9: Net Income ===
  const netIncome = netIncomeBeforeTax - incomeTax;
  const netProfitMarginPercentage = salesRevenue > 0 ? (netIncome / salesRevenue) * 100 : 0;

  const output: IncomeStatementOutput = {
    salesRevenue,
    costOfGoodsSold,
    grossMargin,
    grossMarginPercentage,
    sellingAdminExpenses,
    operatingIncome,
    operatingMarginPercentage,
    interestExpense,
    netIncomeBeforeTax,
    incomeTax,
    netIncome,
    netProfitMarginPercentage,
  };

  return { output, validation };
}

/**
 * Format Income Statement output for display
 */
export function formatIncomeStatementOutput(output: IncomeStatementOutput): Array<{
  label: string;
  amount: string;
  percentage?: string;
}> {
  const format = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const rows = [];

  // Sales Revenue
  rows.push({
    label: 'Sales Revenue',
    amount: format(output.salesRevenue),
    percentage: '100.0%',
  });

  // Cost of Goods Sold
  rows.push({
    label: 'Less: Cost of Goods Sold',
    amount: `(${format(output.costOfGoodsSold)})`,
    percentage: formatPercent((output.costOfGoodsSold / output.salesRevenue) * 100),
  });

  // Blank row
  rows.push({ label: '', amount: '', percentage: '' });

  // Gross Margin
  rows.push({
    label: 'Gross Margin',
    amount: format(output.grossMargin),
    percentage: formatPercent(output.grossMarginPercentage),
  });

  // Blank row
  rows.push({ label: '', amount: '', percentage: '' });

  // Operating Expenses
  rows.push({
    label: 'OPERATING EXPENSES',
    amount: '',
    percentage: '',
  });

  rows.push({
    label: 'Selling & Administrative Expenses',
    amount: `(${format(output.sellingAdminExpenses)})`,
    percentage: formatPercent((output.sellingAdminExpenses / output.salesRevenue) * 100),
  });

  // Blank row
  rows.push({ label: '', amount: '', percentage: '' });

  // Operating Income
  rows.push({
    label: 'Operating Income',
    amount: format(output.operatingIncome),
    percentage: formatPercent(output.operatingMarginPercentage),
  });

  // Blank row
  rows.push({ label: '', amount: '', percentage: '' });

  // Interest Expense
  if (output.interestExpense > 0) {
    rows.push({
      label: 'OTHER EXPENSES',
      amount: '',
      percentage: '',
    });

    rows.push({
      label: 'Interest Expense',
      amount: `(${format(output.interestExpense)})`,
      percentage: formatPercent((output.interestExpense / output.salesRevenue) * 100),
    });

    rows.push({ label: '', amount: '', percentage: '' });
  }

  // Net Income Before Tax
  rows.push({
    label: 'Net Income Before Tax',
    amount: format(output.netIncomeBeforeTax),
    percentage: formatPercent((output.netIncomeBeforeTax / output.salesRevenue) * 100),
  });

  // Income Tax
  if (output.incomeTax > 0) {
    rows.push({
      label: 'Less: Income Tax',
      amount: `(${format(output.incomeTax)})`,
      percentage: formatPercent((output.incomeTax / output.salesRevenue) * 100),
    });

    rows.push({ label: '', amount: '', percentage: '' });
  }

  // Net Income
  rows.push({
    label: 'Net Income',
    amount: format(output.netIncome),
    percentage: formatPercent(output.netProfitMarginPercentage),
  });

  return rows;
}

/**
 * Export Income Statement to CSV format
 */
export function exportIncomeStatementToCSV(
  output: IncomeStatementOutput,
  companyName: string,
  fiscalYear: string
): string {
  const rows = formatIncomeStatementOutput(output);

  let csv = `${companyName}\n`;
  csv += `Schedule 11: Budgeted Income Statement\n`;
  csv += `Fiscal Year: ${fiscalYear}\n\n`;

  csv += 'Item,Amount,% of Sales\n';

  rows.forEach(row => {
    csv += `"${row.label}",${row.amount},${row.percentage || ''}\n`;
  });

  return csv;
}

