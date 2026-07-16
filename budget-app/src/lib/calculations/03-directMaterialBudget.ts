/**
 * SCHEDULE 3: DIRECT-MATERIAL BUDGET
 *
 * Calculates the quantity and cost of raw materials to be purchased during the budget period.
 * Based on Ronald W. Hilton's Managerial Accounting framework.
 *
 * Core Formula:
 * Material Required for Production = Units to Produce × Material per Unit
 * Total Material Required = Required + Desired Ending Inventory
 * Material to Purchase = Total Required - Beginning Inventory
 * Total Cost = Material to Purchase × Cost per Unit
 *
 * Key Considerations:
 * - Link between production and material purchases
 * - Buffer inventory management (typically % of next period's needs)
 * - Multiple material types (fabric, poles, components, etc.)
 * - JIT delivery for some materials (no ending inventory)
 * - Scrap/waste allowances
 * - Bulk purchase discounts
 * - Supplier lead times
 * - Price inflation adjustments
 */

import type { DirectMaterialBudgetInputs, DirectMaterialBudgetOutput, MaterialBudgetDetail, QuarterlyData, MaterialType } from '../types/budgets';

export function calculateDirectMaterialBudget(inputs: DirectMaterialBudgetInputs): DirectMaterialBudgetOutput {
  const { unitsToBeProduced, nextYearQ1Production, materials, percentPaidInCurrentQuarter, percentPaidInNextQuarter } = inputs;

  const materialDetails: MaterialBudgetDetail[] = [];
  let totalScrapWasteCost: QuarterlyData | undefined;
  let totalBulkDiscountSavings: QuarterlyData | undefined;
  const criticalMaterials: string[] = [];

  // Process each material type
  materials.forEach((material) => {
    const detail = calculateMaterialDetail(material, unitsToBeProduced, nextYearQ1Production);
    materialDetails.push(detail);

    // Aggregate scrap costs
    if (detail.scrapWasteCost) {
      if (!totalScrapWasteCost) {
        totalScrapWasteCost = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
      }
      totalScrapWasteCost.q1 += detail.scrapWasteCost.q1;
      totalScrapWasteCost.q2 += detail.scrapWasteCost.q2;
      totalScrapWasteCost.q3 += detail.scrapWasteCost.q3;
      totalScrapWasteCost.q4 += detail.scrapWasteCost.q4;
      totalScrapWasteCost.yearly += detail.scrapWasteCost.yearly;
    }

    // Aggregate bulk discount savings
    if (detail.bulkDiscountSavings) {
      if (!totalBulkDiscountSavings) {
        totalBulkDiscountSavings = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
      }
      totalBulkDiscountSavings.q1 += detail.bulkDiscountSavings.q1;
      totalBulkDiscountSavings.q2 += detail.bulkDiscountSavings.q2;
      totalBulkDiscountSavings.q3 += detail.bulkDiscountSavings.q3;
      totalBulkDiscountSavings.q4 += detail.bulkDiscountSavings.q4;
      totalBulkDiscountSavings.yearly += detail.bulkDiscountSavings.yearly;
    }

    // Identify critical materials (low turnover or high shortage risk)
    if (detail.inventoryTurnoverRatio && detail.inventoryTurnoverRatio < 4) {
      criticalMaterials.push(`${material.name} (low turnover: ${detail.inventoryTurnoverRatio.toFixed(1)}x)`);
    }
    if (detail.daysInventoryOutstanding && detail.daysInventoryOutstanding > 90) {
      criticalMaterials.push(`${material.name} (high inventory days: ${detail.daysInventoryOutstanding.toFixed(0)})`);
    }
  });

  // Calculate total material purchase cost (sum of all materials)
  const totalMaterialPurchaseCost: QuarterlyData = {
    q1: materialDetails.reduce((sum, m) => sum + m.totalPurchaseCost.q1, 0),
    q2: materialDetails.reduce((sum, m) => sum + m.totalPurchaseCost.q2, 0),
    q3: materialDetails.reduce((sum, m) => sum + m.totalPurchaseCost.q3, 0),
    q4: materialDetails.reduce((sum, m) => sum + m.totalPurchaseCost.q4, 0),
    yearly: 0,
  };
  totalMaterialPurchaseCost.yearly = totalMaterialPurchaseCost.q1 + totalMaterialPurchaseCost.q2 + totalMaterialPurchaseCost.q3 + totalMaterialPurchaseCost.q4;

  // Calculate cash disbursements if payment terms provided
  let cashDisbursements: QuarterlyData | undefined;
  if (percentPaidInCurrentQuarter !== undefined && percentPaidInNextQuarter !== undefined) {
    cashDisbursements = calculateCashDisbursements(totalMaterialPurchaseCost, percentPaidInCurrentQuarter, percentPaidInNextQuarter);
  }

  // Calculate overall inventory turnover
  const overallInventoryTurnover = calculateOverallTurnover(materialDetails);

  return {
    materials: materialDetails,
    totalMaterialPurchaseCost,
    cashDisbursements,
    totalScrapWasteCost,
    totalBulkDiscountSavings,
    overallInventoryTurnover,
    criticalMaterials: criticalMaterials.length > 0 ? criticalMaterials : undefined,
  };
}

