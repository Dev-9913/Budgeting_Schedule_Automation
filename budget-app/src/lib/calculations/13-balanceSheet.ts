import {
  BalanceSheetOutput,
  BalanceSheetInputs,
  IncomeStatementOutput,
  CashBudgetOutput,
  CashReceiptsOutput,
  CashDisbursementOutput,
  COGSOutput,
  ManufacturingOverheadOutput,
  SalesBudgetOutput
} from '../types/budgets';

/**
 * Schedule 13: Budgeted Balance Sheet
 *
 * Purpose: Project the financial position (assets, liabilities, equity)
 * at the end of the budget period.
 *
 * CURRENT ASSETS:
 * - Cash (from Schedule 9)
 * - Accounts Receivable (from Schedule 7)
 * - Inventories (from Schedule 10): Raw Material, WIP, Finished Goods
 * - Other Current Assets
 *
 * FIXED ASSETS:
 * - Beginning Fixed Assets + Capital Expenditures
 * - Less: Accumulated Depreciation
 * = Net Fixed Assets
 *
 * LIABILITIES:
 * - Accounts Payable (from Schedule 8)
 * - Wages Payable, Taxes Payable, Other Accrued
 * - Short-term and Long-term Debt
 *
 * STOCKHOLDERS' EQUITY:
 * - Common Stock
 * - Retained Earnings = Beginning + Net Income - Dividends
 *
 * BALANCE CHECK: Total Assets = Total Liabilities + Equity
 *
 * Based on Ronald W. Hilton's Managerial Accounting framework
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates inputs for Balance Sheet calculation
 */
