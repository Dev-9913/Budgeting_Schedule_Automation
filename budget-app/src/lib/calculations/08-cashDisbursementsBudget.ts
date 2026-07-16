import {
  CashDisbursementInputs,
  CashDisbursementOutput,
  QuarterlyData,
  DirectMaterialBudgetOutput,
  DirectLabourBudgetOutput,
  ManufacturingOverheadOutput,
  SellingAdminExpenseOutput
} from '../types/budgets';

/**
 * Schedule 8: Cash Disbursements Budget
 *
 * Purpose: Calculate when cash is actually paid out for all operating expenses
 *
 * This schedule tracks all cash outflows including:
 * - Material purchases (from Schedule 3)
 * - Direct labor payroll (from Schedule 4)
 * - Manufacturing overhead cash costs (from Schedule 5, excluding depreciation)
 * - Selling & Administrative expenses (from Schedule 6, excluding depreciation)
 * - Additional disbursements: loan payments, capital expenditures, dividends, taxes
 *
 * Key Formulas:
 * - Material Payments = Prior A/P + Current Purchases - Ending A/P
 * - Labor Payments = Direct Labor Cost (typically paid same period)
 * - Overhead Cash = Variable + Fixed Overhead - Depreciation
 * - SGA Cash = Total SGA - Depreciation - Non-cash expenses
 * - Total Disbursements = Sum of all payment categories
 *
 * Based on Ronald W. Hilton's Managerial Accounting framework
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates inputs for Cash Disbursements Budget calculation
 */
