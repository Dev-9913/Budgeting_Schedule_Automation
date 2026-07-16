import {
  CashFlowStatementOutput,
  CashFlowStatementInputs,
  IncomeStatementOutput,
  CashReceiptsOutput,
  CashDisbursementOutput,
  ManufacturingOverheadOutput,
  SalesBudgetOutput,
  COGSOutput
} from '../types/budgets';

/**
 * Schedule 12: Budgeted Statement of Cash Flows
 *
 * Purpose: Reconcile net income to operating cash flow and show the complete
 * picture of cash movements by activity (operating, investing, financing).
 *
 * This schedule uses the DIRECT METHOD as the primary presentation,
 * with reconciliation to the indirect method for comparison.
 *
 * OPERATING ACTIVITIES (Direct Method):
 * + Cash Receipts from Customers
 * - Cash Paid for Materials
 * - Cash Paid for Labor
 * - Cash Paid for Overhead
 * - Cash Paid for SGA
 * - Cash Paid for Taxes
 * = Net Cash from Operating Activities
 *
 * INVESTING ACTIVITIES:
 * - Capital Expenditures
 * + Proceeds from Asset Sales
 * = Net Cash from Investing Activities
 *
 * FINANCING ACTIVITIES:
 * + Loan Proceeds
 * - Loan Repayments
 * + Stock Issued
 * - Dividends Paid
 * = Net Cash from Financing Activities
 *
 * Net Change in Cash = Operating + Investing + Financing
 * Ending Cash = Beginning Cash + Net Change
 *
 * Based on Ronald W. Hilton's Managerial Accounting framework
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates inputs for Cash Flow Statement calculation
 */
