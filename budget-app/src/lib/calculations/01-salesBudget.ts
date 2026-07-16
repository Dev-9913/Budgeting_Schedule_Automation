/**
 * SCHEDULE 1: SALES BUDGET
 *
 * Based on Ronald W. Hilton's "Managerial Accounting" Chapter 9
 *
 * Purpose: The sales budget is the starting point for the master budget.
 * It shows the expected sales revenue for each quarter and the entire year.
 *
 * Formula:
 * Sales Revenue = Expected Sales Units × Selling Price per Unit
 *
 * The sales forecast incorporates:
 * - Historical sales trends
 * - General economic conditions
 * - Industry trends
 * - Competitive factors
 * - Planned marketing activities
 * - Price changes
 */

import type { SalesBudgetInputs, SalesBudgetOutput, QuarterlyData } from '../types/budgets';

export function calculateSalesBudget(inputs: SalesBudgetInputs): SalesBudgetOutput {
  const { forecastedSalesUnits, sellingPricePerUnit, priceInflationRate = 0, cashSalesPercentage, creditSalesPercentage } = inputs;

  // Calculate selling price for each quarter (with inflation if applicable)
  const sellingPrice: QuarterlyData = {
    q1: sellingPricePerUnit,
    q2: sellingPricePerUnit * (1 + priceInflationRate / 4), // Quarterly inflation
    q3: sellingPricePerUnit * (1 + (priceInflationRate / 4) * 2),
    q4: sellingPricePerUnit * (1 + (priceInflationRate / 4) * 3),
    yearly: 0, // Will calculate weighted average
  };

  // Calculate weighted average selling price for the year
  const totalUnits = forecastedSalesUnits.yearly;
  sellingPrice.yearly = totalUnits > 0
    ? (
        (forecastedSalesUnits.q1 * sellingPrice.q1) +
        (forecastedSalesUnits.q2 * sellingPrice.q2) +
        (forecastedSalesUnits.q3 * sellingPrice.q3) +
        (forecastedSalesUnits.q4 * sellingPrice.q4)
      ) / totalUnits
    : sellingPricePerUnit;

  // Calculate sales revenue for each quarter
  const salesRevenue: QuarterlyData = {
    q1: forecastedSalesUnits.q1 * sellingPrice.q1,
    q2: forecastedSalesUnits.q2 * sellingPrice.q2,
    q3: forecastedSalesUnits.q3 * sellingPrice.q3,
    q4: forecastedSalesUnits.q4 * sellingPrice.q4,
    yearly: 0, // Will sum up
  };

  // Calculate yearly total revenue
  salesRevenue.yearly = salesRevenue.q1 + salesRevenue.q2 + salesRevenue.q3 + salesRevenue.q4;

  // Calculate cash and credit sales if percentages are provided
  let cashSales: QuarterlyData | undefined;
  let creditSales: QuarterlyData | undefined;

  if (cashSalesPercentage !== undefined || creditSalesPercentage !== undefined) {
    const cashPct = cashSalesPercentage || 0;
    const creditPct = creditSalesPercentage || 0;

    cashSales = {
      q1: salesRevenue.q1 * cashPct,
      q2: salesRevenue.q2 * cashPct,
      q3: salesRevenue.q3 * cashPct,
      q4: salesRevenue.q4 * cashPct,
      yearly: salesRevenue.yearly * cashPct,
    };

    creditSales = {
      q1: salesRevenue.q1 * creditPct,
      q2: salesRevenue.q2 * creditPct,
      q3: salesRevenue.q3 * creditPct,
      q4: salesRevenue.q4 * creditPct,
      yearly: salesRevenue.yearly * creditPct,
    };
  }

  return {
    salesUnits: forecastedSalesUnits,
    sellingPrice,
    salesRevenue,
    cashSales,
    creditSales,
  };
}

/**
 * Helper function to validate sales budget inputs
 */
