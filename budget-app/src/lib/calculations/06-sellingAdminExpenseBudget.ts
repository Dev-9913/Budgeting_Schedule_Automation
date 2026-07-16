/**
 * SCHEDULE 6: SELLING, GENERAL & ADMINISTRATIVE (SG&A) EXPENSE BUDGET
 *
 * Purpose:
 * Plans all non-manufacturing operating expenses including sales, marketing,
 * distribution, and administration.
 *
 * Key Formulas:
 * - Variable SGA = Sales Units × Commission Rate + Other variable SGA
 * - Fixed SGA = Sum of all fixed expenses (salaries, rent, insurance, etc.)
 * - Total SGA Expense = Variable SGA + Fixed SGA
 * - Sales Commissions = Sales Revenue × Commission %
 * - Distribution Costs = Sales Units × Cost per Unit + Fixed Charges
 * - SGA as % of Sales = Total SGA ÷ Sales Revenue
 *
 * Based on Ronald W. Hilton's Managerial Accounting Framework
 */

import type {
  SellingAdminExpenseInputs,
  SellingAdminExpenseOutput,
  QuarterlyData,
  SalesPersonnelDetail,
  DistributionChannelDetail,
  DepartmentBudgetDetail,
} from '../types/budgets';

/**
 * Validate inputs for SG&A Expense Budget
 */
export function validateSellingAdminExpenseInputs(inputs: SellingAdminExpenseInputs): string[] {
  const errors: string[] = [];

  // Check if using simple or detailed approach
  const hasSimpleInputs = inputs.useSimpleApproach && (
    inputs.variableSellingExpenseRate !== undefined ||
    inputs.variableAdminExpenseRate !== undefined ||
    inputs.fixedSellingExpensePerQuarter !== undefined ||
    inputs.fixedAdminExpensePerQuarter !== undefined
  );

  const hasDetailedInputs = (
    inputs.salesPersonnelCategories ||
    inputs.distributionChannels ||
    inputs.departmentBudgets ||
    inputs.commissionRate !== undefined ||
    inputs.advertisingBudgetPerQuarter !== undefined ||
    inputs.executiveSalaries !== undefined
  );

  if (!hasSimpleInputs && !hasDetailedInputs) {
    errors.push('Either provide simple approach rates OR detailed expense inputs');
  }

  // If using detailed approach, need sales data
  if (hasDetailedInputs && !hasSimpleInputs) {
    if (!inputs.salesRevenue && !inputs.salesUnits) {
      errors.push('Sales revenue or sales units required for detailed SG&A calculations (from Schedule 1)');
    }
  }

  // Validate sales personnel categories
  if (inputs.salesPersonnelCategories) {
    inputs.salesPersonnelCategories.forEach((cat, idx) => {
      if (!cat.name || cat.name.trim() === '') {
        errors.push(`Sales personnel category ${idx + 1}: Name is required`);
      }
      if (cat.numberOfPersonnel < 0) {
        errors.push(`Sales personnel category "${cat.name}": Number of personnel cannot be negative`);
      }
      if (cat.baseSalaryPerPerson < 0) {
        errors.push(`Sales personnel category "${cat.name}": Salary cannot be negative`);
      }
    });
  }

  // Validate distribution channels
  if (inputs.distributionChannels) {
    inputs.distributionChannels.forEach((channel, idx) => {
      if (!channel.name || channel.name.trim() === '') {
        errors.push(`Distribution channel ${idx + 1}: Name is required`);
      }
    });
  }

  // Warnings for optional enhancements
  if (!inputs.badDebtRate && inputs.salesRevenue) {
    errors.push('WARNING: Consider adding bad debt rate for uncollectible accounts');
  }

  if (!inputs.customerAcquisitionCostPerCustomer && inputs.newCustomersPerQuarter) {
    errors.push('WARNING: Customer acquisition cost provided but no cost per customer specified');
  }

  return errors;
}

/**
 * Main calculation function for SG&A Expense Budget
 */
export function calculateSellingAdminExpenseBudget(inputs: SellingAdminExpenseInputs): SellingAdminExpenseOutput {
  // If simple approach, use simplified calculation
  if (inputs.useSimpleApproach) {
    return calculateSimpleSGA(inputs);
  }

  // Otherwise, use detailed calculation
  return calculateDetailedSGA(inputs);
}

/**
 * Simple SG&A calculation (percentage-based)
 */
function calculateSimpleSGA(inputs: SellingAdminExpenseInputs): SellingAdminExpenseOutput {
  const salesRevenue = inputs.salesRevenue || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const salesUnits = inputs.salesUnits || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  const varSellingRate = inputs.variableSellingExpenseRate || 0;
  const varAdminRate = inputs.variableAdminExpenseRate || 0;
  const fixedSellingPerQ = inputs.fixedSellingExpensePerQuarter || 0;
  const fixedAdminPerQ = inputs.fixedAdminExpensePerQuarter || 0;

  // Calculate variable expenses as % of sales
  const variableExpenses: QuarterlyData = {
    q1: salesRevenue.q1 * (varSellingRate + varAdminRate),
    q2: salesRevenue.q2 * (varSellingRate + varAdminRate),
    q3: salesRevenue.q3 * (varSellingRate + varAdminRate),
    q4: salesRevenue.q4 * (varSellingRate + varAdminRate),
    yearly: 0,
  };
  variableExpenses.yearly = variableExpenses.q1 + variableExpenses.q2 + variableExpenses.q3 + variableExpenses.q4;

  // Fixed expenses (per quarter)
  const fixedExpenses: QuarterlyData = {
    q1: fixedSellingPerQ + fixedAdminPerQ,
    q2: fixedSellingPerQ + fixedAdminPerQ,
    q3: fixedSellingPerQ + fixedAdminPerQ,
    q4: fixedSellingPerQ + fixedAdminPerQ,
    yearly: (fixedSellingPerQ + fixedAdminPerQ) * 4,
  };

  // Total SG&A
  const totalSGAExpenses: QuarterlyData = {
    q1: variableExpenses.q1 + fixedExpenses.q1,
    q2: variableExpenses.q2 + fixedExpenses.q2,
    q3: variableExpenses.q3 + fixedExpenses.q3,
    q4: variableExpenses.q4 + fixedExpenses.q4,
    yearly: variableExpenses.yearly + fixedExpenses.yearly,
  };

  return {
    salesRevenue,
    salesUnits,
    totalVariableExpenses: variableExpenses,
    totalFixedExpenses: fixedExpenses,
    totalSGAExpenses,
  };
}

/**
 * Detailed SG&A calculation with all categories
 */
