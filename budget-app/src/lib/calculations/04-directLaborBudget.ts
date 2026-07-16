/**
 * SCHEDULE 4: DIRECT-LABOR BUDGET
 *
 * Purpose:
 * Calculates the direct labor hours and costs required to produce
 * the planned production volume.
 *
 * Key Formulas:
 * - Total Direct-Labor Hours = Units to Produce × Hours per Unit
 * - Total Direct-Labor Cost = Total Hours × Hourly Rate
 * - For Multiple Categories: Sum of (Hours × Rate) for each category
 * - With Overtime: Regular Hours + (Overtime Hours × Overtime Multiplier)
 *
 * Based on Ronald W. Hilton's Managerial Accounting Framework
 */

import type {
  DirectLabourBudgetInputs,
  DirectLabourBudgetOutput,
  QuarterlyData,
  LaborCategoryDetail,
} from '../types/budgets';

/**
 * Validate inputs for Direct Labor Budget
 */
export function validateDirectLaborBudgetInputs(inputs: DirectLabourBudgetInputs): string[] {
  const errors: string[] = [];

  // Check units to be produced
  if (!inputs.unitsToBeProduced) {
    errors.push('Units to be produced is required (from Schedule 2: Production Budget)');
  } else {
    if (inputs.unitsToBeProduced.q1 < 0 || inputs.unitsToBeProduced.q2 < 0 ||
        inputs.unitsToBeProduced.q3 < 0 || inputs.unitsToBeProduced.q4 < 0) {
      errors.push('Production units cannot be negative');
    }
  }

  // Check that either simple OR multi-category approach is used
  const hasSimpleInputs = inputs.directLaborHoursPerUnit !== undefined && inputs.hourlyWageRate !== undefined;
  const hasMultiCategory = inputs.laborCategories && inputs.laborCategories.length > 0;

  if (!hasSimpleInputs && !hasMultiCategory) {
    errors.push('Either provide (directLaborHoursPerUnit + hourlyWageRate) OR laborCategories array');
  }

  if (hasSimpleInputs && hasMultiCategory) {
    errors.push('WARNING: Both simple and multi-category inputs provided. Multi-category will be used.');
  }

  // Validate simple inputs
  if (hasSimpleInputs) {
    if (inputs.directLaborHoursPerUnit! <= 0) {
      errors.push('Direct labor hours per unit must be greater than 0');
    }
    if (inputs.hourlyWageRate! <= 0) {
      errors.push('Hourly wage rate must be greater than 0');
    }
  }

  // Validate labor categories
  if (hasMultiCategory) {
    inputs.laborCategories!.forEach((category, index) => {
      if (!category.name || category.name.trim() === '') {
        errors.push(`Labor category ${index + 1}: Name is required`);
      }
      if (category.hoursPerUnit <= 0) {
        errors.push(`Labor category "${category.name}": Hours per unit must be greater than 0`);
      }
      if (category.wageRatePerHour <= 0) {
        errors.push(`Labor category "${category.name}": Wage rate must be greater than 0`);
      }
    });
  }

  // Validate optional fields
  if (inputs.wageInflationRate !== undefined && (inputs.wageInflationRate < -0.5 || inputs.wageInflationRate > 0.5)) {
    errors.push('WARNING: Wage inflation rate seems unusually high (should be -0.5 to 0.5 per quarter)');
  }

  if (inputs.overtimeMultiplier !== undefined && inputs.overtimeMultiplier < 1) {
    errors.push('Overtime multiplier must be >= 1 (e.g., 1.5 for time-and-a-half)');
  }

  if (inputs.fringeBenefitRate !== undefined && (inputs.fringeBenefitRate < 0 || inputs.fringeBenefitRate > 1)) {
    errors.push('Fringe benefit rate must be between 0 and 1 (e.g., 0.25 for 25%)');
  }

  if (inputs.productivityEfficiencyRate !== undefined && (inputs.productivityEfficiencyRate <= 0 || inputs.productivityEfficiencyRate > 1)) {
    errors.push('Productivity efficiency rate must be between 0 and 1 (e.g., 0.95 for 95%)');
  }

  if (inputs.turnoverRate !== undefined && (inputs.turnoverRate < 0 || inputs.turnoverRate > 1)) {
    errors.push('Turnover rate must be between 0 and 1 (e.g., 0.15 for 15% annual turnover)');
  }

  return errors;
}

