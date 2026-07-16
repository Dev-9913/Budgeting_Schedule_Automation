/**
 * SCHEDULE 2: PRODUCTION BUDGET
 *
 * Determines production volume needed to meet sales demand and maintain desired inventory levels.
 * Based on Ronald W. Hilton's Managerial Accounting framework.
 *
 * Core Formula:
 * Units to be Produced = Forecasted Sales + Desired Ending Inventory - Beginning Inventory
 *
 * Key Considerations:
 * - Inventory buffer strategy
 * - Production capacity constraints
 * - Batch size optimization
 * - Just-in-Time (JIT) manufacturing
 * - Obsolescence risk for short shelf-life products
 * - Lead time adjustments
 */

import type { ProductionBudgetInputs, ProductionBudgetOutput, QuarterlyData } from '../types/budgets';

export function calculateProductionBudget(inputs: ProductionBudgetInputs): ProductionBudgetOutput {
  const {
    forecastedSalesUnits,
    beginningInventory,
    desiredEndingInventoryRatio,
    nextYearQ1ForecastedSales,
    maxProductionCapacityPerQuarter,
    minimumBatchSize,
    optimalBatchSize,
    inventoryCarryingCostPerUnit,
    useJIT = false,
    obsolescenceRiskPercentage,
  } = inputs;

  // Calculate desired ending inventory for each quarter
  const desiredEndingInventory: QuarterlyData = {
    q1: useJIT ? 0 : forecastedSalesUnits.q2 * desiredEndingInventoryRatio,
    q2: useJIT ? 0 : forecastedSalesUnits.q3 * desiredEndingInventoryRatio,
    q3: useJIT ? 0 : forecastedSalesUnits.q4 * desiredEndingInventoryRatio,
    q4: useJIT ? 0 : (nextYearQ1ForecastedSales || forecastedSalesUnits.q1) * desiredEndingInventoryRatio,
    yearly: 0,
  };

  // Q4's ending inventory becomes the yearly ending inventory
  desiredEndingInventory.yearly = desiredEndingInventory.q4;

  // Calculate beginning inventory for each quarter
  const beginningInventoryQuarterly: QuarterlyData = {
    q1: beginningInventory,
    q2: desiredEndingInventory.q1,
    q3: desiredEndingInventory.q2,
    q4: desiredEndingInventory.q3,
    yearly: beginningInventory,
  };

  // Calculate total units required (Sales + Desired Ending Inventory)
  const totalUnitsRequired: QuarterlyData = {
    q1: forecastedSalesUnits.q1 + desiredEndingInventory.q1,
    q2: forecastedSalesUnits.q2 + desiredEndingInventory.q2,
    q3: forecastedSalesUnits.q3 + desiredEndingInventory.q3,
    q4: forecastedSalesUnits.q4 + desiredEndingInventory.q4,
    yearly: 0,
  };
  totalUnitsRequired.yearly = totalUnitsRequired.q1 + totalUnitsRequired.q2 + totalUnitsRequired.q3 + totalUnitsRequired.q4;

  // Calculate required production (Total Required - Beginning Inventory)
  let requiredProduction: QuarterlyData = {
    q1: totalUnitsRequired.q1 - beginningInventoryQuarterly.q1,
    q2: totalUnitsRequired.q2 - beginningInventoryQuarterly.q2,
    q3: totalUnitsRequired.q3 - beginningInventoryQuarterly.q3,
    q4: totalUnitsRequired.q4 - beginningInventoryQuarterly.q4,
    yearly: 0,
  };
  requiredProduction.yearly = requiredProduction.q1 + requiredProduction.q2 + requiredProduction.q3 + requiredProduction.q4;

  // Apply batch size adjustments if specified
  let batchAdjustments: QuarterlyData | undefined;
  if (minimumBatchSize || optimalBatchSize) {
    batchAdjustments = applyBatchSizeAdjustments(requiredProduction, minimumBatchSize, optimalBatchSize);
    requiredProduction = batchAdjustments;
  }

  // Calculate capacity utilization if max capacity is specified
  let capacityUtilization: QuarterlyData | undefined;
  if (maxProductionCapacityPerQuarter) {
    capacityUtilization = {
      q1: (requiredProduction.q1 / maxProductionCapacityPerQuarter) * 100,
      q2: (requiredProduction.q2 / maxProductionCapacityPerQuarter) * 100,
      q3: (requiredProduction.q3 / maxProductionCapacityPerQuarter) * 100,
      q4: (requiredProduction.q4 / maxProductionCapacityPerQuarter) * 100,
      yearly: (requiredProduction.yearly / (maxProductionCapacityPerQuarter * 4)) * 100,
    };
  }

  // Calculate inventory carrying cost if specified
  let inventoryCarryingCost: QuarterlyData | undefined;
  if (inventoryCarryingCostPerUnit) {
    inventoryCarryingCost = {
      q1: desiredEndingInventory.q1 * inventoryCarryingCostPerUnit,
      q2: desiredEndingInventory.q2 * inventoryCarryingCostPerUnit,
      q3: desiredEndingInventory.q3 * inventoryCarryingCostPerUnit,
      q4: desiredEndingInventory.q4 * inventoryCarryingCostPerUnit,
      yearly: 0,
    };
    inventoryCarryingCost.yearly =
      inventoryCarryingCost.q1 + inventoryCarryingCost.q2 + inventoryCarryingCost.q3 + inventoryCarryingCost.q4;
  }

  // Calculate obsolescence cost if specified
  let obsolescenceCost: QuarterlyData | undefined;
  if (obsolescenceRiskPercentage && inventoryCarryingCostPerUnit) {
    obsolescenceCost = {
      q1: desiredEndingInventory.q1 * inventoryCarryingCostPerUnit * obsolescenceRiskPercentage,
      q2: desiredEndingInventory.q2 * inventoryCarryingCostPerUnit * obsolescenceRiskPercentage,
      q3: desiredEndingInventory.q3 * inventoryCarryingCostPerUnit * obsolescenceRiskPercentage,
      q4: desiredEndingInventory.q4 * inventoryCarryingCostPerUnit * obsolescenceRiskPercentage,
      yearly: 0,
    };
    obsolescenceCost.yearly =
      obsolescenceCost.q1 + obsolescenceCost.q2 + obsolescenceCost.q3 + obsolescenceCost.q4;
  }

  // Calculate production efficiency (if optimal batch size specified)
  let productionEfficiency: QuarterlyData | undefined;
  if (optimalBatchSize) {
    productionEfficiency = {
      q1: calculateEfficiency(requiredProduction.q1, optimalBatchSize),
      q2: calculateEfficiency(requiredProduction.q2, optimalBatchSize),
      q3: calculateEfficiency(requiredProduction.q3, optimalBatchSize),
      q4: calculateEfficiency(requiredProduction.q4, optimalBatchSize),
      yearly: calculateEfficiency(requiredProduction.yearly, optimalBatchSize * 4),
    };
  }

  return {
    salesUnits: forecastedSalesUnits,
    desiredEndingInventory,
    totalUnitsRequired,
    beginningInventory: beginningInventoryQuarterly,
    requiredProduction,
    capacityUtilization,
    inventoryCarryingCost,
    batchAdjustments,
    obsolescenceCost,
    productionEfficiency,
  };
}