function calculateDetailedSGA(inputs: SellingAdminExpenseInputs): SellingAdminExpenseOutput {
  const salesRevenue = inputs.salesRevenue || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  const salesUnits = inputs.salesUnits || { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  // ====================================================================
  // SELLING EXPENSES
  // ====================================================================

  // Sales Personnel Costs
  let salesPersonnelCosts: SalesPersonnelDetail[] = [];
  let totalSalesPersonnelCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  let salesCommissions: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  let salesSalariesAndBenefits: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  if (inputs.salesPersonnelCategories && inputs.salesPersonnelCategories.length > 0) {
    inputs.salesPersonnelCategories.forEach(cat => {
      const baseSalaries: QuarterlyData = {
        q1: cat.numberOfPersonnel * cat.baseSalaryPerPerson,
        q2: cat.numberOfPersonnel * cat.baseSalaryPerPerson,
        q3: cat.numberOfPersonnel * cat.baseSalaryPerPerson,
        q4: cat.numberOfPersonnel * cat.baseSalaryPerPerson,
        yearly: cat.numberOfPersonnel * cat.baseSalaryPerPerson * 4,
      };

      const benefits: QuarterlyData = {
        q1: baseSalaries.q1 * (cat.benefitRate || 0),
        q2: baseSalaries.q2 * (cat.benefitRate || 0),
        q3: baseSalaries.q3 * (cat.benefitRate || 0),
        q4: baseSalaries.q4 * (cat.benefitRate || 0),
        yearly: 0,
      };
      benefits.yearly = benefits.q1 + benefits.q2 + benefits.q3 + benefits.q4;

      // Calculate commissions based on type
      const commissions: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
      if (cat.commissionRate && cat.commissionRate > 0) {
        if (cat.commissionType === 'revenue') {
          commissions.q1 = salesRevenue.q1 * cat.commissionRate;
          commissions.q2 = salesRevenue.q2 * cat.commissionRate;
          commissions.q3 = salesRevenue.q3 * cat.commissionRate;
          commissions.q4 = salesRevenue.q4 * cat.commissionRate;
        } else {
          // units-based
          commissions.q1 = salesUnits.q1 * cat.commissionRate;
          commissions.q2 = salesUnits.q2 * cat.commissionRate;
          commissions.q3 = salesUnits.q3 * cat.commissionRate;
          commissions.q4 = salesUnits.q4 * cat.commissionRate;
        }
        commissions.yearly = commissions.q1 + commissions.q2 + commissions.q3 + commissions.q4;
      }

      const totalCost: QuarterlyData = {
        q1: baseSalaries.q1 + benefits.q1 + commissions.q1,
        q2: baseSalaries.q2 + benefits.q2 + commissions.q2,
        q3: baseSalaries.q3 + benefits.q3 + commissions.q3,
        q4: baseSalaries.q4 + benefits.q4 + commissions.q4,
        yearly: 0,
      };
      totalCost.yearly = totalCost.q1 + totalCost.q2 + totalCost.q3 + totalCost.q4;

      salesPersonnelCosts.push({
        name: cat.name,
        numberOfPersonnel: cat.numberOfPersonnel,
        baseSalaries,
        benefits,
        commissions,
        totalCost,
      });

      // Accumulate totals
      totalSalesPersonnelCosts.q1 += totalCost.q1;
      totalSalesPersonnelCosts.q2 += totalCost.q2;
      totalSalesPersonnelCosts.q3 += totalCost.q3;
      totalSalesPersonnelCosts.q4 += totalCost.q4;

      salesCommissions.q1 += commissions.q1;
      salesCommissions.q2 += commissions.q2;
      salesCommissions.q3 += commissions.q3;
      salesCommissions.q4 += commissions.q4;

      salesSalariesAndBenefits.q1 += baseSalaries.q1 + benefits.q1;
      salesSalariesAndBenefits.q2 += baseSalaries.q2 + benefits.q2;
      salesSalariesAndBenefits.q3 += baseSalaries.q3 + benefits.q3;
      salesSalariesAndBenefits.q4 += baseSalaries.q4 + benefits.q4;
    });

    totalSalesPersonnelCosts.yearly = totalSalesPersonnelCosts.q1 + totalSalesPersonnelCosts.q2 + totalSalesPersonnelCosts.q3 + totalSalesPersonnelCosts.q4;
    salesCommissions.yearly = salesCommissions.q1 + salesCommissions.q2 + salesCommissions.q3 + salesCommissions.q4;
    salesSalariesAndBenefits.yearly = salesSalariesAndBenefits.q1 + salesSalariesAndBenefits.q2 + salesSalariesAndBenefits.q3 + salesSalariesAndBenefits.q4;
  } else {
    // Simple commission calculation
    if (inputs.commissionRate) {
      salesCommissions = {
        q1: salesRevenue.q1 * inputs.commissionRate,
        q2: salesRevenue.q2 * inputs.commissionRate,
        q3: salesRevenue.q3 * inputs.commissionRate,
        q4: salesRevenue.q4 * inputs.commissionRate,
        yearly: 0,
      };
      salesCommissions.yearly = salesCommissions.q1 + salesCommissions.q2 + salesCommissions.q3 + salesCommissions.q4;
      totalSalesPersonnelCosts = { ...salesCommissions };
    } else if (inputs.commissionPerUnit) {
      salesCommissions = {
        q1: salesUnits.q1 * inputs.commissionPerUnit,
        q2: salesUnits.q2 * inputs.commissionPerUnit,
        q3: salesUnits.q3 * inputs.commissionPerUnit,
        q4: salesUnits.q4 * inputs.commissionPerUnit,
        yearly: 0,
      };
      salesCommissions.yearly = salesCommissions.q1 + salesCommissions.q2 + salesCommissions.q3 + salesCommissions.q4;
      totalSalesPersonnelCosts = { ...salesCommissions };
    }
  }

  // Distribution Costs
  let distributionChannelCosts: DistributionChannelDetail[] = [];
  let distributionVariableCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  let distributionFixedCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };

  if (inputs.distributionChannels && inputs.distributionChannels.length > 0) {
    inputs.distributionChannels.forEach(channel => {
      const variableCosts: QuarterlyData = {
        q1: salesUnits.q1 * (channel.variableCostPerUnit || 0),
        q2: salesUnits.q2 * (channel.variableCostPerUnit || 0),
        q3: salesUnits.q3 * (channel.variableCostPerUnit || 0),
        q4: salesUnits.q4 * (channel.variableCostPerUnit || 0),
        yearly: 0,
      };
      variableCosts.yearly = variableCosts.q1 + variableCosts.q2 + variableCosts.q3 + variableCosts.q4;

      const fixedCosts: QuarterlyData = {
        q1: channel.fixedCostPerQuarter || 0,
        q2: channel.fixedCostPerQuarter || 0,
        q3: channel.fixedCostPerQuarter || 0,
        q4: channel.fixedCostPerQuarter || 0,
        yearly: (channel.fixedCostPerQuarter || 0) * 4,
      };

      const totalCost: QuarterlyData = {
        q1: variableCosts.q1 + fixedCosts.q1,
        q2: variableCosts.q2 + fixedCosts.q2,
        q3: variableCosts.q3 + fixedCosts.q3,
        q4: variableCosts.q4 + fixedCosts.q4,
        yearly: 0,
      };
      totalCost.yearly = totalCost.q1 + totalCost.q2 + totalCost.q3 + totalCost.q4;

      distributionChannelCosts.push({
        name: channel.name,
        variableCosts,
        fixedCosts,
        totalCost,
      });

      distributionVariableCosts.q1 += variableCosts.q1;
      distributionVariableCosts.q2 += variableCosts.q2;
      distributionVariableCosts.q3 += variableCosts.q3;
      distributionVariableCosts.q4 += variableCosts.q4;

      distributionFixedCosts.q1 += fixedCosts.q1;
      distributionFixedCosts.q2 += fixedCosts.q2;
      distributionFixedCosts.q3 += fixedCosts.q3;
      distributionFixedCosts.q4 += fixedCosts.q4;
    });

    distributionVariableCosts.yearly = distributionVariableCosts.q1 + distributionVariableCosts.q2 + distributionVariableCosts.q3 + distributionVariableCosts.q4;
    distributionFixedCosts.yearly = distributionFixedCosts.q1 + distributionFixedCosts.q2 + distributionFixedCosts.q3 + distributionFixedCosts.q4;
  } else {
    // Simple distribution calculation
    if (inputs.distributionCostPerUnit) {
      distributionVariableCosts = {
        q1: salesUnits.q1 * inputs.distributionCostPerUnit,
        q2: salesUnits.q2 * inputs.distributionCostPerUnit,
        q3: salesUnits.q3 * inputs.distributionCostPerUnit,
        q4: salesUnits.q4 * inputs.distributionCostPerUnit,
        yearly: 0,
      };
      distributionVariableCosts.yearly = distributionVariableCosts.q1 + distributionVariableCosts.q2 + distributionVariableCosts.q3 + distributionVariableCosts.q4;
    }
    if (inputs.distributionFixedCostPerQuarter) {
      distributionFixedCosts = {
        q1: inputs.distributionFixedCostPerQuarter,
        q2: inputs.distributionFixedCostPerQuarter,
        q3: inputs.distributionFixedCostPerQuarter,
        q4: inputs.distributionFixedCostPerQuarter,
        yearly: inputs.distributionFixedCostPerQuarter * 4,
      };
    }
  }

  const totalDistributionCosts: QuarterlyData = {
    q1: distributionVariableCosts.q1 + distributionFixedCosts.q1,
    q2: distributionVariableCosts.q2 + distributionFixedCosts.q2,
    q3: distributionVariableCosts.q3 + distributionFixedCosts.q3,
    q4: distributionVariableCosts.q4 + distributionFixedCosts.q4,
    yearly: distributionVariableCosts.yearly + distributionFixedCosts.yearly,
  };

  // Customer Service Costs
  const customerServiceCosts: QuarterlyData = {
    q1: (inputs.customerServiceSalaries || 0) +
        (salesUnits.q1 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    q2: (inputs.customerServiceSalaries || 0) +
        (salesUnits.q2 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    q3: (inputs.customerServiceSalaries || 0) +
        (salesUnits.q3 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    q4: (inputs.customerServiceSalaries || 0) +
        (salesUnits.q4 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    yearly: 0,
  };
  customerServiceCosts.yearly = customerServiceCosts.q1 + customerServiceCosts.q2 + customerServiceCosts.q3 + customerServiceCosts.q4;

  // Customer Acquisition Costs
  let customerAcquisitionCosts: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  if (inputs.customerAcquisitionCostPerCustomer && inputs.newCustomersPerQuarter) {
    customerAcquisitionCosts = {
      q1: inputs.newCustomersPerQuarter.q1 * inputs.customerAcquisitionCostPerCustomer,
      q2: inputs.newCustomersPerQuarter.q2 * inputs.customerAcquisitionCostPerCustomer,
      q3: inputs.newCustomersPerQuarter.q3 * inputs.customerAcquisitionCostPerCustomer,
      q4: inputs.newCustomersPerQuarter.q4 * inputs.customerAcquisitionCostPerCustomer,
      yearly: 0,
    };
    customerAcquisitionCosts.yearly = customerAcquisitionCosts.q1 + customerAcquisitionCosts.q2 + customerAcquisitionCosts.q3 + customerAcquisitionCosts.q4;
  }

  // Total Selling Expenses
  const totalVariableSellingExpenses: QuarterlyData = {
    q1: salesCommissions.q1 + distributionVariableCosts.q1 +
        (salesUnits.q1 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    q2: salesCommissions.q2 + distributionVariableCosts.q2 +
        (salesUnits.q2 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    q3: salesCommissions.q3 + distributionVariableCosts.q3 +
        (salesUnits.q3 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    q4: salesCommissions.q4 + distributionVariableCosts.q4 +
        (salesUnits.q4 * ((inputs.warrantyExpensePerUnit || 0) + (inputs.returnProcessingPerUnit || 0))),
    yearly: 0,
  };
  totalVariableSellingExpenses.yearly = totalVariableSellingExpenses.q1 + totalVariableSellingExpenses.q2 + totalVariableSellingExpenses.q3 + totalVariableSellingExpenses.q4;

  const totalFixedSellingExpenses: QuarterlyData = {
    q1: salesSalariesAndBenefits.q1 + distributionFixedCosts.q1 + (inputs.customerServiceSalaries || 0) + customerAcquisitionCosts.q1,
    q2: salesSalariesAndBenefits.q2 + distributionFixedCosts.q2 + (inputs.customerServiceSalaries || 0) + customerAcquisitionCosts.q2,
    q3: salesSalariesAndBenefits.q3 + distributionFixedCosts.q3 + (inputs.customerServiceSalaries || 0) + customerAcquisitionCosts.q3,
    q4: salesSalariesAndBenefits.q4 + distributionFixedCosts.q4 + (inputs.customerServiceSalaries || 0) + customerAcquisitionCosts.q4,
    yearly: 0,
  };
  totalFixedSellingExpenses.yearly = totalFixedSellingExpenses.q1 + totalFixedSellingExpenses.q2 + totalFixedSellingExpenses.q3 + totalFixedSellingExpenses.q4;

  const totalSellingExpenses: QuarterlyData = {
    q1: totalVariableSellingExpenses.q1 + totalFixedSellingExpenses.q1,
    q2: totalVariableSellingExpenses.q2 + totalFixedSellingExpenses.q2,
    q3: totalVariableSellingExpenses.q3 + totalFixedSellingExpenses.q3,
    q4: totalVariableSellingExpenses.q4 + totalFixedSellingExpenses.q4,
    yearly: totalVariableSellingExpenses.yearly + totalFixedSellingExpenses.yearly,
  };

  // ====================================================================
  // MARKETING EXPENSES
  // ====================================================================

  const advertisingCosts: QuarterlyData = {
    q1: inputs.advertisingBudgetPerQuarter || 0,
    q2: inputs.advertisingBudgetPerQuarter || 0,
    q3: inputs.advertisingBudgetPerQuarter || 0,
    q4: inputs.advertisingBudgetPerQuarter || 0,
    yearly: (inputs.advertisingBudgetPerQuarter || 0) * 4,
  };

  const brandDevelopmentCosts: QuarterlyData = {
    q1: inputs.brandDevelopmentPerQuarter || 0,
    q2: inputs.brandDevelopmentPerQuarter || 0,
    q3: inputs.brandDevelopmentPerQuarter || 0,
    q4: inputs.brandDevelopmentPerQuarter || 0,
    yearly: (inputs.brandDevelopmentPerQuarter || 0) * 4,
  };

  const marketingCampaignCosts: QuarterlyData = {
    q1: inputs.marketingCampaignsPerQuarter || 0,
    q2: inputs.marketingCampaignsPerQuarter || 0,
    q3: inputs.marketingCampaignsPerQuarter || 0,
    q4: inputs.marketingCampaignsPerQuarter || 0,
    yearly: (inputs.marketingCampaignsPerQuarter || 0) * 4,
  };

  const marketResearchCosts: QuarterlyData = {
    q1: inputs.marketResearchPerQuarter || 0,
    q2: inputs.marketResearchPerQuarter || 0,
    q3: inputs.marketResearchPerQuarter || 0,
    q4: inputs.marketResearchPerQuarter || 0,
    yearly: (inputs.marketResearchPerQuarter || 0) * 4,
  };

  const tradeshowsEventsCosts: QuarterlyData = {
    q1: inputs.tradeshowsEventsPerQuarter || 0,
    q2: inputs.tradeshowsEventsPerQuarter || 0,
    q3: inputs.tradeshowsEventsPerQuarter || 0,
    q4: inputs.tradeshowsEventsPerQuarter || 0,
    yearly: (inputs.tradeshowsEventsPerQuarter || 0) * 4,
  };

  const contentCreationCosts: QuarterlyData = {
    q1: inputs.contentCreationPerQuarter || 0,
    q2: inputs.contentCreationPerQuarter || 0,
    q3: inputs.contentCreationPerQuarter || 0,
    q4: inputs.contentCreationPerQuarter || 0,
    yearly: (inputs.contentCreationPerQuarter || 0) * 4,
  };

  const totalMarketingExpenses: QuarterlyData = {
    q1: advertisingCosts.q1 + brandDevelopmentCosts.q1 + marketingCampaignCosts.q1 +
        marketResearchCosts.q1 + tradeshowsEventsCosts.q1 + contentCreationCosts.q1,
    q2: advertisingCosts.q2 + brandDevelopmentCosts.q2 + marketingCampaignCosts.q2 +
        marketResearchCosts.q2 + tradeshowsEventsCosts.q2 + contentCreationCosts.q2,
    q3: advertisingCosts.q3 + brandDevelopmentCosts.q3 + marketingCampaignCosts.q3 +
        marketResearchCosts.q3 + tradeshowsEventsCosts.q3 + contentCreationCosts.q3,
    q4: advertisingCosts.q4 + brandDevelopmentCosts.q4 + marketingCampaignCosts.q4 +
        marketResearchCosts.q4 + tradeshowsEventsCosts.q4 + contentCreationCosts.q4,
    yearly: 0,
  };
  totalMarketingExpenses.yearly = totalMarketingExpenses.q1 + totalMarketingExpenses.q2 + totalMarketingExpenses.q3 + totalMarketingExpenses.q4;

  // ====================================================================
  // ADMINISTRATIVE EXPENSES
  // ====================================================================

  // Administrative Salaries
  const executiveCosts: QuarterlyData = {
    q1: inputs.executiveSalaries || 0,
    q2: inputs.executiveSalaries || 0,
    q3: inputs.executiveSalaries || 0,
    q4: inputs.executiveSalaries || 0,
    yearly: (inputs.executiveSalaries || 0) * 4,
  };

  const financeCosts: QuarterlyData = {
    q1: inputs.financeSalaries || 0,
    q2: inputs.financeSalaries || 0,
    q3: inputs.financeSalaries || 0,
    q4: inputs.financeSalaries || 0,
    yearly: (inputs.financeSalaries || 0) * 4,
  };

  const hrCosts: QuarterlyData = {
    q1: inputs.hrSalaries || 0,
    q2: inputs.hrSalaries || 0,
    q3: inputs.hrSalaries || 0,
    q4: inputs.hrSalaries || 0,
    yearly: (inputs.hrSalaries || 0) * 4,
  };

  const itCosts: QuarterlyData = {
    q1: inputs.itSalaries || 0,
    q2: inputs.itSalaries || 0,
    q3: inputs.itSalaries || 0,
    q4: inputs.itSalaries || 0,
    yearly: (inputs.itSalaries || 0) * 4,
  };

  const legalComplianceCosts: QuarterlyData = {
    q1: inputs.legalComplianceSalaries || 0,
    q2: inputs.legalComplianceSalaries || 0,
    q3: inputs.legalComplianceSalaries || 0,
    q4: inputs.legalComplianceSalaries || 0,
    yearly: (inputs.legalComplianceSalaries || 0) * 4,
  };

  const generalAdminCosts: QuarterlyData = {
    q1: inputs.generalAdminSalaries || 0,
    q2: inputs.generalAdminSalaries || 0,
    q3: inputs.generalAdminSalaries || 0,
    q4: inputs.generalAdminSalaries || 0,
    yearly: (inputs.generalAdminSalaries || 0) * 4,
  };

  const totalAdministrativeSalaries: QuarterlyData = {
    q1: executiveCosts.q1 + financeCosts.q1 + hrCosts.q1 + itCosts.q1 + legalComplianceCosts.q1 + generalAdminCosts.q1,
    q2: executiveCosts.q2 + financeCosts.q2 + hrCosts.q2 + itCosts.q2 + legalComplianceCosts.q2 + generalAdminCosts.q2,
    q3: executiveCosts.q3 + financeCosts.q3 + hrCosts.q3 + itCosts.q3 + legalComplianceCosts.q3 + generalAdminCosts.q3,
    q4: executiveCosts.q4 + financeCosts.q4 + hrCosts.q4 + itCosts.q4 + legalComplianceCosts.q4 + generalAdminCosts.q4,
    yearly: 0,
  };
  totalAdministrativeSalaries.yearly = totalAdministrativeSalaries.q1 + totalAdministrativeSalaries.q2 + totalAdministrativeSalaries.q3 + totalAdministrativeSalaries.q4;

  // Occupancy Costs
  const occupancyCosts: QuarterlyData = {
    q1: (inputs.officeRentPerQuarter || 0) + (inputs.warehouseRentPerQuarter || 0) +
        (inputs.utilitiesPerQuarter || 0) + (inputs.buildingInsurancePerQuarter || 0) +
        (inputs.propertyTaxesPerQuarter || 0) + (inputs.maintenancePerQuarter || 0),
    q2: (inputs.officeRentPerQuarter || 0) + (inputs.warehouseRentPerQuarter || 0) +
        (inputs.utilitiesPerQuarter || 0) + (inputs.buildingInsurancePerQuarter || 0) +
        (inputs.propertyTaxesPerQuarter || 0) + (inputs.maintenancePerQuarter || 0),
    q3: (inputs.officeRentPerQuarter || 0) + (inputs.warehouseRentPerQuarter || 0) +
        (inputs.utilitiesPerQuarter || 0) + (inputs.buildingInsurancePerQuarter || 0) +
        (inputs.propertyTaxesPerQuarter || 0) + (inputs.maintenancePerQuarter || 0),
    q4: (inputs.officeRentPerQuarter || 0) + (inputs.warehouseRentPerQuarter || 0) +
        (inputs.utilitiesPerQuarter || 0) + (inputs.buildingInsurancePerQuarter || 0) +
        (inputs.propertyTaxesPerQuarter || 0) + (inputs.maintenancePerQuarter || 0),
    yearly: 0,
  };
  occupancyCosts.yearly = occupancyCosts.q1 * 4;

  // Technology Costs
  const technologyCosts: QuarterlyData = {
    q1: (inputs.softwareLicensesPerQuarter || 0) + (inputs.cloudServicesPerQuarter || 0) +
        (inputs.telecommunicationsPerQuarter || 0) + (inputs.itSupportPerQuarter || 0),
    q2: (inputs.softwareLicensesPerQuarter || 0) + (inputs.cloudServicesPerQuarter || 0) +
        (inputs.telecommunicationsPerQuarter || 0) + (inputs.itSupportPerQuarter || 0),
    q3: (inputs.softwareLicensesPerQuarter || 0) + (inputs.cloudServicesPerQuarter || 0) +
        (inputs.telecommunicationsPerQuarter || 0) + (inputs.itSupportPerQuarter || 0),
    q4: (inputs.softwareLicensesPerQuarter || 0) + (inputs.cloudServicesPerQuarter || 0) +
        (inputs.telecommunicationsPerQuarter || 0) + (inputs.itSupportPerQuarter || 0),
    yearly: 0,
  };
  technologyCosts.yearly = technologyCosts.q1 * 4;

  // Office Operations
  const officeOperationsCosts: QuarterlyData = {
    q1: (inputs.officeSuppliesPerQuarter || 0) + (inputs.postageShippingPerQuarter || 0) + (inputs.printingPerQuarter || 0),
    q2: (inputs.officeSuppliesPerQuarter || 0) + (inputs.postageShippingPerQuarter || 0) + (inputs.printingPerQuarter || 0),
    q3: (inputs.officeSuppliesPerQuarter || 0) + (inputs.postageShippingPerQuarter || 0) + (inputs.printingPerQuarter || 0),
    q4: (inputs.officeSuppliesPerQuarter || 0) + (inputs.postageShippingPerQuarter || 0) + (inputs.printingPerQuarter || 0),
    yearly: 0,
  };
  officeOperationsCosts.yearly = officeOperationsCosts.q1 * 4;

  // Professional Services
  const professionalServicesCosts: QuarterlyData = {
    q1: (inputs.legalFeesPerQuarter || 0) + (inputs.auditFeesPerQuarter || 0) + (inputs.consultingFeesPerQuarter || 0),
    q2: (inputs.legalFeesPerQuarter || 0) + (inputs.auditFeesPerQuarter || 0) + (inputs.consultingFeesPerQuarter || 0),
    q3: (inputs.legalFeesPerQuarter || 0) + (inputs.auditFeesPerQuarter || 0) + (inputs.consultingFeesPerQuarter || 0),
    q4: (inputs.legalFeesPerQuarter || 0) + (inputs.auditFeesPerQuarter || 0) + (inputs.consultingFeesPerQuarter || 0),
    yearly: 0,
  };
  professionalServicesCosts.yearly = professionalServicesCosts.q1 * 4;

  // Professional Development
  const professionalDevelopmentCosts: QuarterlyData = {
    q1: (inputs.trainingPerQuarter || 0) + (inputs.certificationPerQuarter || 0) + (inputs.conferencesPerQuarter || 0),
    q2: (inputs.trainingPerQuarter || 0) + (inputs.certificationPerQuarter || 0) + (inputs.conferencesPerQuarter || 0),
    q3: (inputs.trainingPerQuarter || 0) + (inputs.certificationPerQuarter || 0) + (inputs.conferencesPerQuarter || 0),
    q4: (inputs.trainingPerQuarter || 0) + (inputs.certificationPerQuarter || 0) + (inputs.conferencesPerQuarter || 0),
    yearly: 0,
  };
  professionalDevelopmentCosts.yearly = professionalDevelopmentCosts.q1 * 4;

  // Travel and Entertainment
  const travelEntertainmentCosts: QuarterlyData = {
    q1: (inputs.salesTravelPerQuarter || 0) + (inputs.executiveTravelPerQuarter || 0) + (inputs.mealsEntertainmentPerQuarter || 0),
    q2: (inputs.salesTravelPerQuarter || 0) + (inputs.executiveTravelPerQuarter || 0) + (inputs.mealsEntertainmentPerQuarter || 0),
    q3: (inputs.salesTravelPerQuarter || 0) + (inputs.executiveTravelPerQuarter || 0) + (inputs.mealsEntertainmentPerQuarter || 0),
    q4: (inputs.salesTravelPerQuarter || 0) + (inputs.executiveTravelPerQuarter || 0) + (inputs.mealsEntertainmentPerQuarter || 0),
    yearly: 0,
  };
  travelEntertainmentCosts.yearly = travelEntertainmentCosts.q1 * 4;

  // Regulatory and Compliance
  const regulatoryComplianceCosts: QuarterlyData = {
    q1: (inputs.licensesPermitsPerQuarter || 0) + (inputs.complianceCostsPerQuarter || 0) + (inputs.insuranceGeneralPerQuarter || 0),
    q2: (inputs.licensesPermitsPerQuarter || 0) + (inputs.complianceCostsPerQuarter || 0) + (inputs.insuranceGeneralPerQuarter || 0),
    q3: (inputs.licensesPermitsPerQuarter || 0) + (inputs.complianceCostsPerQuarter || 0) + (inputs.insuranceGeneralPerQuarter || 0),
    q4: (inputs.licensesPermitsPerQuarter || 0) + (inputs.complianceCostsPerQuarter || 0) + (inputs.insuranceGeneralPerQuarter || 0),
    yearly: 0,
  };
  regulatoryComplianceCosts.yearly = regulatoryComplianceCosts.q1 * 4;

  // Bad Debt Expense
  let badDebtExpense: QuarterlyData = { q1: 0, q2: 0, q3: 0, q4: 0, yearly: 0 };
  if (inputs.badDebtRate) {
    badDebtExpense = {
      q1: salesRevenue.q1 * inputs.badDebtRate,
      q2: salesRevenue.q2 * inputs.badDebtRate,
      q3: salesRevenue.q3 * inputs.badDebtRate,
      q4: salesRevenue.q4 * inputs.badDebtRate,
      yearly: 0,
    };
    badDebtExpense.yearly = badDebtExpense.q1 + badDebtExpense.q2 + badDebtExpense.q3 + badDebtExpense.q4;
  }

  // Depreciation Expense (non-cash)
  const depreciationExpense: QuarterlyData = {
    q1: (inputs.depreciationOfficeEquipment || 0) + (inputs.depreciationFurnitureFixtures || 0),
    q2: (inputs.depreciationOfficeEquipment || 0) + (inputs.depreciationFurnitureFixtures || 0),
    q3: (inputs.depreciationOfficeEquipment || 0) + (inputs.depreciationFurnitureFixtures || 0),
    q4: (inputs.depreciationOfficeEquipment || 0) + (inputs.depreciationFurnitureFixtures || 0),
    yearly: 0,
  };
  depreciationExpense.yearly = depreciationExpense.q1 * 4;

  // Total Fixed Admin Expenses
  const totalFixedAdminExpenses: QuarterlyData = {
    q1: totalAdministrativeSalaries.q1 + occupancyCosts.q1 + technologyCosts.q1 +
        officeOperationsCosts.q1 + professionalServicesCosts.q1 + professionalDevelopmentCosts.q1 +
        travelEntertainmentCosts.q1 + regulatoryComplianceCosts.q1 + depreciationExpense.q1,
    q2: totalAdministrativeSalaries.q2 + occupancyCosts.q2 + technologyCosts.q2 +
        officeOperationsCosts.q2 + professionalServicesCosts.q2 + professionalDevelopmentCosts.q2 +
        travelEntertainmentCosts.q2 + regulatoryComplianceCosts.q2 + depreciationExpense.q2,
    q3: totalAdministrativeSalaries.q3 + occupancyCosts.q3 + technologyCosts.q3 +
        officeOperationsCosts.q3 + professionalServicesCosts.q3 + professionalDevelopmentCosts.q3 +
        travelEntertainmentCosts.q3 + regulatoryComplianceCosts.q3 + depreciationExpense.q3,
    q4: totalAdministrativeSalaries.q4 + occupancyCosts.q4 + technologyCosts.q4 +
        officeOperationsCosts.q4 + professionalServicesCosts.q4 + professionalDevelopmentCosts.q4 +
        travelEntertainmentCosts.q4 + regulatoryComplianceCosts.q4 + depreciationExpense.q4,
    yearly: 0,
  };
  totalFixedAdminExpenses.yearly = totalFixedAdminExpenses.q1 + totalFixedAdminExpenses.q2 + totalFixedAdminExpenses.q3 + totalFixedAdminExpenses.q4;

  const totalAdministrativeExpenses: QuarterlyData = {
    q1: totalFixedAdminExpenses.q1 + badDebtExpense.q1,
    q2: totalFixedAdminExpenses.q2 + badDebtExpense.q2,
    q3: totalFixedAdminExpenses.q3 + badDebtExpense.q3,
    q4: totalFixedAdminExpenses.q4 + badDebtExpense.q4,
    yearly: totalFixedAdminExpenses.yearly + badDebtExpense.yearly,
  };

  // ====================================================================
  // OVERALL TOTALS
  // ====================================================================

  const totalVariableExpenses: QuarterlyData = {
    q1: totalVariableSellingExpenses.q1 + badDebtExpense.q1,
    q2: totalVariableSellingExpenses.q2 + badDebtExpense.q2,
    q3: totalVariableSellingExpenses.q3 + badDebtExpense.q3,
    q4: totalVariableSellingExpenses.q4 + badDebtExpense.q4,
    yearly: totalVariableSellingExpenses.yearly + badDebtExpense.yearly,
  };

  const totalFixedExpenses: QuarterlyData = {
    q1: totalFixedSellingExpenses.q1 + totalMarketingExpenses.q1 + totalFixedAdminExpenses.q1,
    q2: totalFixedSellingExpenses.q2 + totalMarketingExpenses.q2 + totalFixedAdminExpenses.q2,
    q3: totalFixedSellingExpenses.q3 + totalMarketingExpenses.q3 + totalFixedAdminExpenses.q3,
    q4: totalFixedSellingExpenses.q4 + totalMarketingExpenses.q4 + totalFixedAdminExpenses.q4,
    yearly: totalFixedSellingExpenses.yearly + totalMarketingExpenses.yearly + totalFixedAdminExpenses.yearly,
  };

  const totalSGAExpenses: QuarterlyData = {
    q1: totalVariableExpenses.q1 + totalFixedExpenses.q1,
    q2: totalVariableExpenses.q2 + totalFixedExpenses.q2,
    q3: totalVariableExpenses.q3 + totalFixedExpenses.q3,
    q4: totalVariableExpenses.q4 + totalFixedExpenses.q4,
    yearly: totalVariableExpenses.yearly + totalFixedExpenses.yearly,
  };

  // Cash Disbursements (exclude depreciation)
  const cashDisbursementsForSGA: QuarterlyData = {
    q1: totalSGAExpenses.q1 - depreciationExpense.q1,
    q2: totalSGAExpenses.q2 - depreciationExpense.q2,
    q3: totalSGAExpenses.q3 - depreciationExpense.q3,
    q4: totalSGAExpenses.q4 - depreciationExpense.q4,
    yearly: totalSGAExpenses.yearly - depreciationExpense.yearly,
  };

  // ====================================================================
  // METRICS AND ANALYTICS
  // ====================================================================

  const sgaAsPercentOfSales: QuarterlyData = {
    q1: salesRevenue.q1 > 0 ? (totalSGAExpenses.q1 / salesRevenue.q1) : 0,
    q2: salesRevenue.q2 > 0 ? (totalSGAExpenses.q2 / salesRevenue.q2) : 0,
    q3: salesRevenue.q3 > 0 ? (totalSGAExpenses.q3 / salesRevenue.q3) : 0,
    q4: salesRevenue.q4 > 0 ? (totalSGAExpenses.q4 / salesRevenue.q4) : 0,
    yearly: salesRevenue.yearly > 0 ? (totalSGAExpenses.yearly / salesRevenue.yearly) : 0,
  };

  const variableSGAPerUnit: QuarterlyData = {
    q1: salesUnits.q1 > 0 ? (totalVariableExpenses.q1 / salesUnits.q1) : 0,
    q2: salesUnits.q2 > 0 ? (totalVariableExpenses.q2 / salesUnits.q2) : 0,
    q3: salesUnits.q3 > 0 ? (totalVariableExpenses.q3 / salesUnits.q3) : 0,
    q4: salesUnits.q4 > 0 ? (totalVariableExpenses.q4 / salesUnits.q4) : 0,
    yearly: salesUnits.yearly > 0 ? (totalVariableExpenses.yearly / salesUnits.yearly) : 0,
  };

  const fixedSGAPerUnit: QuarterlyData = {
    q1: salesUnits.q1 > 0 ? (totalFixedExpenses.q1 / salesUnits.q1) : 0,
    q2: salesUnits.q2 > 0 ? (totalFixedExpenses.q2 / salesUnits.q2) : 0,
    q3: salesUnits.q3 > 0 ? (totalFixedExpenses.q3 / salesUnits.q3) : 0,
    q4: salesUnits.q4 > 0 ? (totalFixedExpenses.q4 / salesUnits.q4) : 0,
    yearly: salesUnits.yearly > 0 ? (totalFixedExpenses.yearly / salesUnits.yearly) : 0,
  };

  const totalSGAPerUnit: QuarterlyData = {
    q1: salesUnits.q1 > 0 ? (totalSGAExpenses.q1 / salesUnits.q1) : 0,
    q2: salesUnits.q2 > 0 ? (totalSGAExpenses.q2 / salesUnits.q2) : 0,
    q3: salesUnits.q3 > 0 ? (totalSGAExpenses.q3 / salesUnits.q3) : 0,
    q4: salesUnits.q4 > 0 ? (totalSGAExpenses.q4 / salesUnits.q4) : 0,
    yearly: salesUnits.yearly > 0 ? (totalSGAExpenses.yearly / salesUnits.yearly) : 0,
  };

  const marketingAsPercentOfSales: QuarterlyData = {
    q1: salesRevenue.q1 > 0 ? (totalMarketingExpenses.q1 / salesRevenue.q1) : 0,
    q2: salesRevenue.q2 > 0 ? (totalMarketingExpenses.q2 / salesRevenue.q2) : 0,
    q3: salesRevenue.q3 > 0 ? (totalMarketingExpenses.q3 / salesRevenue.q3) : 0,
    q4: salesRevenue.q4 > 0 ? (totalMarketingExpenses.q4 / salesRevenue.q4) : 0,
    yearly: salesRevenue.yearly > 0 ? (totalMarketingExpenses.yearly / salesRevenue.yearly) : 0,
  };

  let costPerNewCustomer: QuarterlyData | undefined;
  if (inputs.newCustomersPerQuarter) {
    costPerNewCustomer = {
      q1: inputs.newCustomersPerQuarter.q1 > 0 ? (customerAcquisitionCosts.q1 / inputs.newCustomersPerQuarter.q1) : 0,
      q2: inputs.newCustomersPerQuarter.q2 > 0 ? (customerAcquisitionCosts.q2 / inputs.newCustomersPerQuarter.q2) : 0,
      q3: inputs.newCustomersPerQuarter.q3 > 0 ? (customerAcquisitionCosts.q3 / inputs.newCustomersPerQuarter.q3) : 0,
      q4: inputs.newCustomersPerQuarter.q4 > 0 ? (customerAcquisitionCosts.q4 / inputs.newCustomersPerQuarter.q4) : 0,
      yearly: inputs.newCustomersPerQuarter.yearly > 0 ? (customerAcquisitionCosts.yearly / inputs.newCustomersPerQuarter.yearly) : 0,
    };
  }

  const salesExpenseRatio: QuarterlyData = {
    q1: salesRevenue.q1 > 0 ? (totalSellingExpenses.q1 / salesRevenue.q1) : 0,
    q2: salesRevenue.q2 > 0 ? (totalSellingExpenses.q2 / salesRevenue.q2) : 0,
    q3: salesRevenue.q3 > 0 ? (totalSellingExpenses.q3 / salesRevenue.q3) : 0,
    q4: salesRevenue.q4 > 0 ? (totalSellingExpenses.q4 / salesRevenue.q4) : 0,
    yearly: salesRevenue.yearly > 0 ? (totalSellingExpenses.yearly / salesRevenue.yearly) : 0,
  };

  const adminExpenseRatio: QuarterlyData = {
    q1: salesRevenue.q1 > 0 ? (totalAdministrativeExpenses.q1 / salesRevenue.q1) : 0,
    q2: salesRevenue.q2 > 0 ? (totalAdministrativeExpenses.q2 / salesRevenue.q2) : 0,
    q3: salesRevenue.q3 > 0 ? (totalAdministrativeExpenses.q3 / salesRevenue.q3) : 0,
    q4: salesRevenue.q4 > 0 ? (totalAdministrativeExpenses.q4 / salesRevenue.q4) : 0,
    yearly: salesRevenue.yearly > 0 ? (totalAdministrativeExpenses.yearly / salesRevenue.yearly) : 0,
  };

  // Return comprehensive output
  return {
    salesRevenue,
    salesUnits,

    // Selling expenses
    salesPersonnelCosts: salesPersonnelCosts.length > 0 ? salesPersonnelCosts : undefined,
    salesCommissions,
    salesSalariesAndBenefits,
    totalSalesPersonnelCosts,

    distributionChannelCosts: distributionChannelCosts.length > 0 ? distributionChannelCosts : undefined,
    distributionVariableCosts,
    distributionFixedCosts,
    totalDistributionCosts,

    customerServiceCosts,
    customerAcquisitionCosts,

    totalVariableSellingExpenses,
    totalFixedSellingExpenses,
    totalSellingExpenses,

    // Marketing expenses
    advertisingCosts,
    brandDevelopmentCosts,
    marketingCampaignCosts,
    marketResearchCosts,
    tradeshowsEventsCosts,
    contentCreationCosts,
    totalMarketingExpenses,

    // Administrative expenses
    executiveCosts,
    financeCosts,
    hrCosts,
    itCosts,
    legalComplianceCosts,
    generalAdminCosts,
    totalAdministrativeSalaries,

    occupancyCosts,
    technologyCosts,
    officeOperationsCosts,
    professionalServicesCosts,
    professionalDevelopmentCosts,
    travelEntertainmentCosts,
    regulatoryComplianceCosts,

    badDebtExpense,
    depreciationExpense,

    totalFixedAdminExpenses,
    totalAdministrativeExpenses,

    // Overall totals
    totalVariableExpenses,
    totalFixedExpenses,
    totalSGAExpenses,
    cashDisbursementsForSGA,

    // Metrics
    sgaAsPercentOfSales,
    variableSGAPerUnit,
    fixedSGAPerUnit,
    totalSGAPerUnit,
    marketingAsPercentOfSales,
    costPerNewCustomer,
    salesExpenseRatio,
    adminExpenseRatio,
  };
}

/**
 * Format SG&A Budget output for display
 */
export function formatSellingAdminExpenseBudgetForDisplay(output: SellingAdminExpenseOutput): any {
  const format = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatPercent = (val: number) => (val * 100).toFixed(2) + '%';

  const rows: any[] = [];

  // Selling Expenses
  rows.push({ label: 'SELLING EXPENSES', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  if (output.salesCommissions && output.salesCommissions.yearly > 0) {
    rows.push({
      label: 'Sales Commissions',
      q1: format(output.salesCommissions.q1),
      q2: format(output.salesCommissions.q2),
      q3: format(output.salesCommissions.q3),
      q4: format(output.salesCommissions.q4),
      yearly: format(output.salesCommissions.yearly),
    });
  }

  if (output.salesSalariesAndBenefits && output.salesSalariesAndBenefits.yearly > 0) {
    rows.push({
      label: 'Sales Salaries & Benefits',
      q1: format(output.salesSalariesAndBenefits.q1),
      q2: format(output.salesSalariesAndBenefits.q2),
      q3: format(output.salesSalariesAndBenefits.q3),
      q4: format(output.salesSalariesAndBenefits.q4),
      yearly: format(output.salesSalariesAndBenefits.yearly),
    });
  }

  if (output.totalDistributionCosts && output.totalDistributionCosts.yearly > 0) {
    rows.push({
      label: 'Distribution Costs',
      q1: format(output.totalDistributionCosts.q1),
      q2: format(output.totalDistributionCosts.q2),
      q3: format(output.totalDistributionCosts.q3),
      q4: format(output.totalDistributionCosts.q4),
      yearly: format(output.totalDistributionCosts.yearly),
    });
  }

  if (output.customerServiceCosts && output.customerServiceCosts.yearly > 0) {
    rows.push({
      label: 'Customer Service',
      q1: format(output.customerServiceCosts.q1),
      q2: format(output.customerServiceCosts.q2),
      q3: format(output.customerServiceCosts.q3),
      q4: format(output.customerServiceCosts.q4),
      yearly: format(output.customerServiceCosts.yearly),
    });
  }

  if (output.totalSellingExpenses) {
    rows.push({
      label: 'Total Selling Expenses',
      q1: format(output.totalSellingExpenses.q1),
      q2: format(output.totalSellingExpenses.q2),
      q3: format(output.totalSellingExpenses.q3),
      q4: format(output.totalSellingExpenses.q4),
      yearly: format(output.totalSellingExpenses.yearly),
    });
  }

  // Marketing Expenses
  if (output.totalMarketingExpenses && output.totalMarketingExpenses.yearly > 0) {
    rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });
    rows.push({ label: 'MARKETING EXPENSES', q1: '', q2: '', q3: '', q4: '', yearly: '' });

    if (output.advertisingCosts && output.advertisingCosts.yearly > 0) {
      rows.push({
        label: 'Advertising',
        q1: format(output.advertisingCosts.q1),
        q2: format(output.advertisingCosts.q2),
        q3: format(output.advertisingCosts.q3),
        q4: format(output.advertisingCosts.q4),
        yearly: format(output.advertisingCosts.yearly),
      });
    }

    if (output.brandDevelopmentCosts && output.brandDevelopmentCosts.yearly > 0) {
      rows.push({
        label: 'Brand Development',
        q1: format(output.brandDevelopmentCosts.q1),
        q2: format(output.brandDevelopmentCosts.q2),
        q3: format(output.brandDevelopmentCosts.q3),
        q4: format(output.brandDevelopmentCosts.q4),
        yearly: format(output.brandDevelopmentCosts.yearly),
      });
    }

    rows.push({
      label: 'Total Marketing Expenses',
      q1: format(output.totalMarketingExpenses.q1),
      q2: format(output.totalMarketingExpenses.q2),
      q3: format(output.totalMarketingExpenses.q3),
      q4: format(output.totalMarketingExpenses.q4),
      yearly: format(output.totalMarketingExpenses.yearly),
    });
  }

  // Administrative Expenses
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });
  rows.push({ label: 'ADMINISTRATIVE EXPENSES', q1: '', q2: '', q3: '', q4: '', yearly: '' });

  if (output.totalAdministrativeSalaries && output.totalAdministrativeSalaries.yearly > 0) {
    rows.push({
      label: 'Administrative Salaries',
      q1: format(output.totalAdministrativeSalaries.q1),
      q2: format(output.totalAdministrativeSalaries.q2),
      q3: format(output.totalAdministrativeSalaries.q3),
      q4: format(output.totalAdministrativeSalaries.q4),
      yearly: format(output.totalAdministrativeSalaries.yearly),
    });
  }

  if (output.occupancyCosts && output.occupancyCosts.yearly > 0) {
    rows.push({
      label: 'Occupancy Costs',
      q1: format(output.occupancyCosts.q1),
      q2: format(output.occupancyCosts.q2),
      q3: format(output.occupancyCosts.q3),
      q4: format(output.occupancyCosts.q4),
      yearly: format(output.occupancyCosts.yearly),
    });
  }

  if (output.technologyCosts && output.technologyCosts.yearly > 0) {
    rows.push({
      label: 'Technology Costs',
      q1: format(output.technologyCosts.q1),
      q2: format(output.technologyCosts.q2),
      q3: format(output.technologyCosts.q3),
      q4: format(output.technologyCosts.q4),
      yearly: format(output.technologyCosts.yearly),
    });
  }

  if (output.professionalServicesCosts && output.professionalServicesCosts.yearly > 0) {
    rows.push({
      label: 'Professional Services',
      q1: format(output.professionalServicesCosts.q1),
      q2: format(output.professionalServicesCosts.q2),
      q3: format(output.professionalServicesCosts.q3),
      q4: format(output.professionalServicesCosts.q4),
      yearly: format(output.professionalServicesCosts.yearly),
    });
  }

  if (output.badDebtExpense && output.badDebtExpense.yearly > 0) {
    rows.push({
      label: 'Bad Debt Expense',
      q1: format(output.badDebtExpense.q1),
      q2: format(output.badDebtExpense.q2),
      q3: format(output.badDebtExpense.q3),
      q4: format(output.badDebtExpense.q4),
      yearly: format(output.badDebtExpense.yearly),
    });
  }

  if (output.depreciationExpense && output.depreciationExpense.yearly > 0) {
    rows.push({
      label: 'Depreciation Expense',
      q1: format(output.depreciationExpense.q1),
      q2: format(output.depreciationExpense.q2),
      q3: format(output.depreciationExpense.q3),
      q4: format(output.depreciationExpense.q4),
      yearly: format(output.depreciationExpense.yearly),
    });
  }

  if (output.totalAdministrativeExpenses) {
    rows.push({
      label: 'Total Administrative Expenses',
      q1: format(output.totalAdministrativeExpenses.q1),
      q2: format(output.totalAdministrativeExpenses.q2),
      q3: format(output.totalAdministrativeExpenses.q3),
      q4: format(output.totalAdministrativeExpenses.q4),
      yearly: format(output.totalAdministrativeExpenses.yearly),
    });
  }

  // Overall Totals
  rows.push({ label: '', q1: '', q2: '', q3: '', q4: '', yearly: '' });
  rows.push({
    label: 'TOTAL SG&A EXPENSES',
    q1: format(output.totalSGAExpenses.q1),
    q2: format(output.totalSGAExpenses.q2),
    q3: format(output.totalSGAExpenses.q3),
    q4: format(output.totalSGAExpenses.q4),
    yearly: format(output.totalSGAExpenses.yearly),
  });

  if (output.cashDisbursementsForSGA) {
    rows.push({
      label: 'Cash Disbursements for SG&A',
      q1: format(output.cashDisbursementsForSGA.q1),
      q2: format(output.cashDisbursementsForSGA.q2),
      q3: format(output.cashDisbursementsForSGA.q3),
      q4: format(output.cashDisbursementsForSGA.q4),
      yearly: format(output.cashDisbursementsForSGA.yearly),
    });
  }

  return {
    headers: ['Category', 'Q1', 'Q2', 'Q3', 'Q4', 'Yearly'],
    rows,
    sgaAsPercentOfSales: output.sgaAsPercentOfSales,
    variableSGAPerUnit: output.variableSGAPerUnit,
    totalSGAPerUnit: output.totalSGAPerUnit,
    marketingAsPercentOfSales: output.marketingAsPercentOfSales,
  };
}

