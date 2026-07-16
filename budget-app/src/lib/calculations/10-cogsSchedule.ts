import {
  COGSInputs,
  COGSOutput,
  DirectMaterialBudgetOutput,
  DirectLabourBudgetOutput,
  ManufacturingOverheadOutput,
  ProductionBudgetOutput
} from '../types/budgets';

/**
 * Schedule 10: Cost of Goods Manufactured & Sold
 *
 * Purpose: Calculate the total cost of producing and selling goods
 *
 * This schedule combines all manufacturing costs to determine:
 * - Cost of Goods Manufactured (total production cost for the period)
 * - Cost of Goods Sold (cost of units actually sold)
 *
 * Key Formulas:
 * - Total Manufacturing Cost = Direct Materials Used + Direct Labor + Manufacturing Overhead
 * - Cost of Goods Manufactured = Beginning WIP + Total Manufacturing Cost - Ending WIP
 * - Cost of Goods Available for Sale = Beginning FG Inventory + Cost of Goods Manufactured
 * - Cost of Goods Sold = Cost of Goods Available - Ending FG Inventory
 * - Cost per Unit = Cost of Goods Manufactured ÷ Units Produced
 *
 * Based on Ronald W. Hilton's Managerial Accounting framework
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates inputs for COGS calculation
 */