function calculateMaterialDetail(
  material: MaterialType,
  unitsToBeProduced: QuarterlyData,
  nextYearQ1Production?: number
): MaterialBudgetDetail {
  const { requiredPerUnit, costPerUnit, beginningInventory, desiredEndingInventoryRatio, scrapWastePercentage, useJIT, priceInflationRate, bulkDiscountThreshold, bulkDiscountRate } = material;

  // Step 1: Calculate material required for production (including scrap/waste)
  const wasteMultiplier = 1 + (scrapWastePercentage || 0);
  const materialRequiredForProduction: QuarterlyData = {
    q1: unitsToBeProduced.q1 * requiredPerUnit * wasteMultiplier,
    q2: unitsToBeProduced.q2 * requiredPerUnit * wasteMultiplier,
    q3: unitsToBeProduced.q3 * requiredPerUnit * wasteMultiplier,
    q4: unitsToBeProduced.q4 * requiredPerUnit * wasteMultiplier,
    yearly: unitsToBeProduced.yearly * requiredPerUnit * wasteMultiplier,
  };

  // Step 2: Calculate desired ending inventory (% of next quarter's production needs)
  const q1NextProduction = unitsToBeProduced.q2;
  const q2NextProduction = unitsToBeProduced.q3;
  const q3NextProduction = unitsToBeProduced.q4;
  const q4NextProduction = nextYearQ1Production || unitsToBeProduced.q1;

  const desiredEndingInventory: QuarterlyData = {
    q1: useJIT ? 0 : q1NextProduction * requiredPerUnit * wasteMultiplier * desiredEndingInventoryRatio,
    q2: useJIT ? 0 : q2NextProduction * requiredPerUnit * wasteMultiplier * desiredEndingInventoryRatio,
    q3: useJIT ? 0 : q3NextProduction * requiredPerUnit * wasteMultiplier * desiredEndingInventoryRatio,
    q4: useJIT ? 0 : q4NextProduction * requiredPerUnit * wasteMultiplier * desiredEndingInventoryRatio,
    yearly: 0,
  };
  desiredEndingInventory.yearly = desiredEndingInventory.q4;

  // Step 3: Calculate total material required
  const totalMaterialRequired: QuarterlyData = {
    q1: materialRequiredForProduction.q1 + desiredEndingInventory.q1,
    q2: materialRequiredForProduction.q2 + desiredEndingInventory.q2,
    q3: materialRequiredForProduction.q3 + desiredEndingInventory.q3,
    q4: materialRequiredForProduction.q4 + desiredEndingInventory.q4,
    yearly: 0,
  };
  totalMaterialRequired.yearly = totalMaterialRequired.q1 + totalMaterialRequired.q2 + totalMaterialRequired.q3 + totalMaterialRequired.q4;

  // Step 4: Calculate beginning inventory (cascading)
  const beginningInventoryQuarterly: QuarterlyData = {
    q1: beginningInventory,
    q2: desiredEndingInventory.q1,
    q3: desiredEndingInventory.q2,
    q4: desiredEndingInventory.q3,
    yearly: beginningInventory,
  };

  // Step 5: Calculate material to be purchased
  const materialToBePurchased: QuarterlyData = {
    q1: totalMaterialRequired.q1 - beginningInventoryQuarterly.q1,
    q2: totalMaterialRequired.q2 - beginningInventoryQuarterly.q2,
    q3: totalMaterialRequired.q3 - beginningInventoryQuarterly.q3,
    q4: totalMaterialRequired.q4 - beginningInventoryQuarterly.q4,
    yearly: 0,
  };
  materialToBePurchased.yearly = materialToBePurchased.q1 + materialToBePurchased.q2 + materialToBePurchased.q3 + materialToBePurchased.q4;

  // Step 6: Calculate cost per unit (with inflation and bulk discounts)
  const costPerUnitQuarterly = calculateCostPerUnit(costPerUnit, priceInflationRate, bulkDiscountThreshold, bulkDiscountRate, materialToBePurchased);

  // Step 7: Calculate total purchase cost
  const totalPurchaseCost: QuarterlyData = {
    q1: materialToBePurchased.q1 * costPerUnitQuarterly.q1,
    q2: materialToBePurchased.q2 * costPerUnitQuarterly.q2,
    q3: materialToBePurchased.q3 * costPerUnitQuarterly.q3,
    q4: materialToBePurchased.q4 * costPerUnitQuarterly.q4,
    yearly: 0,
  };
  totalPurchaseCost.yearly = totalPurchaseCost.q1 + totalPurchaseCost.q2 + totalPurchaseCost.q3 + totalPurchaseCost.q4;

  // Optional: Calculate scrap/waste cost
  let scrapWasteCost: QuarterlyData | undefined;
  if (scrapWastePercentage && scrapWastePercentage > 0) {
    const scrapAmount = {
      q1: unitsToBeProduced.q1 * requiredPerUnit * scrapWastePercentage,
      q2: unitsToBeProduced.q2 * requiredPerUnit * scrapWastePercentage,
      q3: unitsToBeProduced.q3 * requiredPerUnit * scrapWastePercentage,
      q4: unitsToBeProduced.q4 * requiredPerUnit * scrapWastePercentage,
      yearly: 0,
    };
    scrapAmount.yearly = scrapAmount.q1 + scrapAmount.q2 + scrapAmount.q3 + scrapAmount.q4;

    scrapWasteCost = {
      q1: scrapAmount.q1 * costPerUnit,
      q2: scrapAmount.q2 * costPerUnit,
      q3: scrapAmount.q3 * costPerUnit,
      q4: scrapAmount.q4 * costPerUnit,
      yearly: scrapAmount.yearly * costPerUnit,
    };
  }

  // Optional: Calculate bulk discount savings
  let bulkDiscountSavings: QuarterlyData | undefined;
  if (bulkDiscountThreshold && bulkDiscountRate) {
    bulkDiscountSavings = {
      q1: materialToBePurchased.q1 >= bulkDiscountThreshold ? materialToBePurchased.q1 * costPerUnit * bulkDiscountRate : 0,
      q2: materialToBePurchased.q2 >= bulkDiscountThreshold ? materialToBePurchased.q2 * costPerUnit * bulkDiscountRate : 0,
      q3: materialToBePurchased.q3 >= bulkDiscountThreshold ? materialToBePurchased.q3 * costPerUnit * bulkDiscountRate : 0,
      q4: materialToBePurchased.q4 >= bulkDiscountThreshold ? materialToBePurchased.q4 * costPerUnit * bulkDiscountRate : 0,
      yearly: 0,
    };
    bulkDiscountSavings.yearly = bulkDiscountSavings.q1 + bulkDiscountSavings.q2 + bulkDiscountSavings.q3 + bulkDiscountSavings.q4;
  }

  // Optional: Calculate inventory turnover ratio
  const avgInventory = (beginningInventory + desiredEndingInventory.yearly) / 2;
  const inventoryTurnoverRatio = avgInventory > 0 ? materialRequiredForProduction.yearly / avgInventory : undefined;
  const daysInventoryOutstanding = inventoryTurnoverRatio ? 365 / inventoryTurnoverRatio : undefined;

  return {
    name: material.name,
    unit: material.unit,
    productionNeeds: unitsToBeProduced,
    materialRequiredForProduction,
    desiredEndingInventory,
    totalMaterialRequired,
    beginningInventory: beginningInventoryQuarterly,
    materialToBePurchased,
    costPerUnit: costPerUnitQuarterly,
    totalPurchaseCost,
    scrapWasteCost,
    bulkDiscountSavings,
    inventoryTurnoverRatio,
    daysInventoryOutstanding,
  };
}