/**
 * Apply batch size constraints to production volumes
 */
function applyBatchSizeAdjustments(
  production: QuarterlyData,
  minBatchSize?: number,
  optimalBatchSize?: number
): QuarterlyData {
  const adjustProduction = (units: number): number => {
    if (!minBatchSize && !optimalBatchSize) return units;

    const targetBatch = optimalBatchSize || minBatchSize || units;

    // Round up to nearest batch size
    const batches = Math.ceil(units / targetBatch);
    return batches * targetBatch;
  };

  const adjusted = {
    q1: adjustProduction(production.q1),
    q2: adjustProduction(production.q2),
    q3: adjustProduction(production.q3),
    q4: adjustProduction(production.q4),
    yearly: 0,
  };
  adjusted.yearly = adjusted.q1 + adjusted.q2 + adjusted.q3 + adjusted.q4;

  return adjusted;
}

/**
 * Calculate production efficiency (how close to optimal batch production)
 */
function calculateEfficiency(actualProduction: number, optimalBatch: number): number {
  if (actualProduction === 0 || optimalBatch === 0) return 100;

  const batches = actualProduction / optimalBatch;
  const wholeBatches = Math.floor(batches);
  const fractionalPart = batches - wholeBatches;

  // Efficiency is 100% if production is exactly N batches, lower if partial batch
  if (fractionalPart === 0) return 100;

  return ((wholeBatches + fractionalPart) / Math.ceil(batches)) * 100;
}

