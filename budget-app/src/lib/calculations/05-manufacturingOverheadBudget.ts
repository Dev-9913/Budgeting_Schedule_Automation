/**
 * SCHEDULE 5: MANUFACTURING OVERHEAD BUDGET
 *
 * Purpose:
 * Calculates all manufacturing costs other than direct materials and direct labor.
 * Supports both traditional and activity-based costing (ABC) approaches.
 *
 * Key Formulas:
 * - Unit-Level Costs = Units × Cost per Unit
 * - Batch-Level Costs = Number of Runs × Cost per Run
 * - Facility-Level Costs = Fixed allocation per period
 * - Total Manufacturing Overhead = Sum of all cost categories
 * - Cash Overhead = Total Overhead − Non-Cash Charges (Depreciation)
 * - Predetermined OH Rate = Budgeted Overhead ÷ Cost Driver Level
 *
 * Based on Ronald W. Hilton's Managerial Accounting Framework
 */

import type {
  ManufacturingOverheadInputs,
  ManufacturingOverheadOutput,
  QuarterlyData,
  OverheadCategoryDetail,
} from '../types/budgets';

/**
 * Validate inputs for Manufacturing Overhead Budget
 */
export function validateManufacturingOverheadInputs(inputs: ManufacturingOverheadInputs): string[] {
  const errors: string[] = [];

  // Check production units
  if (!inputs.unitsToBeProduced) {
    errors.push('Units to be produced is required (from Schedule 2: Production Budget)');
  } else {
    if (inputs.unitsToBeProduced.q1 < 0 || inputs.unitsToBeProduced.q2 < 0 ||
        inputs.unitsToBeProduced.q3 < 0 || inputs.unitsToBeProduced.q4 < 0) {
      errors.push('Production units cannot be negative');
    }
  }

  // Determine which approach is being used
  const hasSimpleInputs = (
    inputs.variableOverheadRatePerUnit !== undefined ||
    inputs.variableOverheadRatePerLaborHour !== undefined ||
    inputs.fixedOverheadPerQuarter !== undefined
  );

  const hasDetailedCategories = inputs.overheadCategories && inputs.overheadCategories.length > 0;
  const hasABCInputs = inputs.useActivityBasedCosting;

  if (!hasSimpleInputs && !hasDetailedCategories && !hasABCInputs) {
    errors.push('Please provide either: (1) Simple overhead rates, (2) Detailed cost categories, or (3) Activity-based costing data');
  }

  // Validate simple inputs
  if (hasSimpleInputs) {
    if (inputs.variableOverheadRatePerUnit !== undefined && inputs.variableOverheadRatePerUnit < 0) {
      errors.push('Variable overhead rate per unit cannot be negative');
    }
    if (inputs.variableOverheadRatePerLaborHour !== undefined && inputs.variableOverheadRatePerLaborHour < 0) {
      errors.push('Variable overhead rate per labor hour cannot be negative');
    }
    if (inputs.fixedOverheadPerQuarter !== undefined && inputs.fixedOverheadPerQuarter < 0) {
      errors.push('Fixed overhead per quarter cannot be negative');
    }
    if (inputs.depreciationPerQuarter !== undefined && inputs.depreciationPerQuarter < 0) {
      errors.push('Depreciation per quarter cannot be negative');
    }

    // Check if labor hours are needed
    if (inputs.variableOverheadRatePerLaborHour !== undefined && !inputs.directLaborHours) {
      errors.push('Direct labor hours are required when using overhead rate per labor hour (from Schedule 4)');
    }
  }

  // Validate detailed categories
  if (hasDetailedCategories) {
    inputs.overheadCategories!.forEach((category, index) => {
      if (!category.name || category.name.trim() === '') {
        errors.push(`Overhead category ${index + 1}: Name is required`);
      }
      if (category.amount < 0) {
        errors.push(`Overhead category "${category.name}": Amount cannot be negative`);
      }
      if (category.costType === 'variable' && !category.costDriver) {
        errors.push(`Overhead category "${category.name}": Cost driver required for variable costs`);
      }
      if (category.costDriver === 'labor-hours' && !inputs.directLaborHours) {
        errors.push(`Overhead category "${category.name}": Direct labor hours required for this cost driver`);
      }
      if (category.costDriver === 'machine-hours' && !inputs.machineHours) {
        errors.push(`Overhead category "${category.name}": Machine hours required for this cost driver`);
      }
    });
  }

  // Validate ABC inputs
  if (hasABCInputs) {
    if (inputs.numberOfProductionRuns && inputs.costPerProductionRun === undefined) {
      errors.push('Cost per production run is required when production runs are specified');
    }
    if (inputs.numberOfInspections && inputs.costPerInspection === undefined) {
      errors.push('Cost per inspection is required when inspections are specified');
    }
    if (inputs.machineHours && inputs.costPerMachineHour === undefined) {
      errors.push('Cost per machine hour is required when machine hours are specified');
    }
  }

  return errors;
}