function validateBalanceSheetInputs(
  incomeStatementData: IncomeStatementOutput | null,
  cashBudgetData: CashBudgetOutput | null,
  cashReceiptsData: CashReceiptsOutput | null,
  cashDisbursementsData: CashDisbursementOutput | null,
  cogsData: COGSOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  inputs: BalanceSheetInputs
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required schedules
  if (!incomeStatementData) {
    errors.push('Income Statement data (Schedule 11) is required for Balance Sheet');
  }

  if (!cashBudgetData) {
    errors.push('Cash Budget data (Schedule 9) is required for ending cash balance');
  }

  if (!cashReceiptsData) {
    errors.push('Cash Receipts data (Schedule 7) is required for ending A/R balance');
  }

  if (!cashDisbursementsData) {
    errors.push('Cash Disbursements data (Schedule 8) is required for ending A/P balance');
  }

  if (!cogsData) {
    errors.push('COGS data (Schedule 10) is required for inventory values');
  }

  if (!overheadData) {
    errors.push('Manufacturing Overhead data (Schedule 5) is required for depreciation');
  }

  // Validate beginning balances
  if (inputs.beginningFixedAssets < 0) {
    errors.push('Beginning fixed assets cannot be negative');
  }

  if (inputs.beginningAccumulatedDepreciation < 0) {
    errors.push('Beginning accumulated depreciation cannot be negative');
  }

  if (inputs.beginningCommonStock < 0) {
    errors.push('Beginning common stock cannot be negative');
  }

  // Warnings for unusual situations
  if (inputs.beginningRetainedEarnings < 0) {
    warnings.push('Beginning retained earnings is negative (accumulated deficit)');
  }

  if (inputs.beginningLongTermDebt === 0 && (inputs.newLongTermBorrowing || 0) === 0) {
    warnings.push('No long-term debt - company is fully equity financed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Budgeted Balance Sheet (Schedule 13)
 */
export function calculateBalanceSheet(
  incomeStatementData: IncomeStatementOutput | null,
  cashBudgetData: CashBudgetOutput | null,
  cashReceiptsData: CashReceiptsOutput | null,
  cashDisbursementsData: CashDisbursementOutput | null,
  cogsData: COGSOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  salesData: SalesBudgetOutput | null,
  inputs: BalanceSheetInputs
): { output: BalanceSheetOutput | null; validation: ValidationResult } {
  const validation = validateBalanceSheetInputs(
    incomeStatementData,
    cashBudgetData,
    cashReceiptsData,
    cashDisbursementsData,
    cogsData,
    overheadData,
    inputs
  );

  if (!validation.isValid || !incomeStatementData || !cashBudgetData ||
      !cashReceiptsData || !cashDisbursementsData || !cogsData || !overheadData) {
    return { output: null, validation };
  }

  // ============================================
  // CURRENT ASSETS
  // ============================================

  // Cash (from Schedule 9 - ending cash balance)
  const cash = cashBudgetData.endingCash.q4;

  // Accounts Receivable (from Schedule 7 - ending A/R)
  const accountsReceivable = cashReceiptsData.endingAccountsReceivable.q4;

  // Inventories (from Schedule 10)
  // For raw materials, we estimate based on ending FG and WIP
  // In a full implementation, this would come from a materials inventory schedule
  const inventoryRawMaterial = inputs.beginningRawMaterialInventory; // Simplified: use beginning as estimate
  const inventoryWIP = cogsData.endingWIPInventory;
  const inventoryFinishedGoods = cogsData.endingFinishedGoodsInventory;
  const totalInventory = inventoryRawMaterial + inventoryWIP + inventoryFinishedGoods;

  // Other Current Assets
  const otherCurrentAssets = inputs.beginningOtherCurrentAssets + (inputs.otherCurrentAssetChange || 0);

  // Total Current Assets
  const totalCurrentAssets = cash + accountsReceivable + totalInventory + otherCurrentAssets;

  // ============================================
  // FIXED ASSETS
  // ============================================

  // Beginning Fixed Assets + Capital Expenditures
  const capitalExpenditures = cashDisbursementsData.capitalExpenditures.yearly;
  const fixedAssets = inputs.beginningFixedAssets + capitalExpenditures;

  // Accumulated Depreciation (beginning + current year depreciation)
  const currentYearDepreciation = overheadData.depreciation?.yearly || 0;
  const accumulatedDepreciation = inputs.beginningAccumulatedDepreciation + currentYearDepreciation;

  // Net Fixed Assets
  const netFixedAssets = fixedAssets - accumulatedDepreciation;

  // ============================================
  // OTHER ASSETS
  // ============================================

  const otherAssets = inputs.beginningOtherAssets + (inputs.otherAssetChange || 0);

  // ============================================
  // TOTAL ASSETS
  // ============================================

  const totalAssets = totalCurrentAssets + netFixedAssets + otherAssets;

  // ============================================
  // CURRENT LIABILITIES
  // ============================================

  // Accounts Payable (from Schedule 8 - ending A/P)
  const accountsPayable = cashDisbursementsData.endingAccountsPayable.q4;

  // Wages Payable (simplified: assume minimal accrual)
  const wagesPayable = inputs.beginningWagesPayable;

  // Taxes Payable (from income tax calculation)
  const taxesPayable = incomeStatementData.incomeTax - cashDisbursementsData.incomeTaxPayments.yearly;
  const adjustedTaxesPayable = Math.max(0, inputs.beginningTaxesPayable + taxesPayable);

  // Other Accrued Expenses
  const otherAccruedExpenses = inputs.beginningOtherAccruedExpenses;

  // Short-term Debt
  const shortTermDebt = inputs.beginningShortTermDebt;

  // Total Current Liabilities
  const totalCurrentLiabilities = accountsPayable + wagesPayable + adjustedTaxesPayable +
                                   otherAccruedExpenses + shortTermDebt;

  // ============================================
  // LONG-TERM LIABILITIES
  // ============================================

  // Long-term Debt
  const loanPayments = cashDisbursementsData.loanPayments.yearly;
  const newBorrowing = inputs.newLongTermBorrowing || 0;
  const longTermDebtRepayment = inputs.longTermDebtRepayment || loanPayments;
  const longTermDebt = inputs.beginningLongTermDebt + newBorrowing - longTermDebtRepayment;

  // Total Liabilities
  const totalLiabilities = totalCurrentLiabilities + longTermDebt;

  // ============================================
  // STOCKHOLDERS' EQUITY
  // ============================================

  // Common Stock
  const stockIssued = inputs.stockIssued || 0;
  const commonStock = inputs.beginningCommonStock + stockIssued;

  // Retained Earnings
  const beginningRetainedEarnings = inputs.beginningRetainedEarnings;
  const netIncome = incomeStatementData.netIncome;
  const dividendsPaid = cashDisbursementsData.dividendPayments.yearly;
  const endingRetainedEarnings = beginningRetainedEarnings + netIncome - dividendsPaid;

  // Total Equity
  const totalEquity = commonStock + endingRetainedEarnings;

  // ============================================
  // BALANCE CHECK
  // ============================================

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const balanceDifference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = balanceDifference < 0.01; // Allow for rounding

  if (!isBalanced) {
    validation.warnings.push(`Balance sheet does not balance. Difference: $${balanceDifference.toFixed(2)}`);
  }

  // ============================================
  // FINANCIAL RATIOS
  // ============================================

  // Working Capital
  const workingCapital = totalCurrentAssets - totalCurrentLiabilities;

  // Liquidity Ratios
  const currentRatio = totalCurrentLiabilities > 0
    ? totalCurrentAssets / totalCurrentLiabilities
    : Infinity;

  const quickAssets = cash + accountsReceivable;
  const quickRatio = totalCurrentLiabilities > 0
    ? quickAssets / totalCurrentLiabilities
    : Infinity;

  // Solvency Ratios
  const debtToEquityRatio = totalEquity > 0
    ? totalLiabilities / totalEquity
    : Infinity;

  const debtToAssetsRatio = totalAssets > 0
    ? (totalLiabilities / totalAssets) * 100
    : 0;

  // Profitability Ratios
  const averageAssets = (inputs.beginningFixedAssets + inputs.beginningOtherAssets +
                         inputs.beginningOtherCurrentAssets + inputs.beginningRawMaterialInventory +
                         inputs.beginningWIPInventory + inputs.beginningFinishedGoodsInventory +
                         inputs.beginningAccountsReceivable + inputs.beginningCash + totalAssets) / 2;

  const returnOnAssets = averageAssets > 0
    ? (netIncome / averageAssets) * 100
    : 0;

  const averageEquity = (inputs.beginningCommonStock + inputs.beginningRetainedEarnings + totalEquity) / 2;
  const returnOnEquity = averageEquity > 0
    ? (netIncome / averageEquity) * 100
    : 0;

  // Asset Turnover
  const salesRevenue = salesData?.salesRevenue.yearly || incomeStatementData.salesRevenue;
  const assetTurnover = averageAssets > 0
    ? salesRevenue / averageAssets
    : 0;

  const output: BalanceSheetOutput = {
    // Current Assets
    cash,
    accountsReceivable,
    inventoryRawMaterial,
    inventoryWIP,
    inventoryFinishedGoods,
    totalInventory,
    otherCurrentAssets,
    totalCurrentAssets,

    // Fixed Assets
    fixedAssets,
    accumulatedDepreciation,
    netFixedAssets,

    // Other Assets
    otherAssets,
    totalAssets,

    // Current Liabilities
    accountsPayable,
    wagesPayable,
    taxesPayable: adjustedTaxesPayable,
    otherAccruedExpenses,
    shortTermDebt,
    totalCurrentLiabilities,

    // Long-term Liabilities
    longTermDebt,
    totalLiabilities,

    // Stockholders' Equity
    commonStock,
    beginningRetainedEarnings,
    netIncome,
    dividendsPaid,
    endingRetainedEarnings,
    totalEquity,

    // Balance Check
    totalLiabilitiesAndEquity,
    isBalanced,
    balanceDifference,

    // Financial Ratios
    workingCapital,
    currentRatio,
    quickRatio,
    debtToEquityRatio,
    debtToAssetsRatio,
    returnOnAssets,
    returnOnEquity,
    assetTurnover,
  };

  return { output, validation };
}

/**
 * Format Balance Sheet output for display
 */
export function formatBalanceSheetOutput(output: BalanceSheetOutput): Array<{
  section: string;
  label: string;
  amount: string;
  isSubtotal?: boolean;
  isTotal?: boolean;
}> {
  const format = (value: number) => {
    const formatted = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `(${formatted})` : formatted;
  };

  const rows = [];

  // === ASSETS ===
  rows.push({ section: 'ASSETS', label: '', amount: '' });

  // Current Assets
  rows.push({ section: 'Current Assets', label: '', amount: '' });
  rows.push({ section: '', label: 'Cash', amount: format(output.cash) });
  rows.push({ section: '', label: 'Accounts Receivable', amount: format(output.accountsReceivable) });
  rows.push({ section: '', label: 'Inventory - Raw Materials', amount: format(output.inventoryRawMaterial) });
  rows.push({ section: '', label: 'Inventory - Work in Process', amount: format(output.inventoryWIP) });
  rows.push({ section: '', label: 'Inventory - Finished Goods', amount: format(output.inventoryFinishedGoods) });
  rows.push({ section: '', label: 'Total Inventory', amount: format(output.totalInventory), isSubtotal: true });
  if (output.otherCurrentAssets > 0) {
    rows.push({ section: '', label: 'Other Current Assets', amount: format(output.otherCurrentAssets) });
  }
  rows.push({ section: '', label: 'Total Current Assets', amount: format(output.totalCurrentAssets), isSubtotal: true });

  // Fixed Assets
  rows.push({ section: 'Fixed Assets', label: '', amount: '' });
  rows.push({ section: '', label: 'Property, Plant & Equipment', amount: format(output.fixedAssets) });
  rows.push({ section: '', label: 'Less: Accumulated Depreciation', amount: `(${format(output.accumulatedDepreciation)})` });
  rows.push({ section: '', label: 'Net Fixed Assets', amount: format(output.netFixedAssets), isSubtotal: true });

  // Other Assets
  if (output.otherAssets > 0) {
    rows.push({ section: '', label: 'Other Assets', amount: format(output.otherAssets) });
  }

  // Total Assets
  rows.push({ section: '', label: 'TOTAL ASSETS', amount: format(output.totalAssets), isTotal: true });

  // === LIABILITIES ===
  rows.push({ section: 'LIABILITIES', label: '', amount: '' });

  // Current Liabilities
  rows.push({ section: 'Current Liabilities', label: '', amount: '' });
  rows.push({ section: '', label: 'Accounts Payable', amount: format(output.accountsPayable) });
  if (output.wagesPayable > 0) {
    rows.push({ section: '', label: 'Wages Payable', amount: format(output.wagesPayable) });
  }
  if (output.taxesPayable > 0) {
    rows.push({ section: '', label: 'Taxes Payable', amount: format(output.taxesPayable) });
  }
  if (output.otherAccruedExpenses > 0) {
    rows.push({ section: '', label: 'Other Accrued Expenses', amount: format(output.otherAccruedExpenses) });
  }
  if (output.shortTermDebt > 0) {
    rows.push({ section: '', label: 'Short-term Debt', amount: format(output.shortTermDebt) });
  }
  rows.push({ section: '', label: 'Total Current Liabilities', amount: format(output.totalCurrentLiabilities), isSubtotal: true });

  // Long-term Liabilities
  if (output.longTermDebt > 0) {
    rows.push({ section: 'Long-term Liabilities', label: '', amount: '' });
    rows.push({ section: '', label: 'Long-term Debt', amount: format(output.longTermDebt) });
  }

  // Total Liabilities
  rows.push({ section: '', label: 'Total Liabilities', amount: format(output.totalLiabilities), isSubtotal: true });

  // === STOCKHOLDERS' EQUITY ===
  rows.push({ section: "STOCKHOLDERS' EQUITY", label: '', amount: '' });
  rows.push({ section: '', label: 'Common Stock', amount: format(output.commonStock) });
  rows.push({ section: '', label: 'Retained Earnings:', amount: '' });
  rows.push({ section: '', label: '  Beginning Balance', amount: format(output.beginningRetainedEarnings) });
  rows.push({ section: '', label: '  Add: Net Income', amount: format(output.netIncome) });
  rows.push({ section: '', label: '  Less: Dividends', amount: `(${format(output.dividendsPaid)})` });
  rows.push({ section: '', label: '  Ending Retained Earnings', amount: format(output.endingRetainedEarnings), isSubtotal: true });
  rows.push({ section: '', label: 'Total Stockholders\' Equity', amount: format(output.totalEquity), isSubtotal: true });

  // Total Liabilities & Equity
  rows.push({ section: '', label: 'TOTAL LIABILITIES & EQUITY', amount: format(output.totalLiabilitiesAndEquity), isTotal: true });

  return rows;
}

/**
 * Format Financial Ratios for display
 */
export function formatFinancialRatios(output: BalanceSheetOutput): Array<{
  category: string;
  label: string;
  value: string;
  interpretation: string;
}> {
  const formatRatio = (value: number, decimals: number = 2) => {
    if (value === Infinity) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `(${formatted})` : formatted;
  };

  return [
    // Liquidity Ratios
    {
      category: 'Liquidity',
      label: 'Working Capital',
      value: `$${formatCurrency(output.workingCapital)}`,
      interpretation: output.workingCapital > 0 ? 'Positive - can meet short-term obligations' : 'Negative - liquidity concern',
    },
    {
      category: 'Liquidity',
      label: 'Current Ratio',
      value: formatRatio(output.currentRatio),
      interpretation: output.currentRatio >= 2 ? 'Strong liquidity' : output.currentRatio >= 1 ? 'Adequate liquidity' : 'Liquidity concern',
    },
    {
      category: 'Liquidity',
      label: 'Quick Ratio',
      value: formatRatio(output.quickRatio),
      interpretation: output.quickRatio >= 1 ? 'Good quick liquidity' : 'May need to liquidate inventory',
    },

    // Solvency Ratios
    {
      category: 'Solvency',
      label: 'Debt-to-Equity Ratio',
      value: formatRatio(output.debtToEquityRatio),
      interpretation: output.debtToEquityRatio <= 1 ? 'Conservative leverage' : output.debtToEquityRatio <= 2 ? 'Moderate leverage' : 'High leverage',
    },
    {
      category: 'Solvency',
      label: 'Debt-to-Assets Ratio',
      value: `${formatRatio(output.debtToAssetsRatio, 1)}%`,
      interpretation: output.debtToAssetsRatio <= 50 ? 'Low debt financing' : 'High debt financing',
    },

    // Profitability Ratios
    {
      category: 'Profitability',
      label: 'Return on Assets (ROA)',
      value: `${formatRatio(output.returnOnAssets, 1)}%`,
      interpretation: output.returnOnAssets >= 10 ? 'Excellent asset efficiency' : output.returnOnAssets >= 5 ? 'Good asset efficiency' : 'Below average',
    },
    {
      category: 'Profitability',
      label: 'Return on Equity (ROE)',
      value: `${formatRatio(output.returnOnEquity, 1)}%`,
      interpretation: output.returnOnEquity >= 15 ? 'Excellent return to owners' : output.returnOnEquity >= 10 ? 'Good return' : 'Below average',
    },

    // Efficiency Ratios
    {
      category: 'Efficiency',
      label: 'Asset Turnover',
      value: `${formatRatio(output.assetTurnover)}x`,
      interpretation: output.assetTurnover >= 1 ? 'Efficient asset utilization' : 'Low asset turnover',
    },
  ];
}

/**
 * Export Balance Sheet to CSV format
 */
export function exportBalanceSheetToCSV(
  output: BalanceSheetOutput,
  companyName: string,
  fiscalYear: string
): string {
  const rows = formatBalanceSheetOutput(output);
  const ratios = formatFinancialRatios(output);

  let csv = `${companyName}\n`;
  csv += `Schedule 13: Budgeted Balance Sheet\n`;
  csv += `As of End of Fiscal Year: ${fiscalYear}\n\n`;

  // Balance Sheet
  csv += 'BALANCE SHEET\n';
  csv += 'Section,Item,Amount\n';
  rows.forEach(row => {
    csv += `"${row.section}","${row.label}",${row.amount}\n`;
  });

  csv += '\n';

  // Balance Check
  csv += 'BALANCE CHECK\n';
  csv += `Is Balanced,${output.isBalanced ? 'Yes' : 'No'}\n`;
  csv += `Difference,$${output.balanceDifference.toFixed(2)}\n`;

  csv += '\n';

  // Financial Ratios
  csv += 'FINANCIAL RATIOS\n';
  csv += 'Category,Ratio,Value,Interpretation\n';
  ratios.forEach(ratio => {
    csv += `"${ratio.category}","${ratio.label}",${ratio.value},"${ratio.interpretation}"\n`;
  });

  return csv;
}