/**
 * Validation function for Production Budget inputs
 */
export function validateProductionBudgetInputs(inputs: ProductionBudgetInputs): string[] {
  const errors: string[] = [];

  // Validate sales units
  if (inputs.forecastedSalesUnits.q1 < 0) errors.push('Q1 sales units cannot be negative');
  if (inputs.forecastedSalesUnits.q2 < 0) errors.push('Q2 sales units cannot be negative');
  if (inputs.forecastedSalesUnits.q3 < 0) errors.push('Q3 sales units cannot be negative');
  if (inputs.forecastedSalesUnits.q4 < 0) errors.push('Q4 sales units cannot be negative');

  // Validate beginning inventory
  if (inputs.beginningInventory < 0) {
    errors.push('Beginning inventory cannot be negative');
  }

  // Validate inventory ratio
  if (inputs.desiredEndingInventoryRatio < 0) {
    errors.push('Desired ending inventory ratio cannot be negative');
  }
  if (inputs.desiredEndingInventoryRatio > 1) {
    errors.push('WARNING: Ending inventory ratio over 100% is unusually high. This means you plan to hold more than one quarter\'s sales in stock.');
  }

  // Validate production capacity
  if (inputs.maxProductionCapacityPerQuarter !== undefined) {
    if (inputs.maxProductionCapacityPerQuarter <= 0) {
      errors.push('Maximum production capacity must be greater than zero');
    }

    // Check if any quarter exceeds capacity
    const totalRequired = [
      inputs.forecastedSalesUnits.q1,
      inputs.forecastedSalesUnits.q2,
      inputs.forecastedSalesUnits.q3,
      inputs.forecastedSalesUnits.q4,
    ];

    totalRequired.forEach((units, idx) => {
      if (units > inputs.maxProductionCapacityPerQuarter!) {
        errors.push(`WARNING: Q${idx + 1} sales (${units}) exceed production capacity (${inputs.maxProductionCapacityPerQuarter}). You may need to build inventory in advance.`);
      }
    });
  }

  // Validate batch sizes
  if (inputs.minimumBatchSize !== undefined && inputs.minimumBatchSize <= 0) {
    errors.push('Minimum batch size must be greater than zero');
  }
  if (inputs.optimalBatchSize !== undefined && inputs.optimalBatchSize <= 0) {
    errors.push('Optimal batch size must be greater than zero');
  }
  if (inputs.minimumBatchSize && inputs.optimalBatchSize) {
    if (inputs.minimumBatchSize > inputs.optimalBatchSize) {
      errors.push('Minimum batch size cannot be greater than optimal batch size');
    }
  }

  // Validate inventory carrying cost
  if (inputs.inventoryCarryingCostPerUnit !== undefined && inputs.inventoryCarryingCostPerUnit < 0) {
    errors.push('Inventory carrying cost cannot be negative');
  }

  // Validate obsolescence percentage
  if (inputs.obsolescenceRiskPercentage !== undefined) {
    if (inputs.obsolescenceRiskPercentage < 0 || inputs.obsolescenceRiskPercentage > 1) {
      errors.push('Obsolescence risk percentage must be between 0 and 1 (0% to 100%)');
    }
  }

  // JIT warnings
  if (inputs.useJIT && inputs.desiredEndingInventoryRatio > 0) {
    errors.push('WARNING: Just-in-Time (JIT) mode is enabled but inventory ratio is set. JIT will override inventory settings and keep inventory at zero.');
  }

  return errors;
}