/**
 * Calculate Manufacturing Overhead Budget
 */
export function calculateManufacturingOverheadBudget(inputs: ManufacturingOverheadInputs): ManufacturingOverheadOutput {
  const { unitsToBeProduced, directLaborHours } = inputs;

  // Determine which calculation approach to use
  const hasDetailedCategories = inputs.overheadCategories && inputs.overheadCategories.length > 0;
  const useABC = inputs.useActivityBasedCosting;

  if (hasDetailedCategories) {
    return calculateDetailedCategoryOverhead(inputs);
  } else if (useABC) {
    return calculateActivityBasedOverhead(inputs);
  } else {
    return calculateSimpleOverhead(inputs);
  }
}

/**
 * Simple overhead calculation (traditional approach)
 */
function calculateSimpleOverhead(inputs: ManufacturingOverheadInputs): ManufacturingOverheadOutput {
  const { unitsToBeProduced, directLaborHours } = inputs;
  const varRatePerUnit = inputs.variableOverheadRatePerUnit || 0;
  const varRatePerLaborHour = inputs.variableOverheadRatePerLaborHour || 0;
  const fixedPerQuarter = inputs.fixedOverheadPerQuarter || 0;
  const depreciationPerQuarter = inputs.depreciationPerQuarter || 0;

  // Calculate variable overhead
  const variableOverhead: QuarterlyData = {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    yearly: 0,
  };

  // Add unit-based variable overhead
  if (varRatePerUnit > 0) {
    variableOverhead.q1 += unitsToBeProduced.q1 * varRatePerUnit;
    variableOverhead.q2 += unitsToBeProduced.q2 * varRatePerUnit;
    variableOverhead.q3 += unitsToBeProduced.q3 * varRatePerUnit;
    variableOverhead.q4 += unitsToBeProduced.q4 * varRatePerUnit;
  }

  // Add labor-hour-based variable overhead
  if (varRatePerLaborHour > 0 && directLaborHours) {
    variableOverhead.q1 += directLaborHours.q1 * varRatePerLaborHour;
    variableOverhead.q2 += directLaborHours.q2 * varRatePerLaborHour;
    variableOverhead.q3 += directLaborHours.q3 * varRatePerLaborHour;
    variableOverhead.q4 += directLaborHours.q4 * varRatePerLaborHour;
  }

  variableOverhead.yearly = variableOverhead.q1 + variableOverhead.q2 + variableOverhead.q3 + variableOverhead.q4;

  // Calculate fixed overhead
  const fixedOverhead: QuarterlyData = {
    q1: fixedPerQuarter,
    q2: fixedPerQuarter,
    q3: fixedPerQuarter,
    q4: fixedPerQuarter,
    yearly: fixedPerQuarter * 4,
  };

  // Calculate depreciation
  const depreciation: QuarterlyData = {
    q1: depreciationPerQuarter,
    q2: depreciationPerQuarter,
    q3: depreciationPerQuarter,
    q4: depreciationPerQuarter,
    yearly: depreciationPerQuarter * 4,
  };

  // Calculate total overhead
  const totalOverhead: QuarterlyData = {
    q1: variableOverhead.q1 + fixedOverhead.q1,
    q2: variableOverhead.q2 + fixedOverhead.q2,
    q3: variableOverhead.q3 + fixedOverhead.q3,
    q4: variableOverhead.q4 + fixedOverhead.q4,
    yearly: variableOverhead.yearly + fixedOverhead.yearly,
  };

  // Calculate cash disbursements (total overhead - depreciation)
  const cashDisbursements: QuarterlyData = {
    q1: totalOverhead.q1 - depreciation.q1,
    q2: totalOverhead.q2 - depreciation.q2,
    q3: totalOverhead.q3 - depreciation.q3,
    q4: totalOverhead.q4 - depreciation.q4,
    yearly: totalOverhead.yearly - depreciation.yearly,
  };

  // Calculate overhead per unit
  const overheadPerUnit: QuarterlyData = {
    q1: unitsToBeProduced.q1 > 0 ? totalOverhead.q1 / unitsToBeProduced.q1 : 0,
    q2: unitsToBeProduced.q2 > 0 ? totalOverhead.q2 / unitsToBeProduced.q2 : 0,
    q3: unitsToBeProduced.q3 > 0 ? totalOverhead.q3 / unitsToBeProduced.q3 : 0,
    q4: unitsToBeProduced.q4 > 0 ? totalOverhead.q4 / unitsToBeProduced.q4 : 0,
    yearly: unitsToBeProduced.yearly > 0 ? totalOverhead.yearly / unitsToBeProduced.yearly : 0,
  };

  // Calculate predetermined overhead rate
  let predeterminedOverheadRate: number | undefined;
  const allocationBase = inputs.allocationBase || 'units';

  if (allocationBase === 'units') {
    predeterminedOverheadRate = unitsToBeProduced.yearly > 0 ? totalOverhead.yearly / unitsToBeProduced.yearly : 0;
  } else if (allocationBase === 'labor-hours' && directLaborHours) {
    predeterminedOverheadRate = directLaborHours.yearly > 0 ? totalOverhead.yearly / directLaborHours.yearly : 0;
  }

  return {
    productionUnits: unitsToBeProduced,
    directLaborHours,
    variableOverhead,
    fixedOverhead,
    totalOverhead,
    depreciation,
    cashDisbursements,
    overheadPerUnit,
    predeterminedOverheadRate,
  };
}