function calculateCostPerUnit(
  baseCost: number,
  inflationRate: number | undefined,
  bulkThreshold: number | undefined,
  bulkDiscountRate: number | undefined,
  purchases: QuarterlyData
): QuarterlyData {
  const quarterlyInflation = (inflationRate || 0) / 4;

  let costPerUnit: QuarterlyData = {
    q1: baseCost,
    q2: baseCost * (1 + quarterlyInflation),
    q3: baseCost * (1 + quarterlyInflation * 2),
    q4: baseCost * (1 + quarterlyInflation * 3),
    yearly: 0,
  };

  // Apply bulk discounts if applicable
  if (bulkThreshold && bulkDiscountRate) {
    if (purchases.q1 >= bulkThreshold) costPerUnit.q1 *= (1 - bulkDiscountRate);
    if (purchases.q2 >= bulkThreshold) costPerUnit.q2 *= (1 - bulkDiscountRate);
    if (purchases.q3 >= bulkThreshold) costPerUnit.q3 *= (1 - bulkDiscountRate);
    if (purchases.q4 >= bulkThreshold) costPerUnit.q4 *= (1 - bulkDiscountRate);
  }

  // Calculate weighted average for yearly
  const totalPurchases = purchases.q1 + purchases.q2 + purchases.q3 + purchases.q4;
  if (totalPurchases > 0) {
    costPerUnit.yearly = (
      (purchases.q1 * costPerUnit.q1 +
       purchases.q2 * costPerUnit.q2 +
       purchases.q3 * costPerUnit.q3 +
       purchases.q4 * costPerUnit.q4) / totalPurchases
    );
  } else {
    costPerUnit.yearly = baseCost;
  }

  return costPerUnit;
}