/**
 * Calculate Direct Labor Budget
 */
export function calculateDirectLaborBudget(inputs: DirectLabourBudgetInputs): DirectLabourBudgetOutput {
  const { unitsToBeProduced } = inputs;

  // Determine if using multi-category or simple approach
  const useMultiCategory = inputs.laborCategories && inputs.laborCategories.length > 0;

  if (useMultiCategory) {
    return calculateMultiCategoryLaborBudget(inputs);
  } else {
    return calculateSimpleLaborBudget(inputs);
  }
}

/**
 * Simple single-category labor budget calculation
 */
function calculateSimpleLaborBudget(inputs: DirectLabourBudgetInputs): DirectLabourBudgetOutput {
  const { unitsToBeProduced, directLaborHoursPerUnit, hourlyWageRate } = inputs;
  const hoursPerUnit = directLaborHoursPerUnit!;
  const baseWageRate = hourlyWageRate!;

  // Calculate total labor hours
  const totalLaborHoursRequired: QuarterlyData = {
    q1: unitsToBeProduced.q1 * hoursPerUnit,
    q2: unitsToBeProduced.q2 * hoursPerUnit,
    q3: unitsToBeProduced.q3 * hoursPerUnit,
    q4: unitsToBeProduced.q4 * hoursPerUnit,
    yearly: unitsToBeProduced.yearly * hoursPerUnit,
  };

  // Apply productivity efficiency if provided
  if (inputs.productivityEfficiencyRate && inputs.productivityEfficiencyRate < 1) {
    const efficiencyFactor = 1 / inputs.productivityEfficiencyRate;
    totalLaborHoursRequired.q1 *= efficiencyFactor;
    totalLaborHoursRequired.q2 *= efficiencyFactor;
    totalLaborHoursRequired.q3 *= efficiencyFactor;
    totalLaborHoursRequired.q4 *= efficiencyFactor;
    totalLaborHoursRequired.yearly *= efficiencyFactor;
  }

  // Calculate wage rates with inflation (if applicable)
  const averageLaborRate: QuarterlyData = {
    q1: baseWageRate,
    q2: baseWageRate * (1 + (inputs.wageInflationRate || 0)),
    q3: baseWageRate * Math.pow(1 + (inputs.wageInflationRate || 0), 2),
    q4: baseWageRate * Math.pow(1 + (inputs.wageInflationRate || 0), 3),
    yearly: 0, // Will calculate as weighted average
  };
  averageLaborRate.yearly = (
    (averageLaborRate.q1 * totalLaborHoursRequired.q1 +
     averageLaborRate.q2 * totalLaborHoursRequired.q2 +
     averageLaborRate.q3 * totalLaborHoursRequired.q3 +
     averageLaborRate.q4 * totalLaborHoursRequired.q4) /
    totalLaborHoursRequired.yearly
  ) || 0;

  // Calculate regular and overtime hours (if threshold provided)
  let regularHours: QuarterlyData | undefined;
  let overtimeHours: QuarterlyData | undefined;
  let overtimeCost: QuarterlyData | undefined;

  if (inputs.overtimeThreshold && inputs.overtimeThreshold > 0) {
    const threshold = inputs.overtimeThreshold;
    const otMultiplier = inputs.overtimeMultiplier || 1.5;

    regularHours = {
      q1: Math.min(totalLaborHoursRequired.q1, threshold),
      q2: Math.min(totalLaborHoursRequired.q2, threshold),
      q3: Math.min(totalLaborHoursRequired.q3, threshold),
      q4: Math.min(totalLaborHoursRequired.q4, threshold),
      yearly: 0,
    };
    regularHours.yearly = regularHours.q1 + regularHours.q2 + regularHours.q3 + regularHours.q4;

    overtimeHours = {
      q1: Math.max(0, totalLaborHoursRequired.q1 - threshold),
      q2: Math.max(0, totalLaborHoursRequired.q2 - threshold),
      q3: Math.max(0, totalLaborHoursRequired.q3 - threshold),
      q4: Math.max(0, totalLaborHoursRequired.q4 - threshold),
      yearly: 0,
    };
    overtimeHours.yearly = overtimeHours.q1 + overtimeHours.q2 + overtimeHours.q3 + overtimeHours.q4;

    overtimeCost = {
      q1: overtimeHours.q1 * averageLaborRate.q1 * otMultiplier,
      q2: overtimeHours.q2 * averageLaborRate.q2 * otMultiplier,
      q3: overtimeHours.q3 * averageLaborRate.q3 * otMultiplier,
      q4: overtimeHours.q4 * averageLaborRate.q4 * otMultiplier,
      yearly: 0,
    };
    overtimeCost.yearly = overtimeCost.q1 + overtimeCost.q2 + overtimeCost.q3 + overtimeCost.q4;
  }

  // Calculate base labor cost
  const totalLaborCost: QuarterlyData = {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    yearly: 0,
  };

  if (regularHours && overtimeHours && overtimeCost) {
    // With overtime
    totalLaborCost.q1 = regularHours.q1 * averageLaborRate.q1 + overtimeCost.q1;
    totalLaborCost.q2 = regularHours.q2 * averageLaborRate.q2 + overtimeCost.q2;
    totalLaborCost.q3 = regularHours.q3 * averageLaborRate.q3 + overtimeCost.q3;
    totalLaborCost.q4 = regularHours.q4 * averageLaborRate.q4 + overtimeCost.q4;
  } else {
    // No overtime
    totalLaborCost.q1 = totalLaborHoursRequired.q1 * averageLaborRate.q1;
    totalLaborCost.q2 = totalLaborHoursRequired.q2 * averageLaborRate.q2;
    totalLaborCost.q3 = totalLaborHoursRequired.q3 * averageLaborRate.q3;
    totalLaborCost.q4 = totalLaborHoursRequired.q4 * averageLaborRate.q4;
  }
  totalLaborCost.yearly = totalLaborCost.q1 + totalLaborCost.q2 + totalLaborCost.q3 + totalLaborCost.q4;

  // Calculate fringe benefits if applicable
  let fringeBenefitCost: QuarterlyData | undefined;
  let totalCostIncludingBenefits: QuarterlyData | undefined;

  if (inputs.fringeBenefitRate && inputs.fringeBenefitRate > 0) {
    fringeBenefitCost = {
      q1: totalLaborCost.q1 * inputs.fringeBenefitRate,
      q2: totalLaborCost.q2 * inputs.fringeBenefitRate,
      q3: totalLaborCost.q3 * inputs.fringeBenefitRate,
      q4: totalLaborCost.q4 * inputs.fringeBenefitRate,
      yearly: 0,
    };
    fringeBenefitCost.yearly = fringeBenefitCost.q1 + fringeBenefitCost.q2 + fringeBenefitCost.q3 + fringeBenefitCost.q4;

    totalCostIncludingBenefits = {
      q1: totalLaborCost.q1 + fringeBenefitCost.q1,
      q2: totalLaborCost.q2 + fringeBenefitCost.q2,
      q3: totalLaborCost.q3 + fringeBenefitCost.q3,
      q4: totalLaborCost.q4 + fringeBenefitCost.q4,
      yearly: 0,
    };
    totalCostIncludingBenefits.yearly = totalCostIncludingBenefits.q1 + totalCostIncludingBenefits.q2 +
                                        totalCostIncludingBenefits.q3 + totalCostIncludingBenefits.q4;
  }

  // Calculate workforce planning metrics
  let averageEmployeesNeeded: QuarterlyData | undefined;
  let turnoverCost: QuarterlyData | undefined;
  let trainingCost: QuarterlyData | undefined;

  if (inputs.averageHoursPerEmployee && inputs.averageHoursPerEmployee > 0) {
    averageEmployeesNeeded = {
      q1: totalLaborHoursRequired.q1 / inputs.averageHoursPerEmployee,
      q2: totalLaborHoursRequired.q2 / inputs.averageHoursPerEmployee,
      q3: totalLaborHoursRequired.q3 / inputs.averageHoursPerEmployee,
      q4: totalLaborHoursRequired.q4 / inputs.averageHoursPerEmployee,
      yearly: totalLaborHoursRequired.yearly / (inputs.averageHoursPerEmployee * 4),
    };

    // Calculate turnover and training costs
    if (inputs.turnoverRate && inputs.trainingCostPerEmployee) {
      const quarterlyTurnoverRate = inputs.turnoverRate / 4;

      turnoverCost = {
        q1: averageEmployeesNeeded.q1 * quarterlyTurnoverRate * inputs.trainingCostPerEmployee,
        q2: averageEmployeesNeeded.q2 * quarterlyTurnoverRate * inputs.trainingCostPerEmployee,
        q3: averageEmployeesNeeded.q3 * quarterlyTurnoverRate * inputs.trainingCostPerEmployee,
        q4: averageEmployeesNeeded.q4 * quarterlyTurnoverRate * inputs.trainingCostPerEmployee,
        yearly: 0,
      };
      turnoverCost.yearly = turnoverCost.q1 + turnoverCost.q2 + turnoverCost.q3 + turnoverCost.q4;

      trainingCost = turnoverCost;
    }
  }

  // Calculate labor cost per unit
  const laborCostPerUnit: QuarterlyData = {
    q1: unitsToBeProduced.q1 > 0 ? totalLaborCost.q1 / unitsToBeProduced.q1 : 0,
    q2: unitsToBeProduced.q2 > 0 ? totalLaborCost.q2 / unitsToBeProduced.q2 : 0,
    q3: unitsToBeProduced.q3 > 0 ? totalLaborCost.q3 / unitsToBeProduced.q3 : 0,
    q4: unitsToBeProduced.q4 > 0 ? totalLaborCost.q4 / unitsToBeProduced.q4 : 0,
    yearly: unitsToBeProduced.yearly > 0 ? totalLaborCost.yearly / unitsToBeProduced.yearly : 0,
  };

  // Calculate productivity rate (if efficiency was applied)
  let productivityRate: QuarterlyData | undefined;
  if (inputs.productivityEfficiencyRate) {
    productivityRate = {
      q1: inputs.productivityEfficiencyRate,
      q2: inputs.productivityEfficiencyRate,
      q3: inputs.productivityEfficiencyRate,
      q4: inputs.productivityEfficiencyRate,
      yearly: inputs.productivityEfficiencyRate,
    };
  }

  return {
    productionUnits: unitsToBeProduced,
    totalLaborHoursRequired,
    averageLaborRate,
    totalLaborCost,
    regularHours,
    overtimeHours,
    overtimeCost,
    fringeBenefitCost,
    totalCostIncludingBenefits,
    averageEmployeesNeeded,
    turnoverCost,
    trainingCost,
    laborCostPerUnit,
    productivityRate,
  };
}