/**
 * Detailed category-based overhead calculation
 */
function calculateDetailedCategoryOverhead(inputs: ManufacturingOverheadInputs): ManufacturingOverheadOutput {
  const { unitsToBeProduced, directLaborHours, machineHours, overheadCategories } = inputs;

  const categories: OverheadCategoryDetail[] = [];
  let totalVariable: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  let totalFixed: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  let totalDepreciation: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  overheadCategories!.forEach((category) => {
    const cost: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

    if (category.costType === 'variable') {
      // Variable costs depend on cost driver
      switch (category.costDriver) {
        case 'units':
          cost.q1 = unitsToBeProduced.q1 * category.amount;
          cost.q2 = unitsToBeProduced.q2 * category.amount;
          cost.q3 = unitsToBeProduced.q3 * category.amount;
          cost.q4 = unitsToBeProduced.q4 * category.amount;
          break;
        case 'labor-hours':
          if (directLaborHours) {
            cost.q1 = directLaborHours.q1 * category.amount;
            cost.q2 = directLaborHours.q2 * category.amount;
            cost.q3 = directLaborHours.q3 * category.amount;
            cost.q4 = directLaborHours.q4 * category.amount;
          }
          break;
        case 'machine-hours':
          if (machineHours) {
            cost.q1 = machineHours.q1 * category.amount;
            cost.q2 = machineHours.q2 * category.amount;
            cost.q3 = machineHours.q3 * category.amount;
            cost.q4 = machineHours.q4 * category.amount;
          }
          break;
      }
      cost.yearly = cost.q1 + cost.q2 + cost.q3 + cost.q4;
      totalVariable.q1 += cost.q1;
      totalVariable.q2 += cost.q2;
      totalVariable.q3 += cost.q3;
      totalVariable.q4 += cost.q4;
      totalVariable.yearly += cost.yearly;
    } else {
      // Fixed costs - same each quarter
      cost.q1 = category.amount;
      cost.q2 = category.amount;
      cost.q3 = category.amount;
      cost.q4 = category.amount;
      cost.yearly = category.amount * 4;

      totalFixed.q1 += cost.q1;
      totalFixed.q2 += cost.q2;
      totalFixed.q3 += cost.q3;
      totalFixed.q4 += cost.q4;
      totalFixed.yearly += cost.yearly;
    }

    // Track depreciation separately
    if (category.isNonCash) {
      totalDepreciation.q1 += cost.q1;
      totalDepreciation.q2 += cost.q2;
      totalDepreciation.q3 += cost.q3;
      totalDepreciation.q4 += cost.q4;
      totalDepreciation.yearly += cost.yearly;
    }

    categories.push({
      name: category.name,
      costType: category.costType,
      cost,
      costDriver: category.costDriver,
      isNonCash: category.isNonCash,
    });
  });

  const totalOverhead: QuarterlyData = {
    q1: totalVariable.q1 + totalFixed.q1,
    q2: totalVariable.q2 + totalFixed.q2,
    q3: totalVariable.q3 + totalFixed.q3,
    q4: totalVariable.q4 + totalFixed.q4,
    yearly: totalVariable.yearly + totalFixed.yearly,
  };

  const cashDisbursements: QuarterlyData = {
    q1: totalOverhead.q1 - totalDepreciation.q1,
    q2: totalOverhead.q2 - totalDepreciation.q2,
    q3: totalOverhead.q3 - totalDepreciation.q3,
    q4: totalOverhead.q4 - totalDepreciation.q4,
    yearly: totalOverhead.yearly - totalDepreciation.yearly,
  };

  const overheadPerUnit: QuarterlyData = {
    q1: unitsToBeProduced.q1 > 0 ? totalOverhead.q1 / unitsToBeProduced.q1 : 0,
    q2: unitsToBeProduced.q2 > 0 ? totalOverhead.q2 / unitsToBeProduced.q2 : 0,
    q3: unitsToBeProduced.q3 > 0 ? totalOverhead.q3 / unitsToBeProduced.q3 : 0,
    q4: unitsToBeProduced.q4 > 0 ? totalOverhead.q4 / unitsToBeProduced.q4 : 0,
    yearly: unitsToBeProduced.yearly > 0 ? totalOverhead.yearly / unitsToBeProduced.yearly : 0,
  };

  return {
    productionUnits: unitsToBeProduced,
    directLaborHours,
    variableOverhead: totalVariable,
    fixedOverhead: totalFixed,
    totalOverhead,
    depreciation: totalDepreciation,
    cashDisbursements,
    overheadCategories: categories,
    overheadPerUnit,
  };
}

