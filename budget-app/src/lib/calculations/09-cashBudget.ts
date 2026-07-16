import {
  CashBudgetInputs,
  CashBudgetOutput,
  QuarterlyData,
  CashReceiptsOutput,
  CashDisbursementOutput
} from '../types/budgets';

/**
 * Schedule 9: Cash Budget
 *
 * Purpose: Forecast the company's cash position and financing needs
 *
 * This is the master cash planning schedule that combines:
 * - Cash Receipts (Schedule 7)
 * - Cash Disbursements (Schedule 8)
 * - Beginning cash balance
 * - Minimum cash balance requirement
 * - Financing activities (borrowing and repayments)
 *
 * Key Formulas:
 * - Cash Available = Beginning Cash + Cash Receipts
 * - Excess (Deficiency) = Cash Available - Cash Disbursements - Minimum Cash Required
 * - Ending Cash = Cash Available - Cash Disbursements + Net Financing
 * - Operating Cash Flow = Cash Receipts - Cash Disbursements
 * - Free Cash Flow = Operating Cash Flow - Capital Expenditures
 *
 * Based on Ronald W. Hilton's Managerial Accounting framework
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates inputs for Cash Budget calculation
 */
function validateCashBudgetInputs(
  receiptsData: CashReceiptsOutput | null,
  disbursementsData: CashDisbursementOutput | null,
  inputs: CashBudgetInputs
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required data
  if (!receiptsData) {
    errors.push('Cash Receipts data (Schedule 7) is required for Cash Budget');
  }

  if (!disbursementsData) {
    errors.push('Cash Disbursements data (Schedule 8) is required for Cash Budget');
  }

  // Validate beginning cash balance
  if (inputs.beginningCashBalance < 0) {
    errors.push('Beginning cash balance cannot be negative');
  }

  // Validate minimum cash balance
  if (inputs.minimumCashBalance < 0) {
    errors.push('Minimum cash balance cannot be negative');
  }

  // Warnings
  if (inputs.beginningCashBalance < inputs.minimumCashBalance) {
    warnings.push('Beginning cash balance is below the minimum required cash balance');
  }

  if (inputs.minimumCashBalance === 0) {
    warnings.push('Minimum cash balance is set to zero - most companies maintain a safety cushion');
  }

  if (inputs.interestRateOnBorrowing && (inputs.interestRateOnBorrowing < 0 || inputs.interestRateOnBorrowing > 1)) {
    errors.push('Interest rate on borrowing must be between 0 and 1 (0% to 100%)');
  }

  if (inputs.interestRateOnInvestments && (inputs.interestRateOnInvestments < 0 || inputs.interestRateOnInvestments > 1)) {
    errors.push('Interest rate on investments must be between 0 and 1 (0% to 100%)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Cash Budget (Schedule 9)
 */
export function calculateCashBudget(
  receiptsData: CashReceiptsOutput | null,
  disbursementsData: CashDisbursementOutput | null,
  inputs: CashBudgetInputs
): { output: CashBudgetOutput | null; validation: ValidationResult } {
  const validation = validateCashBudgetInputs(receiptsData, disbursementsData, inputs);

  if (!validation.isValid || !receiptsData || !disbursementsData) {
    return { output: null, validation };
  }

  // Initialize quarterly data structures
  const beginningCash: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const cashReceipts: QuarterlyData = receiptsData.totalCashReceipts;
  const cashAvailable: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const cashDisbursements: QuarterlyData = disbursementsData.totalDisbursements;
  const excessOrDeficiency: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const financing: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const endingCash: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  // Track cash balance through quarters
  let currentCash = inputs.beginningCashBalance;
  const minCash = inputs.minimumCashBalance;

  // Q1
  beginningCash.q1 = currentCash;
  cashAvailable.q1 = beginningCash.q1 + cashReceipts.q1;
  excessOrDeficiency.q1 = cashAvailable.q1 - cashDisbursements.q1 - minCash;

  // Determine financing needs (simplified: borrow if deficiency, no automatic repayment)
  if (excessOrDeficiency.q1 < 0) {
    // Need to borrow to maintain minimum cash
    financing.q1 = -excessOrDeficiency.q1; // Positive financing = borrowing
  } else {
    financing.q1 = 0; // No financing needed (could add optional repayment logic)
  }

  endingCash.q1 = cashAvailable.q1 - cashDisbursements.q1 + financing.q1;
  currentCash = endingCash.q1;

  // Q2
  beginningCash.q2 = currentCash;
  cashAvailable.q2 = beginningCash.q2 + cashReceipts.q2;
  excessOrDeficiency.q2 = cashAvailable.q2 - cashDisbursements.q2 - minCash;

  if (excessOrDeficiency.q2 < 0) {
    financing.q2 = -excessOrDeficiency.q2;
  } else {
    financing.q2 = 0;
  }

  endingCash.q2 = cashAvailable.q2 - cashDisbursements.q2 + financing.q2;
  currentCash = endingCash.q2;

  // Q3
  beginningCash.q3 = currentCash;
  cashAvailable.q3 = beginningCash.q3 + cashReceipts.q3;
  excessOrDeficiency.q3 = cashAvailable.q3 - cashDisbursements.q3 - minCash;

  if (excessOrDeficiency.q3 < 0) {
    financing.q3 = -excessOrDeficiency.q3;
  } else {
    financing.q3 = 0;
  }

  endingCash.q3 = cashAvailable.q3 - cashDisbursements.q3 + financing.q3;
  currentCash = endingCash.q3;

  // Q4
  beginningCash.q4 = currentCash;
  cashAvailable.q4 = beginningCash.q4 + cashReceipts.q4;
  excessOrDeficiency.q4 = cashAvailable.q4 - cashDisbursements.q4 - minCash;

  if (excessOrDeficiency.q4 < 0) {
    financing.q4 = -excessOrDeficiency.q4;
  } else {
    financing.q4 = 0;
  }

  endingCash.q4 = cashAvailable.q4 - cashDisbursements.q4 + financing.q4;

  // Calculate yearly totals
  beginningCash.yearly = beginningCash.q1;
  cashAvailable.yearly = cashAvailable.q1 + cashAvailable.q2 + cashAvailable.q3 + cashAvailable.q4;
  excessOrDeficiency.yearly = excessOrDeficiency.q1 + excessOrDeficiency.q2 + excessOrDeficiency.q3 + excessOrDeficiency.q4;
  financing.yearly = financing.q1 + financing.q2 + financing.q3 + financing.q4;
  endingCash.yearly = endingCash.q4; // Q4 ending balance

  // Calculate additional metrics
  const operatingCashFlow: QuarterlyData = {
    q1: cashReceipts.q1 - cashDisbursements.q1,
    q2: cashReceipts.q2 - cashDisbursements.q2,
    q3: cashReceipts.q3 - cashDisbursements.q3,
    q4: cashReceipts.q4 - cashDisbursements.q4,
    yearly: 0,
  };
  operatingCashFlow.yearly = operatingCashFlow.q1 + operatingCashFlow.q2 + operatingCashFlow.q3 + operatingCashFlow.q4;

  // Free cash flow = Operating cash flow - Capital expenditures
  const capex = disbursementsData.capitalExpenditures;
  const freeCashFlow: QuarterlyData = {
    q1: operatingCashFlow.q1 - capex.q1,
    q2: operatingCashFlow.q2 - capex.q2,
    q3: operatingCashFlow.q3 - capex.q3,
    q4: operatingCashFlow.q4 - capex.q4,
    yearly: 0,
  };
  freeCashFlow.yearly = freeCashFlow.q1 + freeCashFlow.q2 + freeCashFlow.q3 + freeCashFlow.q4;

  const output: CashBudgetOutput = {
    beginningCash,
    cashReceipts,
    cashAvailable,
    cashDisbursements,
    excessOrDeficiency,
    financing,
    endingCash,
    operatingCashFlow,
    freeCashFlow,
  };

  return { output, validation };
}

/**
 * Format Cash Budget output for display
 */
export function formatCashBudgetOutput(output: CashBudgetOutput): Array<{
  label: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  yearly: string;
}> {
  const format = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = [];

  // Beginning cash
  rows.push({
    label: 'Beginning Cash Balance',
    q1: format(output.beginningCash.q1),
    q2: format(output.beginningCash.q2),
    q3: format(output.beginningCash.q3),
    q4: format(output.beginningCash.q4),
    yearly: format(output.beginningCash.yearly),
  });

  // Cash receipts
  rows.push({
    label: 'Add: Cash Receipts (Schedule 7)',
    q1: format(output.cashReceipts.q1),
    q2: format(output.cashReceipts.q2),
    q3: format(output.cashReceipts.q3),
    q4: format(output.cashReceipts.q4),
    yearly: format(output.cashReceipts.yearly),
  });

  // Cash available
  rows.push({
    label: 'Cash Available',
    q1: format(output.cashAvailable.q1),
    q2: format(output.cashAvailable.q2),
    q3: format(output.cashAvailable.q3),
    q4: format(output.cashAvailable.q4),
    yearly: format(output.cashAvailable.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Cash disbursements
  rows.push({
    label: 'Less: Cash Disbursements (Schedule 8)',
    q1: format(output.cashDisbursements.q1),
    q2: format(output.cashDisbursements.q2),
    q3: format(output.cashDisbursements.q3),
    q4: format(output.cashDisbursements.q4),
    yearly: format(output.cashDisbursements.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Excess or deficiency
  rows.push({
    label: 'Excess (Deficiency) of Cash',
    q1: format(output.excessOrDeficiency.q1),
    q2: format(output.excessOrDeficiency.q2),
    q3: format(output.excessOrDeficiency.q3),
    q4: format(output.excessOrDeficiency.q4),
    yearly: format(output.excessOrDeficiency.yearly),
  });

  // Financing
  rows.push({
    label: 'Financing (Borrowing)',
    q1: format(output.financing.q1),
    q2: format(output.financing.q2),
    q3: format(output.financing.q3),
    q4: format(output.financing.q4),
    yearly: format(output.financing.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Ending cash
  rows.push({
    label: 'Ending Cash Balance',
    q1: format(output.endingCash.q1),
    q2: format(output.endingCash.q2),
    q3: format(output.endingCash.q3),
    q4: format(output.endingCash.q4),
    yearly: format(output.endingCash.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Additional metrics
  rows.push({
    label: 'CASH FLOW METRICS',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    yearly: '',
  });

  rows.push({
    label: 'Operating Cash Flow',
    q1: format(output.operatingCashFlow.q1),
    q2: format(output.operatingCashFlow.q2),
    q3: format(output.operatingCashFlow.q3),
    q4: format(output.operatingCashFlow.q4),
    yearly: format(output.operatingCashFlow.yearly),
  });

  rows.push({
    label: 'Free Cash Flow',
    q1: format(output.freeCashFlow.q1),
    q2: format(output.freeCashFlow.q2),
    q3: format(output.freeCashFlow.q3),
    q4: format(output.freeCashFlow.q4),
    yearly: format(output.freeCashFlow.yearly),
  });

  return rows;
}

/**
 * Export Cash Budget to CSV format
 */
export function exportCashBudgetToCSV(
  output: CashBudgetOutput,
  companyName: string,
  productName: string,
  fiscalYear: string
): string {
  const rows = formatCashBudgetOutput(output);

  let csv = `${companyName}\n`;
  csv += `Schedule 9: Cash Budget\n`;
  csv += `Product: ${productName}\n`;
  csv += `Fiscal Year: ${fiscalYear}\n\n`;

  csv += 'Item,Q1,Q2,Q3,Q4,Yearly\n';

  rows.forEach(row => {
    csv += `"${row.label}",${row.q1},${row.q2},${row.q3},${row.q4},${row.yearly}\n`;
  });

  return csv;
}