function calculateCashDisbursements(
  totalCost: QuarterlyData,
  percentCurrentQuarter: number,
  percentNextQuarter: number
): QuarterlyData {
  // Assume Q4 of prior year had same purchases as Q4 of current year (for Q1 calculation)
  const priorQ4 = totalCost.q4;

  return {
    q1: (priorQ4 * percentNextQuarter) + (totalCost.q1 * percentCurrentQuarter),
    q2: (totalCost.q1 * percentNextQuarter) + (totalCost.q2 * percentCurrentQuarter),
    q3: (totalCost.q2 * percentNextQuarter) + (totalCost.q3 * percentCurrentQuarter),
    q4: (totalCost.q3 * percentNextQuarter) + (totalCost.q4 * percentCurrentQuarter),
    yearly: totalCost.yearly, // All will be paid by year end
  };
}

function calculateOverallTurnover(materials: MaterialBudgetDetail[]): number | undefined {
  const turnovers = materials
    .map(m => m.inventoryTurnoverRatio)
    .filter((t): t is number => t !== undefined);

  if (turnovers.length === 0) return undefined;

  return turnovers.reduce((sum, t) => sum + t, 0) / turnovers.length;
}

/**
 * Validation function for Direct Material Budget inputs
 */
export function validateDirectMaterialBudgetInputs(inputs: DirectMaterialBudgetInputs): string[] {
  const errors: string[] = [];

  // Validate production units
  if (inputs.unitsToBeProduced.q1 < 0) errors.push('Q1 production units cannot be negative');
  if (inputs.unitsToBeProduced.q2 < 0) errors.push('Q2 production units cannot be negative');
  if (inputs.unitsToBeProduced.q3 < 0) errors.push('Q3 production units cannot be negative');
  if (inputs.unitsToBeProduced.q4 < 0) errors.push('Q4 production units cannot be negative');

  // Validate materials array
  if (!inputs.materials || inputs.materials.length === 0) {
    errors.push('At least one material type must be specified');
    return errors;
  }

  // Validate each material
  inputs.materials.forEach((material, idx) => {
    const prefix = inputs.materials.length > 1 ? `Material "${material.name}": ` : '';

    if (!material.name || material.name.trim() === '') {
      errors.push(`${prefix}Material name cannot be empty`);
    }

    if (material.requiredPerUnit <= 0) {
      errors.push(`${prefix}Material required per unit must be greater than zero`);
    }

    if (material.costPerUnit <= 0) {
      errors.push(`${prefix}Cost per unit must be greater than zero`);
    }

    if (material.beginningInventory < 0) {
      errors.push(`${prefix}Beginning inventory cannot be negative`);
    }

    if (material.desiredEndingInventoryRatio < 0) {
      errors.push(`${prefix}Ending inventory ratio cannot be negative`);
    }

    if (material.desiredEndingInventoryRatio > 1) {
      errors.push(`WARNING: ${prefix}Ending inventory ratio over 100% is unusually high`);
    }

    if (material.scrapWastePercentage !== undefined) {
      if (material.scrapWastePercentage < 0 || material.scrapWastePercentage > 0.5) {
        errors.push(`${prefix}Scrap/waste percentage should be between 0% and 50%`);
      }
      if (material.scrapWastePercentage > 0.2) {
        errors.push(`WARNING: ${prefix}Scrap/waste over 20% is very high. Consider process improvements.`);
      }
    }

    if (material.priceInflationRate !== undefined) {
      if (material.priceInflationRate < -0.5 || material.priceInflationRate > 1) {
        errors.push(`${prefix}Price inflation rate seems unrealistic`);
      }
    }

    if (material.bulkDiscountThreshold !== undefined && material.bulkDiscountRate !== undefined) {
      if (material.bulkDiscountThreshold <= 0) {
        errors.push(`${prefix}Bulk discount threshold must be greater than zero`);
      }
      if (material.bulkDiscountRate < 0 || material.bulkDiscountRate > 0.5) {
        errors.push(`${prefix}Bulk discount rate should be between 0% and 50%`);
      }
    }

    if (material.supplierLeadTimeDays !== undefined && material.supplierLeadTimeDays < 0) {
      errors.push(`${prefix}Supplier lead time cannot be negative`);
    }

    if (material.useJIT && material.desiredEndingInventoryRatio > 0) {
      errors.push(`WARNING: ${prefix}JIT is enabled but ending inventory ratio is set. JIT will override inventory settings.`);
    }
  });

  // Validate payment terms
  if (inputs.percentPaidInCurrentQuarter !== undefined || inputs.percentPaidInNextQuarter !== undefined) {
    const currentPct = inputs.percentPaidInCurrentQuarter || 0;
    const nextPct = inputs.percentPaidInNextQuarter || 0;

    if (currentPct < 0 || currentPct > 1) {
      errors.push('Percent paid in current quarter must be between 0 and 1');
    }
    if (nextPct < 0 || nextPct > 1) {
      errors.push('Percent paid in next quarter must be between 0 and 1');
    }

    const totalPct = currentPct + nextPct;
    if (Math.abs(totalPct - 1) > 0.01) {
      errors.push(`Payment percentages must add up to 100%. Currently: ${(totalPct * 100).toFixed(1)}%`);
    }
  }

  return errors;
}