function validateCOGSInputs(
  materialData: DirectMaterialBudgetOutput | null,
  laborData: DirectLabourBudgetOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  productionData: ProductionBudgetOutput | null,
  inputs: COGSInputs
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required schedules
  if (!materialData) {
    errors.push('Direct Materials data (Schedule 3) is required for COGS calculation');
  }

  if (!laborData) {
    errors.push('Direct Labor data (Schedule 4) is required for COGS calculation');
  }

  if (!overheadData) {
    errors.push('Manufacturing Overhead data (Schedule 5) is required for COGS calculation');
  }

  if (!productionData) {
    errors.push('Production data (Schedule 2) is required for COGS calculation');
  }

  // Validate inventory values
  if (inputs.beginningWIPInventory < 0) {
    errors.push('Beginning Work-in-Process inventory cannot be negative');
  }

  if (inputs.endingWIPInventory < 0) {
    errors.push('Ending Work-in-Process inventory cannot be negative');
  }

  if (inputs.beginningFinishedGoodsInventory < 0) {
    errors.push('Beginning Finished Goods inventory cannot be negative');
  }

  if (inputs.endingFinishedGoodsInventory < 0) {
    errors.push('Ending Finished Goods inventory cannot be negative');
  }

  // Warnings
  if (inputs.beginningWIPInventory === 0 && inputs.endingWIPInventory === 0) {
    warnings.push('No Work-in-Process inventory - assuming all production is completed within each period');
  }

  if (inputs.beginningFinishedGoodsInventory === 0) {
    warnings.push('Beginning Finished Goods inventory is zero - no carryover from prior period');
  }

  // Check for reasonable inventory levels
  if (productionData && inputs.endingFinishedGoodsInventory > (productionData.requiredProduction.yearly * 0.5)) {
    warnings.push('Ending Finished Goods inventory seems high (>50% of annual production)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate Cost of Goods Manufactured & Sold (Schedule 10)
 */
export function calculateCOGS(
  materialData: DirectMaterialBudgetOutput | null,
  laborData: DirectLabourBudgetOutput | null,
  overheadData: ManufacturingOverheadOutput | null,
  productionData: ProductionBudgetOutput | null,
  inputs: COGSInputs
): { output: COGSOutput | null; validation: ValidationResult } {
  const validation = validateCOGSInputs(materialData, laborData, overheadData, productionData, inputs);

  if (!validation.isValid || !materialData || !laborData || !overheadData || !productionData) {
    return { output: null, validation };
  }

  // === STEP 1: Direct Materials Used ===
  // For simplicity, using total material cost from Schedule 3
  // In a more detailed version, this would be: Beginning Raw Materials + Purchases - Ending Raw Materials
  const directMaterialUsed = materialData.totalMaterialPurchaseCost.yearly;

  // === STEP 2: Direct Labor ===
  const directLabor = laborData.totalLaborCost.yearly;

  // === STEP 3: Manufacturing Overhead ===
  const manufacturingOverhead = overheadData.totalOverhead.yearly;

  // === STEP 4: Total Manufacturing Cost ===
  const totalManufacturingCost = directMaterialUsed + directLabor + manufacturingOverhead;

  // === STEP 5: Cost of Goods Manufactured ===
  // Beginning WIP + Total Manufacturing Cost - Ending WIP
  const costOfGoodsManufactured =
    inputs.beginningWIPInventory + totalManufacturingCost - inputs.endingWIPInventory;

  // === STEP 6: Cost of Goods Available for Sale ===
  // Beginning FG Inventory + Cost of Goods Manufactured
  const costOfGoodsAvailableForSale =
    inputs.beginningFinishedGoodsInventory + costOfGoodsManufactured;

  // === STEP 7: Cost of Goods Sold ===
  // Cost of Goods Available - Ending FG Inventory
  const costOfGoodsSold =
    costOfGoodsAvailableForSale - inputs.endingFinishedGoodsInventory;

  // === STEP 8: Calculate Per-Unit Metrics ===
  const unitsProduced = productionData.requiredProduction.yearly;
  const costPerUnitManufactured = unitsProduced > 0 ? costOfGoodsManufactured / unitsProduced : 0;

  // Assuming units sold from production data (produced - increase in FG inventory)
  const inventoryChange = inputs.endingFinishedGoodsInventory - inputs.beginningFinishedGoodsInventory;
  const unitsSold = unitsProduced - inventoryChange;
  const costPerUnitSold = unitsSold > 0 ? costOfGoodsSold / unitsSold : 0;

  const output: COGSOutput = {
    // Manufacturing costs
    directMaterial: directMaterialUsed,
    directLabor: directLabor,
    manufacturingOverhead: manufacturingOverhead,
    totalManufacturingCost: totalManufacturingCost,

    // Work-in-Process
    beginningWIPInventory: inputs.beginningWIPInventory,
    endingWIPInventory: inputs.endingWIPInventory,
    costOfGoodsManufactured: costOfGoodsManufactured,

    // Finished Goods
    beginningFinishedGoodsInventory: inputs.beginningFinishedGoodsInventory,
    endingFinishedGoodsInventory: inputs.endingFinishedGoodsInventory,
    costOfGoodsAvailableForSale: costOfGoodsAvailableForSale,
    costOfGoodsSold: costOfGoodsSold,

    // Per-unit metrics
    unitsProduced: unitsProduced,
    unitsSold: unitsSold,
    costPerUnitManufactured: costPerUnitManufactured,
    costPerUnitSold: costPerUnitSold,
  };

  return { output, validation };
}

/**
 * Format COGS output for display
 */
export function formatCOGSOutput(output: COGSOutput): Array<{
  label: string;
  amount: string;
}> {
  const format = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = [];

  // Manufacturing Costs Section
  rows.push({ label: 'MANUFACTURING COSTS', amount: '' });
  rows.push({ label: 'Direct Materials Used', amount: format(output.directMaterial) });
  rows.push({ label: 'Direct Labor', amount: format(output.directLabor) });
  rows.push({ label: 'Manufacturing Overhead', amount: format(output.manufacturingOverhead) });
  rows.push({ label: '', amount: '' });
  rows.push({ label: 'Total Manufacturing Cost', amount: format(output.totalManufacturingCost) });

  // Work-in-Process Section
  rows.push({ label: '', amount: '' });
  rows.push({ label: 'WORK-IN-PROCESS INVENTORY', amount: '' });
  rows.push({ label: 'Add: Beginning WIP Inventory', amount: format(output.beginningWIPInventory) });
  rows.push({ label: 'Less: Ending WIP Inventory', amount: `(${format(output.endingWIPInventory)})` });
  rows.push({ label: '', amount: '' });
  rows.push({ label: 'Cost of Goods Manufactured', amount: format(output.costOfGoodsManufactured) });

  // Finished Goods Section
  rows.push({ label: '', amount: '' });
  rows.push({ label: 'FINISHED GOODS INVENTORY', amount: '' });
  rows.push({ label: 'Add: Beginning Finished Goods Inventory', amount: format(output.beginningFinishedGoodsInventory) });
  rows.push({ label: 'Cost of Goods Available for Sale', amount: format(output.costOfGoodsAvailableForSale) });
  rows.push({ label: 'Less: Ending Finished Goods Inventory', amount: `(${format(output.endingFinishedGoodsInventory)})` });
  rows.push({ label: '', amount: '' });
  rows.push({ label: 'Cost of Goods Sold', amount: format(output.costOfGoodsSold) });

  // Per-Unit Metrics
  rows.push({ label: '', amount: '' });
  rows.push({ label: 'PER-UNIT METRICS', amount: '' });
  rows.push({ label: 'Units Produced', amount: format(output.unitsProduced) });
  rows.push({ label: 'Units Sold', amount: format(output.unitsSold) });
  rows.push({ label: 'Cost per Unit Manufactured', amount: format(output.costPerUnitManufactured) });
  rows.push({ label: 'Cost per Unit Sold', amount: format(output.costPerUnitSold) });

  return rows;
}

/**
 * Export COGS to CSV format
 */
export function exportCOGSToCSV(
  output: COGSOutput,
  companyName: string,
  productName: string,
  fiscalYear: string
): string {
  const rows = formatCOGSOutput(output);

  let csv = `${companyName}\n`;
  csv += `Schedule 10: Cost of Goods Manufactured & Sold\n`;
  csv += `Product: ${productName}\n`;
  csv += `Fiscal Year: ${fiscalYear}\n\n`;

  csv += 'Item,Amount\n';

  rows.forEach(row => {
    csv += `"${row.label}",${row.amount}\n`;
  });

  return csv;
}