function validateCashDisbursementsInputs(
  materialData: DirectMaterialBudgetOutput | null,
  laborData: DirectLabourBudgetOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  sgaData: SellingAdminExpenseOutput | null,
  inputs: CashDisbursementInputs
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Material data is strongly recommended but not required
  if (!materialData) {
    warnings.push('Material budget (Schedule 3) not provided - material payments will be zero');
  }

  // Labor data is strongly recommended but not required
  if (!laborData) {
    warnings.push('Labor budget (Schedule 4) not provided - labor payments will be zero');
  }

  // Overhead data is strongly recommended but not required
  if (!overheadData) {
    warnings.push('Overhead budget (Schedule 5) not provided - overhead payments will be zero');
  }

  // SGA data is strongly recommended but not required
  if (!sgaData) {
    warnings.push('SGA budget (Schedule 6) not provided - SGA payments will be zero');
  }

  // Validate optional inputs are non-negative if provided
  const validateQuarterlyData = (data: QuarterlyData | undefined, name: string) => {
    if (data) {
      if (data.q1 < 0 || data.q2 < 0 || data.q3 < 0 || data.q4 < 0) {
        errors.push(`${name} cannot have negative values`);
      }
    }
  };

  validateQuarterlyData(inputs.incomeTaxPayments, 'Income tax payments');
  validateQuarterlyData(inputs.dividendPayments, 'Dividend payments');
  validateQuarterlyData(inputs.capitalExpenditures, 'Capital expenditures');
  validateQuarterlyData(inputs.loanPayments, 'Loan payments');

  // Validate payment timing percentages if material data exists
  if (materialData && inputs.percentMaterialPaidSameQuarter !== undefined) {
    if (inputs.percentMaterialPaidSameQuarter < 0 || inputs.percentMaterialPaidSameQuarter > 1) {
      errors.push('Percent of material paid in same quarter must be between 0 and 1 (0% to 100%)');
    }
  }

  if (materialData && inputs.percentMaterialPaidNextQuarter !== undefined) {
    if (inputs.percentMaterialPaidNextQuarter < 0 || inputs.percentMaterialPaidNextQuarter > 1) {
      errors.push('Percent of material paid in next quarter must be between 0 and 1 (0% to 100%)');
    }
  }

  // Check if payment percentages add up to approximately 100%
  if (
    inputs.percentMaterialPaidSameQuarter !== undefined &&
    inputs.percentMaterialPaidNextQuarter !== undefined
  ) {
    const totalPercent = inputs.percentMaterialPaidSameQuarter + inputs.percentMaterialPaidNextQuarter;
    if (Math.abs(totalPercent - 1.0) > 0.001) {
      warnings.push(
        `Material payment percentages should add up to 100%. Currently: ${(totalPercent * 100).toFixed(1)}% ` +
        `(Same quarter: ${(inputs.percentMaterialPaidSameQuarter * 100).toFixed(1)}%, ` +
        `Next quarter: ${(inputs.percentMaterialPaidNextQuarter * 100).toFixed(1)}%)`
      );
    }
  }

  // Validate beginning accounts payable
  if (inputs.beginningAccountsPayable !== undefined && inputs.beginningAccountsPayable < 0) {
    errors.push('Beginning accounts payable cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Cash Disbursements Budget (Schedule 8)
 */
export function calculateCashDisbursementsBudget(
  materialData: DirectMaterialBudgetOutput | null,
  laborData: DirectLabourBudgetOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  sgaData: SellingAdminExpenseOutput | null,
  inputs: CashDisbursementInputs
): { output: CashDisbursementOutput | null; validation: ValidationResult } {
  const validation = validateCashDisbursementsInputs(materialData, laborData, overheadData, sgaData, inputs);

  if (!validation.isValid) {
    return { output: null, validation };
  }

  // Initialize quarterly data structures
  const materialPayments: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const laborPayments: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const overheadPayments: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const sgaPayments: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const incomeTaxPayments: QuarterlyData = inputs.incomeTaxPayments || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const dividendPayments: QuarterlyData = inputs.dividendPayments || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const capitalExpenditures: QuarterlyData = inputs.capitalExpenditures || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const loanPayments: QuarterlyData = inputs.loanPayments || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const totalDisbursements: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const endingAccountsPayable: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  // === MATERIAL PAYMENTS ===
  if (materialData && materialData.totalMaterialPurchaseCost) {
    const percentSame = inputs.percentMaterialPaidSameQuarter ?? 0.5; // Default 50% same quarter
    const percentNext = inputs.percentMaterialPaidNextQuarter ?? 0.5; // Default 50% next quarter
    const beginningAP = inputs.beginningAccountsPayable ?? 0;

    let currentAP = beginningAP;
    const purchases = materialData.totalMaterialPurchaseCost;

    // Q1
    const paymentFromBeginningAP_Q1 = currentAP * percentNext;
    const paymentFromQ1Purchases = purchases.q1 * percentSame;
    materialPayments.q1 = paymentFromBeginningAP_Q1 + paymentFromQ1Purchases;
    endingAccountsPayable.q1 = currentAP + purchases.q1 - materialPayments.q1;
    currentAP = endingAccountsPayable.q1;

    // Q2
    const paymentFromQ1Purchases_Q2 = purchases.q1 * percentNext;
    const paymentFromQ2Purchases = purchases.q2 * percentSame;
    materialPayments.q2 = paymentFromQ1Purchases_Q2 + paymentFromQ2Purchases;
    endingAccountsPayable.q2 = currentAP + purchases.q2 - materialPayments.q2;
    currentAP = endingAccountsPayable.q2;

    // Q3
    const paymentFromQ2Purchases_Q3 = purchases.q2 * percentNext;
    const paymentFromQ3Purchases = purchases.q3 * percentSame;
    materialPayments.q3 = paymentFromQ2Purchases_Q3 + paymentFromQ3Purchases;
    endingAccountsPayable.q3 = currentAP + purchases.q3 - materialPayments.q3;
    currentAP = endingAccountsPayable.q3;

    // Q4
    const paymentFromQ3Purchases_Q4 = purchases.q3 * percentNext;
    const paymentFromQ4Purchases = purchases.q4 * percentSame;
    materialPayments.q4 = paymentFromQ3Purchases_Q4 + paymentFromQ4Purchases;
    endingAccountsPayable.q4 = currentAP + purchases.q4 - materialPayments.q4;

    materialPayments.yearly = materialPayments.q1 + materialPayments.q2 + materialPayments.q3 + materialPayments.q4;
    endingAccountsPayable.yearly = endingAccountsPayable.q4;
  }

  // === LABOR PAYMENTS ===
  // Direct labor is typically paid in the same period (hourly wages, salaries)
  if (laborData && laborData.totalLaborCost) {
    laborPayments.q1 = laborData.totalLaborCost.q1;
    laborPayments.q2 = laborData.totalLaborCost.q2;
    laborPayments.q3 = laborData.totalLaborCost.q3;
    laborPayments.q4 = laborData.totalLaborCost.q4;
    laborPayments.yearly = laborData.totalLaborCost.yearly;
  }

  // === OVERHEAD PAYMENTS ===
  // Manufacturing overhead payments = cash expenses (excludes depreciation)
  if (overheadData && overheadData.cashDisbursements) {
    overheadPayments.q1 = overheadData.cashDisbursements.q1;
    overheadPayments.q2 = overheadData.cashDisbursements.q2;
    overheadPayments.q3 = overheadData.cashDisbursements.q3;
    overheadPayments.q4 = overheadData.cashDisbursements.q4;
    overheadPayments.yearly = overheadData.cashDisbursements.yearly;
  }

  // === SGA PAYMENTS ===
  // SGA payments = total SGA expenses (already excludes depreciation from Schedule 6)
  if (sgaData && sgaData.totalSGAExpenses) {
    sgaPayments.q1 = sgaData.totalSGAExpenses.q1;
    sgaPayments.q2 = sgaData.totalSGAExpenses.q2;
    sgaPayments.q3 = sgaData.totalSGAExpenses.q3;
    sgaPayments.q4 = sgaData.totalSGAExpenses.q4;
    sgaPayments.yearly = sgaData.totalSGAExpenses.yearly;
  }

  // === CALCULATE TOTALS ===
  // Calculate yearly totals for optional inputs if not already set
  if (inputs.incomeTaxPayments && !inputs.incomeTaxPayments.yearly) {
    incomeTaxPayments.yearly = incomeTaxPayments.q1 + incomeTaxPayments.q2 + incomeTaxPayments.q3 + incomeTaxPayments.q4;
  }
  if (inputs.dividendPayments && !inputs.dividendPayments.yearly) {
    dividendPayments.yearly = dividendPayments.q1 + dividendPayments.q2 + dividendPayments.q3 + dividendPayments.q4;
  }
  if (inputs.capitalExpenditures && !inputs.capitalExpenditures.yearly) {
    capitalExpenditures.yearly = capitalExpenditures.q1 + capitalExpenditures.q2 + capitalExpenditures.q3 + capitalExpenditures.q4;
  }
  if (inputs.loanPayments && !inputs.loanPayments.yearly) {
    loanPayments.yearly = loanPayments.q1 + loanPayments.q2 + loanPayments.q3 + loanPayments.q4;
  }

  // Total disbursements per quarter
  totalDisbursements.q1 = materialPayments.q1 + laborPayments.q1 + overheadPayments.q1 + sgaPayments.q1 +
                          incomeTaxPayments.q1 + dividendPayments.q1 + capitalExpenditures.q1 + loanPayments.q1;
  totalDisbursements.q2 = materialPayments.q2 + laborPayments.q2 + overheadPayments.q2 + sgaPayments.q2 +
                          incomeTaxPayments.q2 + dividendPayments.q2 + capitalExpenditures.q2 + loanPayments.q2;
  totalDisbursements.q3 = materialPayments.q3 + laborPayments.q3 + overheadPayments.q3 + sgaPayments.q3 +
                          incomeTaxPayments.q3 + dividendPayments.q3 + capitalExpenditures.q3 + loanPayments.q3;
  totalDisbursements.q4 = materialPayments.q4 + laborPayments.q4 + overheadPayments.q4 + sgaPayments.q4 +
                          incomeTaxPayments.q4 + dividendPayments.q4 + capitalExpenditures.q4 + loanPayments.q4;
  totalDisbursements.yearly = totalDisbursements.q1 + totalDisbursements.q2 + totalDisbursements.q3 + totalDisbursements.q4;

  const output: CashDisbursementOutput = {
    materialPayments,
    laborPayments,
    overheadPayments,
    sgaPayments,
    incomeTaxPayments,
    dividendPayments,
    capitalExpenditures,
    loanPayments,
    totalDisbursements,
    endingAccountsPayable,
  };

  return { output, validation };
}

/**
 * Format Cash Disbursements Budget output for display
 */
export function formatCashDisbursementsOutput(output: CashDisbursementOutput): Array<{
  label: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  yearly: string;
}> {
  const format = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = [];

  // Operating Disbursements
  rows.push({
    label: 'OPERATING DISBURSEMENTS',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    yearly: '',
  });

  rows.push({
    label: 'Material purchases (Schedule 3)',
    q1: format(output.materialPayments.q1),
    q2: format(output.materialPayments.q2),
    q3: format(output.materialPayments.q3),
    q4: format(output.materialPayments.q4),
    yearly: format(output.materialPayments.yearly),
  });

  rows.push({
    label: 'Direct labor payroll (Schedule 4)',
    q1: format(output.laborPayments.q1),
    q2: format(output.laborPayments.q2),
    q3: format(output.laborPayments.q3),
    q4: format(output.laborPayments.q4),
    yearly: format(output.laborPayments.yearly),
  });

  rows.push({
    label: 'Manufacturing overhead (Schedule 5)',
    q1: format(output.overheadPayments.q1),
    q2: format(output.overheadPayments.q2),
    q3: format(output.overheadPayments.q3),
    q4: format(output.overheadPayments.q4),
    yearly: format(output.overheadPayments.yearly),
  });

  rows.push({
    label: 'Selling & Administrative expenses (Schedule 6)',
    q1: format(output.sgaPayments.q1),
    q2: format(output.sgaPayments.q2),
    q3: format(output.sgaPayments.q3),
    q4: format(output.sgaPayments.q4),
    yearly: format(output.sgaPayments.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Other Disbursements
  rows.push({
    label: 'OTHER DISBURSEMENTS',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    yearly: '',
  });

  rows.push({
    label: 'Income tax payments',
    q1: format(output.incomeTaxPayments.q1),
    q2: format(output.incomeTaxPayments.q2),
    q3: format(output.incomeTaxPayments.q3),
    q4: format(output.incomeTaxPayments.q4),
    yearly: format(output.incomeTaxPayments.yearly),
  });

  rows.push({
    label: 'Dividend payments',
    q1: format(output.dividendPayments.q1),
    q2: format(output.dividendPayments.q2),
    q3: format(output.dividendPayments.q3),
    q4: format(output.dividendPayments.q4),
    yearly: format(output.dividendPayments.yearly),
  });

  rows.push({
    label: 'Capital expenditures',
    q1: format(output.capitalExpenditures.q1),
    q2: format(output.capitalExpenditures.q2),
    q3: format(output.capitalExpenditures.q3),
    q4: format(output.capitalExpenditures.q4),
    yearly: format(output.capitalExpenditures.yearly),
  });

  rows.push({
    label: 'Loan payments',
    q1: format(output.loanPayments.q1),
    q2: format(output.loanPayments.q2),
    q3: format(output.loanPayments.q3),
    q4: format(output.loanPayments.q4),
    yearly: format(output.loanPayments.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Total Disbursements
  rows.push({
    label: 'Total Cash Disbursements',
    q1: format(output.totalDisbursements.q1),
    q2: format(output.totalDisbursements.q2),
    q3: format(output.totalDisbursements.q3),
    q4: format(output.totalDisbursements.q4),
    yearly: format(output.totalDisbursements.yearly),
  });

  // Blank row
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  // Accounts Payable
  rows.push({
    label: 'Ending Accounts Payable',
    q1: format(output.endingAccountsPayable.q1),
    q2: format(output.endingAccountsPayable.q2),
    q3: format(output.endingAccountsPayable.q3),
    q4: format(output.endingAccountsPayable.q4),
    yearly: format(output.endingAccountsPayable.yearly),
  });

  return rows;
}

/**
 * Export Cash Disbursements Budget to CSV format
 */
export function exportCashDisbursementsToCSV(
  output: CashDisbursementOutput,
  companyName: string,
  productName: string,
  fiscalYear: string
): string {
  const rows = formatCashDisbursementsOutput(output);

  let csv = `${companyName}\n`;
  csv += `Schedule 8: Cash Disbursements Budget\n`;
  csv += `Product: ${productName}\n`;
  csv += `Fiscal Year: ${fiscalYear}\n\n`;

  csv += 'Item,Q1,Q2,Q3,Q4,Yearly\n';

  rows.forEach(row => {
    csv += `"${row.label}",${row.q1},${row.q2},${row.q3},${row.q4},${row.yearly}\n`;
  });

  return csv;
}