/**
 * Format Direct Material Budget for display
 */
export function formatDirectMaterialBudgetForDisplay(output: DirectMaterialBudgetOutput) {
  const materialSections = output.materials.map(material => {
    const rows = [
      {
        label: `Units to be produced`,
        q1: material.productionNeeds.q1.toFixed(0),
        q2: material.productionNeeds.q2.toFixed(0),
        q3: material.productionNeeds.q3.toFixed(0),
        q4: material.productionNeeds.q4.toFixed(0),
        yearly: material.productionNeeds.yearly.toFixed(0),
      },
      {
        label: `${material.unit.charAt(0).toUpperCase() + material.unit.slice(1)} required per unit`,
        q1: (material.materialRequiredForProduction.q1 / material.productionNeeds.q1 || 0).toFixed(2),
        q2: (material.materialRequiredForProduction.q2 / material.productionNeeds.q2 || 0).toFixed(2),
        q3: (material.materialRequiredForProduction.q3 / material.productionNeeds.q3 || 0).toFixed(2),
        q4: (material.materialRequiredForProduction.q4 / material.productionNeeds.q4 || 0).toFixed(2),
        yearly: (material.materialRequiredForProduction.yearly / material.productionNeeds.yearly || 0).toFixed(2),
      },
      {
        label: `Material required for production (${material.unit})`,
        q1: material.materialRequiredForProduction.q1.toFixed(2),
        q2: material.materialRequiredForProduction.q2.toFixed(2),
        q3: material.materialRequiredForProduction.q3.toFixed(2),
        q4: material.materialRequiredForProduction.q4.toFixed(2),
        yearly: material.materialRequiredForProduction.yearly.toFixed(2),
      },
      {
        label: `Add: Desired ending inventory (${material.unit})`,
        q1: material.desiredEndingInventory.q1.toFixed(2),
        q2: material.desiredEndingInventory.q2.toFixed(2),
        q3: material.desiredEndingInventory.q3.toFixed(2),
        q4: material.desiredEndingInventory.q4.toFixed(2),
        yearly: material.desiredEndingInventory.yearly.toFixed(2),
      },
      {
        label: `Total material required (${material.unit})`,
        q1: material.totalMaterialRequired.q1.toFixed(2),
        q2: material.totalMaterialRequired.q2.toFixed(2),
        q3: material.totalMaterialRequired.q3.toFixed(2),
        q4: material.totalMaterialRequired.q4.toFixed(2),
        yearly: material.totalMaterialRequired.yearly.toFixed(2),
      },
      {
        label: `Less: Beginning inventory (${material.unit})`,
        q1: material.beginningInventory.q1.toFixed(2),
        q2: material.beginningInventory.q2.toFixed(2),
        q3: material.beginningInventory.q3.toFixed(2),
        q4: material.beginningInventory.q4.toFixed(2),
        yearly: material.beginningInventory.yearly.toFixed(2),
      },
      {
        label: `Material to be purchased (${material.unit})`,
        q1: material.materialToBePurchased.q1.toFixed(2),
        q2: material.materialToBePurchased.q2.toFixed(2),
        q3: material.materialToBePurchased.q3.toFixed(2),
        q4: material.materialToBePurchased.q4.toFixed(2),
        yearly: material.materialToBePurchased.yearly.toFixed(2),
      },
      {
        label: `Cost per ${material.unit}`,
        q1: material.costPerUnit.q1.toFixed(2),
        q2: material.costPerUnit.q2.toFixed(2),
        q3: material.costPerUnit.q3.toFixed(2),
        q4: material.costPerUnit.q4.toFixed(2),
        yearly: material.costPerUnit.yearly.toFixed(2),
      },
      {
        label: `Total purchase cost`,
        q1: material.totalPurchaseCost.q1.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        q2: material.totalPurchaseCost.q2.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        q3: material.totalPurchaseCost.q3.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        q4: material.totalPurchaseCost.q4.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        yearly: material.totalPurchaseCost.yearly.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      },
    ];

    return {
      name: material.name,
      unit: material.unit,
      rows,
      scrapWasteCost: material.scrapWasteCost,
      bulkDiscountSavings: material.bulkDiscountSavings,
      inventoryTurnoverRatio: material.inventoryTurnoverRatio,
      daysInventoryOutstanding: material.daysInventoryOutstanding,
    };
  });

  const totalRow = {
    label: 'Total raw material purchases',
    q1: output.totalMaterialPurchaseCost.q1.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    q2: output.totalMaterialPurchaseCost.q2.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    q3: output.totalMaterialPurchaseCost.q3.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    q4: output.totalMaterialPurchaseCost.q4.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    yearly: output.totalMaterialPurchaseCost.yearly.toLocaleString('en-US', { minimumFractionDigits: 2 }),
  };

  // Format materials with headers for each
  const materials = materialSections.map(section => ({
    ...section,
    headers: ['', 'Q1 (Oct-Dec)', 'Q2 (Jan-Mar)', 'Q3 (Apr-Jun)', 'Q4 (Jul-Sep)', 'Yearly Total'],
  }));

  // Format summary section
  const summary = {
    headers: ['', 'Q1 (Oct-Dec)', 'Q2 (Jan-Mar)', 'Q3 (Apr-Jun)', 'Q4 (Jul-Sep)', 'Yearly Total'],
    rows: [totalRow],
  };

  // Format analytics
  const analytics = {
    overallInventoryTurnover: output.overallInventoryTurnover,
    totalScrapWasteCost: output.totalScrapWasteCost?.yearly,
    totalBulkDiscountSavings: output.totalBulkDiscountSavings?.yearly,
    criticalMaterials: output.criticalMaterials,
  };

  return {
    materials,
    summary,
    analytics,
    cashDisbursements: output.cashDisbursements,
  };
}