/**
 * Multi-category labor budget calculation
 */
function calculateMultiCategoryLaborBudget(inputs: DirectLabourBudgetInputs): DirectLabourBudgetOutput {
  const { unitsToBeProduced, laborCategories } = inputs;
  const categories: LaborCategoryDetail[] = [];

  let totalHoursAllCategories: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  let totalCostAllCategories: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  // Process each labor category
  laborCategories!.forEach((category) => {
    // Calculate hours for this category
    const hoursRequired: QuarterlyData = {
      q1: unitsToBeProduced.q1 * category.hoursPerUnit,
      q2: unitsToBeProduced.q2 * category.hoursPerUnit,
      q3: unitsToBeProduced.q3 * category.hoursPerUnit,
      q4: unitsToBeProduced.q4 * category.hoursPerUnit,
      yearly: unitsToBeProduced.yearly * category.hoursPerUnit,
    };

    // Calculate wage rates with inflation
    const wageRate: QuarterlyData = {
      q1: category.wageRatePerHour,
      q2: category.wageRatePerHour * (1 + (inputs.wageInflationRate || 0)),
      q3: category.wageRatePerHour * Math.pow(1 + (inputs.wageInflationRate || 0), 2),
      q4: category.wageRatePerHour * Math.pow(1 + (inputs.wageInflationRate || 0), 3),
      yearly: 0,
    };
    wageRate.yearly = (
      (wageRate.q1 * hoursRequired.q1 +
       wageRate.q2 * hoursRequired.q2 +
       wageRate.q3 * hoursRequired.q3 +
       wageRate.q4 * hoursRequired.q4) /
      hoursRequired.yearly
    ) || 0;

    // Calculate labor cost for this category
    const laborCost: QuarterlyData = {
      q1: hoursRequired.q1 * wageRate.q1,
      q2: hoursRequired.q2 * wageRate.q2,
      q3: hoursRequired.q3 * wageRate.q3,
      q4: hoursRequired.q4 * wageRate.q4,
      yearly: 0,
    };
    laborCost.yearly = laborCost.q1 + laborCost.q2 + laborCost.q3 + laborCost.q4;

    categories.push({
      name: category.name,
      hoursRequired,
      wageRate,
      laborCost,
    });

    // Add to totals
    totalHoursAllCategories.q1 += hoursRequired.q1;
    totalHoursAllCategories.q2 += hoursRequired.q2;
    totalHoursAllCategories.q3 += hoursRequired.q3;
    totalHoursAllCategories.q4 += hoursRequired.q4;
    totalHoursAllCategories.yearly += hoursRequired.yearly;

    totalCostAllCategories.q1 += laborCost.q1;
    totalCostAllCategories.q2 += laborCost.q2;
    totalCostAllCategories.q3 += laborCost.q3;
    totalCostAllCategories.q4 += laborCost.q4;
    totalCostAllCategories.yearly += laborCost.yearly;
  });

  // Calculate average labor rate across all categories
  const averageLaborRate: QuarterlyData = {
    q1: totalHoursAllCategories.q1 > 0 ? totalCostAllCategories.q1 / totalHoursAllCategories.q1 : 0,
    q2: totalHoursAllCategories.q2 > 0 ? totalCostAllCategories.q2 / totalHoursAllCategories.q2 : 0,
    q3: totalHoursAllCategories.q3 > 0 ? totalCostAllCategories.q3 / totalHoursAllCategories.q3 : 0,
    q4: totalHoursAllCategories.q4 > 0 ? totalCostAllCategories.q4 / totalHoursAllCategories.q4 : 0,
    yearly: totalHoursAllCategories.yearly > 0 ? totalCostAllCategories.yearly / totalHoursAllCategories.yearly : 0,
  };

  // Calculate fringe benefits if applicable
  let fringeBenefitCost: QuarterlyData | undefined;
  let totalCostIncludingBenefits: QuarterlyData | undefined;

  if (inputs.fringeBenefitRate && inputs.fringeBenefitRate > 0) {
    fringeBenefitCost = {
      q1: totalCostAllCategories.q1 * inputs.fringeBenefitRate,
      q2: totalCostAllCategories.q2 * inputs.fringeBenefitRate,
      q3: totalCostAllCategories.q3 * inputs.fringeBenefitRate,
      q4: totalCostAllCategories.q4 * inputs.fringeBenefitRate,
      yearly: 0,
    };
    fringeBenefitCost.yearly = fringeBenefitCost.q1 + fringeBenefitCost.q2 + fringeBenefitCost.q3 + fringeBenefitCost.q4;

    totalCostIncludingBenefits = {
      q1: totalCostAllCategories.q1 + fringeBenefitCost.q1,
      q2: totalCostAllCategories.q2 + fringeBenefitCost.q2,
      q3: totalCostAllCategories.q3 + fringeBenefitCost.q3,
      q4: totalCostAllCategories.q4 + fringeBenefitCost.q4,
      yearly: 0,
    };
    totalCostIncludingBenefits.yearly = totalCostIncludingBenefits.q1 + totalCostIncludingBenefits.q2 +
                                        totalCostIncludingBenefits.q3 + totalCostIncludingBenefits.q4;
  }

  // Calculate labor cost per unit
  const laborCostPerUnit: QuarterlyData = {
    q1: unitsToBeProduced.q1 > 0 ? totalCostAllCategories.q1 / unitsToBeProduced.q1 : 0,
    q2: unitsToBeProduced.q2 > 0 ? totalCostAllCategories.q2 / unitsToBeProduced.q2 : 0,
    q3: unitsToBeProduced.q3 > 0 ? totalCostAllCategories.q3 / unitsToBeProduced.q3 : 0,
    q4: unitsToBeProduced.q4 > 0 ? totalCostAllCategories.q4 / unitsToBeProduced.q4 : 0,
    yearly: unitsToBeProduced.yearly > 0 ? totalCostAllCategories.yearly / unitsToBeProduced.yearly : 0,
  };

  return {
    productionUnits: unitsToBeProduced,
    totalLaborHoursRequired: totalHoursAllCategories,
    averageLaborRate,
    totalLaborCost: totalCostAllCategories,
    laborCategories: categories,
    fringeBenefitCost,
    totalCostIncludingBenefits,
    laborCostPerUnit,
  };
}