/**
 * Activity-Based Costing (ABC) overhead calculation
 */
function calculateActivityBasedOverhead(inputs: ManufacturingOverheadInputs): ManufacturingOverheadOutput {
  const { unitsToBeProduced, directLaborHours, numberOfProductionRuns, numberOfInspections, machineHours } = inputs;

  // Unit-level costs (vary with units)
  let unitLevelCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  if (inputs.indirectMaterialsPerUnit) {
    unitLevelCosts.q1 = unitsToBeProduced.q1 * inputs.indirectMaterialsPerUnit;
    unitLevelCosts.q2 = unitsToBeProduced.q2 * inputs.indirectMaterialsPerUnit;
    unitLevelCosts.q3 = unitsToBeProduced.q3 * inputs.indirectMaterialsPerUnit;
    unitLevelCosts.q4 = unitsToBeProduced.q4 * inputs.indirectMaterialsPerUnit;
  }

  if (inputs.qualityControlPerUnit) {
    unitLevelCosts.q1 += unitsToBeProduced.q1 * inputs.qualityControlPerUnit;
    unitLevelCosts.q2 += unitsToBeProduced.q2 * inputs.qualityControlPerUnit;
    unitLevelCosts.q3 += unitsToBeProduced.q3 * inputs.qualityControlPerUnit;
    unitLevelCosts.q4 += unitsToBeProduced.q4 * inputs.qualityControlPerUnit;
  }

  if (machineHours && inputs.costPerMachineHour) {
    unitLevelCosts.q1 += machineHours.q1 * inputs.costPerMachineHour;
    unitLevelCosts.q2 += machineHours.q2 * inputs.costPerMachineHour;
    unitLevelCosts.q3 += machineHours.q3 * inputs.costPerMachineHour;
    unitLevelCosts.q4 += machineHours.q4 * inputs.costPerMachineHour;
  }

  unitLevelCosts.yearly = unitLevelCosts.q1 + unitLevelCosts.q2 + unitLevelCosts.q3 + unitLevelCosts.q4;

  // Batch-level costs (vary with production runs/batches)
  let batchLevelCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  if (numberOfProductionRuns && inputs.costPerProductionRun) {
    batchLevelCosts.q1 = numberOfProductionRuns.q1 * inputs.costPerProductionRun;
    batchLevelCosts.q2 = numberOfProductionRuns.q2 * inputs.costPerProductionRun;
    batchLevelCosts.q3 = numberOfProductionRuns.q3 * inputs.costPerProductionRun;
    batchLevelCosts.q4 = numberOfProductionRuns.q4 * inputs.costPerProductionRun;
    batchLevelCosts.yearly = batchLevelCosts.q1 + batchLevelCosts.q2 + batchLevelCosts.q3 + batchLevelCosts.q4;
  }

  // Product-level costs (inspections, quality, etc.)
  let productLevelCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  if (numberOfInspections && inputs.costPerInspection) {
    productLevelCosts.q1 = numberOfInspections.q1 * inputs.costPerInspection;
    productLevelCosts.q2 = numberOfInspections.q2 * inputs.costPerInspection;
    productLevelCosts.q3 = numberOfInspections.q3 * inputs.costPerInspection;
    productLevelCosts.q4 = numberOfInspections.q4 * inputs.costPerInspection;
  }

  if (inputs.qualityControlLabor) {
    productLevelCosts.q1 += inputs.qualityControlLabor;
    productLevelCosts.q2 += inputs.qualityControlLabor;
    productLevelCosts.q3 += inputs.qualityControlLabor;
    productLevelCosts.q4 += inputs.qualityControlLabor;
  }

  productLevelCosts.yearly = productLevelCosts.q1 + productLevelCosts.q2 + productLevelCosts.q3 + productLevelCosts.q4;

  // Facility-level costs (fixed costs)
  let facilityLevelCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  const facilityCosts = [
    inputs.facilityRent || 0,
    inputs.facilityInsurance || 0,
    inputs.propertyTaxes || 0,
    inputs.utilities && !inputs.utilitiesIsVariable ? inputs.utilities : 0,
    inputs.supervisorySalaries || 0,
    inputs.supportStaffSalaries || 0,
    inputs.shopSuppliesPerQuarter || 0,
    inputs.plannedMaintenancePerQuarter || 0,
    inputs.technologyCosts || 0,
    inputs.warehouseCosts || 0,
    inputs.environmentalComplianceCosts || 0,
    inputs.depreciationPerQuarter || 0,
  ];

  const facilityTotal = facilityCosts.reduce((a, b) => a + b, 0);
  facilityLevelCosts = {
    q1: facilityTotal,
    q2: facilityTotal,
    q3: facilityTotal,
    q4: facilityTotal,
    yearly: facilityTotal * 4,
  };

  // Calculate totals
  const totalOverhead: QuarterlyData = {
    q1: unitLevelCosts.q1 + batchLevelCosts.q1 + productLevelCosts.q1 + facilityLevelCosts.q1,
    q2: unitLevelCosts.q2 + batchLevelCosts.q2 + productLevelCosts.q2 + facilityLevelCosts.q2,
    q3: unitLevelCosts.q3 + batchLevelCosts.q3 + productLevelCosts.q3 + facilityLevelCosts.q3,
    q4: unitLevelCosts.q4 + batchLevelCosts.q4 + productLevelCosts.q4 + facilityLevelCosts.q4,
    yearly: unitLevelCosts.yearly + batchLevelCosts.yearly + productLevelCosts.yearly + facilityLevelCosts.yearly,
  };

  // Separate variable and fixed
  const variableOverhead: QuarterlyData = {
    q1: unitLevelCosts.q1 + batchLevelCosts.q1,
    q2: unitLevelCosts.q2 + batchLevelCosts.q2,
    q3: unitLevelCosts.q3 + batchLevelCosts.q3,
    q4: unitLevelCosts.q4 + batchLevelCosts.q4,
    yearly: unitLevelCosts.yearly + batchLevelCosts.yearly,
  };

  const fixedOverhead: QuarterlyData = {
    q1: productLevelCosts.q1 + facilityLevelCosts.q1,
    q2: productLevelCosts.q2 + facilityLevelCosts.q2,
    q3: productLevelCosts.q3 + facilityLevelCosts.q3,
    q4: productLevelCosts.q4 + facilityLevelCosts.q4,
    yearly: productLevelCosts.yearly + facilityLevelCosts.yearly,
  };

  const depreciationPerQuarter = inputs.depreciationPerQuarter || 0;
  const depreciation: QuarterlyData = {
    q1: depreciationPerQuarter,
    q2: depreciationPerQuarter,
    q3: depreciationPerQuarter,
    q4: depreciationPerQuarter,
    yearly: depreciationPerQuarter * 4,
  };

  const cashDisbursements: QuarterlyData = {
    q1: totalOverhead.q1 - depreciation.q1,
    q2: totalOverhead.q2 - depreciation.q2,
    q3: totalOverhead.q3 - depreciation.q3,
    q4: totalOverhead.q4 - depreciation.q4,
    yearly: totalOverhead.yearly - depreciation.yearly,
  };

  const overheadPerUnit: QuarterlyData = {
    q1: unitsToBeProduced.q1 > 0 ? totalOverhead.q1 / unitsToBeProduced.q1 : 0,
    q2: unitsToBeProduced.q2 > 0 ? totalOverhead.q2 / unitsToBeProduced.q2 : 0,
    q3: unitsToBeProduced.q3 > 0 ? totalOverhead.q3 / unitsToBeProduced.q3 : 0,
    q4: unitsToBeProduced.q4 > 0 ? totalOverhead.q4 / unitsToBeProduced.q4 : 0,
    yearly: unitsToBeProduced.yearly > 0 ? totalOverhead.yearly / unitsToBeProduced.yearly : 0,
  };

  return {
    productionUnits: unitsToBeProduced,
    directLaborHours,
    variableOverhead,
    fixedOverhead,
    totalOverhead,
    depreciation,
    cashDisbursements,
    unitLevelCosts,
    batchLevelCosts,
    productLevelCosts,
    facilityLevelCosts,
    overheadPerUnit,
  };
}