function validateCashFlowStatementInputs(
  incomeStatementData: IncomeStatementOutput | null,
  cashReceiptsData: CashReceiptsOutput | null,
  cashDisbursementsData: CashDisbursementOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  inputs: CashFlowStatementInputs
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required schedules
  if (!incomeStatementData) {
    errors.push('Income Statement data (Schedule 11) is required for Cash Flow Statement');
  }

  if (!cashReceiptsData) {
    errors.push('Cash Receipts data (Schedule 7) is required for Cash Flow Statement');
  }

  if (!cashDisbursementsData) {
    errors.push('Cash Disbursements data (Schedule 8) is required for Cash Flow Statement');
  }

  if (!overheadData) {
    errors.push('Manufacturing Overhead data (Schedule 5) is required for depreciation');
  }

  // Validate inputs
  if (inputs.beginningCash < 0) {
    errors.push('Beginning cash balance cannot be negative');
  }

  if (inputs.beginningAccountsReceivable < 0) {
    errors.push('Beginning accounts receivable cannot be negative');
  }

  if (inputs.beginningInventory < 0) {
    errors.push('Beginning inventory cannot be negative');
  }

  if (inputs.beginningAccountsPayable < 0) {
    errors.push('Beginning accounts payable cannot be negative');
  }

  // Warnings
  if (inputs.beginningCash === 0) {
    warnings.push('Beginning cash is zero - verify this is correct');
  }

  if (inputs.loanProceeds && inputs.loanProceeds > 0) {
    warnings.push('New borrowings will increase debt obligations');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Budgeted Statement of Cash Flows (Schedule 12)
 */
export function calculateCashFlowStatement(
  incomeStatementData: IncomeStatementOutput | null,
  cashReceiptsData: CashReceiptsOutput | null,
  cashDisbursementsData: CashDisbursementOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  salesData: SalesBudgetOutput | null,
  cogsData: COGSOutput | null,
  inputs: CashFlowStatementInputs
): { output: CashFlowStatementOutput | null; validation: ValidationResult } {
  const validation = validateCashFlowStatementInputs(
    incomeStatementData,
    cashReceiptsData,
    cashDisbursementsData,
    overheadData,
    inputs
  );

  if (!validation.isValid || !incomeStatementData || !cashReceiptsData || !cashDisbursementsData || !overheadData) {
    return { output: null, validation };
  }

  // ============================================
  // OPERATING ACTIVITIES (Direct Method)
  // ============================================

  // Cash Receipts from Customers (from Schedule 7)
  const cashReceiptsFromCustomers = cashReceiptsData.totalCashReceipts.yearly;

  // Cash Paid for Materials (from Schedule 8)
  const cashPaidForMaterials = cashDisbursementsData.materialPayments.yearly;

  // Cash Paid for Labor (from Schedule 8)
  const cashPaidForLabor = cashDisbursementsData.laborPayments.yearly;

  // Cash Paid for Overhead (from Schedule 8)
  const cashPaidForOverhead = cashDisbursementsData.overheadPayments.yearly;

  // Cash Paid for SGA (from Schedule 8)
  const cashPaidForSGA = cashDisbursementsData.sgaPayments.yearly;

  // Cash Paid for Taxes (from Schedule 8)
  const cashPaidForTaxes = cashDisbursementsData.incomeTaxPayments.yearly;

  // Net Cash from Operating Activities
  const netCashFromOperating = cashReceiptsFromCustomers
    - cashPaidForMaterials
    - cashPaidForLabor
    - cashPaidForOverhead
    - cashPaidForSGA
    - cashPaidForTaxes;

  // ============================================
  // INVESTING ACTIVITIES
  // ============================================

  // Capital Expenditures (from Schedule 8)
  const capitalExpenditures = cashDisbursementsData.capitalExpenditures.yearly;

  // Proceeds from Asset Sales (from inputs)
  const proceedsFromAssetSales = inputs.proceedsFromAssetSales || 0;

  // Net Cash from Investing Activities
  const netCashFromInvesting = proceedsFromAssetSales - capitalExpenditures;

  // ============================================
  // FINANCING ACTIVITIES
  // ============================================

  // Loan Proceeds (new borrowings)
  const loanProceeds = inputs.loanProceeds || 0;

  // Loan Repayments (from Schedule 8)
  const loanRepayments = cashDisbursementsData.loanPayments.yearly;

  // Stock Issued
  const stockIssued = inputs.stockIssued || 0;

  // Dividends Paid (from Schedule 8)
  const dividendsPaid = cashDisbursementsData.dividendPayments.yearly;

  // Net Cash from Financing Activities
  const netCashFromFinancing = loanProceeds - loanRepayments + stockIssued - dividendsPaid;

  // ============================================
  // CASH SUMMARY
  // ============================================

  // Net Change in Cash
  const netChangeInCash = netCashFromOperating + netCashFromInvesting + netCashFromFinancing;

  // Beginning and Ending Cash
  const beginningCash = inputs.beginningCash;
  const endingCash = beginningCash + netChangeInCash;

  // ============================================
  // INDIRECT METHOD RECONCILIATION
  // ============================================

  // Net Income (from Schedule 11)
  const netIncome = incomeStatementData.netIncome;

  // Depreciation (non-cash expense from Schedule 5)
  const depreciation = overheadData.depreciation?.yearly || 0;

  // Change in Accounts Receivable
  const endingAR = cashReceiptsData.endingAccountsReceivable.yearly;
  const changeInAccountsReceivable = endingAR - inputs.beginningAccountsReceivable;

  // Change in Inventory (approximate from COGS data if available)
  let changeInInventory = 0;
  if (cogsData) {
    // Use ending Finished Goods inventory from COGS schedule
    // For simplicity, we assume ending raw material inventory ~ beginning + purchases - usage
    const endingFinishedGoodsInventory = cogsData.endingFinishedGoodsInventory;
    // Estimate total ending inventory using FG inventory as primary component
    const endingInventoryEstimate = endingFinishedGoodsInventory + cogsData.endingWIPInventory;
    changeInInventory = endingInventoryEstimate - inputs.beginningInventory;
  }

  // Change in Accounts Payable
  const endingAP = cashDisbursementsData.endingAccountsPayable.yearly;
  const changeInAccountsPayable = endingAP - inputs.beginningAccountsPayable;

  // Indirect Method Operating Cash Flow
  const indirectMethodOperatingCash = netIncome
    + depreciation
    - changeInAccountsReceivable
    - changeInInventory
    + changeInAccountsPayable;

  // ============================================
  // QUALITY METRICS
  // ============================================

  // Free Cash Flow = Operating Cash Flow - Capital Expenditures
  const freeCashFlow = netCashFromOperating - capitalExpenditures;

  // Operating Cash to Net Income Ratio (quality of earnings)
  const operatingCashToNetIncomeRatio = netIncome !== 0
    ? netCashFromOperating / netIncome
    : 0;

  // Capital Intensity Ratio (CapEx as % of sales)
  const salesRevenue = salesData?.salesRevenue.yearly || incomeStatementData.salesRevenue;
  const capitalIntensityRatio = salesRevenue > 0
    ? (capitalExpenditures / salesRevenue) * 100
    : 0;

  // Dividend Coverage Ratio (Operating cash / dividends)
  const dividendCoverageRatio = dividendsPaid > 0
    ? netCashFromOperating / dividendsPaid
    : Infinity;

  // Debt Service Coverage Ratio (Operating cash / debt payments)
  const debtServiceCoverageRatio = loanRepayments > 0
    ? netCashFromOperating / loanRepayments
    : Infinity;

  // Cash Flow Adequacy Ratio (Operating cash / total cash needs)
  const totalCashNeeds = capitalExpenditures + dividendsPaid + loanRepayments;
  const cashFlowAdequacyRatio = totalCashNeeds > 0
    ? netCashFromOperating / totalCashNeeds
    : Infinity;

  const output: CashFlowStatementOutput = {
    // Operating Activities (Direct Method)
    cashReceiptsFromCustomers,
    cashPaidForMaterials,
    cashPaidForLabor,
    cashPaidForOverhead,
    cashPaidForSGA,
    cashPaidForTaxes,
    netCashFromOperating,

    // Investing Activities
    capitalExpenditures,
    proceedsFromAssetSales,
    netCashFromInvesting,

    // Financing Activities
    loanProceeds,
    loanRepayments,
    stockIssued,
    dividendsPaid,
    netCashFromFinancing,

    // Summary
    netChangeInCash,
    beginningCash,
    endingCash,

    // Indirect Method Reconciliation
    netIncome,
    depreciation,
    changeInAccountsReceivable,
    changeInInventory,
    changeInAccountsPayable,
    indirectMethodOperatingCash,

    // Quality Metrics
    freeCashFlow,
    operatingCashToNetIncomeRatio,
    capitalIntensityRatio,
    dividendCoverageRatio,
    debtServiceCoverageRatio,
    cashFlowAdequacyRatio,
  };

  return { output, validation };
}

/**
 * Format Cash Flow Statement output for display
 */
export function formatCashFlowStatementOutput(output: CashFlowStatementOutput): Array<{
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

  // === OPERATING ACTIVITIES (Direct Method) ===
  rows.push({ section: 'OPERATING ACTIVITIES', label: '', amount: '', isSubtotal: false });
  rows.push({ section: 'Operating', label: 'Cash Receipts from Customers', amount: format(output.cashReceiptsFromCustomers) });
  rows.push({ section: 'Operating', label: 'Cash Paid for Materials', amount: format(-output.cashPaidForMaterials) });
  rows.push({ section: 'Operating', label: 'Cash Paid for Labor', amount: format(-output.cashPaidForLabor) });
  rows.push({ section: 'Operating', label: 'Cash Paid for Overhead', amount: format(-output.cashPaidForOverhead) });
  rows.push({ section: 'Operating', label: 'Cash Paid for SG&A', amount: format(-output.cashPaidForSGA) });
  rows.push({ section: 'Operating', label: 'Cash Paid for Taxes', amount: format(-output.cashPaidForTaxes) });
  rows.push({ section: 'Operating', label: 'Net Cash from Operating Activities', amount: format(output.netCashFromOperating), isSubtotal: true });

  // === INVESTING ACTIVITIES ===
  rows.push({ section: 'INVESTING ACTIVITIES', label: '', amount: '', isSubtotal: false });
  rows.push({ section: 'Investing', label: 'Capital Expenditures', amount: format(-output.capitalExpenditures) });
  if (output.proceedsFromAssetSales > 0) {
    rows.push({ section: 'Investing', label: 'Proceeds from Asset Sales', amount: format(output.proceedsFromAssetSales) });
  }
  rows.push({ section: 'Investing', label: 'Net Cash from Investing Activities', amount: format(output.netCashFromInvesting), isSubtotal: true });

  // === FINANCING ACTIVITIES ===
  rows.push({ section: 'FINANCING ACTIVITIES', label: '', amount: '', isSubtotal: false });
  if (output.loanProceeds > 0) {
    rows.push({ section: 'Financing', label: 'Loan Proceeds', amount: format(output.loanProceeds) });
  }
  if (output.loanRepayments > 0) {
    rows.push({ section: 'Financing', label: 'Loan Repayments', amount: format(-output.loanRepayments) });
  }
  if (output.stockIssued > 0) {
    rows.push({ section: 'Financing', label: 'Stock Issued', amount: format(output.stockIssued) });
  }
  if (output.dividendsPaid > 0) {
    rows.push({ section: 'Financing', label: 'Dividends Paid', amount: format(-output.dividendsPaid) });
  }
  rows.push({ section: 'Financing', label: 'Net Cash from Financing Activities', amount: format(output.netCashFromFinancing), isSubtotal: true });

  // === SUMMARY ===
  rows.push({ section: 'SUMMARY', label: '', amount: '', isSubtotal: false });
  rows.push({ section: 'Summary', label: 'Net Change in Cash', amount: format(output.netChangeInCash), isSubtotal: true });
  rows.push({ section: 'Summary', label: 'Beginning Cash Balance', amount: format(output.beginningCash) });
  rows.push({ section: 'Summary', label: 'Ending Cash Balance', amount: format(output.endingCash), isTotal: true });

  return rows;
}

/**
 * Format Indirect Method Reconciliation for display
 */
export function formatIndirectMethodReconciliation(output: CashFlowStatementOutput): Array<{
  label: string;
  amount: string;
  isSubtotal?: boolean;
}> {
  const format = (value: number) => {
    const formatted = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `(${formatted})` : formatted;
  };

  return [
    { label: 'Net Income', amount: format(output.netIncome) },
    { label: 'Add: Depreciation', amount: format(output.depreciation) },
    { label: 'Less: Increase in Accounts Receivable', amount: format(-output.changeInAccountsReceivable) },
    { label: 'Less: Increase in Inventory', amount: format(-output.changeInInventory) },
    { label: 'Add: Increase in Accounts Payable', amount: format(output.changeInAccountsPayable) },
    { label: 'Net Cash from Operating (Indirect)', amount: format(output.indirectMethodOperatingCash), isSubtotal: true },
  ];
}

/**
 * Format Quality Metrics for display
 */
export function formatQualityMetrics(output: CashFlowStatementOutput): Array<{
  label: string;
  value: string;
  interpretation: string;
}> {
  const formatRatio = (value: number) => {
    if (value === Infinity) return 'N/A (no denominator)';
    return value.toFixed(2);
  };

  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `(${formatted})` : formatted;
  };

  return [
    {
      label: 'Free Cash Flow',
      value: formatCurrency(output.freeCashFlow),
      interpretation: output.freeCashFlow > 0 ? 'Positive - cash available for growth' : 'Negative - may need financing',
    },
    {
      label: 'Operating Cash / Net Income',
      value: formatRatio(output.operatingCashToNetIncomeRatio),
      interpretation: output.operatingCashToNetIncomeRatio >= 1 ? 'Good - cash supports earnings' : 'Lower quality earnings',
    },
    {
      label: 'Capital Intensity (%)',
      value: `${output.capitalIntensityRatio.toFixed(1)}%`,
      interpretation: output.capitalIntensityRatio < 10 ? 'Low capital requirements' : 'Capital intensive business',
    },
    {
      label: 'Dividend Coverage',
      value: formatRatio(output.dividendCoverageRatio),
      interpretation: output.dividendCoverageRatio >= 2 ? 'Sustainable dividends' : 'Dividend sustainability concern',
    },
    {
      label: 'Debt Service Coverage',
      value: formatRatio(output.debtServiceCoverageRatio),
      interpretation: output.debtServiceCoverageRatio >= 1.5 ? 'Good debt coverage' : 'Debt service risk',
    },
    {
      label: 'Cash Flow Adequacy',
      value: formatRatio(output.cashFlowAdequacyRatio),
      interpretation: output.cashFlowAdequacyRatio >= 1 ? 'Self-financing capability' : 'External financing needed',
    },
  ];
}

/**
 * Export Cash Flow Statement to CSV format
 */
export function exportCashFlowStatementToCSV(
  output: CashFlowStatementOutput,
  companyName: string,
  fiscalYear: string
): string {
  const rows = formatCashFlowStatementOutput(output);
  const indirectRows = formatIndirectMethodReconciliation(output);
  const qualityMetrics = formatQualityMetrics(output);

  let csv = `${companyName}\n`;
  csv += `Schedule 12: Budgeted Statement of Cash Flows\n`;
  csv += `Fiscal Year: ${fiscalYear}\n\n`;

  // Direct Method
  csv += 'DIRECT METHOD\n';
  csv += 'Section,Item,Amount\n';
  rows.forEach(row => {
    csv += `"${row.section}","${row.label}",${row.amount}\n`;
  });

  csv += '\n';

  // Indirect Method Reconciliation
  csv += 'INDIRECT METHOD RECONCILIATION\n';
  csv += 'Item,Amount\n';
  indirectRows.forEach(row => {
    csv += `"${row.label}",${row.amount}\n`;
  });

  csv += '\n';

  // Quality Metrics
  csv += 'QUALITY METRICS\n';
  csv += 'Metric,Value,Interpretation\n';
  qualityMetrics.forEach(metric => {
    csv += `"${metric.label}",${metric.value},"${metric.interpretation}"\n`;
  });

  return csv;
}