/**
 * Format Direct Labor Budget output for display in tables
 */
export function formatDirectLaborBudgetForDisplay(output: DirectLabourBudgetOutput): any {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const headers = ['Description', 'Q1', 'Q2', 'Q3', 'Q4', 'Yearly'];

  // If multi-category, create separate tables for each category
  if (output.laborCategories && output.laborCategories.length > 0) {
    const categoryTables = output.laborCategories.map((category) => {
      const rows = [
        {
          label: `Hours Required - ${category.name}`,
          q1: formatNumber(category.hoursRequired.q1),
          q2: formatNumber(category.hoursRequired.q2),
          q3: formatNumber(category.hoursRequired.q3),
          q4: formatNumber(category.hoursRequired.q4),
          yearly: formatNumber(category.hoursRequired.yearly),
        },
        {
          label: `Wage Rate per Hour - ${category.name}`,
          q1: formatNumber(category.wageRate.q1),
          q2: formatNumber(category.wageRate.q2),
          q3: formatNumber(category.wageRate.q3),
          q4: formatNumber(category.wageRate.q4),
          yearly: formatNumber(category.wageRate.yearly),
        },
        {
          label: `Labor Cost - ${category.name}`,
          q1: formatNumber(category.laborCost.q1),
          q2: formatNumber(category.laborCost.q2),
          q3: formatNumber(category.laborCost.q3),
          q4: formatNumber(category.laborCost.q4),
          yearly: formatNumber(category.laborCost.yearly),
        },
      ];

      return {
        categoryName: category.name,
        headers,
        rows,
      };
    });

    // Summary table
    const summaryRows = [
      {
        label: 'Units to be Produced',
        q1: formatNumber(output.productionUnits.q1),
        q2: formatNumber(output.productionUnits.q2),
        q3: formatNumber(output.productionUnits.q3),
        q4: formatNumber(output.productionUnits.q4),
        yearly: formatNumber(output.productionUnits.yearly),
      },
      {
        label: 'Total Direct-Labor Hours',
        q1: formatNumber(output.totalLaborHoursRequired.q1),
        q2: formatNumber(output.totalLaborHoursRequired.q2),
        q3: formatNumber(output.totalLaborHoursRequired.q3),
        q4: formatNumber(output.totalLaborHoursRequired.q4),
        yearly: formatNumber(output.totalLaborHoursRequired.yearly),
      },
      {
        label: 'Average Labor Rate per Hour',
        q1: formatNumber(output.averageLaborRate.q1),
        q2: formatNumber(output.averageLaborRate.q2),
        q3: formatNumber(output.averageLaborRate.q3),
        q4: formatNumber(output.averageLaborRate.q4),
        yearly: formatNumber(output.averageLaborRate.yearly),
      },
      {
        label: 'Total Direct-Labor Cost',
        q1: formatNumber(output.totalLaborCost.q1),
        q2: formatNumber(output.totalLaborCost.q2),
        q3: formatNumber(output.totalLaborCost.q3),
        q4: formatNumber(output.totalLaborCost.q4),
        yearly: formatNumber(output.totalLaborCost.yearly),
      },
    ];

    if (output.fringeBenefitCost) {
      summaryRows.push({
        label: 'Fringe Benefit Cost',
        q1: formatNumber(output.fringeBenefitCost.q1),
        q2: formatNumber(output.fringeBenefitCost.q2),
        q3: formatNumber(output.fringeBenefitCost.q3),
        q4: formatNumber(output.fringeBenefitCost.q4),
        yearly: formatNumber(output.fringeBenefitCost.yearly),
      });
    }

    if (output.totalCostIncludingBenefits) {
      summaryRows.push({
        label: 'Total Cost (Including Benefits)',
        q1: formatNumber(output.totalCostIncludingBenefits.q1),
        q2: formatNumber(output.totalCostIncludingBenefits.q2),
        q3: formatNumber(output.totalCostIncludingBenefits.q3),
        q4: formatNumber(output.totalCostIncludingBenefits.q4),
        yearly: formatNumber(output.totalCostIncludingBenefits.yearly),
      });
    }

    return {
      headers,
      categoryTables,
      summaryRows,
      laborCostPerUnit: output.laborCostPerUnit,
      averageEmployeesNeeded: output.averageEmployeesNeeded,
      turnoverCost: output.turnoverCost,
      trainingCost: output.trainingCost,
      productivityRate: output.productivityRate,
    };
  }

  // Simple single-category display
  const rows = [
    {
      label: 'Units to be Produced',
      q1: formatNumber(output.productionUnits.q1),
      q2: formatNumber(output.productionUnits.q2),
      q3: formatNumber(output.productionUnits.q3),
      q4: formatNumber(output.productionUnits.q4),
      yearly: formatNumber(output.productionUnits.yearly),
    },
    {
      label: 'Direct-Labor Hours Required',
      q1: formatNumber(output.totalLaborHoursRequired.q1),
      q2: formatNumber(output.totalLaborHoursRequired.q2),
      q3: formatNumber(output.totalLaborHoursRequired.q3),
      q4: formatNumber(output.totalLaborHoursRequired.q4),
      yearly: formatNumber(output.totalLaborHoursRequired.yearly),
    },
  ];

  if (output.regularHours && output.overtimeHours) {
    rows.push({
      label: '  - Regular Hours',
      q1: formatNumber(output.regularHours.q1),
      q2: formatNumber(output.regularHours.q2),
      q3: formatNumber(output.regularHours.q3),
      q4: formatNumber(output.regularHours.q4),
      yearly: formatNumber(output.regularHours.yearly),
    });
    rows.push({
      label: '  - Overtime Hours',
      q1: formatNumber(output.overtimeHours.q1),
      q2: formatNumber(output.overtimeHours.q2),
      q3: formatNumber(output.overtimeHours.q3),
      q4: formatNumber(output.overtimeHours.q4),
      yearly: formatNumber(output.overtimeHours.yearly),
    });
  }

  rows.push({
    label: 'Direct-Labor Rate per Hour',
    q1: formatNumber(output.averageLaborRate.q1),
    q2: formatNumber(output.averageLaborRate.q2),
    q3: formatNumber(output.averageLaborRate.q3),
    q4: formatNumber(output.averageLaborRate.q4),
    yearly: formatNumber(output.averageLaborRate.yearly),
  });

  rows.push({
    label: 'Total Direct-Labor Cost',
    q1: formatNumber(output.totalLaborCost.q1),
    q2: formatNumber(output.totalLaborCost.q2),
    q3: formatNumber(output.totalLaborCost.q3),
    q4: formatNumber(output.totalLaborCost.q4),
    yearly: formatNumber(output.totalLaborCost.yearly),
  });

  if (output.overtimeCost) {
    rows.push({
      label: '  - Overtime Premium',
      q1: formatNumber(output.overtimeCost.q1),
      q2: formatNumber(output.overtimeCost.q2),
      q3: formatNumber(output.overtimeCost.q3),
      q4: formatNumber(output.overtimeCost.q4),
      yearly: formatNumber(output.overtimeCost.yearly),
    });
  }

  if (output.fringeBenefitCost) {
    rows.push({
      label: 'Fringe Benefit Cost',
      q1: formatNumber(output.fringeBenefitCost.q1),
      q2: formatNumber(output.fringeBenefitCost.q2),
      q3: formatNumber(output.fringeBenefitCost.q3),
      q4: formatNumber(output.fringeBenefitCost.q4),
      yearly: formatNumber(output.fringeBenefitCost.yearly),
    });
  }

  if (output.totalCostIncludingBenefits) {
    rows.push({
      label: 'Total Labor Cost (Including Benefits)',
      q1: formatNumber(output.totalCostIncludingBenefits.q1),
      q2: formatNumber(output.totalCostIncludingBenefits.q2),
      q3: formatNumber(output.totalCostIncludingBenefits.q3),
      q4: formatNumber(output.totalCostIncludingBenefits.q4),
      yearly: formatNumber(output.totalCostIncludingBenefits.yearly),
    });
  }

  return {
    headers,
    rows,
    laborCostPerUnit: output.laborCostPerUnit,
    averageEmployeesNeeded: output.averageEmployeesNeeded,
    turnoverCost: output.turnoverCost,
    trainingCost: output.trainingCost,
    productivityRate: output.productivityRate,
  };
}