/**
 * Format Manufacturing Overhead Budget output for display
 */
export function formatManufacturingOverheadBudgetForDisplay(output: ManufacturingOverheadOutput): any {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const headers = ['Description', 'Q1', 'Q2', 'Q3', 'Q4', 'Yearly'];

  // Main table rows
  const rows = [
    {
      label: 'Units to be Produced',
      q1: formatNumber(output.productionUnits.q1),
      q2: formatNumber(output.productionUnits.q2),
      q3: formatNumber(output.productionUnits.q3),
      q4: formatNumber(output.productionUnits.q4),
      yearly: formatNumber(output.productionUnits.yearly),
    },
  ];

  if (output.directLaborHours) {
    rows.push({
      label: 'Direct Labor Hours',
      q1: formatNumber(output.directLaborHours.q1),
      q2: formatNumber(output.directLaborHours.q2),
      q3: formatNumber(output.directLaborHours.q3),
      q4: formatNumber(output.directLaborHours.q4),
      yearly: formatNumber(output.directLaborHours.yearly),
    });
  }

  rows.push({
    label: 'Variable Manufacturing Overhead',
    q1: formatNumber(output.variableOverhead.q1),
    q2: formatNumber(output.variableOverhead.q2),
    q3: formatNumber(output.variableOverhead.q3),
    q4: formatNumber(output.variableOverhead.q4),
    yearly: formatNumber(output.variableOverhead.yearly),
  });

  rows.push({
    label: 'Fixed Manufacturing Overhead',
    q1: formatNumber(output.fixedOverhead.q1),
    q2: formatNumber(output.fixedOverhead.q2),
    q3: formatNumber(output.fixedOverhead.q3),
    q4: formatNumber(output.fixedOverhead.q4),
    yearly: formatNumber(output.fixedOverhead.yearly),
  });

  rows.push({
    label: 'Total Manufacturing Overhead',
    q1: formatNumber(output.totalOverhead.q1),
    q2: formatNumber(output.totalOverhead.q2),
    q3: formatNumber(output.totalOverhead.q3),
    q4: formatNumber(output.totalOverhead.q4),
    yearly: formatNumber(output.totalOverhead.yearly),
  });

  rows.push({
    label: 'Less: Depreciation',
    q1: formatNumber(output.depreciation.q1),
    q2: formatNumber(output.depreciation.q2),
    q3: formatNumber(output.depreciation.q3),
    q4: formatNumber(output.depreciation.q4),
    yearly: formatNumber(output.depreciation.yearly),
  });

  rows.push({
    label: 'Cash Disbursements for Overhead',
    q1: formatNumber(output.cashDisbursements.q1),
    q2: formatNumber(output.cashDisbursements.q2),
    q3: formatNumber(output.cashDisbursements.q3),
    q4: formatNumber(output.cashDisbursements.q4),
    yearly: formatNumber(output.cashDisbursements.yearly),
  });

  return {
    headers,
    rows,
    overheadCategories: output.overheadCategories,
    abcBreakdown: output.unitLevelCosts ? {
      unitLevel: output.unitLevelCosts,
      batchLevel: output.batchLevelCosts,
      productLevel: output.productLevelCosts,
      facilityLevel: output.facilityLevelCosts,
    } : undefined,
    overheadPerUnit: output.overheadPerUnit,
    predeterminedRate: output.predeterminedOverheadRate,
  };
}