/**
 * Format Production Budget for display
 */
export function formatProductionBudgetForDisplay(output: ProductionBudgetOutput, inputs?: ProductionBudgetInputs) {
  const rows = [
    {
      label: 'Forecasted Sales (Units)',
      q1: output.salesUnits.q1.toFixed(2),
      q2: output.salesUnits.q2.toFixed(2),
      q3: output.salesUnits.q3.toFixed(2),
      q4: output.salesUnits.q4.toFixed(2),
      yearly: output.salesUnits.yearly.toFixed(2),
    },
    {
      label: 'Add: Desired Ending Inventory',
      q1: output.desiredEndingInventory.q1.toFixed(2),
      q2: output.desiredEndingInventory.q2.toFixed(2),
      q3: output.desiredEndingInventory.q3.toFixed(2),
      q4: output.desiredEndingInventory.q4.toFixed(2),
      yearly: output.desiredEndingInventory.yearly.toFixed(2),
    },
    {
      label: 'Total Units Required',
      q1: output.totalUnitsRequired.q1.toFixed(2),
      q2: output.totalUnitsRequired.q2.toFixed(2),
      q3: output.totalUnitsRequired.q3.toFixed(2),
      q4: output.totalUnitsRequired.q4.toFixed(2),
      yearly: output.totalUnitsRequired.yearly.toFixed(2),
    },
    {
      label: 'Less: Beginning Inventory',
      q1: output.beginningInventory.q1.toFixed(2),
      q2: output.beginningInventory.q2.toFixed(2),
      q3: output.beginningInventory.q3.toFixed(2),
      q4: output.beginningInventory.q4.toFixed(2),
      yearly: output.beginningInventory.yearly.toFixed(2),
    },
    {
      label: 'Required Production',
      q1: output.requiredProduction.q1.toFixed(2),
      q2: output.requiredProduction.q2.toFixed(2),
      q3: output.requiredProduction.q3.toFixed(2),
      q4: output.requiredProduction.q4.toFixed(2),
      yearly: output.requiredProduction.yearly.toFixed(2),
    },
  ];

  // Add capacity utilization if available
  if (output.capacityUtilization) {
    rows.push({
      label: 'Capacity Utilization (%)',
      q1: output.capacityUtilization.q1.toFixed(1) + '%',
      q2: output.capacityUtilization.q2.toFixed(1) + '%',
      q3: output.capacityUtilization.q3.toFixed(1) + '%',
      q4: output.capacityUtilization.q4.toFixed(1) + '%',
      yearly: output.capacityUtilization.yearly.toFixed(1) + '%',
    });
  }

  // Add production efficiency if available
  if (output.productionEfficiency) {
    rows.push({
      label: 'Production Efficiency (%)',
      q1: output.productionEfficiency.q1.toFixed(1) + '%',
      q2: output.productionEfficiency.q2.toFixed(1) + '%',
      q3: output.productionEfficiency.q3.toFixed(1) + '%',
      q4: output.productionEfficiency.q4.toFixed(1) + '%',
      yearly: output.productionEfficiency.yearly.toFixed(1) + '%',
    });
  }

  return {
    headers: ['', 'Q1 (Oct-Dec)', 'Q2 (Jan-Mar)', 'Q3 (Apr-Jun)', 'Q4 (Jul-Sep)', 'Yearly Total'],
    rows,
    inventoryCarryingCost: output.inventoryCarryingCost,
    obsolescenceCost: output.obsolescenceCost,
    notes: inputs?.nextYearQ1ForecastedSales
      ? `Note: Q4 ending inventory is based on next year's Q1 forecasted sales of ${inputs.nextYearQ1ForecastedSales} units.`
      : 'Note: Q4 ending inventory is based on current year Q1 sales (assuming similar demand pattern next year).',
  };
}