export function validateSalesBudgetInputs(inputs: SalesBudgetInputs): string[] {
  const errors: string[] = [];

  // Validate sales units
  if (inputs.forecastedSalesUnits.q1 < 0) errors.push('Q1 sales units cannot be negative');
  if (inputs.forecastedSalesUnits.q2 < 0) errors.push('Q2 sales units cannot be negative');
  if (inputs.forecastedSalesUnits.q3 < 0) errors.push('Q3 sales units cannot be negative');
  if (inputs.forecastedSalesUnits.q4 < 0) errors.push('Q4 sales units cannot be negative');

  // Validate selling price
  if (inputs.sellingPricePerUnit <= 0) {
    errors.push('Selling price must be greater than zero');
  }

  // Validate inflation rate if provided
  if (inputs.priceInflationRate !== undefined && inputs.priceInflationRate !== 0) {
    if (inputs.priceInflationRate < -1) {
      errors.push('Price inflation rate cannot be less than -100%');
    }
    if (inputs.priceInflationRate > 2) {
      errors.push('Price inflation rate seems unrealistic (over 200%)');
    }
    if (inputs.priceInflationRate > 0.5) {
      errors.push('WARNING: Inflation rate over 50% is unusually high. Please verify.');
    }
  }

  // Check that yearly totals make sense
  const calculatedYearly =
    inputs.forecastedSalesUnits.q1 +
    inputs.forecastedSalesUnits.q2 +
    inputs.forecastedSalesUnits.q3 +
    inputs.forecastedSalesUnits.q4;

  if (Math.abs(calculatedYearly - inputs.forecastedSalesUnits.yearly) > 0.01) {
    errors.push(
      `Yearly total (${inputs.forecastedSalesUnits.yearly}) does not match sum of quarters (${calculatedYearly})`
    );
  }

  // Warning for zero sales in any quarter
  const quarters = [
    { name: 'Q1', value: inputs.forecastedSalesUnits.q1 },
    { name: 'Q2', value: inputs.forecastedSalesUnits.q2 },
    { name: 'Q3', value: inputs.forecastedSalesUnits.q3 },
    { name: 'Q4', value: inputs.forecastedSalesUnits.q4 },
  ];
  const zeroQuarters = quarters.filter(q => q.value === 0);
  if (zeroQuarters.length > 0 && calculatedYearly > 0) {
    errors.push(`WARNING: Zero sales forecasted for ${zeroQuarters.map(q => q.name).join(', ')}. Is this intentional?`);
  }

  // Warning for highly concentrated sales (>80% in one quarter)
  if (calculatedYearly > 0) {
    quarters.forEach(q => {
      const percentage = (q.value / calculatedYearly) * 100;
      if (percentage > 80) {
        errors.push(`WARNING: ${percentage.toFixed(0)}% of annual sales are in ${q.name}. This is an unusual pattern.`);
      }
    });
  }

  // Validate cash and credit sales percentages
  if (inputs.cashSalesPercentage !== undefined || inputs.creditSalesPercentage !== undefined) {
    const cashPct = inputs.cashSalesPercentage || 0;
    const creditPct = inputs.creditSalesPercentage || 0;

    if (cashPct < 0 || cashPct > 1) {
      errors.push('Cash sales percentage must be between 0 and 1 (0% to 100%)');
    }
    if (creditPct < 0 || creditPct > 1) {
      errors.push('Credit sales percentage must be between 0 and 1 (0% to 100%)');
    }

    const totalPct = cashPct + creditPct;
    if (Math.abs(totalPct - 1) > 0.01) {
      errors.push(`Cash and credit percentages must add up to 100%. Currently: ${(totalPct * 100).toFixed(1)}%`);
    }
  }

  return errors;
}

/**
 * Helper function to format sales budget output for display
 */
export function formatSalesBudgetForDisplay(output: SalesBudgetOutput, inputs?: SalesBudgetInputs) {
  const rows = [
    {
      label: 'Expected Sales (Units)',
      q1: output.salesUnits.q1.toFixed(2),
      q2: output.salesUnits.q2.toFixed(2),
      q3: output.salesUnits.q3.toFixed(2),
      q4: output.salesUnits.q4.toFixed(2),
      yearly: output.salesUnits.yearly.toFixed(2),
    },
    {
      label: 'Selling Price per Unit',
      q1: output.sellingPrice.q1.toFixed(2),
      q2: output.sellingPrice.q2.toFixed(2),
      q3: output.sellingPrice.q3.toFixed(2),
      q4: output.sellingPrice.q4.toFixed(2),
      yearly: output.sellingPrice.yearly.toFixed(2),
    },
    {
      label: 'Sales Revenue',
      q1: output.salesRevenue.q1.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q2: output.salesRevenue.q2.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q3: output.salesRevenue.q3.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q4: output.salesRevenue.q4.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      yearly: output.salesRevenue.yearly.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
  ];

  // Add cash and credit sales rows if available
  if (output.cashSales && output.creditSales) {
    rows.push({
      label: 'Cash Sales',
      q1: output.cashSales.q1.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q2: output.cashSales.q2.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q3: output.cashSales.q3.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q4: output.cashSales.q4.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      yearly: output.cashSales.yearly.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    });

    rows.push({
      label: 'Credit Sales',
      q1: output.creditSales.q1.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q2: output.creditSales.q2.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q3: output.creditSales.q3.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      q4: output.creditSales.q4.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      yearly: output.creditSales.yearly.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    });
  }

  // Add growth comparison row if historical data is available
  if (inputs?.historicalSalesUnits) {
    const calcGrowth = (current: number, prior: number) => {
      if (prior === 0) return 'N/A';
      const growth = ((current - prior) / prior) * 100;
      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    };

    rows.push({
      label: 'Growth vs Prior Year',
      q1: calcGrowth(output.salesUnits.q1, inputs.historicalSalesUnits.q1),
      q2: calcGrowth(output.salesUnits.q2, inputs.historicalSalesUnits.q2),
      q3: calcGrowth(output.salesUnits.q3, inputs.historicalSalesUnits.q3),
      q4: calcGrowth(output.salesUnits.q4, inputs.historicalSalesUnits.q4),
      yearly: calcGrowth(output.salesUnits.yearly, inputs.historicalSalesUnits.yearly),
    });
  }

  // Calculate seasonal distribution
  const seasonalDistribution = {
    q1: output.salesUnits.yearly > 0 ? (output.salesUnits.q1 / output.salesUnits.yearly) * 100 : 0,
    q2: output.salesUnits.yearly > 0 ? (output.salesUnits.q2 / output.salesUnits.yearly) * 100 : 0,
    q3: output.salesUnits.yearly > 0 ? (output.salesUnits.q3 / output.salesUnits.yearly) * 100 : 0,
    q4: output.salesUnits.yearly > 0 ? (output.salesUnits.q4 / output.salesUnits.yearly) * 100 : 0,
  };

  return {
    headers: ['', 'Q1 (Oct-Dec)', 'Q2 (Jan-Mar)', 'Q3 (Apr-Jun)', 'Q4 (Jul-Sep)', 'Yearly Total'],
    rows,
    seasonalDistribution,
  };
}

