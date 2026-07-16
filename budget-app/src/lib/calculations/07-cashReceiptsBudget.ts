import { CashReceiptsInputs, CashReceiptsOutput, QuarterlyData, SalesBudgetOutput } from '../types/budgets';

/**
 * Schedule 8: Cash Receipts Budget
 *
 * Purpose: Calculate when cash is actually collected from sales
 *
 * This schedule bridges the gap between accrual accounting (sales revenue)
 * and cash accounting (actual cash received). It tracks:
 * - Cash sales (collected immediately in the same quarter)
 * - Credit sales (collected over time based on collection patterns)
 * - Beginning and ending accounts receivable
 *
 * Key Formulas:
 * - Collections from Same Quarter Sales = Current Quarter Credit Sales × % Collected Same Quarter
 * - Collections from Prior Quarter = Prior Quarter Credit Sales × % Collected Next Quarter
 * - Total Cash Receipts = Cash Sales + Collections from Same Quarter + Collections from Prior Quarter
 * - Ending A/R = Beginning A/R + Credit Sales - Collections
 *
 * Based on Ronald W. Hilton's Managerial Accounting framework
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates inputs for Cash Receipts Budget calculation
 */
function validateCashReceiptsInputs(
  salesData: SalesBudgetOutput | null,
  inputs: CashReceiptsInputs
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate sales data exists
  if (!salesData) {
    errors.push('Sales data (Schedule 1) is required for Cash Receipts Budget');
    return { isValid: false, errors, warnings };
  }

  if (!salesData.salesRevenue) {
    errors.push('Sales revenue data is missing from Schedule 1');
    return { isValid: false, errors, warnings };
  }

  // Validate collection percentages
  if (inputs.percentCollectedInSameQuarter < 0 || inputs.percentCollectedInSameQuarter > 1) {
    errors.push('Percent collected in same quarter must be between 0 and 1 (0% to 100%)');
  }

  if (inputs.percentCollectedInNextQuarter < 0 || inputs.percentCollectedInNextQuarter > 1) {
    errors.push('Percent collected in next quarter must be between 0 and 1 (0% to 100%)');
  }

  const uncollectible = inputs.percentUncollectible || 0;
  if (uncollectible < 0 || uncollectible > 1) {
    errors.push('Percent uncollectible must be between 0 and 1 (0% to 100%)');
  }

  // Check if percentages add up to approximately 100%
  const totalPercent = inputs.percentCollectedInSameQuarter + inputs.percentCollectedInNextQuarter + uncollectible;
  if (Math.abs(totalPercent - 1.0) > 0.001) {
    warnings.push(
      `Collection percentages should add up to 100%. Currently: ${(totalPercent * 100).toFixed(1)}% ` +
      `(Same quarter: ${(inputs.percentCollectedInSameQuarter * 100).toFixed(1)}%, ` +
      `Next quarter: ${(inputs.percentCollectedInNextQuarter * 100).toFixed(1)}%, ` +
      `Uncollectible: ${(uncollectible * 100).toFixed(1)}%)`
    );
  }

  // Validate beginning A/R
  if (inputs.beginningAccountsReceivable < 0) {
    errors.push('Beginning accounts receivable cannot be negative');
  }

  // Warnings for optimal setup
  if (!salesData.cashSales || !salesData.creditSales) {
    warnings.push('Sales budget should specify cash vs credit sales split for accurate cash receipts calculation');
  }

  if (uncollectible > 0.05) {
    warnings.push(`Uncollectible rate of ${(uncollectible * 100).toFixed(1)}% seems high. Industry average is typically 1-3%`);
  }

  if (inputs.percentCollectedInSameQuarter < 0.5) {
    warnings.push('Less than 50% collection in same quarter may indicate aggressive credit terms');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Cash Receipts Budget (Schedule 8)
 */
export function calculateCashReceiptsBudget(
  salesData: SalesBudgetOutput | null,
  inputs: CashReceiptsInputs
): { output: CashReceiptsOutput | null; validation: ValidationResult } {
  const validation = validateCashReceiptsInputs(salesData, inputs);

  if (!validation.isValid || !salesData) {
    return { output: null, validation };
  }

  // Extract data from sales budget
  const salesRevenue = salesData.salesRevenue!;
  const cashSales = salesData.cashSales || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const creditSales = salesData.creditSales || salesRevenue;

  // Initialize quarterly data
  const collectionsSameQuarter: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const collectionsNextQuarter: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const totalCashReceipts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const endingAccountsReceivable: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  // Track accounts receivable balance
  let currentAR = inputs.beginningAccountsReceivable;

  // Q1 calculations
  // Collections from beginning A/R (assumed collected based on next quarter percentage)
  collectionsNextQuarter.q1 = currentAR * inputs.percentCollectedInNextQuarter;

  // Collections from Q1 credit sales (same quarter)
  collectionsSameQuarter.q1 = creditSales.q1 * inputs.percentCollectedInSameQuarter;

  // Total cash receipts Q1 = Cash sales + Collections from beginning A/R + Collections from Q1 credit sales
  totalCashReceipts.q1 = cashSales.q1 + collectionsNextQuarter.q1 + collectionsSameQuarter.q1;

  // Ending A/R Q1 = Beginning A/R + Credit Sales Q1 - Total Collections Q1
  endingAccountsReceivable.q1 = currentAR + creditSales.q1 - (collectionsNextQuarter.q1 + collectionsSameQuarter.q1);
  currentAR = endingAccountsReceivable.q1;

  // Q2 calculations
  collectionsNextQuarter.q2 = creditSales.q1 * inputs.percentCollectedInNextQuarter;
  collectionsSameQuarter.q2 = creditSales.q2 * inputs.percentCollectedInSameQuarter;
  totalCashReceipts.q2 = cashSales.q2 + collectionsNextQuarter.q2 + collectionsSameQuarter.q2;
  endingAccountsReceivable.q2 = currentAR + creditSales.q2 - (collectionsNextQuarter.q2 + collectionsSameQuarter.q2);
  currentAR = endingAccountsReceivable.q2;

  // Q3 calculations
  collectionsNextQuarter.q3 = creditSales.q2 * inputs.percentCollectedInNextQuarter;
  collectionsSameQuarter.q3 = creditSales.q3 * inputs.percentCollectedInSameQuarter;
  totalCashReceipts.q3 = cashSales.q3 + collectionsNextQuarter.q3 + collectionsSameQuarter.q3;
  endingAccountsReceivable.q3 = currentAR + creditSales.q3 - (collectionsNextQuarter.q3 + collectionsSameQuarter.q3);
  currentAR = endingAccountsReceivable.q3;

  // Q4 calculations
  collectionsNextQuarter.q4 = creditSales.q3 * inputs.percentCollectedInNextQuarter;
  collectionsSameQuarter.q4 = creditSales.q4 * inputs.percentCollectedInSameQuarter;
  totalCashReceipts.q4 = cashSales.q4 + collectionsNextQuarter.q4 + collectionsSameQuarter.q4;
  endingAccountsReceivable.q4 = currentAR + creditSales.q4 - (collectionsNextQuarter.q4 + collectionsSameQuarter.q4);

  // Calculate yearly totals
  collectionsSameQuarter.yearly = collectionsSameQuarter.q1 + collectionsSameQuarter.q2 + collectionsSameQuarter.q3 + collectionsSameQuarter.q4;
  collectionsNextQuarter.yearly = collectionsNextQuarter.q1 + collectionsNextQuarter.q2 + collectionsNextQuarter.q3 + collectionsNextQuarter.q4;
  totalCashReceipts.yearly = totalCashReceipts.q1 + totalCashReceipts.q2 + totalCashReceipts.q3 + totalCashReceipts.q4;
  endingAccountsReceivable.yearly = endingAccountsReceivable.q4; // Q4 ending balance

  const output: CashReceiptsOutput = {
    salesRevenue: salesRevenue,
    collectionsSameQuarter,
    collectionsNextQuarter,
    totalCashReceipts,
    endingAccountsReceivable,
  };

  return { output, validation };
}

/**
 * Format Cash Receipts Budget output for display
 */
export function formatCashReceiptsOutput(output: CashReceiptsOutput): Array<{
  label: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  yearly: string;
}> {
  const format = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = [];

  // Sales Revenue (reference)
  rows.push({
    label: 'Sales Revenue (from Schedule 1)',
    q1: format(output.salesRevenue.q1),
    q2: format(output.salesRevenue.q2),
    q3: format(output.salesRevenue.q3),
    q4: format(output.salesRevenue.q4),
    yearly: format(output.salesRevenue.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Collections breakdown
  rows.push({
    label: 'CASH COLLECTIONS',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    yearly: '',
  });

  rows.push({
    label: 'Collections from same quarter sales',
    q1: format(output.collectionsSameQuarter.q1),
    q2: format(output.collectionsSameQuarter.q2),
    q3: format(output.collectionsSameQuarter.q3),
    q4: format(output.collectionsSameQuarter.q4),
    yearly: format(output.collectionsSameQuarter.yearly),
  });

  rows.push({
    label: 'Collections from prior quarter sales',
    q1: format(output.collectionsNextQuarter.q1),
    q2: format(output.collectionsNextQuarter.q2),
    q3: format(output.collectionsNextQuarter.q3),
    q4: format(output.collectionsNextQuarter.q4),
    yearly: format(output.collectionsNextQuarter.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Total cash receipts
  rows.push({
    label: 'Total Cash Receipts',
    q1: format(output.totalCashReceipts.q1),
    q2: format(output.totalCashReceipts.q2),
    q3: format(output.totalCashReceipts.q3),
    q4: format(output.totalCashReceipts.q4),
    yearly: format(output.totalCashReceipts.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Accounts receivable
  rows.push({
    label: 'Ending Accounts Receivable',
    q1: format(output.endingAccountsReceivable.q1),
    q2: format(output.endingAccountsReceivable.q2),
    q3: format(output.endingAccountsReceivable.q3),
    q4: format(output.endingAccountsReceivable.q4),
    yearly: format(output.endingAccountsReceivable.yearly),
  });

  return rows;
}

/**
 * Export Cash Receipts Budget to CSV format
 */
export function exportCashReceiptsToCSV(
  output: CashReceiptsOutput,
  companyName: string,
  productName: string,
  fiscalYear: string
): string {
  const rows = formatCashReceiptsOutput(output);

  let csv = `${companyName}\n`;
  csv += `Schedule 8: Cash Receipts Budget\n`;
  csv += `Product: ${productName}\n`;
  csv += `Fiscal Year: ${fiscalYear}\n\n`;

  csv += 'Item,Q1,Q2,Q3,Q4,Yearly\n';

  rows.forEach(row => {
    csv += `"${row.label}",${row.q1},${row.q2},${row.q3},${row.q4},${row.yearly}\n`;
  });

  return csv;
}

