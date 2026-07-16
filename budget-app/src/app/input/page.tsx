'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculateSalesBudget, validateSalesBudgetInputs, formatSalesBudgetForDisplay } from '@/lib/calculations/01-salesBudget';
import { calculateProductionBudget, validateProductionBudgetInputs, formatProductionBudgetForDisplay } from '@/lib/calculations/02-productionBudget';
import { calculateDirectMaterialBudget, validateDirectMaterialBudgetInputs, formatDirectMaterialBudgetForDisplay } from '@/lib/calculations/03-directMaterialBudget';
import { calculateDirectLaborBudget, validateDirectLaborBudgetInputs, formatDirectLaborBudgetForDisplay } from '@/lib/calculations/04-directLaborBudget';
import { calculateManufacturingOverheadBudget, validateManufacturingOverheadInputs, formatManufacturingOverheadBudgetForDisplay } from '@/lib/calculations/05-manufacturingOverheadBudget';
import { calculateSellingAdminExpenseBudget, validateSellingAdminExpenseInputs, formatSellingAdminExpenseBudgetForDisplay } from '@/lib/calculations/06-sellingAdminExpenseBudget';
import { calculateCashReceiptsBudget, formatCashReceiptsOutput, exportCashReceiptsToCSV } from '@/lib/calculations/07-cashReceiptsBudget';
import { calculateCashDisbursementsBudget, formatCashDisbursementsOutput, exportCashDisbursementsToCSV } from '@/lib/calculations/08-cashDisbursementsBudget';
import { calculateCashBudget, formatCashBudgetOutput, exportCashBudgetToCSV } from '@/lib/calculations/09-cashBudget';
import { calculateCOGS, formatCOGSOutput, exportCOGSToCSV } from '@/lib/calculations/10-cogsSchedule';
import { calculateIncomeStatement, formatIncomeStatementOutput, exportIncomeStatementToCSV } from '@/lib/calculations/11-incomeStatement';
import { calculateCashFlowStatement, formatCashFlowStatementOutput, formatIndirectMethodReconciliation, formatQualityMetrics, exportCashFlowStatementToCSV } from '@/lib/calculations/12-cashFlowStatement';
import { calculateBalanceSheet, formatBalanceSheetOutput, formatFinancialRatios, exportBalanceSheetToCSV } from '@/lib/calculations/13-balanceSheet';
import type { SalesBudgetInputs, SalesBudgetOutput, ProductionBudgetInputs, ProductionBudgetOutput, DirectMaterialBudgetInputs, DirectMaterialBudgetOutput, DirectLabourBudgetInputs, DirectLabourBudgetOutput, ManufacturingOverheadInputs, ManufacturingOverheadOutput, SellingAdminExpenseInputs, SellingAdminExpenseOutput, CashReceiptsInputs, CashReceiptsOutput, CashDisbursementInputs, CashDisbursementOutput, CashBudgetInputs, CashBudgetOutput, COGSInputs, COGSOutput, IncomeStatementInputs, IncomeStatementOutput, CashFlowStatementInputs, CashFlowStatementOutput, BalanceSheetInputs, BalanceSheetOutput, MaterialType, LaborCategory, OverheadCostCategory, SalesPersonnelCategory, DistributionChannel, DepartmentBudget } from '@/lib/types/budgets';
import {
  SalesTrendChart,
  SalesComparisonChart,
  ProductionChart,
  CostTrendChart,
  ExpenseBreakdownChart,
  CashFlowChart,
  COGSBreakdownChart,
  IncomeWaterfallChart,
  CashFlowActivitiesChart,
  BalanceSheetChart,
} from '@/components/charts';

export default function InputPage() {
  const [darkMode, setDarkMode] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const [companyName, setCompanyName] = useState('');
  const [productName, setProductName] = useState('');
  const [currency, setCurrency] = useState('');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString());
  const [assumptions, setAssumptions] = useState('');

  // Prior year sales (optional)
  const [priorQ1Sales, setPriorQ1Sales] = useState('');
  const [priorQ2Sales, setPriorQ2Sales] = useState('');
  const [priorQ3Sales, setPriorQ3Sales] = useState('');
  const [priorQ4Sales, setPriorQ4Sales] = useState('');

  // Current year forecast
  const [q1Sales, setQ1Sales] = useState('');
  const [q2Sales, setQ2Sales] = useState('');
  const [q3Sales, setQ3Sales] = useState('');
  const [q4Sales, setQ4Sales] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [inflationRate, setInflationRate] = useState('0');
  const [priceAdjustment, setPriceAdjustment] = useState<'constant' | 'inflation'>('inflation');

  // Cash vs Credit Sales
  const [cashSalesPercentage, setCashSalesPercentage] = useState('');
  const [creditSalesPercentage, setCreditSalesPercentage] = useState('');

  // Growth rate calculator
  const [growthRate, setGrowthRate] = useState('');

  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Raw outputs for charting
  const [salesRawOutput, setSalesRawOutput] = useState<SalesBudgetOutput | null>(null);
  const [productionRawOutput, setProductionRawOutput] = useState<ProductionBudgetOutput | null>(null);
  const [materialRawOutput, setMaterialRawOutput] = useState<DirectMaterialBudgetOutput | null>(null);
  const [laborRawOutput, setLaborRawOutput] = useState<DirectLabourBudgetOutput | null>(null);
  const [overheadRawOutput, setOverheadRawOutput] = useState<ManufacturingOverheadOutput | null>(null);
  const [sgaRawOutput, setSgaRawOutput] = useState<SellingAdminExpenseOutput | null>(null);
  const [historicalSalesData, setHistoricalSalesData] = useState<{ q1: number; q2: number; q3: number; q4: number; yearly: number } | null>(null);

  // Chart visibility toggle
  const [showCharts, setShowCharts] = useState(true);

  // Schedule 2: Production Budget state
  const [beginningInventory, setBeginningInventory] = useState('');
  const [endingInventoryRatio, setEndingInventoryRatio] = useState('');
  const [nextYearQ1Sales, setNextYearQ1Sales] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [minBatchSize, setMinBatchSize] = useState('');
  const [optimalBatchSize, setOptimalBatchSize] = useState('');
  const [carryingCost, setCarryingCost] = useState('');
  const [useJIT, setUseJIT] = useState(false);
  const [obsolescenceRisk, setObsolescenceRisk] = useState('');

  const [productionResult, setProductionResult] = useState<any>(null);
  const [productionErrors, setProductionErrors] = useState<string[]>([]);

  // Schedule 3: Direct Material Budget state
  const [materials, setMaterials] = useState<MaterialType[]>([
    {
      name: '',
      requiredPerUnit: 0,
      costPerUnit: 0,
      beginningInventory: 0,
      desiredEndingInventoryRatio: 0,
      unit: '',
    },
  ]);
  const [nextYearQ1Production, setNextYearQ1Production] = useState('');
  const [percentPaidCurrentQuarter, setPercentPaidCurrentQuarter] = useState('');
  const [percentPaidNextQuarter, setPercentPaidNextQuarter] = useState('');

  const [materialResult, setMaterialResult] = useState<any>(null);
  const [materialErrors, setMaterialErrors] = useState<string[]>([]);

  // Schedule 4: Direct Labor Budget state
  const [useSimpleLaborInput, setUseSimpleLaborInput] = useState(true);
  const [directLaborHoursPerUnit, setDirectLaborHoursPerUnit] = useState('');
  const [hourlyWageRate, setHourlyWageRate] = useState('');
  const [laborCategories, setLaborCategories] = useState<LaborCategory[]>([
    {
      name: '',
      hoursPerUnit: 0,
      wageRatePerHour: 0,
    },
  ]);
  const [wageInflationRate, setWageInflationRate] = useState('');
  const [overtimeThreshold, setOvertimeThreshold] = useState('');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState('1.5');
  const [fringeBenefitRate, setFringeBenefitRate] = useState('');
  const [productivityEfficiencyRate, setProductivityEfficiencyRate] = useState('');
  const [turnoverRate, setTurnoverRate] = useState('');
  const [trainingCostPerEmployee, setTrainingCostPerEmployee] = useState('');
  const [averageHoursPerEmployee, setAverageHoursPerEmployee] = useState('');

  const [laborResult, setLaborResult] = useState<any>(null);
  const [laborErrors, setLaborErrors] = useState<string[]>([]);

  // Schedule 5: Manufacturing Overhead Budget state
  const [overheadApproach, setOverheadApproach] = useState<'simple' | 'detailed' | 'abc'>('simple');

  // Simple approach fields
  const [variableOverheadRatePerUnit, setVariableOverheadRatePerUnit] = useState('');
  const [variableOverheadRatePerLaborHour, setVariableOverheadRatePerLaborHour] = useState('');
  const [fixedOverheadPerQuarter, setFixedOverheadPerQuarter] = useState('');
  const [depreciationPerQuarter, setDepreciationPerQuarter] = useState('');
  const [allocationBase, setAllocationBase] = useState<'units' | 'labor-hours' | 'machine-hours'>('units');

  // Detailed categories approach
  const [overheadCategories, setOverheadCategories] = useState<OverheadCostCategory[]>([
    {
      name: '',
      costType: 'variable',
      amount: 0,
      costDriver: 'units',
    },
  ]);

  // ABC approach fields
  const [useActivityBasedCosting, setUseActivityBasedCosting] = useState(false);
  const [productionRunsQ1, setProductionRunsQ1] = useState('');
  const [productionRunsQ2, setProductionRunsQ2] = useState('');
  const [productionRunsQ3, setProductionRunsQ3] = useState('');
  const [productionRunsQ4, setProductionRunsQ4] = useState('');
  const [costPerProductionRun, setCostPerProductionRun] = useState('');
  const [inspectionsQ1, setInspectionsQ1] = useState('');
  const [inspectionsQ2, setInspectionsQ2] = useState('');
  const [inspectionsQ3, setInspectionsQ3] = useState('');
  const [inspectionsQ4, setInspectionsQ4] = useState('');
  const [costPerInspection, setCostPerInspection] = useState('');
  const [machineHoursQ1, setMachineHoursQ1] = useState('');
  const [machineHoursQ2, setMachineHoursQ2] = useState('');
  const [machineHoursQ3, setMachineHoursQ3] = useState('');
  const [machineHoursQ4, setMachineHoursQ4] = useState('');
  const [costPerMachineHour, setCostPerMachineHour] = useState('');

  // Facility costs
  const [facilityRent, setFacilityRent] = useState('');
  const [facilityInsurance, setFacilityInsurance] = useState('');
  const [propertyTaxes, setPropertyTaxes] = useState('');
  const [utilities, setUtilities] = useState('');
  const [utilitiesIsVariable, setUtilitiesIsVariable] = useState(false);

  // Indirect labor
  const [supervisorySalaries, setSupervisorySalaries] = useState('');
  const [supportStaffSalaries, setSupportStaffSalaries] = useState('');

  // Supplies and materials
  const [indirectMaterialsPerUnit, setIndirectMaterialsPerUnit] = useState('');
  const [shopSuppliesPerQuarter, setShopSuppliesPerQuarter] = useState('');

  // Maintenance
  const [plannedMaintenancePerQuarter, setPlannedMaintenancePerQuarter] = useState('');
  const [maintenancePerMachineHour, setMaintenancePerMachineHour] = useState('');

  // Quality control
  const [qualityControlPerUnit, setQualityControlPerUnit] = useState('');
  const [qualityControlLabor, setQualityControlLabor] = useState('');

  // Other costs
  const [technologyCosts, setTechnologyCosts] = useState('');
  const [warehouseCosts, setWarehouseCosts] = useState('');
  const [environmentalComplianceCosts, setEnvironmentalComplianceCosts] = useState('');

  const [overheadResult, setOverheadResult] = useState<any>(null);
  const [overheadErrors, setOverheadErrors] = useState<string[]>([]);

  // Schedule 6: SG&A Expense Budget state
  const [sgaApproach, setSgaApproach] = useState<'simple' | 'detailed'>('simple');

  // Simple approach
  const [useSimpleSGA, setUseSimpleSGA] = useState(true);
  const [variableSellingExpenseRate, setVariableSellingExpenseRate] = useState('');
  const [variableAdminExpenseRate, setVariableAdminExpenseRate] = useState('');
  const [fixedSellingExpensePerQuarter, setFixedSellingExpensePerQuarter] = useState('');
  const [fixedAdminExpensePerQuarter, setFixedAdminExpensePerQuarter] = useState('');

  // Detailed approach - Selling Expenses
  const [commissionRate, setCommissionRate] = useState('');
  const [commissionPerUnit, setCommissionPerUnit] = useState('');
  const [distributionCostPerUnit, setDistributionCostPerUnit] = useState('');
  const [distributionFixedCostPerQuarter, setDistributionFixedCostPerQuarter] = useState('');
  const [customerServiceSalaries, setCustomerServiceSalaries] = useState('');
  const [warrantyExpensePerUnit, setWarrantyExpensePerUnit] = useState('');

  // Marketing Expenses
  const [advertisingBudgetPerQuarter, setAdvertisingBudgetPerQuarter] = useState('');
  const [brandDevelopmentPerQuarter, setBrandDevelopmentPerQuarter] = useState('');
  const [marketingCampaignsPerQuarter, setMarketingCampaignsPerQuarter] = useState('');

  // Administrative Expenses
  const [executiveSalaries, setExecutiveSalaries] = useState('');
  const [financeSalaries, setFinanceSalaries] = useState('');
  const [hrSalaries, setHrSalaries] = useState('');
  const [itSalaries, setItSalaries] = useState('');

  // Occupancy costs
  const [officeRentPerQuarter, setOfficeRentPerQuarter] = useState('');
  const [utilitiesPerQuarter, setUtilitiesPerQuarter] = useState('');

  // Technology costs
  const [softwareLicensesPerQuarter, setSoftwareLicensesPerQuarter] = useState('');
  const [telecommunicationsPerQuarter, setTelecommunicationsPerQuarter] = useState('');

  // Other admin costs
  const [officeSuppliesPerQuarter, setOfficeSuppliesPerQuarter] = useState('');
  const [legalFeesPerQuarter, setLegalFeesPerQuarter] = useState('');
  const [badDebtRate, setBadDebtRate] = useState('');
  const [depreciationOfficeEquipment, setDepreciationOfficeEquipment] = useState('');

  const [sgaResult, setSgaResult] = useState<any>(null);
  const [sgaErrors, setSgaErrors] = useState<string[]>([]);

  // Schedule 7: Cash Receipts Budget state
  const [percentCollectedSameQuarter, setPercentCollectedSameQuarter] = useState('');
  const [percentCollectedNextQuarter, setPercentCollectedNextQuarter] = useState('');
  const [percentUncollectible, setPercentUncollectible] = useState('');
  const [beginningAccountsReceivable, setBeginningAccountsReceivable] = useState('');
  const [cashReceiptsResult, setCashReceiptsResult] = useState<CashReceiptsOutput | null>(null);
  const [cashReceiptsErrors, setCashReceiptsErrors] = useState<string[]>([]);
  const [cashReceiptsWarnings, setCashReceiptsWarnings] = useState<string[]>([]);

  // Schedule 8: Cash Disbursements Budget state
  const [percentMaterialPaidSameQuarter, setPercentMaterialPaidSameQuarter] = useState('');
  const [percentMaterialPaidNextQuarter, setPercentMaterialPaidNextQuarter] = useState('');
  const [beginningAccountsPayable, setBeginningAccountsPayable] = useState('');
  const [incomeTaxQ1, setIncomeTaxQ1] = useState('');
  const [incomeTaxQ2, setIncomeTaxQ2] = useState('');
  const [incomeTaxQ3, setIncomeTaxQ3] = useState('');
  const [incomeTaxQ4, setIncomeTaxQ4] = useState('');
  const [dividendQ1, setDividendQ1] = useState('');
  const [dividendQ2, setDividendQ2] = useState('');
  const [dividendQ3, setDividendQ3] = useState('');
  const [dividendQ4, setDividendQ4] = useState('');
  const [capexQ1, setCapexQ1] = useState('');
  const [capexQ2, setCapexQ2] = useState('');
  const [capexQ3, setCapexQ3] = useState('');
  const [capexQ4, setCapexQ4] = useState('');
  const [loanPaymentQ1, setLoanPaymentQ1] = useState('');
  const [loanPaymentQ2, setLoanPaymentQ2] = useState('');
  const [loanPaymentQ3, setLoanPaymentQ3] = useState('');
  const [loanPaymentQ4, setLoanPaymentQ4] = useState('');
  const [cashDisbursementsResult, setCashDisbursementsResult] = useState<CashDisbursementOutput | null>(null);
  const [cashDisbursementsErrors, setCashDisbursementsErrors] = useState<string[]>([]);
  const [cashDisbursementsWarnings, setCashDisbursementsWarnings] = useState<string[]>([]);

  // Schedule 9: Cash Budget state
  const [beginningCashBalance, setBeginningCashBalance] = useState('');
  const [minimumCashBalance, setMinimumCashBalance] = useState('');
  const [interestRateOnBorrowing, setInterestRateOnBorrowing] = useState('');
  const [interestRateOnInvestments, setInterestRateOnInvestments] = useState('');
  const [cashBudgetResult, setCashBudgetResult] = useState<CashBudgetOutput | null>(null);
  const [cashBudgetErrors, setCashBudgetErrors] = useState<string[]>([]);
  const [cashBudgetWarnings, setCashBudgetWarnings] = useState<string[]>([]);

  // Schedule 10: COGS state
  const [beginningWIPInventory, setBeginningWIPInventory] = useState('');
  const [endingWIPInventory, setEndingWIPInventory] = useState('');
  const [beginningFinishedGoodsInventory, setBeginningFinishedGoodsInventory] = useState('');
  const [endingFinishedGoodsInventory, setEndingFinishedGoodsInventory] = useState('');
  const [cogsResult, setCogsResult] = useState<COGSOutput | null>(null);
  const [cogsErrors, setCogsErrors] = useState<string[]>([]);
  const [cogsWarnings, setCogsWarnings] = useState<string[]>([]);

  // Schedule 11: Income Statement state
  const [interestExpense, setInterestExpense] = useState('');
  const [incomeTaxRate, setIncomeTaxRate] = useState('');
  const [incomeStatementResult, setIncomeStatementResult] = useState<IncomeStatementOutput | null>(null);
  const [incomeStatementErrors, setIncomeStatementErrors] = useState<string[]>([]);
  const [incomeStatementWarnings, setIncomeStatementWarnings] = useState<string[]>([]);

  // Schedule 12: Cash Flow Statement state
  const [cfBeginningCash, setCfBeginningCash] = useState('');
  const [cfBeginningAR, setCfBeginningAR] = useState('');
  const [cfBeginningInventory, setCfBeginningInventory] = useState('');
  const [cfBeginningAP, setCfBeginningAP] = useState('');
  const [cfLoanProceeds, setCfLoanProceeds] = useState('');
  const [cfStockIssued, setCfStockIssued] = useState('');
  const [cfAssetSales, setCfAssetSales] = useState('');
  const [cashFlowResult, setCashFlowResult] = useState<CashFlowStatementOutput | null>(null);
  const [cashFlowErrors, setCashFlowErrors] = useState<string[]>([]);
  const [cashFlowWarnings, setCashFlowWarnings] = useState<string[]>([]);

  // Schedule 13: Balance Sheet state
  const [bsBeginningCash, setBsBeginningCash] = useState('');
  const [bsBeginningAR, setBsBeginningAR] = useState('');
  const [bsBeginningRawMaterial, setBsBeginningRawMaterial] = useState('');
  const [bsBeginningWIP, setBsBeginningWIP] = useState('');
  const [bsBeginningFG, setBsBeginningFG] = useState('');
  const [bsBeginningOtherCurrentAssets, setBsBeginningOtherCurrentAssets] = useState('');
  const [bsBeginningFixedAssets, setBsBeginningFixedAssets] = useState('');
  const [bsBeginningAccumDepr, setBsBeginningAccumDepr] = useState('');
  const [bsBeginningOtherAssets, setBsBeginningOtherAssets] = useState('');
  const [bsBeginningAP, setBsBeginningAP] = useState('');
  const [bsBeginningWagesPayable, setBsBeginningWagesPayable] = useState('');
  const [bsBeginningTaxesPayable, setBsBeginningTaxesPayable] = useState('');
  const [bsBeginningOtherAccrued, setBsBeginningOtherAccrued] = useState('');
  const [bsBeginningShortTermDebt, setBsBeginningShortTermDebt] = useState('');
  const [bsBeginningLongTermDebt, setBsBeginningLongTermDebt] = useState('');
  const [bsBeginningCommonStock, setBsBeginningCommonStock] = useState('');
  const [bsBeginningRetainedEarnings, setBsBeginningRetainedEarnings] = useState('');
  const [bsNewLongTermBorrowing, setBsNewLongTermBorrowing] = useState('');
  const [bsLongTermDebtRepayment, setBsLongTermDebtRepayment] = useState('');
  const [bsStockIssued, setBsStockIssued] = useState('');
  const [balanceSheetResult, setBalanceSheetResult] = useState<BalanceSheetOutput | null>(null);
  const [balanceSheetErrors, setBalanceSheetErrors] = useState<string[]>([]);
  const [balanceSheetWarnings, setBalanceSheetWarnings] = useState<string[]>([]);

  // Save preferences to localStorage when they change
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
  };

  const applyGrowthRate = () => {
    const growth = parseFloat(growthRate) / 100 || 0;
    const priorQ1 = parseFloat(priorQ1Sales) || 0;
    const priorQ2 = parseFloat(priorQ2Sales) || 0;
    const priorQ3 = parseFloat(priorQ3Sales) || 0;
    const priorQ4 = parseFloat(priorQ4Sales) || 0;

    if (priorQ1 === 0 && priorQ2 === 0 && priorQ3 === 0 && priorQ4 === 0) {
      alert('Please enter prior year sales data first');
      return;
    }

    setQ1Sales(String(Math.round(priorQ1 * (1 + growth))));
    setQ2Sales(String(Math.round(priorQ2 * (1 + growth))));
    setQ3Sales(String(Math.round(priorQ3 * (1 + growth))));
    setQ4Sales(String(Math.round(priorQ4 * (1 + growth))));
  };

  // =============================================================================
  // EXAMPLE DATA: ABC Manufacturing Company
  // =============================================================================
  // This is a fixed, tested dataset that works perfectly across all 13 schedules.
  // The data represents a realistic manufacturing company scenario.
  // =============================================================================

  const loadExampleData = () => {
    // =========================================================================
    // COMPANY INFORMATION
    // =========================================================================
    setCompanyName('ABC Manufacturing Company');
    setProductName('Premium Widget');
    setCurrency('USD');
    setFiscalYear('2026');
    setAssumptions('Example data for ABC Manufacturing Company - a mid-sized widget manufacturer with steady growth and seasonal demand patterns.');

    // =========================================================================
    // SCHEDULE 1: SALES BUDGET
    // =========================================================================
    // Prior Year Sales (for comparison)
    setPriorQ1Sales('10000');
    setPriorQ2Sales('12000');
    setPriorQ3Sales('15000');
    setPriorQ4Sales('13000');

    // Current Year Forecast (10% growth)
    setQ1Sales('11000');
    setQ2Sales('13200');
    setQ3Sales('16500');
    setQ4Sales('14300');

    // Pricing
    setSellingPrice('50');
    setInflationRate('0.02');
    setPriceAdjustment('inflation');

    // Cash/Credit Split
    setCashSalesPercentage('0.30');
    setCreditSalesPercentage('0.70');
    setGrowthRate('0.10');

    // =========================================================================
    // SCHEDULE 2: PRODUCTION BUDGET
    // =========================================================================
    setBeginningInventory('2000');
    setEndingInventoryRatio('0.15');
    setNextYearQ1Sales('12100');
    setMaxCapacity('20000');
    setMinBatchSize('1000');
    setOptimalBatchSize('5000');
    setCarryingCost('2.50');
    setUseJIT(false);
    setObsolescenceRisk('0.02');

    // =========================================================================
    // SCHEDULE 3: DIRECT MATERIAL BUDGET
    // =========================================================================
    setMaterials([
      {
        name: 'Steel Frame',
        requiredPerUnit: 2,
        costPerUnit: 8,
        beginningInventory: 5000,
        desiredEndingInventoryRatio: 0.10,
        unit: 'kg',
        scrapWastePercentage: 0.03,
        bulkDiscountThreshold: 10000,
        bulkDiscountRate: 0.08,
        priceInflationRate: 0.015,
        useJIT: false,
      },
      {
        name: 'Electronic Components',
        requiredPerUnit: 3,
        costPerUnit: 12,
        beginningInventory: 8000,
        desiredEndingInventoryRatio: 0.12,
        unit: 'pieces',
        scrapWastePercentage: 0.02,
        bulkDiscountThreshold: 15000,
        bulkDiscountRate: 0.10,
        priceInflationRate: 0.01,
        useJIT: false,
      },
      {
        name: 'Plastic Housing',
        requiredPerUnit: 1,
        costPerUnit: 5,
        beginningInventory: 3000,
        desiredEndingInventoryRatio: 0.10,
        unit: 'units',
        scrapWastePercentage: 0.04,
        bulkDiscountThreshold: 8000,
        bulkDiscountRate: 0.05,
        priceInflationRate: 0.02,
        useJIT: false,
      },
    ]);
    setNextYearQ1Production('12500');
    setPercentPaidCurrentQuarter('0.60');
    setPercentPaidNextQuarter('0.40');

    // =========================================================================
    // SCHEDULE 4: DIRECT LABOR BUDGET
    // =========================================================================
    setUseSimpleLaborInput(false);
    setDirectLaborHoursPerUnit('3');
    setHourlyWageRate('25');

    setLaborCategories([
      {
        name: 'Assembly Workers',
        hoursPerUnit: 1.5,
        wageRatePerHour: 22,
      },
      {
        name: 'Quality Inspectors',
        hoursPerUnit: 0.5,
        wageRatePerHour: 28,
      },
      {
        name: 'Finishing Technicians',
        hoursPerUnit: 1.0,
        wageRatePerHour: 25,
      },
    ]);

    setWageInflationRate('0.02');
    setOvertimeThreshold('2000');
    setOvertimeMultiplier('1.5');
    setFringeBenefitRate('0.25');
    setProductivityEfficiencyRate('0.95');
    setTurnoverRate('0.12');
    setTrainingCostPerEmployee('1500');
    setAverageHoursPerEmployee('500');

    // =========================================================================
    // SCHEDULE 5: MANUFACTURING OVERHEAD BUDGET
    // =========================================================================
    setOverheadApproach('abc');
    setUseActivityBasedCosting(true);

    // Simple approach values (also used as fallback)
    setVariableOverheadRatePerUnit('6');
    setVariableOverheadRatePerLaborHour('3');
    setFixedOverheadPerQuarter('28000');
    setDepreciationPerQuarter('8000');
    setAllocationBase('labor-hours');

    // ABC Activity Drivers
    setProductionRunsQ1('15');
    setProductionRunsQ2('18');
    setProductionRunsQ3('22');
    setProductionRunsQ4('19');
    setCostPerProductionRun('800');

    setInspectionsQ1('25');
    setInspectionsQ2('30');
    setInspectionsQ3('35');
    setInspectionsQ4('32');
    setCostPerInspection('150');

    setMachineHoursQ1('1200');
    setMachineHoursQ2('1400');
    setMachineHoursQ3('1700');
    setMachineHoursQ4('1500');
    setCostPerMachineHour('15');

    // Facility Costs
    setFacilityRent('12000');
    setFacilityInsurance('3000');
    setPropertyTaxes('2000');
    setUtilities('4000');
    setUtilitiesIsVariable(false);

    // Labor Overhead
    setSupervisorySalaries('18000');
    setSupportStaffSalaries('12000');

    // Materials Overhead
    setIndirectMaterialsPerUnit('3');
    setShopSuppliesPerQuarter('1500');

    // Maintenance
    setPlannedMaintenancePerQuarter('4500');
    setMaintenancePerMachineHour('6');

    // Quality Control
    setQualityControlPerUnit('1.5');
    setQualityControlLabor('6500');

    // Other Overhead
    setTechnologyCosts('2000');
    setWarehouseCosts('3500');
    setEnvironmentalComplianceCosts('1500');

    // =========================================================================
    // SCHEDULE 6: SELLING & ADMINISTRATIVE EXPENSE BUDGET
    // =========================================================================
    setSgaApproach('detailed');
    setUseSimpleSGA(false);

    // Simple approach values
    setVariableSellingExpenseRate('0.08');
    setVariableAdminExpenseRate('0.05');
    setFixedSellingExpensePerQuarter('35000');
    setFixedAdminExpensePerQuarter('45000');

    // Sales Expenses
    setCommissionRate('0.05');
    setCommissionPerUnit('');
    setDistributionCostPerUnit('3.50');
    setDistributionFixedCostPerQuarter('8000');
    setCustomerServiceSalaries('15000');
    setWarrantyExpensePerUnit('1.50');

    // Marketing Expenses
    setAdvertisingBudgetPerQuarter('12000');
    setBrandDevelopmentPerQuarter('8000');
    setMarketingCampaignsPerQuarter('10000');

    // Administrative Salaries
    setExecutiveSalaries('35000');
    setFinanceSalaries('22000');
    setHrSalaries('15000');
    setItSalaries('20000');

    // Office/Occupancy
    setOfficeRentPerQuarter('10000');
    setUtilitiesPerQuarter('3000');

    // Technology
    setSoftwareLicensesPerQuarter('4500');
    setTelecommunicationsPerQuarter('1500');

    // Other Admin
    setOfficeSuppliesPerQuarter('1200');
    setLegalFeesPerQuarter('5000');
    setBadDebtRate('0.02');
    setDepreciationOfficeEquipment('3500');

    // =========================================================================
    // SCHEDULE 7: CASH RECEIPTS BUDGET
    // =========================================================================
    setPercentCollectedSameQuarter('0.70');
    setPercentCollectedNextQuarter('0.28');
    setPercentUncollectible('0.02');
    setBeginningAccountsReceivable('25000');

    // =========================================================================
    // SCHEDULE 8: CASH DISBURSEMENTS BUDGET
    // =========================================================================
    setPercentMaterialPaidSameQuarter('0.55');
    setPercentMaterialPaidNextQuarter('0.45');
    setBeginningAccountsPayable('20000');

    // Quarterly Payments
    setIncomeTaxQ1('0');
    setIncomeTaxQ2('12000');
    setIncomeTaxQ3('0');
    setIncomeTaxQ4('15000');

    setDividendQ1('0');
    setDividendQ2('0');
    setDividendQ3('0');
    setDividendQ4('8000');

    setCapexQ1('10000');
    setCapexQ2('0');
    setCapexQ3('15000');
    setCapexQ4('0');

    setLoanPaymentQ1('6000');
    setLoanPaymentQ2('6000');
    setLoanPaymentQ3('6000');
    setLoanPaymentQ4('6000');

    // =========================================================================
    // SCHEDULE 9: CASH BUDGET
    // =========================================================================
    setBeginningCashBalance('40000');
    setMinimumCashBalance('15000');
    setInterestRateOnBorrowing('0.08');
    setInterestRateOnInvestments('0.03');

    // =========================================================================
    // SCHEDULE 10: COST OF GOODS MANUFACTURED & SOLD
    // =========================================================================
    setBeginningWIPInventory('3000');
    setEndingWIPInventory('3500');
    setBeginningFinishedGoodsInventory('10000');
    setEndingFinishedGoodsInventory('12000');

    // =========================================================================
    // SCHEDULE 11: INCOME STATEMENT
    // =========================================================================
    setInterestExpense('15000');
    setIncomeTaxRate('0.25');

    // =========================================================================
    // SCHEDULE 12: CASH FLOW STATEMENT
    // =========================================================================
    setCfBeginningCash('40000');
    setCfBeginningAR('50000');
    setCfBeginningInventory('60000');
    setCfBeginningAP('35000');
    setCfLoanProceeds('25000');
    setCfStockIssued('10000');
    setCfAssetSales('5000');

    // =========================================================================
    // SCHEDULE 13: BALANCE SHEET
    // =========================================================================
    setBsBeginningCash('40000');
    setBsBeginningAR('60000');
    setBsBeginningRawMaterial('22000');
    setBsBeginningWIP('10000');
    setBsBeginningFG('30000');
    setBsBeginningOtherCurrentAssets('5000');
    setBsBeginningFixedAssets('350000');
    setBsBeginningAccumDepr('100000');
    setBsBeginningOtherAssets('10000');
    setBsBeginningAP('40000');
    setBsBeginningWagesPayable('10000');
    setBsBeginningTaxesPayable('12000');
    setBsBeginningOtherAccrued('5000');
    setBsBeginningShortTermDebt('15000');
    setBsBeginningLongTermDebt('100000');
    setBsBeginningCommonStock('150000');
    setBsBeginningRetainedEarnings('95000');
    setBsNewLongTermBorrowing('20000');
    setBsLongTermDebtRepayment('10000');
    setBsStockIssued('10000');

    // =========================================================================
    // AUTO-CALCULATE ALL SCHEDULES
    // =========================================================================
    // We calculate directly with the example values since React state updates are async

    // Schedule 1: Sales Budget
    const salesInputs: SalesBudgetInputs = {
      historicalSalesUnits: { q1: 10000, q2: 12000, q3: 15000, q4: 13000, yearly: 50000 },
      forecastedSalesUnits: { q1: 11000, q2: 13200, q3: 16500, q4: 14300, yearly: 55000 },
      sellingPricePerUnit: 50,
      priceInflationRate: 0.02,
      cashSalesPercentage: 0.30,
      creditSalesPercentage: 0.70,
    };
    const salesOutput = calculateSalesBudget(salesInputs);
    const salesFormatted = formatSalesBudgetForDisplay(salesOutput, salesInputs);
    setResult(salesFormatted);
    setErrors([]);
    setSalesRawOutput(salesOutput);
    setHistoricalSalesData(salesInputs.historicalSalesUnits || null);

    // Schedule 2: Production Budget
    const productionInputs: ProductionBudgetInputs = {
      forecastedSalesUnits: { q1: 11000, q2: 13200, q3: 16500, q4: 14300, yearly: 55000 },
      beginningInventory: 2000,
      desiredEndingInventoryRatio: 0.15,
      nextYearQ1ForecastedSales: 12100,
      maxProductionCapacityPerQuarter: 20000,
      minimumBatchSize: 1000,
      optimalBatchSize: 5000,
      inventoryCarryingCostPerUnit: 2.50,
      useJIT: false,
      obsolescenceRiskPercentage: 0.02,
    };
    const productionOutput = calculateProductionBudget(productionInputs);
    const productionFormatted = formatProductionBudgetForDisplay(productionOutput, productionInputs);
    setProductionResult(productionFormatted);
    setProductionErrors([]);
    setProductionRawOutput(productionOutput);

    // Schedule 3: Direct Material Budget
    const exampleMaterials: MaterialType[] = [
      { name: 'Steel Frame', requiredPerUnit: 2, costPerUnit: 8, beginningInventory: 5000, desiredEndingInventoryRatio: 0.10, unit: 'kg', scrapWastePercentage: 0.03, bulkDiscountThreshold: 10000, bulkDiscountRate: 0.08, priceInflationRate: 0.015, useJIT: false },
      { name: 'Electronic Components', requiredPerUnit: 3, costPerUnit: 12, beginningInventory: 8000, desiredEndingInventoryRatio: 0.12, unit: 'pieces', scrapWastePercentage: 0.02, bulkDiscountThreshold: 15000, bulkDiscountRate: 0.10, priceInflationRate: 0.01, useJIT: false },
      { name: 'Plastic Housing', requiredPerUnit: 1, costPerUnit: 5, beginningInventory: 3000, desiredEndingInventoryRatio: 0.10, unit: 'units', scrapWastePercentage: 0.04, bulkDiscountThreshold: 8000, bulkDiscountRate: 0.05, priceInflationRate: 0.02, useJIT: false },
    ];
    const materialInputs: DirectMaterialBudgetInputs = {
      unitsToBeProduced: productionOutput.requiredProduction,
      materials: exampleMaterials,
      nextYearQ1Production: 12500,
      percentPaidInCurrentQuarter: 0.60,
      percentPaidInNextQuarter: 0.40,
    };
    const materialOutput = calculateDirectMaterialBudget(materialInputs);
    const materialFormatted = formatDirectMaterialBudgetForDisplay(materialOutput);
    setMaterialResult(materialFormatted);
    setMaterialErrors([]);
    setMaterialRawOutput(materialOutput);

    // Schedule 4: Direct Labor Budget
    const exampleLaborCategories: LaborCategory[] = [
      { name: 'Assembly Workers', hoursPerUnit: 1.5, wageRatePerHour: 22 },
      { name: 'Quality Inspectors', hoursPerUnit: 0.5, wageRatePerHour: 28 },
      { name: 'Finishing Technicians', hoursPerUnit: 1.0, wageRatePerHour: 25 },
    ];
    const laborInputs: DirectLabourBudgetInputs = {
      unitsToBeProduced: productionOutput.requiredProduction,
      laborCategories: exampleLaborCategories,
      wageInflationRate: 0.02,
      overtimeThreshold: 2000,
      overtimeMultiplier: 1.5,
      fringeBenefitRate: 0.25,
      productivityEfficiencyRate: 0.95,
      turnoverRate: 0.12,
      trainingCostPerEmployee: 1500,
      averageHoursPerEmployee: 500,
    };
    const laborOutput = calculateDirectLaborBudget(laborInputs);
    const laborFormatted = formatDirectLaborBudgetForDisplay(laborOutput);
    setLaborResult(laborFormatted);
    setLaborErrors([]);
    setLaborRawOutput(laborOutput);

    // Schedule 5: Manufacturing Overhead Budget
    const overheadInputs: ManufacturingOverheadInputs = {
      unitsToBeProduced: productionOutput.requiredProduction,
      directLaborHours: laborOutput.totalLaborHoursRequired,
      variableOverheadRatePerUnit: 6,
      variableOverheadRatePerLaborHour: 3,
      fixedOverheadPerQuarter: 28000,
      depreciationPerQuarter: 8000,
      useActivityBasedCosting: true,
      numberOfProductionRuns: { q1: 15, q2: 18, q3: 22, q4: 19, yearly: 74 },
      costPerProductionRun: 800,
      numberOfInspections: { q1: 25, q2: 30, q3: 35, q4: 32, yearly: 122 },
      costPerInspection: 150,
      machineHours: { q1: 1200, q2: 1400, q3: 1700, q4: 1500, yearly: 5800 },
      costPerMachineHour: 15,
      facilityRent: 12000,
      facilityInsurance: 3000,
      propertyTaxes: 2000,
      utilities: 4000,
      utilitiesIsVariable: false,
      supervisorySalaries: 18000,
      supportStaffSalaries: 12000,
      indirectMaterialsPerUnit: 3,
      shopSuppliesPerQuarter: 1500,
      plannedMaintenancePerQuarter: 4500,
      maintenancePerMachineHour: 6,
      qualityControlPerUnit: 1.5,
      qualityControlLabor: 6500,
      technologyCosts: 2000,
      warehouseCosts: 3500,
      environmentalComplianceCosts: 1500,
    };
    const overheadOutput = calculateManufacturingOverheadBudget(overheadInputs);
    const overheadFormatted = formatManufacturingOverheadBudgetForDisplay(overheadOutput);
    setOverheadResult(overheadFormatted);
    setOverheadErrors([]);
    setOverheadRawOutput(overheadOutput);

    // Schedule 6: SG&A Expense Budget
    const sgaInputs: SellingAdminExpenseInputs = {
      salesRevenue: salesOutput.salesRevenue,
      salesUnits: salesOutput.salesUnits,
      commissionRate: 0.05,
      distributionCostPerUnit: 3.50,
      distributionFixedCostPerQuarter: 8000,
      customerServiceSalaries: 15000,
      warrantyExpensePerUnit: 1.50,
      advertisingBudgetPerQuarter: 12000,
      brandDevelopmentPerQuarter: 8000,
      marketingCampaignsPerQuarter: 10000,
      executiveSalaries: 35000,
      financeSalaries: 22000,
      hrSalaries: 15000,
      itSalaries: 20000,
      officeRentPerQuarter: 10000,
      utilitiesPerQuarter: 3000,
      softwareLicensesPerQuarter: 4500,
      telecommunicationsPerQuarter: 1500,
      officeSuppliesPerQuarter: 1200,
      legalFeesPerQuarter: 5000,
      badDebtRate: 0.02,
      depreciationOfficeEquipment: 3500,
    };
    const sgaOutput = calculateSellingAdminExpenseBudget(sgaInputs);
    const sgaFormatted = formatSellingAdminExpenseBudgetForDisplay(sgaOutput);
    setSgaResult(sgaFormatted);
    setSgaErrors([]);
    setSgaRawOutput(sgaOutput);

    // Schedule 7: Cash Receipts Budget
    const cashReceiptsInputs: CashReceiptsInputs = {
      percentCollectedInSameQuarter: 0.70,
      percentCollectedInNextQuarter: 0.28,
      percentUncollectible: 0.02,
      beginningAccountsReceivable: 25000,
    };
    const cashReceiptsCalc = calculateCashReceiptsBudget(salesOutput, cashReceiptsInputs);
    setCashReceiptsResult(cashReceiptsCalc.output);
    setCashReceiptsErrors(cashReceiptsCalc.validation.errors);

    // Schedule 8: Cash Disbursements Budget
    const cashDisbursementsInputs: CashDisbursementInputs = {
      percentMaterialPaidSameQuarter: 0.55,
      percentMaterialPaidNextQuarter: 0.45,
      beginningAccountsPayable: 20000,
      incomeTaxPayments: { q1: 0, q2: 12000, q3: 0, q4: 15000, yearly: 27000 },
      dividendPayments: { q1: 0, q2: 0, q3: 0, q4: 8000, yearly: 8000 },
      capitalExpenditures: { q1: 10000, q2: 0, q3: 15000, q4: 0, yearly: 25000 },
      loanPayments: { q1: 6000, q2: 6000, q3: 6000, q4: 6000, yearly: 24000 },
    };
    const cashDisbursementsCalc = calculateCashDisbursementsBudget(
      materialOutput,
      laborOutput,
      overheadOutput,
      sgaOutput,
      cashDisbursementsInputs
    );
    setCashDisbursementsResult(cashDisbursementsCalc.output);
    setCashDisbursementsErrors(cashDisbursementsCalc.validation.errors);

    // Schedule 9: Cash Budget
    if (cashReceiptsCalc.output && cashDisbursementsCalc.output) {
      const cashBudgetInputs: CashBudgetInputs = {
        beginningCashBalance: 40000,
        minimumCashBalance: 15000,
        interestRateOnBorrowing: 0.08,
        interestRateOnInvestments: 0.03,
      };
      const cashBudgetCalc = calculateCashBudget(
        cashReceiptsCalc.output,
        cashDisbursementsCalc.output,
        cashBudgetInputs
      );
      setCashBudgetResult(cashBudgetCalc.output);
      setCashBudgetErrors(cashBudgetCalc.validation.errors);

      // Schedule 10: COGS
      const cogsInputs: COGSInputs = {
        beginningWIPInventory: 3000,
        endingWIPInventory: 3500,
        beginningFinishedGoodsInventory: 10000,
        endingFinishedGoodsInventory: 12000,
      };
      const cogsCalc = calculateCOGS(
        materialOutput,
        laborOutput,
        overheadOutput,
        productionOutput,
        cogsInputs
      );
      setCogsResult(cogsCalc.output);
      setCogsErrors(cogsCalc.validation.errors);

      // Schedule 11: Income Statement
      if (cogsCalc.output) {
        const incomeStatementInputs: IncomeStatementInputs = {
          interestExpense: 15000,
          incomeTaxRate: 0.25,
        };
        const incomeStatementCalc = calculateIncomeStatement(
          salesOutput,
          cogsCalc.output,
          sgaOutput,
          incomeStatementInputs
        );
        setIncomeStatementResult(incomeStatementCalc.output);
        setIncomeStatementErrors(incomeStatementCalc.validation.errors);

        // Schedule 12: Cash Flow Statement
        if (incomeStatementCalc.output) {
          const cashFlowInputs: CashFlowStatementInputs = {
            beginningCash: 40000,
            beginningAccountsReceivable: 50000,
            beginningInventory: 60000,
            beginningAccountsPayable: 35000,
            loanProceeds: 25000,
            stockIssued: 10000,
            proceedsFromAssetSales: 5000,
          };
          const cashFlowCalc = calculateCashFlowStatement(
            incomeStatementCalc.output,
            cashReceiptsCalc.output,
            cashDisbursementsCalc.output,
            overheadOutput,
            salesOutput,
            cogsCalc.output,
            cashFlowInputs
          );
          setCashFlowResult(cashFlowCalc.output);
          setCashFlowErrors(cashFlowCalc.validation.errors);

          // Schedule 13: Balance Sheet
          const balanceSheetInputs: BalanceSheetInputs = {
            beginningCash: 40000,
            beginningAccountsReceivable: 60000,
            beginningRawMaterialInventory: 22000,
            beginningWIPInventory: 10000,
            beginningFinishedGoodsInventory: 30000,
            beginningOtherCurrentAssets: 5000,
            beginningFixedAssets: 350000,
            beginningAccumulatedDepreciation: 100000,
            beginningOtherAssets: 10000,
            beginningAccountsPayable: 40000,
            beginningWagesPayable: 10000,
            beginningTaxesPayable: 12000,
            beginningOtherAccruedExpenses: 5000,
            beginningShortTermDebt: 15000,
            beginningLongTermDebt: 100000,
            beginningCommonStock: 150000,
            beginningRetainedEarnings: 95000,
            newLongTermBorrowing: 20000,
            longTermDebtRepayment: 10000,
            stockIssued: 10000,
          };
          const balanceSheetCalc = calculateBalanceSheet(
            incomeStatementCalc.output,
            cashBudgetCalc.output,
            cashReceiptsCalc.output,
            cashDisbursementsCalc.output,
            cogsCalc.output,
            overheadOutput,
            salesOutput,
            balanceSheetInputs
          );
          setBalanceSheetResult(balanceSheetCalc.output);
          setBalanceSheetErrors(balanceSheetCalc.validation.errors);
        }
      }
    }
  };

  const handleCalculate = () => {
    const priorYearTotal = (parseFloat(priorQ1Sales) || 0) + (parseFloat(priorQ2Sales) || 0) + (parseFloat(priorQ3Sales) || 0) + (parseFloat(priorQ4Sales) || 0);
    const hasPriorYearData = priorYearTotal > 0;

    const hasCashCreditData = cashSalesPercentage !== '' || creditSalesPercentage !== '';

    const inputs: SalesBudgetInputs = {
      historicalSalesUnits: hasPriorYearData ? {
        q1: parseFloat(priorQ1Sales) || 0,
        q2: parseFloat(priorQ2Sales) || 0,
        q3: parseFloat(priorQ3Sales) || 0,
        q4: parseFloat(priorQ4Sales) || 0,
        yearly: priorYearTotal,
      } : undefined,
      forecastedSalesUnits: {
        q1: parseFloat(q1Sales) || 0,
        q2: parseFloat(q2Sales) || 0,
        q3: parseFloat(q3Sales) || 0,
        q4: parseFloat(q4Sales) || 0,
        yearly: (parseFloat(q1Sales) || 0) + (parseFloat(q2Sales) || 0) + (parseFloat(q3Sales) || 0) + (parseFloat(q4Sales) || 0),
      },
      sellingPricePerUnit: parseFloat(sellingPrice) || 0,
      priceInflationRate: priceAdjustment === 'inflation' ? (parseFloat(inflationRate) || 0) : 0,
      cashSalesPercentage: hasCashCreditData ? (parseFloat(cashSalesPercentage) || 0) : undefined,
      creditSalesPercentage: hasCashCreditData ? (parseFloat(creditSalesPercentage) || 0) : undefined,
    };

    const validationErrors = validateSalesBudgetInputs(inputs);
    const actualErrors = validationErrors.filter(e => !e.startsWith('WARNING:'));

    if (actualErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    const output = calculateSalesBudget(inputs);
    const formatted = formatSalesBudgetForDisplay(output, inputs);
    setResult(formatted);
    setErrors(validationErrors); // Keep warnings visible even after successful calculation
    setSalesRawOutput(output);
    setHistoricalSalesData(inputs.historicalSalesUnits || null);
  };

  const handleCalculateProduction = () => {
    if (!result) {
      alert('Please calculate Sales Budget first (Schedule 1)');
      return;
    }

    const inputs: ProductionBudgetInputs = {
      forecastedSalesUnits: {
        q1: parseFloat(q1Sales) || 0,
        q2: parseFloat(q2Sales) || 0,
        q3: parseFloat(q3Sales) || 0,
        q4: parseFloat(q4Sales) || 0,
        yearly: (parseFloat(q1Sales) || 0) + (parseFloat(q2Sales) || 0) + (parseFloat(q3Sales) || 0) + (parseFloat(q4Sales) || 0),
      },
      beginningInventory: parseFloat(beginningInventory) || 0,
      desiredEndingInventoryRatio: parseFloat(endingInventoryRatio) || 0,
      nextYearQ1ForecastedSales: nextYearQ1Sales ? parseFloat(nextYearQ1Sales) : undefined,
      maxProductionCapacityPerQuarter: maxCapacity ? parseFloat(maxCapacity) : undefined,
      minimumBatchSize: minBatchSize ? parseFloat(minBatchSize) : undefined,
      optimalBatchSize: optimalBatchSize ? parseFloat(optimalBatchSize) : undefined,
      inventoryCarryingCostPerUnit: carryingCost ? parseFloat(carryingCost) : undefined,
      useJIT,
      obsolescenceRiskPercentage: obsolescenceRisk ? parseFloat(obsolescenceRisk) : undefined,
    };

    const validationErrors = validateProductionBudgetInputs(inputs);
    const actualErrors = validationErrors.filter(e => !e.startsWith('WARNING:'));

    if (actualErrors.length > 0) {
      setProductionErrors(validationErrors);
      setProductionResult(null);
      return;
    }

    const output = calculateProductionBudget(inputs);
    const formatted = formatProductionBudgetForDisplay(output, inputs);
    setProductionResult(formatted);
    setProductionErrors(validationErrors);
    setProductionRawOutput(output);
  };

  const downloadCSV = () => {
    if (!result) return;

    let csvContent = `${companyName || 'Your Company'} - ${productName || 'Product'}\n`;
    csvContent += `Schedule 1: Sales Budget\n`;
    csvContent += `For the Year Ending December 31, ${fiscalYear}\n`;
    csvContent += `Currency: ${currency}\n`;
    if (assumptions) {
      csvContent += `Assumptions: ${assumptions}\n`;
    }
    csvContent += `\n`;

    // Headers
    csvContent += result.headers.join(',') + '\n';

    // Rows - remove commas from numbers to prevent CSV corruption
    result.rows.forEach((row: any) => {
      const cleanQ1 = String(row.q1).replace(/,/g, '');
      const cleanQ2 = String(row.q2).replace(/,/g, '');
      const cleanQ3 = String(row.q3).replace(/,/g, '');
      const cleanQ4 = String(row.q4).replace(/,/g, '');
      const cleanYearly = String(row.yearly).replace(/,/g, '');
      csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadProductionCSV = () => {
    if (!productionResult) return;

    let csvContent = `${companyName || 'Your Company'} - ${productName || 'Product'}\n`;
    csvContent += `Schedule 2: Production Budget\n`;
    csvContent += `For the Year Ending December 31, ${fiscalYear}\n`;
    csvContent += `\n`;

    // Headers
    csvContent += productionResult.headers.join(',') + '\n';

    // Rows
    productionResult.rows.forEach((row: any) => {
      const cleanQ1 = String(row.q1).replace(/,/g, '');
      const cleanQ2 = String(row.q2).replace(/,/g, '');
      const cleanQ3 = String(row.q3).replace(/,/g, '');
      const cleanQ4 = String(row.q4).replace(/,/g, '');
      const cleanYearly = String(row.yearly).replace(/,/g, '');
      csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `production-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Material management functions
  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        name: '',
        requiredPerUnit: 0,
        costPerUnit: 0,
        beginningInventory: 0,
        desiredEndingInventoryRatio: 0,
        unit: '',
      },
    ]);
  };

  const removeMaterial = (index: number) => {
    if (materials.length === 1) {
      alert('You must have at least one material');
      return;
    }
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof MaterialType, value: any) => {
    const newMaterials = [...materials];
    (newMaterials[index] as any)[field] = value;
    setMaterials(newMaterials);
  };

  const handleCalculateMaterial = () => {
    if (!productionResult) {
      alert('Please calculate Production Budget first (Schedule 2)');
      return;
    }

    const unitsToBeProduced = {
      q1: parseFloat(q1Sales) || 0,
      q2: parseFloat(q2Sales) || 0,
      q3: parseFloat(q3Sales) || 0,
      q4: parseFloat(q4Sales) || 0,
      yearly: (parseFloat(q1Sales) || 0) + (parseFloat(q2Sales) || 0) + (parseFloat(q3Sales) || 0) + (parseFloat(q4Sales) || 0),
    };

    // Use production data from production result
    if (productionResult?.rows) {
      const prodRow = productionResult.rows.find((r: any) => r.label === 'Required Production');
      if (prodRow) {
        unitsToBeProduced.q1 = parseFloat(String(prodRow.q1).replace(/,/g, '')) || 0;
        unitsToBeProduced.q2 = parseFloat(String(prodRow.q2).replace(/,/g, '')) || 0;
        unitsToBeProduced.q3 = parseFloat(String(prodRow.q3).replace(/,/g, '')) || 0;
        unitsToBeProduced.q4 = parseFloat(String(prodRow.q4).replace(/,/g, '')) || 0;
        unitsToBeProduced.yearly = parseFloat(String(prodRow.yearly).replace(/,/g, '')) || 0;
      }
    }

    const inputs: DirectMaterialBudgetInputs = {
      unitsToBeProduced,
      nextYearQ1Production: nextYearQ1Production ? parseFloat(nextYearQ1Production) : undefined,
      materials: materials.map(m => ({
        ...m,
        requiredPerUnit: typeof m.requiredPerUnit === 'string' ? parseFloat(m.requiredPerUnit) || 0 : m.requiredPerUnit,
        costPerUnit: typeof m.costPerUnit === 'string' ? parseFloat(m.costPerUnit) || 0 : m.costPerUnit,
        beginningInventory: typeof m.beginningInventory === 'string' ? parseFloat(m.beginningInventory) || 0 : m.beginningInventory,
        desiredEndingInventoryRatio: typeof m.desiredEndingInventoryRatio === 'string' ? parseFloat(m.desiredEndingInventoryRatio) || 0 : m.desiredEndingInventoryRatio,
      })),
      percentPaidInCurrentQuarter: percentPaidCurrentQuarter ? parseFloat(percentPaidCurrentQuarter) : undefined,
      percentPaidInNextQuarter: percentPaidNextQuarter ? parseFloat(percentPaidNextQuarter) : undefined,
    };

    const validationErrors = validateDirectMaterialBudgetInputs(inputs);
    const actualErrors = validationErrors.filter(e => !e.startsWith('WARNING:'));

    if (actualErrors.length > 0) {
      setMaterialErrors(validationErrors);
      setMaterialResult(null);
      return;
    }

    const output = calculateDirectMaterialBudget(inputs);
    const formatted = formatDirectMaterialBudgetForDisplay(output);
    setMaterialResult(formatted);
    setMaterialErrors(validationErrors);
  };

  const downloadMaterialCSV = () => {
    if (!materialResult) return;

    let csvContent = `${companyName || 'Your Company'} - ${productName || 'Product'}\n`;
    csvContent += `Schedule 3: Direct Material Budget\n`;
    csvContent += `For the Year Ending December 31, ${fiscalYear}\n\n`;

    // For each material
    materialResult.materials?.forEach((material: any) => {
      csvContent += `Material: ${material.name} (${material.unit})\n`;
      csvContent += material.headers.join(',') + '\n';
      material.rows.forEach((row: any) => {
        const cleanQ1 = String(row.q1).replace(/,/g, '');
        const cleanQ2 = String(row.q2).replace(/,/g, '');
        const cleanQ3 = String(row.q3).replace(/,/g, '');
        const cleanQ4 = String(row.q4).replace(/,/g, '');
        const cleanYearly = String(row.yearly).replace(/,/g, '');
        csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
      });
      csvContent += '\n';
    });

    // Total summary
    if (materialResult.summary) {
      csvContent += 'Total Material Purchase Cost\n';
      csvContent += materialResult.summary.headers.join(',') + '\n';
      materialResult.summary.rows.forEach((row: any) => {
        const cleanQ1 = String(row.q1).replace(/,/g, '');
        const cleanQ2 = String(row.q2).replace(/,/g, '');
        const cleanQ3 = String(row.q3).replace(/,/g, '');
        const cleanQ4 = String(row.q4).replace(/,/g, '');
        const cleanYearly = String(row.yearly).replace(/,/g, '');
        csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `direct-material-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Labor category management functions
  const addLaborCategory = () => {
    setLaborCategories([
      ...laborCategories,
      {
        name: '',
        hoursPerUnit: 0,
        wageRatePerHour: 0,
      },
    ]);
  };

  const removeLaborCategory = (index: number) => {
    if (laborCategories.length === 1) {
      alert('You must have at least one labor category');
      return;
    }
    setLaborCategories(laborCategories.filter((_, i) => i !== index));
  };

  const updateLaborCategory = (index: number, field: keyof LaborCategory, value: any) => {
    const newCategories = [...laborCategories];
    (newCategories[index] as any)[field] = value;
    setLaborCategories(newCategories);
  };

  const handleCalculateLabor = () => {
    if (!productionResult) {
      alert('Please calculate Production Budget first (Schedule 2)');
      return;
    }

    const unitsToBeProduced = {
      q1: parseFloat(q1Sales) || 0,
      q2: parseFloat(q2Sales) || 0,
      q3: parseFloat(q3Sales) || 0,
      q4: parseFloat(q4Sales) || 0,
      yearly: (parseFloat(q1Sales) || 0) + (parseFloat(q2Sales) || 0) + (parseFloat(q3Sales) || 0) + (parseFloat(q4Sales) || 0),
    };

    // Use production data from production result
    if (productionResult?.rows) {
      const prodRow = productionResult.rows.find((r: any) => r.label === 'Required Production');
      if (prodRow) {
        unitsToBeProduced.q1 = parseFloat(String(prodRow.q1).replace(/,/g, '')) || 0;
        unitsToBeProduced.q2 = parseFloat(String(prodRow.q2).replace(/,/g, '')) || 0;
        unitsToBeProduced.q3 = parseFloat(String(prodRow.q3).replace(/,/g, '')) || 0;
        unitsToBeProduced.q4 = parseFloat(String(prodRow.q4).replace(/,/g, '')) || 0;
        unitsToBeProduced.yearly = parseFloat(String(prodRow.yearly).replace(/,/g, '')) || 0;
      }
    }

    const inputs: DirectLabourBudgetInputs = {
      unitsToBeProduced,
      directLaborHoursPerUnit: useSimpleLaborInput && directLaborHoursPerUnit ? parseFloat(directLaborHoursPerUnit) : undefined,
      hourlyWageRate: useSimpleLaborInput && hourlyWageRate ? parseFloat(hourlyWageRate) : undefined,
      laborCategories: !useSimpleLaborInput ? laborCategories.map(cat => ({
        ...cat,
        hoursPerUnit: typeof cat.hoursPerUnit === 'string' ? parseFloat(cat.hoursPerUnit) || 0 : cat.hoursPerUnit,
        wageRatePerHour: typeof cat.wageRatePerHour === 'string' ? parseFloat(cat.wageRatePerHour) || 0 : cat.wageRatePerHour,
      })) : undefined,
      wageInflationRate: wageInflationRate ? parseFloat(wageInflationRate) : undefined,
      overtimeThreshold: overtimeThreshold ? parseFloat(overtimeThreshold) : undefined,
      overtimeMultiplier: overtimeMultiplier ? parseFloat(overtimeMultiplier) : undefined,
      fringeBenefitRate: fringeBenefitRate ? parseFloat(fringeBenefitRate) : undefined,
      productivityEfficiencyRate: productivityEfficiencyRate ? parseFloat(productivityEfficiencyRate) : undefined,
      turnoverRate: turnoverRate ? parseFloat(turnoverRate) : undefined,
      trainingCostPerEmployee: trainingCostPerEmployee ? parseFloat(trainingCostPerEmployee) : undefined,
      averageHoursPerEmployee: averageHoursPerEmployee ? parseFloat(averageHoursPerEmployee) : undefined,
    };

    const validationErrors = validateDirectLaborBudgetInputs(inputs);
    const actualErrors = validationErrors.filter(e => !e.startsWith('WARNING:'));

    if (actualErrors.length > 0) {
      setLaborErrors(validationErrors);
      setLaborResult(null);
      return;
    }

    const output = calculateDirectLaborBudget(inputs);
    const formatted = formatDirectLaborBudgetForDisplay(output);
    setLaborResult(formatted);
    setLaborErrors(validationErrors);
  };

  const downloadLaborCSV = () => {
    if (!laborResult) return;

    let csvContent = `${companyName || 'Your Company'} - ${productName || 'Product'}\n`;
    csvContent += `Schedule 4: Direct Labor Budget\n`;
    csvContent += `For the Year Ending December 31, ${fiscalYear}\n\n`;

    // If multi-category, include each category
    if (laborResult.categoryTables) {
      laborResult.categoryTables.forEach((cat: any) => {
        csvContent += `Labor Category: ${cat.categoryName}\n`;
        csvContent += cat.headers.join(',') + '\n';
        cat.rows.forEach((row: any) => {
          const cleanQ1 = String(row.q1).replace(/,/g, '');
          const cleanQ2 = String(row.q2).replace(/,/g, '');
          const cleanQ3 = String(row.q3).replace(/,/g, '');
          const cleanQ4 = String(row.q4).replace(/,/g, '');
          const cleanYearly = String(row.yearly).replace(/,/g, '');
          csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
        });
        csvContent += '\n';
      });

      // Summary
      csvContent += 'Summary - Total Direct Labor\n';
      csvContent += laborResult.headers.join(',') + '\n';
      laborResult.summaryRows.forEach((row: any) => {
        const cleanQ1 = String(row.q1).replace(/,/g, '');
        const cleanQ2 = String(row.q2).replace(/,/g, '');
        const cleanQ3 = String(row.q3).replace(/,/g, '');
        const cleanQ4 = String(row.q4).replace(/,/g, '');
        const cleanYearly = String(row.yearly).replace(/,/g, '');
        csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
      });
    } else {
      // Simple single-category
      csvContent += laborResult.headers.join(',') + '\n';
      laborResult.rows.forEach((row: any) => {
        const cleanQ1 = String(row.q1).replace(/,/g, '');
        const cleanQ2 = String(row.q2).replace(/,/g, '');
        const cleanQ3 = String(row.q3).replace(/,/g, '');
        const cleanQ4 = String(row.q4).replace(/,/g, '');
        const cleanYearly = String(row.yearly).replace(/,/g, '');
        csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `direct-labor-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Overhead category management functions
  const addOverheadCategory = () => {
    setOverheadCategories([
      ...overheadCategories,
      {
        name: '',
        costType: 'variable',
        amount: 0,
        costDriver: 'units',
      },
    ]);
  };

  const removeOverheadCategory = (index: number) => {
    if (overheadCategories.length === 1) {
      alert('You must have at least one overhead category');
      return;
    }
    setOverheadCategories(overheadCategories.filter((_, i) => i !== index));
  };

  const updateOverheadCategory = (index: number, field: keyof OverheadCostCategory, value: any) => {
    const newCategories = [...overheadCategories];
    (newCategories[index] as any)[field] = value;
    setOverheadCategories(newCategories);
  };

  const handleCalculateOverhead = () => {
    if (!productionResult) {
      alert('Please calculate Production Budget first (Schedule 2)');
      return;
    }

    const unitsToBeProduced = {
      q1: parseFloat(q1Sales) || 0,
      q2: parseFloat(q2Sales) || 0,
      q3: parseFloat(q3Sales) || 0,
      q4: parseFloat(q4Sales) || 0,
      yearly: (parseFloat(q1Sales) || 0) + (parseFloat(q2Sales) || 0) + (parseFloat(q3Sales) || 0) + (parseFloat(q4Sales) || 0),
    };

    // Use production data from production result
    if (productionResult?.rows) {
      const prodRow = productionResult.rows.find((r: any) => r.label === 'Required Production');
      if (prodRow) {
        unitsToBeProduced.q1 = parseFloat(String(prodRow.q1).replace(/,/g, '')) || 0;
        unitsToBeProduced.q2 = parseFloat(String(prodRow.q2).replace(/,/g, '')) || 0;
        unitsToBeProduced.q3 = parseFloat(String(prodRow.q3).replace(/,/g, '')) || 0;
        unitsToBeProduced.q4 = parseFloat(String(prodRow.q4).replace(/,/g, '')) || 0;
        unitsToBeProduced.yearly = parseFloat(String(prodRow.yearly).replace(/,/g, '')) || 0;
      }
    }

    // Get labor hours if available
    let directLaborHours = undefined;
    if (laborResult?.totalLaborHoursRequired) {
      directLaborHours = laborResult.totalLaborHoursRequired;
    }

    const inputs: ManufacturingOverheadInputs = {
      unitsToBeProduced,
      directLaborHours,
      variableOverheadRatePerUnit: variableOverheadRatePerUnit ? parseFloat(variableOverheadRatePerUnit) : undefined,
      variableOverheadRatePerLaborHour: variableOverheadRatePerLaborHour ? parseFloat(variableOverheadRatePerLaborHour) : undefined,
      fixedOverheadPerQuarter: fixedOverheadPerQuarter ? parseFloat(fixedOverheadPerQuarter) : undefined,
      depreciationPerQuarter: depreciationPerQuarter ? parseFloat(depreciationPerQuarter) : undefined,
      allocationBase,
      overheadCategories: overheadApproach === 'detailed' ? overheadCategories.map(cat => ({
        ...cat,
        amount: typeof cat.amount === 'string' ? parseFloat(cat.amount) || 0 : cat.amount,
      })) : undefined,
      useActivityBasedCosting: overheadApproach === 'abc',
      numberOfProductionRuns: overheadApproach === 'abc' && (productionRunsQ1 || productionRunsQ2 || productionRunsQ3 || productionRunsQ4) ? {
        q1: parseFloat(productionRunsQ1) || 0,
        q2: parseFloat(productionRunsQ2) || 0,
        q3: parseFloat(productionRunsQ3) || 0,
        q4: parseFloat(productionRunsQ4) || 0,
        yearly: (parseFloat(productionRunsQ1) || 0) + (parseFloat(productionRunsQ2) || 0) + (parseFloat(productionRunsQ3) || 0) + (parseFloat(productionRunsQ4) || 0),
      } : undefined,
      costPerProductionRun: costPerProductionRun ? parseFloat(costPerProductionRun) : undefined,
      numberOfInspections: overheadApproach === 'abc' && (inspectionsQ1 || inspectionsQ2 || inspectionsQ3 || inspectionsQ4) ? {
        q1: parseFloat(inspectionsQ1) || 0,
        q2: parseFloat(inspectionsQ2) || 0,
        q3: parseFloat(inspectionsQ3) || 0,
        q4: parseFloat(inspectionsQ4) || 0,
        yearly: (parseFloat(inspectionsQ1) || 0) + (parseFloat(inspectionsQ2) || 0) + (parseFloat(inspectionsQ3) || 0) + (parseFloat(inspectionsQ4) || 0),
      } : undefined,
      costPerInspection: costPerInspection ? parseFloat(costPerInspection) : undefined,
      machineHours: overheadApproach === 'abc' && (machineHoursQ1 || machineHoursQ2 || machineHoursQ3 || machineHoursQ4) ? {
        q1: parseFloat(machineHoursQ1) || 0,
        q2: parseFloat(machineHoursQ2) || 0,
        q3: parseFloat(machineHoursQ3) || 0,
        q4: parseFloat(machineHoursQ4) || 0,
        yearly: (parseFloat(machineHoursQ1) || 0) + (parseFloat(machineHoursQ2) || 0) + (parseFloat(machineHoursQ3) || 0) + (parseFloat(machineHoursQ4) || 0),
      } : undefined,
      costPerMachineHour: costPerMachineHour ? parseFloat(costPerMachineHour) : undefined,
      facilityRent: facilityRent ? parseFloat(facilityRent) : undefined,
      facilityInsurance: facilityInsurance ? parseFloat(facilityInsurance) : undefined,
      propertyTaxes: propertyTaxes ? parseFloat(propertyTaxes) : undefined,
      utilities: utilities ? parseFloat(utilities) : undefined,
      utilitiesIsVariable,
      supervisorySalaries: supervisorySalaries ? parseFloat(supervisorySalaries) : undefined,
      supportStaffSalaries: supportStaffSalaries ? parseFloat(supportStaffSalaries) : undefined,
      indirectMaterialsPerUnit: indirectMaterialsPerUnit ? parseFloat(indirectMaterialsPerUnit) : undefined,
      shopSuppliesPerQuarter: shopSuppliesPerQuarter ? parseFloat(shopSuppliesPerQuarter) : undefined,
      plannedMaintenancePerQuarter: plannedMaintenancePerQuarter ? parseFloat(plannedMaintenancePerQuarter) : undefined,
      maintenancePerMachineHour: maintenancePerMachineHour ? parseFloat(maintenancePerMachineHour) : undefined,
      qualityControlPerUnit: qualityControlPerUnit ? parseFloat(qualityControlPerUnit) : undefined,
      qualityControlLabor: qualityControlLabor ? parseFloat(qualityControlLabor) : undefined,
      technologyCosts: technologyCosts ? parseFloat(technologyCosts) : undefined,
      warehouseCosts: warehouseCosts ? parseFloat(warehouseCosts) : undefined,
      environmentalComplianceCosts: environmentalComplianceCosts ? parseFloat(environmentalComplianceCosts) : undefined,
    };

    const validationErrors = validateManufacturingOverheadInputs(inputs);
    const actualErrors = validationErrors.filter(e => !e.startsWith('WARNING:'));

    if (actualErrors.length > 0) {
      setOverheadErrors(validationErrors);
      setOverheadResult(null);
      return;
    }

    const output = calculateManufacturingOverheadBudget(inputs);
    const formatted = formatManufacturingOverheadBudgetForDisplay(output);
    setOverheadResult(formatted);
    setOverheadErrors(validationErrors);
  };

  const downloadOverheadCSV = () => {
    if (!overheadResult) return;

    let csvContent = `${companyName || 'Your Company'} - ${productName || 'Product'}\n`;
    csvContent += `Schedule 5: Manufacturing Overhead Budget\n`;
    csvContent += `For the Year Ending December 31, ${fiscalYear}\n\n`;

    csvContent += overheadResult.headers.join(',') + '\n';
    overheadResult.rows.forEach((row: any) => {
      const cleanQ1 = String(row.q1).replace(/,/g, '');
      const cleanQ2 = String(row.q2).replace(/,/g, '');
      const cleanQ3 = String(row.q3).replace(/,/g, '');
      const cleanQ4 = String(row.q4).replace(/,/g, '');
      const cleanYearly = String(row.yearly).replace(/,/g, '');
      csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `manufacturing-overhead-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateSGA = () => {
    if (!result) {
      alert('Please calculate Sales Budget first (Schedule 1)');
      return;
    }

    // Get sales data from Schedule 1
    const salesRevenue = {
      q1: result.totalRevenue?.q1 || 0,
      q2: result.totalRevenue?.q2 || 0,
      q3: result.totalRevenue?.q3 || 0,
      q4: result.totalRevenue?.q4 || 0,
      yearly: result.totalRevenue?.yearly || 0,
    };

    const salesUnits = {
      q1: result.unitsSold?.q1 || 0,
      q2: result.unitsSold?.q2 || 0,
      q3: result.unitsSold?.q3 || 0,
      q4: result.unitsSold?.q4 || 0,
      yearly: result.unitsSold?.yearly || 0,
    };

    const inputs: SellingAdminExpenseInputs = {
      salesRevenue,
      salesUnits,
      useSimpleApproach: sgaApproach === 'simple',

      // Simple approach
      variableSellingExpenseRate: variableSellingExpenseRate ? parseFloat(variableSellingExpenseRate) : undefined,
      variableAdminExpenseRate: variableAdminExpenseRate ? parseFloat(variableAdminExpenseRate) : undefined,
      fixedSellingExpensePerQuarter: fixedSellingExpensePerQuarter ? parseFloat(fixedSellingExpensePerQuarter) : undefined,
      fixedAdminExpensePerQuarter: fixedAdminExpensePerQuarter ? parseFloat(fixedAdminExpensePerQuarter) : undefined,

      // Detailed approach - Selling Expenses
      commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
      commissionPerUnit: commissionPerUnit ? parseFloat(commissionPerUnit) : undefined,
      distributionCostPerUnit: distributionCostPerUnit ? parseFloat(distributionCostPerUnit) : undefined,
      distributionFixedCostPerQuarter: distributionFixedCostPerQuarter ? parseFloat(distributionFixedCostPerQuarter) : undefined,
      customerServiceSalaries: customerServiceSalaries ? parseFloat(customerServiceSalaries) : undefined,
      warrantyExpensePerUnit: warrantyExpensePerUnit ? parseFloat(warrantyExpensePerUnit) : undefined,

      // Marketing Expenses
      advertisingBudgetPerQuarter: advertisingBudgetPerQuarter ? parseFloat(advertisingBudgetPerQuarter) : undefined,
      brandDevelopmentPerQuarter: brandDevelopmentPerQuarter ? parseFloat(brandDevelopmentPerQuarter) : undefined,
      marketingCampaignsPerQuarter: marketingCampaignsPerQuarter ? parseFloat(marketingCampaignsPerQuarter) : undefined,

      // Administrative Expenses
      executiveSalaries: executiveSalaries ? parseFloat(executiveSalaries) : undefined,
      financeSalaries: financeSalaries ? parseFloat(financeSalaries) : undefined,
      hrSalaries: hrSalaries ? parseFloat(hrSalaries) : undefined,
      itSalaries: itSalaries ? parseFloat(itSalaries) : undefined,

      // Occupancy costs
      officeRentPerQuarter: officeRentPerQuarter ? parseFloat(officeRentPerQuarter) : undefined,
      utilitiesPerQuarter: utilitiesPerQuarter ? parseFloat(utilitiesPerQuarter) : undefined,

      // Technology costs
      softwareLicensesPerQuarter: softwareLicensesPerQuarter ? parseFloat(softwareLicensesPerQuarter) : undefined,
      telecommunicationsPerQuarter: telecommunicationsPerQuarter ? parseFloat(telecommunicationsPerQuarter) : undefined,

      // Other admin costs
      officeSuppliesPerQuarter: officeSuppliesPerQuarter ? parseFloat(officeSuppliesPerQuarter) : undefined,
      legalFeesPerQuarter: legalFeesPerQuarter ? parseFloat(legalFeesPerQuarter) : undefined,
      badDebtRate: badDebtRate ? parseFloat(badDebtRate) : undefined,
      depreciationOfficeEquipment: depreciationOfficeEquipment ? parseFloat(depreciationOfficeEquipment) : undefined,
    };

    const validationErrors = validateSellingAdminExpenseInputs(inputs);
    const output = calculateSellingAdminExpenseBudget(inputs);
    const formatted = formatSellingAdminExpenseBudgetForDisplay(output);
    setSgaResult(formatted);
    setSgaErrors(validationErrors);
  };

  const downloadSGACSV = () => {
    if (!sgaResult) return;

    let csvContent = `${companyName || 'Your Company'} - ${productName || 'Product'}\n`;
    csvContent += `Schedule 6: Selling, General & Administrative Expense Budget\n`;
    csvContent += `For the Year Ending December 31, ${fiscalYear}\n\n`;

    csvContent += sgaResult.headers.join(',') + '\n';
    sgaResult.rows.forEach((row: any) => {
      const cleanQ1 = String(row.q1).replace(/,/g, '');
      const cleanQ2 = String(row.q2).replace(/,/g, '');
      const cleanQ3 = String(row.q3).replace(/,/g, '');
      const cleanQ4 = String(row.q4).replace(/,/g, '');
      const cleanYearly = String(row.yearly).replace(/,/g, '');
      csvContent += `"${row.label}",${cleanQ1},${cleanQ2},${cleanQ3},${cleanQ4},${cleanYearly}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sga-expense-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateCashReceipts = () => {
    if (!result) {
      alert('Please calculate Sales Budget first (Schedule 1)');
      return;
    }

    const inputs: CashReceiptsInputs = {
      percentCollectedInSameQuarter: parseFloat(percentCollectedSameQuarter) || 0,
      percentCollectedInNextQuarter: parseFloat(percentCollectedNextQuarter) || 0,
      percentUncollectible: percentUncollectible ? parseFloat(percentUncollectible) : undefined,
      beginningAccountsReceivable: parseFloat(beginningAccountsReceivable) || 0,
    };

    const { output, validation } = calculateCashReceiptsBudget(result, inputs);

    setCashReceiptsResult(output);
    setCashReceiptsErrors(validation.errors);
    setCashReceiptsWarnings(validation.warnings);
  };

  const downloadCashReceiptsCSV = () => {
    if (!cashReceiptsResult) return;

    const csvContent = exportCashReceiptsToCSV(
      cashReceiptsResult,
      companyName || 'Your Company',
      productName || 'Product',
      fiscalYear
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cash-receipts-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateCashDisbursements = () => {
    const inputs: CashDisbursementInputs = {
      percentMaterialPaidSameQuarter: parseFloat(percentMaterialPaidSameQuarter) || undefined,
      percentMaterialPaidNextQuarter: parseFloat(percentMaterialPaidNextQuarter) || undefined,
      beginningAccountsPayable: parseFloat(beginningAccountsPayable) || undefined,
      incomeTaxPayments: {
        q1: parseFloat(incomeTaxQ1) || 0,
        q2: parseFloat(incomeTaxQ2) || 0,
        q3: parseFloat(incomeTaxQ3) || 0,
        q4: parseFloat(incomeTaxQ4) || 0,
        yearly: 0,
      },
      dividendPayments: {
        q1: parseFloat(dividendQ1) || 0,
        q2: parseFloat(dividendQ2) || 0,
        q3: parseFloat(dividendQ3) || 0,
        q4: parseFloat(dividendQ4) || 0,
        yearly: 0,
      },
      capitalExpenditures: {
        q1: parseFloat(capexQ1) || 0,
        q2: parseFloat(capexQ2) || 0,
        q3: parseFloat(capexQ3) || 0,
        q4: parseFloat(capexQ4) || 0,
        yearly: 0,
      },
      loanPayments: {
        q1: parseFloat(loanPaymentQ1) || 0,
        q2: parseFloat(loanPaymentQ2) || 0,
        q3: parseFloat(loanPaymentQ3) || 0,
        q4: parseFloat(loanPaymentQ4) || 0,
        yearly: 0,
      },
    };

    const { output, validation } = calculateCashDisbursementsBudget(
      materialResult,
      laborResult,
      overheadResult,
      sgaResult,
      inputs
    );

    setCashDisbursementsResult(output);
    setCashDisbursementsErrors(validation.errors);
    setCashDisbursementsWarnings(validation.warnings);
  };

  const downloadCashDisbursementsCSV = () => {
    if (!cashDisbursementsResult) return;

    const csvContent = exportCashDisbursementsToCSV(
      cashDisbursementsResult,
      companyName || 'Your Company',
      productName || 'Product',
      fiscalYear
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cash-disbursements-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateCashBudget = () => {
    if (!cashReceiptsResult) {
      alert('Please calculate Cash Receipts Budget first (Schedule 7)');
      return;
    }

    if (!cashDisbursementsResult) {
      alert('Please calculate Cash Disbursements Budget first (Schedule 8)');
      return;
    }

    const inputs: CashBudgetInputs = {
      beginningCashBalance: parseFloat(beginningCashBalance) || 0,
      minimumCashBalance: parseFloat(minimumCashBalance) || 0,
      interestRateOnBorrowing: interestRateOnBorrowing ? parseFloat(interestRateOnBorrowing) : undefined,
      interestRateOnInvestments: interestRateOnInvestments ? parseFloat(interestRateOnInvestments) : undefined,
    };

    const { output, validation } = calculateCashBudget(
      cashReceiptsResult,
      cashDisbursementsResult,
      inputs
    );

    setCashBudgetResult(output);
    setCashBudgetErrors(validation.errors);
    setCashBudgetWarnings(validation.warnings);
  };

  const downloadCashBudgetCSV = () => {
    if (!cashBudgetResult) return;

    const csvContent = exportCashBudgetToCSV(
      cashBudgetResult,
      companyName || 'Your Company',
      productName || 'Product',
      fiscalYear
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cash-budget-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateCOGS = () => {
    if (!materialResult) {
      alert('Please calculate Direct Materials Budget first (Schedule 3)');
      return;
    }

    if (!laborResult) {
      alert('Please calculate Direct Labor Budget first (Schedule 4)');
      return;
    }

    if (!overheadResult) {
      alert('Please calculate Manufacturing Overhead Budget first (Schedule 5)');
      return;
    }

    if (!productionResult) {
      alert('Please calculate Production Budget first (Schedule 2)');
      return;
    }

    const inputs: COGSInputs = {
      beginningWIPInventory: parseFloat(beginningWIPInventory) || 0,
      endingWIPInventory: parseFloat(endingWIPInventory) || 0,
      beginningFinishedGoodsInventory: parseFloat(beginningFinishedGoodsInventory) || 0,
      endingFinishedGoodsInventory: parseFloat(endingFinishedGoodsInventory) || 0,
    };

    const { output, validation } = calculateCOGS(
      materialResult,
      laborResult,
      overheadResult,
      productionResult,
      inputs
    );

    setCogsResult(output);
    setCogsErrors(validation.errors);
    setCogsWarnings(validation.warnings);
  };

  const downloadCOGSCSV = () => {
    if (!cogsResult) return;

    const csvContent = exportCOGSToCSV(
      cogsResult,
      companyName || 'Your Company',
      productName || 'Product',
      fiscalYear
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cogs-schedule-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateIncomeStatement = () => {
    if (!result) {
      alert('Please calculate Sales Budget first (Schedule 1)');
      return;
    }

    if (!cogsResult) {
      alert('Please calculate Cost of Goods Sold first (Schedule 10)');
      return;
    }

    if (!sgaResult) {
      alert('Please calculate Selling & Administrative Expenses first (Schedule 6)');
      return;
    }

    const inputs: IncomeStatementInputs = {
      interestExpense: parseFloat(interestExpense) || 0,
      incomeTaxRate: parseFloat(incomeTaxRate) || 0,
    };

    const { output, validation } = calculateIncomeStatement(
      result,
      cogsResult,
      sgaResult,
      inputs
    );

    setIncomeStatementResult(output);
    setIncomeStatementErrors(validation.errors);
    setIncomeStatementWarnings(validation.warnings);
  };

  const downloadIncomeStatementCSV = () => {
    if (!incomeStatementResult) return;

    const csvContent = exportIncomeStatementToCSV(
      incomeStatementResult,
      companyName || 'Your Company',
      fiscalYear
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `income-statement-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateCashFlowStatement = () => {
    if (!incomeStatementResult) {
      alert('Please calculate Income Statement first (Schedule 11)');
      return;
    }

    if (!cashReceiptsResult) {
      alert('Please calculate Cash Receipts Budget first (Schedule 7)');
      return;
    }

    if (!cashDisbursementsResult) {
      alert('Please calculate Cash Disbursements Budget first (Schedule 8)');
      return;
    }

    if (!overheadResult) {
      alert('Please calculate Manufacturing Overhead Budget first (Schedule 5)');
      return;
    }

    const inputs: CashFlowStatementInputs = {
      beginningCash: parseFloat(cfBeginningCash) || 0,
      beginningAccountsReceivable: parseFloat(cfBeginningAR) || 0,
      beginningInventory: parseFloat(cfBeginningInventory) || 0,
      beginningAccountsPayable: parseFloat(cfBeginningAP) || 0,
      loanProceeds: parseFloat(cfLoanProceeds) || 0,
      stockIssued: parseFloat(cfStockIssued) || 0,
      proceedsFromAssetSales: parseFloat(cfAssetSales) || 0,
    };

    const { output, validation } = calculateCashFlowStatement(
      incomeStatementResult,
      cashReceiptsResult,
      cashDisbursementsResult,
      overheadResult,
      result,  // salesData
      cogsResult,  // cogsData
      inputs
    );

    setCashFlowResult(output);
    setCashFlowErrors(validation.errors);
    setCashFlowWarnings(validation.warnings);
  };

  const downloadCashFlowStatementCSV = () => {
    if (!cashFlowResult) return;

    const csvContent = exportCashFlowStatementToCSV(
      cashFlowResult,
      companyName || 'Your Company',
      fiscalYear
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cash-flow-statement-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalculateBalanceSheet = () => {
    if (!incomeStatementResult) {
      alert('Please calculate Income Statement first (Schedule 11)');
      return;
    }

    if (!cashBudgetResult) {
      alert('Please calculate Cash Budget first (Schedule 9)');
      return;
    }

    if (!cashReceiptsResult) {
      alert('Please calculate Cash Receipts Budget first (Schedule 7)');
      return;
    }

    if (!cashDisbursementsResult) {
      alert('Please calculate Cash Disbursements Budget first (Schedule 8)');
      return;
    }

    if (!cogsResult) {
      alert('Please calculate COGS first (Schedule 10)');
      return;
    }

    if (!overheadResult) {
      alert('Please calculate Manufacturing Overhead Budget first (Schedule 5)');
      return;
    }

    const inputs: BalanceSheetInputs = {
      beginningCash: parseFloat(bsBeginningCash) || 0,
      beginningAccountsReceivable: parseFloat(bsBeginningAR) || 0,
      beginningRawMaterialInventory: parseFloat(bsBeginningRawMaterial) || 0,
      beginningWIPInventory: parseFloat(bsBeginningWIP) || 0,
      beginningFinishedGoodsInventory: parseFloat(bsBeginningFG) || 0,
      beginningOtherCurrentAssets: parseFloat(bsBeginningOtherCurrentAssets) || 0,
      beginningFixedAssets: parseFloat(bsBeginningFixedAssets) || 0,
      beginningAccumulatedDepreciation: parseFloat(bsBeginningAccumDepr) || 0,
      beginningOtherAssets: parseFloat(bsBeginningOtherAssets) || 0,
      beginningAccountsPayable: parseFloat(bsBeginningAP) || 0,
      beginningWagesPayable: parseFloat(bsBeginningWagesPayable) || 0,
      beginningTaxesPayable: parseFloat(bsBeginningTaxesPayable) || 0,
      beginningOtherAccruedExpenses: parseFloat(bsBeginningOtherAccrued) || 0,
      beginningShortTermDebt: parseFloat(bsBeginningShortTermDebt) || 0,
      beginningLongTermDebt: parseFloat(bsBeginningLongTermDebt) || 0,
      beginningCommonStock: parseFloat(bsBeginningCommonStock) || 0,
      beginningRetainedEarnings: parseFloat(bsBeginningRetainedEarnings) || 0,
      newLongTermBorrowing: parseFloat(bsNewLongTermBorrowing) || 0,
      longTermDebtRepayment: parseFloat(bsLongTermDebtRepayment) || 0,
      stockIssued: parseFloat(bsStockIssued) || 0,
    };

    const { output, validation } = calculateBalanceSheet(
      incomeStatementResult,
      cashBudgetResult,
      cashReceiptsResult,
      cashDisbursementsResult,
      cogsResult,
      overheadResult,
      result, // salesData
      inputs
    );

    setBalanceSheetResult(output);
    setBalanceSheetErrors(validation.errors);
    setBalanceSheetWarnings(validation.warnings);
  };

  const downloadBalanceSheetCSV = () => {
    if (!balanceSheetResult) return;

    const csvContent = exportBalanceSheetToCSV(
      balanceSheetResult,
      companyName || 'Your Company',
      fiscalYear
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `balance-sheet-${companyName.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const bgColor = darkMode ? 'bg-[#111]' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-[#454545]';
  const headingColor = darkMode ? 'text-white' : 'text-black';
  const inputBg = darkMode ? 'bg-[#222] border-gray-700 text-white' : 'bg-white border-gray-300 text-black';
  const buttonBg = darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800';
  const hrColor = darkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className={`text-sm hover:underline ${textColor}`}>
            ← Home
          </Link>
          <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
          <Link href="/dashboard" className={`text-sm hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Dashboard
          </Link>
        </div>
        <h1 className={`text-xl font-semibold ${headingColor}`}>
          Budget Input
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={loadExampleData}
            className={`text-sm px-4 py-2 border ${darkMode ? 'border-green-700 bg-green-900 text-green-200 hover:bg-green-800' : 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'} transition-colors`}
          >
            Load Example: ABC Manufacturing
          </button>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Inverted Mode
          </span>
          <button
            onClick={toggleDarkMode}
            className={`text-sm hover:underline ${darkMode ? 'text-gray-300' : 'text-[#454545]'}`}
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className={`max-w-5xl mx-auto px-6 py-12 ${textColor}`}>
        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 1: Sales Budget
        </h2>
        <p className="text-lg mb-12 leading-relaxed">
          Enter your forecasted sales data
        </p>

        {/* Form */}
        <div className="mb-12">
          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Company Information</h3>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Type company name"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Type product name"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Currency
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="Type currency"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Fiscal Year
              </label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                placeholder="Type fiscal year"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>
          </div>

          <hr className={`my-12 ${hrColor}`} />

          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Prior Year Sales (Optional)</h3>
          <p className={`text-sm mb-4 ${textColor}`}>
            Enter last year's sales to see growth comparison. Leave blank if not applicable.
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q1 (Oct-Dec)
              </label>
              <input
                type="number"
                value={priorQ1Sales}
                onChange={(e) => setPriorQ1Sales(e.target.value)}
                placeholder="800"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q2 (Jan-Mar)
              </label>
              <input
                type="number"
                value={priorQ2Sales}
                onChange={(e) => setPriorQ2Sales(e.target.value)}
                placeholder="1200"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q3 (Apr-Jun)
              </label>
              <input
                type="number"
                value={priorQ3Sales}
                onChange={(e) => setPriorQ3Sales(e.target.value)}
                placeholder="1000"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q4 (Jul-Sep)
              </label>
              <input
                type="number"
                value={priorQ4Sales}
                onChange={(e) => setPriorQ4Sales(e.target.value)}
                placeholder="1100"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>
          </div>

          <div className={`p-4 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} mb-8`}>
            <h4 className={`text-sm font-semibold mb-3 ${headingColor}`}>
              Quick Forecast Calculator
            </h4>
            <p className={`text-xs mb-3 ${textColor}`}>
              Apply a growth rate to prior year sales to auto-calculate current year forecast
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-2 ${headingColor}`}>
                  Growth Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(e.target.value)}
                  placeholder="e.g., 15 for 15% growth"
                  className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                />
              </div>
              <button
                onClick={applyGrowthRate}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Apply to Forecast
              </button>
            </div>
          </div>

          <hr className={`my-12 ${hrColor}`} />

          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Forecasted Sales (Current Year)</h3>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q1 (Oct-Dec)
              </label>
              <input
                type="number"
                value={q1Sales}
                onChange={(e) => setQ1Sales(e.target.value)}
                placeholder="1000"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q2 (Jan-Mar)
              </label>
              <input
                type="number"
                value={q2Sales}
                onChange={(e) => setQ2Sales(e.target.value)}
                placeholder="1500"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q3 (Apr-Jun)
              </label>
              <input
                type="number"
                value={q3Sales}
                onChange={(e) => setQ3Sales(e.target.value)}
                placeholder="1200"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Q4 (Jul-Sep)
              </label>
              <input
                type="number"
                value={q4Sales}
                onChange={(e) => setQ4Sales(e.target.value)}
                placeholder="1300"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${headingColor}`}>
              Price Adjustment Method
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priceAdjustment"
                  value="constant"
                  checked={priceAdjustment === 'constant'}
                  onChange={(e) => setPriceAdjustment(e.target.value as 'constant' | 'inflation')}
                  className="mr-2"
                />
                <span className={`text-sm ${textColor}`}>Constant Price (same across all quarters)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="priceAdjustment"
                  value="inflation"
                  checked={priceAdjustment === 'inflation'}
                  onChange={(e) => setPriceAdjustment(e.target.value as 'constant' | 'inflation')}
                  className="mr-2"
                />
                <span className={`text-sm ${textColor}`}>Inflation-Adjusted Price</span>
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Selling Price per Unit ({currency})
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="85000"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Inflation Rate (Annual %)
              </label>
              <input
                type="number"
                step="0.01"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                placeholder="0.15"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
                disabled={priceAdjustment === 'constant'}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                {priceAdjustment === 'constant'
                  ? 'Disabled when using constant price'
                  : 'Enter as decimal (e.g., 0.15 for 15%)'}
              </p>
            </div>
          </div>

          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Cash vs Credit Sales (Optional)</h3>
          <p className={`text-sm mb-4 ${textColor}`}>
            Split sales revenue into cash (collected immediately) and credit (collected later). Required for Schedule 8 (Cash Receipts Budget).
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Cash Sales Percentage
              </label>
              <input
                type="number"
                step="0.01"
                value={cashSalesPercentage}
                onChange={(e) => setCashSalesPercentage(e.target.value)}
                placeholder="0.40"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                Enter as decimal (e.g., 0.40 for 40% cash sales)
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Credit Sales Percentage
              </label>
              <input
                type="number"
                step="0.01"
                value={creditSalesPercentage}
                onChange={(e) => setCreditSalesPercentage(e.target.value)}
                placeholder="0.60"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                Enter as decimal (e.g., 0.60 for 60% credit sales)
              </p>
            </div>
          </div>

          <hr className={`my-12 ${hrColor}`} />

          <div className="mb-8">
            <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
              Budget Assumptions & Notes (Optional)
            </label>
            <textarea
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              placeholder="e.g., Conservative forecast due to market uncertainty; New market entry in Q3; Based on historical growth trends..."
              rows={3}
              className={`w-full px-4 py-3 border ${inputBg} text-base`}
            />
            <p className={`text-xs mt-2 ${textColor}`}>
              Document key assumptions for reference
            </p>
          </div>

          <button
            onClick={handleCalculate}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate
          </button>

          {errors.length > 0 && (
            <div className="mt-6 space-y-3">
              {errors.filter(e => !e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Errors:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    {errors.filter(e => !e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.filter(e => e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Warnings:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    {errors.filter(e => e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error.replace('WARNING: ', '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        {/* Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Results</h3>
            {result && (
              <button
                onClick={downloadCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!result && (
            <p className="text-lg leading-relaxed">
              Enter data and click Calculate to see your sales budget
            </p>
          )}

          {result && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-2 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear} | Currency: {currency}
              </p>
              {assumptions && (
                <div className={`mb-6 p-3 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
                  <p className={`text-xs font-semibold mb-1 ${headingColor}`}>Assumptions & Notes:</p>
                  <p className={`text-sm ${textColor}`}>{assumptions}</p>
                </div>
              )}

              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {result.headers.map((header: string, idx: number) => (
                        <th
                          key={idx}
                          className={`py-3 px-4 text-left font-semibold text-sm ${idx === 0 ? '' : 'text-right'} ${headingColor}`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row: any, idx: number) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} ${
                          idx === result.rows.length - 1 ? 'font-semibold' : ''
                        }`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold font-mono">{row.yearly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={`text-xs mb-8 ${textColor}`}>
                Note: The "Yearly Total" price is the weighted average selling price across all quarters.
              </p>

              <div className="mb-8">
                <h4 className={`text-lg font-semibold mb-3 ${headingColor}`}>
                  Seasonal Distribution
                </h4>
                <p className={`text-sm mb-4 ${textColor}`}>
                  Percentage of annual sales expected in each quarter:
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {result.seasonalDistribution && (
                    <>
                      <div className={`p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <div className={`text-xs mb-1 ${textColor}`}>Q1 (Oct-Dec)</div>
                        <div className={`text-2xl font-semibold ${headingColor}`}>
                          {result.seasonalDistribution.q1.toFixed(1)}%
                        </div>
                      </div>
                      <div className={`p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <div className={`text-xs mb-1 ${textColor}`}>Q2 (Jan-Mar)</div>
                        <div className={`text-2xl font-semibold ${headingColor}`}>
                          {result.seasonalDistribution.q2.toFixed(1)}%
                        </div>
                      </div>
                      <div className={`p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <div className={`text-xs mb-1 ${textColor}`}>Q3 (Apr-Jun)</div>
                        <div className={`text-2xl font-semibold ${headingColor}`}>
                          {result.seasonalDistribution.q3.toFixed(1)}%
                        </div>
                      </div>
                      <div className={`p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <div className={`text-xs mb-1 ${textColor}`}>Q4 (Jul-Sep)</div>
                        <div className={`text-2xl font-semibold ${headingColor}`}>
                          {result.seasonalDistribution.q4.toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sales Budget Charts */}
              {showCharts && salesRawOutput && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>
                      Data Visualization
                    </h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      {showCharts ? 'Hide Charts' : 'Show Charts'}
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <SalesTrendChart
                      salesUnits={salesRawOutput.salesUnits}
                      salesRevenue={salesRawOutput.salesRevenue}
                      historicalUnits={historicalSalesData || undefined}
                      darkMode={darkMode}
                    />
                    {historicalSalesData && (
                      <SalesComparisonChart
                        salesUnits={salesRawOutput.salesUnits}
                        salesRevenue={salesRawOutput.salesRevenue}
                        historicalUnits={historicalSalesData}
                        darkMode={darkMode}
                      />
                    )}
                  </div>
                </div>
              )}

              <p className="text-lg leading-relaxed">
                ✓ Sales Budget calculated successfully
              </p>
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Sales Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Sales Budget is the starting point for the master budget. It shows expected sales
          in both units and revenue for each quarter and the entire year.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Sales Revenue = Expected Sales Units × Selling Price per Unit
        </p>

        <hr className={`my-16 ${hrColor}`} />

        {/* SCHEDULE 2: PRODUCTION BUDGET */}
        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 2: Production Budget
        </h2>
        <p className="text-lg mb-12 leading-relaxed">
          Determine production volume needed to meet sales demand and maintain inventory levels
        </p>

        <div className="mb-12">
          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Inventory Policy</h3>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Beginning Inventory (Units)
              </label>
              <input
                type="number"
                value={beginningInventory}
                onChange={(e) => setBeginningInventory(e.target.value)}
                placeholder="100"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                Opening inventory at start of year
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Desired Ending Inventory Ratio
              </label>
              <input
                type="number"
                step="0.01"
                value={endingInventoryRatio}
                onChange={(e) => setEndingInventoryRatio(e.target.value)}
                placeholder="0.10"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                Enter as decimal (e.g., 0.10 for 10% of next quarter's sales)
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="useJIT"
                checked={useJIT}
                onChange={(e) => setUseJIT(e.target.checked)}
                className="mr-3 w-4 h-4"
              />
              <label htmlFor="useJIT" className={`text-sm font-medium ${headingColor}`}>
                Use Just-in-Time (JIT) Manufacturing
              </label>
            </div>
            <p className={`text-xs ${textColor} ml-7`}>
              Enable JIT to set ending inventory to zero (production = sales)
            </p>
          </div>

          <hr className={`my-8 ${hrColor}`} />

          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Optional Enhancements</h3>
          <p className={`text-sm mb-6 ${textColor}`}>
            Add production constraints and cost analysis (all optional)
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Next Year Q1 Sales Forecast
              </label>
              <input
                type="number"
                value={nextYearQ1Sales}
                onChange={(e) => setNextYearQ1Sales(e.target.value)}
                placeholder="Leave blank to use current Q1"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Max Production Capacity/Quarter
              </label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="Optional"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Inventory Carrying Cost/Unit
              </label>
              <input
                type="number"
                step="0.01"
                value={carryingCost}
                onChange={(e) => setCarryingCost(e.target.value)}
                placeholder="Optional"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Minimum Batch Size
              </label>
              <input
                type="number"
                value={minBatchSize}
                onChange={(e) => setMinBatchSize(e.target.value)}
                placeholder="Optional"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Optimal Batch Size
              </label>
              <input
                type="number"
                value={optimalBatchSize}
                onChange={(e) => setOptimalBatchSize(e.target.value)}
                placeholder="Optional"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Obsolescence Risk (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={obsolescenceRisk}
                onChange={(e) => setObsolescenceRisk(e.target.value)}
                placeholder="0.05"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                Enter as decimal (e.g., 0.05 for 5% risk)
              </p>
            </div>
          </div>

          <button
            onClick={handleCalculateProduction}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate Production Budget
          </button>

          {productionErrors.length > 0 && (
            <div className="mt-6 space-y-3">
              {productionErrors.filter(e => !e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Errors:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    {productionErrors.filter(e => !e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {productionErrors.filter(e => e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Warnings:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    {productionErrors.filter(e => e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error.replace('WARNING: ', '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        {/* Production Budget Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Production Budget Results</h3>
            {productionResult && (
              <button
                onClick={downloadProductionCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!productionResult && (
            <p className="text-lg leading-relaxed">
              Calculate Sales Budget first, then enter production data and click Calculate Production Budget
            </p>
          )}

          {productionResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {productionResult.headers.map((header: string, idx: number) => (
                        <th
                          key={idx}
                          className={`py-3 px-4 text-left font-semibold text-sm ${idx === 0 ? '' : 'text-right'} ${headingColor}`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productionResult.rows.map((row: any, idx: number) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} ${
                          idx === productionResult.rows.length - 1 ? 'font-semibold' : ''
                        }`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold font-mono">{row.yearly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {productionResult.notes && (
                <p className={`text-xs mb-6 ${textColor} italic`}>
                  * {productionResult.notes}
                </p>
              )}

              {productionResult.inventoryCarryingCost && (
                <div className={`mb-6 p-4 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
                  <h4 className={`text-sm font-semibold mb-2 ${headingColor}`}>Inventory Carrying Cost</h4>
                  <p className={`text-xs ${textColor}`}>
                    Q1: {productionResult.inventoryCarryingCost.q1.toFixed(2)} |
                    Q2: {productionResult.inventoryCarryingCost.q2.toFixed(2)} |
                    Q3: {productionResult.inventoryCarryingCost.q3.toFixed(2)} |
                    Q4: {productionResult.inventoryCarryingCost.q4.toFixed(2)} |
                    Yearly: {productionResult.inventoryCarryingCost.yearly.toFixed(2)}
                  </p>
                </div>
              )}

              {productionResult.obsolescenceCost && (
                <div className={`mb-6 p-4 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
                  <h4 className={`text-sm font-semibold mb-2 ${headingColor}`}>Obsolescence Cost</h4>
                  <p className={`text-xs ${textColor}`}>
                    Q1: {productionResult.obsolescenceCost.q1.toFixed(2)} |
                    Q2: {productionResult.obsolescenceCost.q2.toFixed(2)} |
                    Q3: {productionResult.obsolescenceCost.q3.toFixed(2)} |
                    Q4: {productionResult.obsolescenceCost.q4.toFixed(2)} |
                    Yearly: {productionResult.obsolescenceCost.yearly.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Production Budget Charts */}
              {showCharts && productionRawOutput && salesRawOutput && (
                <div className="mb-8">
                  <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>
                    Data Visualization
                  </h4>
                  <ProductionChart
                    salesUnits={salesRawOutput.salesUnits}
                    production={productionRawOutput.requiredProduction}
                    endingInventory={productionRawOutput.desiredEndingInventory}
                    darkMode={darkMode}
                  />
                </div>
              )}

              <p className="text-lg leading-relaxed">
                ✓ Production Budget calculated successfully
              </p>
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Production Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Production Budget determines how many units must be produced to meet sales demand
          while maintaining desired inventory levels.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Units to Produce = Sales + Desired Ending Inventory - Beginning Inventory
        </p>

        <hr className={`my-16 ${hrColor}`} />

        {/* SCHEDULE 3: DIRECT MATERIAL BUDGET */}
        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 3: Direct Material Budget
        </h2>
        <p className="text-lg mb-12 leading-relaxed">
          Calculate raw material requirements and purchase costs for production
        </p>

        <div className="mb-12">
          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Materials</h3>
          <p className={`text-sm mb-6 ${textColor}`}>
            Add all raw materials required for production. You can add multiple materials (e.g., fabric, poles, etc.)
          </p>

          {materials.map((material, index) => (
            <div key={index} className={`mb-8 p-6 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${headingColor}`}>
                  Material {index + 1}
                </h4>
                {materials.length > 1 && (
                  <button
                    onClick={() => removeMaterial(index)}
                    className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Material Name
                  </label>
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                    placeholder="e.g., Tent Fabric"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={material.unit}
                    onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                    placeholder="e.g., yards, kg, liters"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Required per Unit Produced
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={material.requiredPerUnit}
                    onChange={(e) => updateMaterial(index, 'requiredPerUnit', e.target.value)}
                    placeholder="4.0"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Cost per Unit ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={material.costPerUnit}
                    onChange={(e) => updateMaterial(index, 'costPerUnit', e.target.value)}
                    placeholder="5.00"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Beginning Inventory
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={material.beginningInventory}
                    onChange={(e) => updateMaterial(index, 'beginningInventory', e.target.value)}
                    placeholder="600"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Ending Inventory Ratio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={material.desiredEndingInventoryRatio}
                    onChange={(e) => updateMaterial(index, 'desiredEndingInventoryRatio', e.target.value)}
                    placeholder="0.10"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                  <p className={`text-xs mt-2 ${textColor}`}>
                    Enter as decimal (e.g., 0.10 for 10% of next quarter's needs)
                  </p>
                </div>
              </div>

              {/* Optional enhancements */}
              <details className="mt-4">
                <summary className={`text-sm font-medium cursor-pointer ${headingColor} hover:underline`}>
                  Optional Enhancements (click to expand)
                </summary>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                      Scrap/Waste %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={material.scrapWastePercentage || ''}
                      onChange={(e) => updateMaterial(index, 'scrapWastePercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.05"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                    <p className={`text-xs mt-1 ${textColor}`}>
                      e.g., 0.05 for 5% waste
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                      Price Inflation Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={material.priceInflationRate || ''}
                      onChange={(e) => updateMaterial(index, 'priceInflationRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.02"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                    <p className={`text-xs mt-1 ${textColor}`}>
                      Quarterly rate (e.g., 0.02 for 2%)
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                      Bulk Discount Threshold
                    </label>
                    <input
                      type="number"
                      value={material.bulkDiscountThreshold || ''}
                      onChange={(e) => updateMaterial(index, 'bulkDiscountThreshold', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="10000"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                      Bulk Discount Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={material.bulkDiscountRate || ''}
                      onChange={(e) => updateMaterial(index, 'bulkDiscountRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.10"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                    <p className={`text-xs mt-1 ${textColor}`}>
                      e.g., 0.10 for 10% discount
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                      Supplier Lead Time (days)
                    </label>
                    <input
                      type="number"
                      value={material.supplierLeadTimeDays || ''}
                      onChange={(e) => updateMaterial(index, 'supplierLeadTimeDays', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="30"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id={`jit-${index}`}
                      checked={material.useJIT || false}
                      onChange={(e) => updateMaterial(index, 'useJIT', e.target.checked)}
                      className="mr-2 w-4 h-4"
                    />
                    <label htmlFor={`jit-${index}`} className={`text-sm ${headingColor}`}>
                      Use JIT (no ending inventory)
                    </label>
                  </div>
                </div>
              </details>
            </div>
          ))}

          <button
            onClick={addMaterial}
            className={`${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'} font-medium px-6 py-2 text-sm mb-8`}
          >
            + Add Another Material
          </button>

          <hr className={`my-8 ${hrColor}`} />

          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Payment Terms (Optional)</h3>
          <p className={`text-sm mb-4 ${textColor}`}>
            Specify when material purchases are paid (used for cash disbursement calculations)
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Next Year Q1 Production
              </label>
              <input
                type="number"
                value={nextYearQ1Production}
                onChange={(e) => setNextYearQ1Production(e.target.value)}
                placeholder="Leave blank to use current Q1"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                For Q4 ending inventory calculation
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                % Paid in Current Quarter
              </label>
              <input
                type="number"
                step="0.01"
                value={percentPaidCurrentQuarter}
                onChange={(e) => setPercentPaidCurrentQuarter(e.target.value)}
                placeholder="0.60"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                e.g., 0.60 for 60% paid immediately
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                % Paid in Next Quarter
              </label>
              <input
                type="number"
                step="0.01"
                value={percentPaidNextQuarter}
                onChange={(e) => setPercentPaidNextQuarter(e.target.value)}
                placeholder="0.40"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                e.g., 0.40 for 40% paid next quarter
              </p>
            </div>
          </div>

          <button
            onClick={handleCalculateMaterial}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate Material Budget
          </button>

          {materialErrors.length > 0 && (
            <div className="mt-6 space-y-3">
              {materialErrors.filter(e => !e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Errors:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    {materialErrors.filter(e => !e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {materialErrors.filter(e => e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Warnings:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    {materialErrors.filter(e => e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error.replace('WARNING: ', '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        {/* Material Budget Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Material Budget Results</h3>
            {materialResult && (
              <button
                onClick={downloadMaterialCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!materialResult && (
            <p className="text-lg leading-relaxed">
              Calculate Production Budget first, then enter material data and click Calculate Material Budget
            </p>
          )}

          {materialResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              {/* Display each material */}
              {materialResult.materials?.map((mat: any, idx: number) => (
                <div key={idx} className="mb-8">
                  <h4 className={`text-xl font-semibold mb-4 ${headingColor}`}>
                    {mat.name} ({mat.unit})
                  </h4>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                          {mat.headers.map((header: string, hidx: number) => (
                            <th
                              key={hidx}
                              className={`py-3 px-4 text-left font-semibold text-sm ${hidx === 0 ? '' : 'text-right'} ${headingColor}`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mat.rows.map((row: any, ridx: number) => (
                          <tr
                            key={ridx}
                            className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                          >
                            <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                            <td className="py-3 px-4 text-right text-sm font-semibold font-mono">{row.yearly}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Material-specific metrics */}
                  {(mat.inventoryTurnoverRatio || mat.daysInventoryOutstanding) && (
                    <div className={`p-3 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} text-sm mb-4`}>
                      {mat.inventoryTurnoverRatio && (
                        <p className={textColor}>
                          <strong>Inventory Turnover:</strong> {mat.inventoryTurnoverRatio.toFixed(2)}x annually
                        </p>
                      )}
                      {mat.daysInventoryOutstanding && (
                        <p className={textColor}>
                          <strong>Days Inventory Outstanding:</strong> {mat.daysInventoryOutstanding.toFixed(0)} days
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Total Summary */}
              {materialResult.summary && (
                <div className="mb-8">
                  <h4 className={`text-xl font-semibold mb-4 ${headingColor}`}>
                    Total Material Purchase Cost
                  </h4>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                          {materialResult.summary.headers.map((header: string, idx: number) => (
                            <th
                              key={idx}
                              className={`py-3 px-4 text-left font-semibold text-sm ${idx === 0 ? '' : 'text-right'} ${headingColor}`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {materialResult.summary.rows.map((row: any, idx: number) => (
                          <tr
                            key={idx}
                            className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} font-semibold`}
                          >
                            <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.yearly}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analytics */}
              {materialResult.analytics && (
                <div className={`p-4 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} mb-6`}>
                  <h4 className={`text-sm font-semibold mb-3 ${headingColor}`}>Analytics</h4>

                  {materialResult.analytics.overallInventoryTurnover && (
                    <p className={`text-sm mb-2 ${textColor}`}>
                      <strong>Overall Inventory Turnover:</strong> {materialResult.analytics.overallInventoryTurnover.toFixed(2)}x annually
                    </p>
                  )}

                  {materialResult.analytics.totalScrapWasteCost && (
                    <p className={`text-sm mb-2 ${textColor}`}>
                      <strong>Total Scrap/Waste Cost:</strong> {currency} {materialResult.analytics.totalScrapWasteCost.toFixed(2)}
                    </p>
                  )}

                  {materialResult.analytics.totalBulkDiscountSavings && (
                    <p className={`text-sm mb-2 ${textColor}`}>
                      <strong>Total Bulk Discount Savings:</strong> {currency} {materialResult.analytics.totalBulkDiscountSavings.toFixed(2)}
                    </p>
                  )}

                  {materialResult.analytics.criticalMaterials && materialResult.analytics.criticalMaterials.length > 0 && (
                    <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      <strong>⚠ Critical Materials (low turnover):</strong> {materialResult.analytics.criticalMaterials.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Direct Material Budget Charts */}
              {showCharts && materialRawOutput && (
                <div className="mb-8">
                  <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>
                    Data Visualization
                  </h4>
                  <CostTrendChart
                    data={materialRawOutput.totalMaterialPurchaseCost}
                    label="Material Purchase Cost Trend"
                    color="#3B82F6"
                    darkMode={darkMode}
                  />
                </div>
              )}

              <p className="text-lg leading-relaxed">
                ✓ Direct Material Budget calculated successfully
              </p>
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Direct Material Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Direct Material Budget calculates the quantity and cost of raw materials needed for production.
          It ensures adequate materials are available while managing inventory costs.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Material to Purchase = (Production Needs × Material per Unit + Desired Ending Inventory) - Beginning Inventory
        </p>

        <hr className={`my-16 ${hrColor}`} />

        {/* SCHEDULE 4: DIRECT LABOR BUDGET */}
        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 4: Direct Labor Budget
        </h2>
        <p className="text-lg mb-12 leading-relaxed">
          Calculate direct labor hours and costs required for production
        </p>

        <div className="mb-12">
          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Labor Input Method</h3>
          <p className={`text-sm mb-4 ${textColor}`}>
            Choose between simple single-category input or multi-category labor types
          </p>

          <div className="flex gap-6 mb-8">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="laborInputMethod"
                checked={useSimpleLaborInput}
                onChange={() => setUseSimpleLaborInput(true)}
                className="mr-2"
              />
              <span className={`text-sm ${textColor}`}>Simple (Single labor rate)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="laborInputMethod"
                checked={!useSimpleLaborInput}
                onChange={() => setUseSimpleLaborInput(false)}
                className="mr-2"
              />
              <span className={`text-sm ${textColor}`}>Multi-Category (Different labor types)</span>
            </label>
          </div>

          {useSimpleLaborInput ? (
            <>
              <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Labor Requirements</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Direct Labor Hours per Unit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={directLaborHoursPerUnit}
                    onChange={(e) => setDirectLaborHoursPerUnit(e.target.value)}
                    placeholder="2.5"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                  <p className={`text-xs mt-2 ${textColor}`}>
                    Hours of direct labor required to produce one unit
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Hourly Wage Rate ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={hourlyWageRate}
                    onChange={(e) => setHourlyWageRate(e.target.value)}
                    placeholder="25.00"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                  <p className={`text-xs mt-2 ${textColor}`}>
                    Average wage rate per hour
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Labor Categories</h3>
              <p className={`text-sm mb-6 ${textColor}`}>
                Add different labor categories with their own hourly requirements and wage rates
              </p>

              {laborCategories.map((category, index) => (
                <div key={index} className={`mb-8 p-6 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>
                      Labor Category {index + 1}
                    </h4>
                    {laborCategories.length > 1 && (
                      <button
                        onClick={() => removeLaborCategory(index)}
                        className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateLaborCategory(index, 'name', e.target.value)}
                        placeholder="e.g., Assembly, Finishing"
                        className={`w-full px-4 py-3 border ${inputBg} text-base`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                        Hours per Unit
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={category.hoursPerUnit}
                        onChange={(e) => updateLaborCategory(index, 'hoursPerUnit', e.target.value)}
                        placeholder="1.5"
                        className={`w-full px-4 py-3 border ${inputBg} text-base`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                        Wage Rate per Hour ({currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={category.wageRatePerHour}
                        onChange={(e) => updateLaborCategory(index, 'wageRatePerHour', e.target.value)}
                        placeholder="30.00"
                        className={`w-full px-4 py-3 border ${inputBg} text-base`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addLaborCategory}
                className={`${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'} font-medium px-6 py-2 text-sm mb-8`}
              >
                + Add Another Labor Category
              </button>
            </>
          )}

          <hr className={`my-8 ${hrColor}`} />

          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Optional Enhancements</h3>
          <p className={`text-sm mb-6 ${textColor}`}>
            Add wage inflation, overtime, fringe benefits, and workforce planning metrics (all optional)
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Wage Inflation Rate (Quarterly)
              </label>
              <input
                type="number"
                step="0.001"
                value={wageInflationRate}
                onChange={(e) => setWageInflationRate(e.target.value)}
                placeholder="0.01"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                e.g., 0.01 for 1% per quarter
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Fringe Benefit Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={fringeBenefitRate}
                onChange={(e) => setFringeBenefitRate(e.target.value)}
                placeholder="0.25"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                e.g., 0.25 for 25% (health, FICA, etc.)
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Productivity Efficiency Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={productivityEfficiencyRate}
                onChange={(e) => setProductivityEfficiencyRate(e.target.value)}
                placeholder="0.95"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                e.g., 0.95 for 95% efficiency
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Overtime Threshold (Hours/Quarter)
              </label>
              <input
                type="number"
                value={overtimeThreshold}
                onChange={(e) => setOvertimeThreshold(e.target.value)}
                placeholder="Leave blank for no overtime"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                Maximum regular hours before overtime
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Overtime Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                value={overtimeMultiplier}
                onChange={(e) => setOvertimeMultiplier(e.target.value)}
                placeholder="1.5"
                className={`w-full px-4 py-3 border ${inputBg} text-base`}
              />
              <p className={`text-xs mt-2 ${textColor}`}>
                e.g., 1.5 for time-and-a-half
              </p>
            </div>
          </div>

          <details className="mb-8">
            <summary className={`text-lg font-semibold cursor-pointer ${headingColor} hover:underline mb-4`}>
              Workforce Planning (click to expand)
            </summary>

            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Average Hours per Employee (Quarterly)
                </label>
                <input
                  type="number"
                  value={averageHoursPerEmployee}
                  onChange={(e) => setAverageHoursPerEmployee(e.target.value)}
                  placeholder="480"
                  className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                />
                <p className={`text-xs mt-1 ${textColor}`}>
                  For calculating FTE needed
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Annual Turnover Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={turnoverRate}
                  onChange={(e) => setTurnoverRate(e.target.value)}
                  placeholder="0.15"
                  className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                />
                <p className={`text-xs mt-1 ${textColor}`}>
                  e.g., 0.15 for 15% turnover
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Training Cost per Employee ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={trainingCostPerEmployee}
                  onChange={(e) => setTrainingCostPerEmployee(e.target.value)}
                  placeholder="2000"
                  className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                />
              </div>
            </div>
          </details>

          <button
            onClick={handleCalculateLabor}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate Labor Budget
          </button>

          {laborErrors.length > 0 && (
            <div className="mt-6 space-y-3">
              {laborErrors.filter(e => !e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Errors:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    {laborErrors.filter(e => !e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {laborErrors.filter(e => e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Warnings:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    {laborErrors.filter(e => e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error.replace('WARNING: ', '')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        {/* Labor Budget Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Labor Budget Results</h3>
            {laborResult && (
              <button
                onClick={downloadLaborCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!laborResult && (
            <p className="text-lg leading-relaxed">
              Calculate Production Budget first, then enter labor data and click Calculate Labor Budget
            </p>
          )}

          {laborResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              {/* Display multi-category tables if applicable */}
              {laborResult.categoryTables && laborResult.categoryTables.map((cat: any, idx: number) => (
                <div key={idx} className="mb-8">
                  <h4 className={`text-xl font-semibold mb-4 ${headingColor}`}>
                    {cat.categoryName}
                  </h4>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                          {cat.headers.map((header: string, hidx: number) => (
                            <th
                              key={hidx}
                              className={`py-3 px-4 text-left font-semibold text-sm ${hidx === 0 ? '' : 'text-right'} ${headingColor}`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.rows.map((row: any, ridx: number) => (
                          <tr
                            key={ridx}
                            className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                          >
                            <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                            <td className="py-3 px-4 text-right text-sm font-semibold font-mono">{row.yearly}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Summary table for multi-category OR main table for simple */}
              {laborResult.summaryRows && (
                <div className="mb-8">
                  <h4 className={`text-xl font-semibold mb-4 ${headingColor}`}>
                    Summary - Total Direct Labor
                  </h4>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                          {laborResult.headers.map((header: string, idx: number) => (
                            <th
                              key={idx}
                              className={`py-3 px-4 text-left font-semibold text-sm ${idx === 0 ? '' : 'text-right'} ${headingColor}`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {laborResult.summaryRows.map((row: any, idx: number) => (
                          <tr
                            key={idx}
                            className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                          >
                            <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                            <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                            <td className="py-3 px-4 text-right text-sm font-semibold font-mono">{row.yearly}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Simple single-category main table */}
              {!laborResult.summaryRows && laborResult.rows && (
                <div className="overflow-x-auto mb-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        {laborResult.headers.map((header: string, idx: number) => (
                          <th
                            key={idx}
                            className={`py-3 px-4 text-left font-semibold text-sm ${idx === 0 ? '' : 'text-right'} ${headingColor}`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {laborResult.rows.map((row: any, idx: number) => (
                        <tr
                          key={idx}
                          className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                        >
                          <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                          <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                          <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                          <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                          <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                          <td className="py-3 px-4 text-right text-sm font-semibold font-mono">{row.yearly}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Additional Metrics */}
              {(laborResult.laborCostPerUnit || laborResult.averageEmployeesNeeded) && (
                <div className={`p-4 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} mb-6`}>
                  <h4 className={`text-sm font-semibold mb-3 ${headingColor}`}>Analytics</h4>

                  {laborResult.laborCostPerUnit && (
                    <p className={`text-sm mb-2 ${textColor}`}>
                      <strong>Labor Cost per Unit:</strong> {currency} {laborResult.laborCostPerUnit.yearly.toFixed(2)}
                    </p>
                  )}

                  {laborResult.averageEmployeesNeeded && (
                    <p className={`text-sm mb-2 ${textColor}`}>
                      <strong>Average Employees Needed:</strong> {laborResult.averageEmployeesNeeded.yearly.toFixed(1)} FTE
                    </p>
                  )}

                  {laborResult.turnoverCost && (
                    <p className={`text-sm mb-2 ${textColor}`}>
                      <strong>Annual Turnover & Training Cost:</strong> {currency} {laborResult.turnoverCost.yearly.toFixed(2)}
                    </p>
                  )}

                  {laborResult.productivityRate && (
                    <p className={`text-sm ${textColor}`}>
                      <strong>Productivity Efficiency:</strong> {(laborResult.productivityRate.yearly * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}

              {/* Direct Labor Budget Charts */}
              {showCharts && laborRawOutput && (
                <div className="mb-8">
                  <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>
                    Data Visualization
                  </h4>
                  <CostTrendChart
                    data={laborRawOutput.totalLaborCost}
                    label="Total Labor Cost Trend"
                    color="#10B981"
                    darkMode={darkMode}
                  />
                </div>
              )}

              <p className="text-lg leading-relaxed">
                ✓ Direct Labor Budget calculated successfully
              </p>
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Direct Labor Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Direct Labor Budget calculates the hours and costs for direct labor needed to complete the production plan.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Total Direct-Labor Cost = (Units to Produce × Hours per Unit) × Hourly Wage Rate
        </p>

        <hr className={`my-16 ${hrColor}`} />

        {/* SCHEDULE 5: MANUFACTURING OVERHEAD BUDGET */}
        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 5: Manufacturing Overhead Budget
        </h2>
        <p className="text-lg mb-12 leading-relaxed">
          Calculate all manufacturing costs other than direct materials and direct labor
        </p>

        <div className="mb-12">
          <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Overhead Approach</h3>
          <p className={`text-sm mb-4 ${textColor}`}>
            Choose your overhead calculation method
          </p>

          <div className="flex gap-6 mb-8 flex-wrap">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="overheadApproach"
                checked={overheadApproach === 'simple'}
                onChange={() => setOverheadApproach('simple')}
                className="mr-2"
              />
              <span className={`text-sm ${textColor}`}>Simple (Traditional costing)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="overheadApproach"
                checked={overheadApproach === 'abc'}
                onChange={() => setOverheadApproach('abc')}
                className="mr-2"
              />
              <span className={`text-sm ${textColor}`}>Activity-Based Costing (ABC)</span>
            </label>
          </div>

          {overheadApproach === 'simple' && (
            <>
              <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Variable & Fixed Overhead</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Variable Overhead Rate per Unit ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variableOverheadRatePerUnit}
                    onChange={(e) => setVariableOverheadRatePerUnit(e.target.value)}
                    placeholder="5.00"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                  <p className={`text-xs mt-2 ${textColor}`}>
                    Variable overhead cost per unit produced
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Variable Overhead Rate per Labor Hour ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={variableOverheadRatePerLaborHour}
                    onChange={(e) => setVariableOverheadRatePerLaborHour(e.target.value)}
                    placeholder="3.00"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                  <p className={`text-xs mt-2 ${textColor}`}>
                    Variable overhead per direct labor hour (requires Schedule 4)
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Fixed Overhead per Quarter ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fixedOverheadPerQuarter}
                    onChange={(e) => setFixedOverheadPerQuarter(e.target.value)}
                    placeholder="50000"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                  <p className={`text-xs mt-2 ${textColor}`}>
                    Fixed overhead costs per quarter
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                    Depreciation per Quarter ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={depreciationPerQuarter}
                    onChange={(e) => setDepreciationPerQuarter(e.target.value)}
                    placeholder="10000"
                    className={`w-full px-4 py-3 border ${inputBg} text-base`}
                  />
                  <p className={`text-xs mt-2 ${textColor}`}>
                    Non-cash depreciation expense
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Allocation Base (for predetermined overhead rate)
                </label>
                <select
                  value={allocationBase}
                  onChange={(e) => setAllocationBase(e.target.value as any)}
                  className={`w-full px-4 py-3 border ${inputBg} text-base`}
                >
                  <option value="units">Units Produced</option>
                  <option value="labor-hours">Direct Labor Hours</option>
                  <option value="machine-hours">Machine Hours</option>
                </select>
              </div>
            </>
          )}

          {overheadApproach === 'abc' && (
            <>
              <h3 className={`text-2xl font-semibold mb-6 ${headingColor}`}>Activity-Based Costing Data</h3>
              <p className={`text-sm mb-6 ${textColor}`}>
                Enter cost driver data for ABC analysis (Unit-level, Batch-level, Facility-level)
              </p>

              <div className="mb-8">
                <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Batch-Level Costs (Production Runs)</h4>
                <div className="grid md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q1 Runs</label>
                    <input
                      type="number"
                      value={productionRunsQ1}
                      onChange={(e) => setProductionRunsQ1(e.target.value)}
                      placeholder="10"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q2 Runs</label>
                    <input
                      type="number"
                      value={productionRunsQ2}
                      onChange={(e) => setProductionRunsQ2(e.target.value)}
                      placeholder="12"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q3 Runs</label>
                    <input
                      type="number"
                      value={productionRunsQ3}
                      onChange={(e) => setProductionRunsQ3(e.target.value)}
                      placeholder="15"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q4 Runs</label>
                    <input
                      type="number"
                      value={productionRunsQ4}
                      onChange={(e) => setProductionRunsQ4(e.target.value)}
                      placeholder="13"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Cost per Run</label>
                    <input
                      type="number"
                      step="0.01"
                      value={costPerProductionRun}
                      onChange={(e) => setCostPerProductionRun(e.target.value)}
                      placeholder="1000"
                      className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                    />
                  </div>
                </div>
              </div>

              <details className="mb-8">
                <summary className={`text-lg font-semibold cursor-pointer ${headingColor} hover:underline mb-4`}>
                  Advanced ABC Inputs (click to expand)
                </summary>

                <div className="space-y-6 mt-4">
                  <div>
                    <h4 className={`text-base font-semibold mb-3 ${headingColor}`}>Product-Level Costs (Inspections)</h4>
                    <div className="grid md:grid-cols-5 gap-4">
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q1</label>
                        <input
                          type="number"
                          value={inspectionsQ1}
                          onChange={(e) => setInspectionsQ1(e.target.value)}
                          placeholder="5"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q2</label>
                        <input
                          type="number"
                          value={inspectionsQ2}
                          onChange={(e) => setInspectionsQ2(e.target.value)}
                          placeholder="6"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q3</label>
                        <input
                          type="number"
                          value={inspectionsQ3}
                          onChange={(e) => setInspectionsQ3(e.target.value)}
                          placeholder="7"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Q4</label>
                        <input
                          type="number"
                          value={inspectionsQ4}
                          onChange={(e) => setInspectionsQ4(e.target.value)}
                          placeholder="6"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Cost/Inspection</label>
                        <input
                          type="number"
                          step="0.01"
                          value={costPerInspection}
                          onChange={(e) => setCostPerInspection(e.target.value)}
                          placeholder="500"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-base font-semibold mb-3 ${headingColor}`}>Facility-Level Costs (Quarterly)</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Facility Rent</label>
                        <input
                          type="number"
                          step="0.01"
                          value={facilityRent}
                          onChange={(e) => setFacilityRent(e.target.value)}
                          placeholder="20000"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Facility Insurance</label>
                        <input
                          type="number"
                          step="0.01"
                          value={facilityInsurance}
                          onChange={(e) => setFacilityInsurance(e.target.value)}
                          placeholder="5000"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Property Taxes</label>
                        <input
                          type="number"
                          step="0.01"
                          value={propertyTaxes}
                          onChange={(e) => setPropertyTaxes(e.target.value)}
                          placeholder="3000"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Supervisory Salaries</label>
                        <input
                          type="number"
                          step="0.01"
                          value={supervisorySalaries}
                          onChange={(e) => setSupervisorySalaries(e.target.value)}
                          placeholder="15000"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Support Staff</label>
                        <input
                          type="number"
                          step="0.01"
                          value={supportStaffSalaries}
                          onChange={(e) => setSupportStaffSalaries(e.target.value)}
                          placeholder="10000"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Depreciation</label>
                        <input
                          type="number"
                          step="0.01"
                          value={depreciationPerQuarter}
                          onChange={(e) => setDepreciationPerQuarter(e.target.value)}
                          placeholder="10000"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-base font-semibold mb-3 ${headingColor}`}>Unit-Level Costs</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Indirect Materials per Unit</label>
                        <input
                          type="number"
                          step="0.01"
                          value={indirectMaterialsPerUnit}
                          onChange={(e) => setIndirectMaterialsPerUnit(e.target.value)}
                          placeholder="2.50"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${headingColor}`}>Quality Control per Unit</label>
                        <input
                          type="number"
                          step="0.01"
                          value={qualityControlPerUnit}
                          onChange={(e) => setQualityControlPerUnit(e.target.value)}
                          placeholder="1.50"
                          className={`w-full px-3 py-2 border ${inputBg} text-sm`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </>
          )}

          <button
            onClick={handleCalculateOverhead}
            className={`${buttonBg} font-medium px-8 py-3 text-lg mt-4`}
          >
            Calculate Manufacturing Overhead
          </button>

          {overheadErrors.length > 0 && (
            <div className="mt-6 space-y-3">
              {overheadErrors.filter(e => !e.startsWith('WARNING:')).length > 0 && (
                <div className={`p-4 ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                  <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Errors:
                  </p>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    {overheadErrors.filter(e => !e.startsWith('WARNING:')).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        {/* Overhead Budget Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Manufacturing Overhead Results</h3>
            {overheadResult && (
              <button
                onClick={downloadOverheadCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!overheadResult && (
            <p className="text-lg leading-relaxed">
              Calculate Production Budget first, then enter overhead data and click Calculate Manufacturing Overhead
            </p>
          )}

          {overheadResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {overheadResult.headers.map((header: string, idx: number) => (
                        <th
                          key={idx}
                          className={`py-3 px-4 text-left font-semibold text-sm ${idx === 0 ? '' : 'text-right'} ${headingColor}`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {overheadResult.rows.map((row: any, idx: number) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q1}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q2}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q3}</td>
                        <td className="py-3 px-4 text-right text-sm font-mono">{row.q4}</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold font-mono">{row.yearly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {overheadResult.overheadPerUnit && (
                <div className={`p-4 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} mb-6`}>
                  <h4 className={`text-sm font-semibold mb-3 ${headingColor}`}>Cost Metrics</h4>
                  <p className={`text-sm mb-2 ${textColor}`}>
                    <strong>Overhead per Unit:</strong> {currency} {overheadResult.overheadPerUnit.yearly.toFixed(2)}
                  </p>
                  {overheadResult.predeterminedRate && (
                    <p className={`text-sm ${textColor}`}>
                      <strong>Predetermined Overhead Rate:</strong> {currency} {overheadResult.predeterminedRate.toFixed(2)} per {allocationBase === 'units' ? 'unit' : allocationBase === 'labor-hours' ? 'labor hour' : 'machine hour'}
                    </p>
                  )}
                </div>
              )}

              {/* Manufacturing Overhead Charts */}
              {showCharts && overheadRawOutput && (
                <div className="mb-8">
                  <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>
                    Data Visualization
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <CostTrendChart
                      data={overheadRawOutput.totalOverhead}
                      label="Total Overhead Trend"
                      color="#F59E0B"
                      darkMode={darkMode}
                    />
                    <ExpenseBreakdownChart
                      expenses={[
                        { name: 'Variable', value: overheadRawOutput.variableOverhead.yearly },
                        { name: 'Fixed', value: overheadRawOutput.fixedOverhead.yearly },
                        { name: 'Depreciation', value: overheadRawOutput.depreciation?.yearly || 0 },
                      ]}
                      title="Overhead Breakdown"
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              )}

              <p className="text-lg leading-relaxed">
                ✓ Manufacturing Overhead Budget calculated successfully
              </p>
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Manufacturing Overhead Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Manufacturing Overhead Budget calculates all manufacturing costs other than direct materials and direct labor, including indirect materials, indirect labor, utilities, depreciation, and facility costs.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Total Manufacturing Overhead = Variable Overhead + Fixed Overhead; Cash Disbursements = Total Overhead − Depreciation
        </p>

        <hr className={`my-12 ${hrColor}`} />

        {/* ============================================ */}
        {/* SCHEDULE 6: SG&A EXPENSE BUDGET */}
        {/* ============================================ */}

        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 6: Selling, General & Administrative (SG&A) Expense Budget
        </h2>
        <p className="text-lg mb-8 leading-relaxed">
          The SG&A Expense Budget plans all non-manufacturing operating expenses including sales commissions, marketing, distribution, and administrative costs.
        </p>

        {/* Approach Selection */}
        <div className="mb-8">
          <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Select Approach</h4>
          <div className="flex gap-6 mb-4 flex-wrap">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sgaApproach"
                checked={sgaApproach === 'simple'}
                onChange={() => setSgaApproach('simple')}
                className="mr-2"
              />
              <span>Simple (Percentage-based)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sgaApproach"
                checked={sgaApproach === 'detailed'}
                onChange={() => setSgaApproach('detailed')}
                className="mr-2"
              />
              <span>Detailed (Line-by-line)</span>
            </label>
          </div>
        </div>

        {/* Simple Approach Form */}
        {sgaApproach === 'simple' && (
          <div className="mb-8">
            <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Simple Approach Inputs</h4>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Variable Selling Expense Rate (% of sales)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={variableSellingExpenseRate}
                  onChange={(e) => setVariableSellingExpenseRate(e.target.value)}
                  placeholder="0.05 (5%)"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Variable Admin Expense Rate (% of sales)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={variableAdminExpenseRate}
                  onChange={(e) => setVariableAdminExpenseRate(e.target.value)}
                  placeholder="0.03 (3%)"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Fixed Selling Expense per Quarter ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fixedSellingExpensePerQuarter}
                  onChange={(e) => setFixedSellingExpensePerQuarter(e.target.value)}
                  placeholder="50000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Fixed Admin Expense per Quarter ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fixedAdminExpensePerQuarter}
                  onChange={(e) => setFixedAdminExpensePerQuarter(e.target.value)}
                  placeholder="75000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Approach Form */}
        {sgaApproach === 'detailed' && (
          <div className="mb-8">
            <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Selling Expenses</h4>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Commission Rate (% of revenue)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="0.05 (5%)"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Distribution Cost per Unit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={distributionCostPerUnit}
                  onChange={(e) => setDistributionCostPerUnit(e.target.value)}
                  placeholder="2.50"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Distribution Fixed Cost per Quarter ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={distributionFixedCostPerQuarter}
                  onChange={(e) => setDistributionFixedCostPerQuarter(e.target.value)}
                  placeholder="15000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Customer Service Salaries per Quarter ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customerServiceSalaries}
                  onChange={(e) => setCustomerServiceSalaries(e.target.value)}
                  placeholder="25000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Warranty Expense per Unit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={warrantyExpensePerUnit}
                  onChange={(e) => setWarrantyExpensePerUnit(e.target.value)}
                  placeholder="1.00"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>
            </div>

            <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Marketing Expenses (per Quarter)</h4>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Advertising Budget ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={advertisingBudgetPerQuarter}
                  onChange={(e) => setAdvertisingBudgetPerQuarter(e.target.value)}
                  placeholder="20000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Brand Development ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={brandDevelopmentPerQuarter}
                  onChange={(e) => setBrandDevelopmentPerQuarter(e.target.value)}
                  placeholder="10000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Marketing Campaigns ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={marketingCampaignsPerQuarter}
                  onChange={(e) => setMarketingCampaignsPerQuarter(e.target.value)}
                  placeholder="15000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>
            </div>

            <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Administrative Expenses (per Quarter)</h4>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Executive Salaries ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={executiveSalaries}
                  onChange={(e) => setExecutiveSalaries(e.target.value)}
                  placeholder="150000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Finance Salaries ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={financeSalaries}
                  onChange={(e) => setFinanceSalaries(e.target.value)}
                  placeholder="50000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  HR Salaries ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={hrSalaries}
                  onChange={(e) => setHrSalaries(e.target.value)}
                  placeholder="40000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  IT Salaries ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={itSalaries}
                  onChange={(e) => setItSalaries(e.target.value)}
                  placeholder="60000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Office Rent ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={officeRentPerQuarter}
                  onChange={(e) => setOfficeRentPerQuarter(e.target.value)}
                  placeholder="30000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Utilities ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={utilitiesPerQuarter}
                  onChange={(e) => setUtilitiesPerQuarter(e.target.value)}
                  placeholder="5000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Software Licenses ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={softwareLicensesPerQuarter}
                  onChange={(e) => setSoftwareLicensesPerQuarter(e.target.value)}
                  placeholder="10000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Telecommunications ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={telecommunicationsPerQuarter}
                  onChange={(e) => setTelecommunicationsPerQuarter(e.target.value)}
                  placeholder="3000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Office Supplies ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={officeSuppliesPerQuarter}
                  onChange={(e) => setOfficeSuppliesPerQuarter(e.target.value)}
                  placeholder="2000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Legal Fees ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={legalFeesPerQuarter}
                  onChange={(e) => setLegalFeesPerQuarter(e.target.value)}
                  placeholder="8000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Bad Debt Rate (% of sales)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={badDebtRate}
                  onChange={(e) => setBadDebtRate(e.target.value)}
                  placeholder="0.02 (2%)"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                  Depreciation - Office Equipment ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={depreciationOfficeEquipment}
                  onChange={(e) => setDepreciationOfficeEquipment(e.target.value)}
                  placeholder="5000"
                  className={`w-full px-4 py-2 border ${inputBg}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <button
          onClick={handleCalculateSGA}
          className={`${buttonBg} font-medium px-6 py-3 mb-6`}
        >
          Calculate SG&A Expenses
        </button>

        {/* Error Display */}
        {sgaErrors.length > 0 && (
          <div className="mt-6 space-y-3">
            {sgaErrors.filter(e => !e.startsWith('WARNING:')).length > 0 && (
              <div className={`p-4 ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                  Errors:
                </p>
                <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                  {sgaErrors.filter(e => !e.startsWith('WARNING:')).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {sgaErrors.filter(e => e.startsWith('WARNING:')).length > 0 && (
              <div className={`p-4 ${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border`}>
                <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  Warnings:
                </p>
                <ul className={`list-disc list-inside text-xs space-y-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  {sgaErrors.filter(e => e.startsWith('WARNING:')).map((warning, idx) => (
                    <li key={idx}>{warning.replace('WARNING: ', '')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* SGA Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>SG&A Expense Results</h3>
            {sgaResult && (
              <button
                onClick={downloadSGACSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!sgaResult && (
            <p className="text-lg leading-relaxed">
              Calculate Sales Budget first, then enter SG&A data and click Calculate SG&A Expenses
            </p>
          )}

          {sgaResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      {sgaResult.headers.map((header: string, idx: number) => (
                        <th
                          key={idx}
                          className={`py-3 px-4 text-left font-semibold text-sm ${idx === 0 ? '' : 'text-right'} ${headingColor}`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sgaResult.rows.map((row: any, idx: number) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q1}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q2}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q3}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q4}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{row.yearly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sgaResult.sgaAsPercentOfSales && (
                <div className={`p-4 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} mb-6`}>
                  <h4 className={`text-sm font-semibold mb-3 ${headingColor}`}>SG&A Metrics</h4>
                  <p className={`text-sm mb-2 ${textColor}`}>
                    <strong>SG&A as % of Sales (Yearly):</strong> {(sgaResult.sgaAsPercentOfSales.yearly * 100).toFixed(2)}%
                  </p>
                  {sgaResult.variableSGAPerUnit && (
                    <p className={`text-sm mb-2 ${textColor}`}>
                      <strong>Variable SG&A per Unit:</strong> {currency} {sgaResult.variableSGAPerUnit.yearly.toFixed(2)}
                    </p>
                  )}
                  {sgaResult.totalSGAPerUnit && (
                    <p className={`text-sm ${textColor}`}>
                      <strong>Total SG&A per Unit:</strong> {currency} {sgaResult.totalSGAPerUnit.yearly.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* SG&A Charts */}
              {showCharts && sgaRawOutput && (
                <div className="mb-8">
                  <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>
                    Data Visualization
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <CostTrendChart
                      data={sgaRawOutput.totalSGAExpenses}
                      label="Total SG&A Expenses Trend"
                      color="#8B5CF6"
                      darkMode={darkMode}
                    />
                    <ExpenseBreakdownChart
                      expenses={[
                        { name: 'Selling', value: sgaRawOutput.totalSellingExpenses?.yearly || 0 },
                        { name: 'Marketing', value: sgaRawOutput.totalMarketingExpenses?.yearly || 0 },
                        { name: 'Admin', value: sgaRawOutput.totalAdministrativeExpenses?.yearly || 0 },
                      ]}
                      title="SG&A Expense Breakdown"
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              )}

              <p className="text-lg leading-relaxed">
                ✓ SG&A Expense Budget calculated successfully
              </p>
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the SG&A Expense Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Selling, General & Administrative Expense Budget plans all non-manufacturing operating expenses including sales commissions, marketing, distribution, and administrative overhead.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Total SG&A = Variable Expenses + Fixed Expenses; Variable includes commissions and distribution; Fixed includes salaries, rent, and utilities
        </p>

        <hr className={`my-12 ${hrColor}`} />

        {/* ============================================ */}
        {/* SCHEDULE 7: CASH RECEIPTS BUDGET */}
        {/* ============================================ */}

        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 7: Cash Receipts Budget
        </h2>
        <p className="text-lg mb-8 leading-relaxed">
          The Cash Receipts Budget calculates when cash is actually collected from sales, bridging the gap between accrual accounting (sales revenue) and cash accounting (actual cash received).
        </p>

        {/* Cash Receipts Inputs */}
        <div className="mb-8">
          <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Collection Policy</h4>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Percent Collected in Same Quarter
              </label>
              <input
                type="number"
                step="0.01"
                value={percentCollectedSameQuarter}
                onChange={(e) => setPercentCollectedSameQuarter(e.target.value)}
                placeholder="0.70 (70%)"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">e.g., 0.70 for 70% collected in same quarter</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Percent Collected in Next Quarter
              </label>
              <input
                type="number"
                step="0.01"
                value={percentCollectedNextQuarter}
                onChange={(e) => setPercentCollectedNextQuarter(e.target.value)}
                placeholder="0.28 (28%)"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">e.g., 0.28 for 28% collected next quarter</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Percent Uncollectible (Bad Debt) - Optional
              </label>
              <input
                type="number"
                step="0.001"
                value={percentUncollectible}
                onChange={(e) => setPercentUncollectible(e.target.value)}
                placeholder="0.02 (2%)"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">e.g., 0.02 for 2% bad debt allowance</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Beginning Accounts Receivable ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={beginningAccountsReceivable}
                onChange={(e) => setBeginningAccountsReceivable(e.target.value)}
                placeholder="25000"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Outstanding receivables at start of year</p>
            </div>
          </div>

          <button
            onClick={handleCalculateCashReceipts}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate Cash Receipts
          </button>
        </div>

        {/* Display Errors and Warnings */}
        {cashReceiptsErrors.length > 0 && (
          <div className="mb-6 p-4 border border-red-500 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
              {cashReceiptsErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {cashReceiptsWarnings.length > 0 && (
          <div className="mb-6 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Warnings:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-300">
              {cashReceiptsWarnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cash Receipts Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Cash Receipts Results</h3>
            {cashReceiptsResult && (
              <button
                onClick={downloadCashReceiptsCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!cashReceiptsResult && (
            <p className="text-lg leading-relaxed">
              Calculate Sales Budget first, then enter cash receipts data and click Calculate Cash Receipts
            </p>
          )}

          {cashReceiptsResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <th className={`py-3 px-4 text-left font-semibold text-sm ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q1</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q2</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q3</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q4</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatCashReceiptsOutput(cashReceiptsResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q1}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q2}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q3}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q4}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{row.yearly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-lg leading-relaxed">
                ✓ Cash Receipts Budget calculated successfully
              </p>

              {/* Charts for Cash Receipts */}
              {showCharts && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>Cash Collection Visualization</h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Hide Charts
                    </button>
                  </div>
                  <div className="grid md:grid-cols-1 gap-6">
                    <CostTrendChart
                      data={cashReceiptsResult.totalCashReceipts}
                      label="Total Cash Receipts by Quarter"
                      color="#10B981"
                      darkMode={darkMode}
                      height={280}
                    />
                    <ExpenseBreakdownChart
                      expenses={[
                        { name: 'Cash Sales', value: cashReceiptsResult.collectionsSameQuarter.yearly },
                        { name: 'Credit Collections', value: cashReceiptsResult.collectionsNextQuarter.yearly },
                      ]}
                      title="Cash Receipts Composition (Yearly)"
                      darkMode={darkMode}
                      height={280}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Cash Receipts Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Cash Receipts Budget shows when cash from sales is actually collected. It accounts for the timing difference between when a sale is made (revenue recognition) and when cash is received (cash collection).
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Total Cash Receipts = Cash Sales + (Credit Sales × % Collected Same Quarter) + (Prior Quarter Credit Sales × % Collected Next Quarter)
        </p>

        <hr className={`my-12 ${hrColor}`} />

        {/* ============================================ */}
        {/* SCHEDULE 8: CASH DISBURSEMENTS BUDGET */}
        {/* ============================================ */}

        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 8: Cash Disbursements Budget
        </h2>
        <p className="text-lg mb-8 leading-relaxed">
          The Cash Disbursements Budget calculates when cash is actually paid out for all operating expenses, combining data from Schedules 3-6 plus additional payments like taxes, dividends, and capital expenditures.
        </p>

        {/* Cash Disbursements Inputs */}
        <div className="mb-8">
          <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Material Payment Policy</h4>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Percent Paid in Same Quarter
              </label>
              <input
                type="number"
                step="0.01"
                value={percentMaterialPaidSameQuarter}
                onChange={(e) => setPercentMaterialPaidSameQuarter(e.target.value)}
                placeholder="0.50 (50%)"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">e.g., 0.50 for 50% paid immediately</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Percent Paid in Next Quarter
              </label>
              <input
                type="number"
                step="0.01"
                value={percentMaterialPaidNextQuarter}
                onChange={(e) => setPercentMaterialPaidNextQuarter(e.target.value)}
                placeholder="0.50 (50%)"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">e.g., 0.50 for 50% paid next quarter</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Beginning Accounts Payable ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={beginningAccountsPayable}
                onChange={(e) => setBeginningAccountsPayable(e.target.value)}
                placeholder="20000"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Outstanding payables at start of year</p>
            </div>
          </div>

          <h4 className={`text-lg font-semibold mb-4 mt-6 ${headingColor}`}>Other Cash Disbursements (Optional)</h4>

          <div className="mb-6">
            <p className={`text-sm font-medium mb-3 ${headingColor}`}>Income Tax Payments ($)</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs mb-1 opacity-75">Q1</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeTaxQ1}
                  onChange={(e) => setIncomeTaxQ1(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q2</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeTaxQ2}
                  onChange={(e) => setIncomeTaxQ2(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q3</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeTaxQ3}
                  onChange={(e) => setIncomeTaxQ3(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q4</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeTaxQ4}
                  onChange={(e) => setIncomeTaxQ4(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={`text-sm font-medium mb-3 ${headingColor}`}>Dividend Payments ($)</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs mb-1 opacity-75">Q1</label>
                <input
                  type="number"
                  step="0.01"
                  value={dividendQ1}
                  onChange={(e) => setDividendQ1(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q2</label>
                <input
                  type="number"
                  step="0.01"
                  value={dividendQ2}
                  onChange={(e) => setDividendQ2(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q3</label>
                <input
                  type="number"
                  step="0.01"
                  value={dividendQ3}
                  onChange={(e) => setDividendQ3(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q4</label>
                <input
                  type="number"
                  step="0.01"
                  value={dividendQ4}
                  onChange={(e) => setDividendQ4(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={`text-sm font-medium mb-3 ${headingColor}`}>Capital Expenditures ($)</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs mb-1 opacity-75">Q1</label>
                <input
                  type="number"
                  step="0.01"
                  value={capexQ1}
                  onChange={(e) => setCapexQ1(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q2</label>
                <input
                  type="number"
                  step="0.01"
                  value={capexQ2}
                  onChange={(e) => setCapexQ2(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q3</label>
                <input
                  type="number"
                  step="0.01"
                  value={capexQ3}
                  onChange={(e) => setCapexQ3(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q4</label>
                <input
                  type="number"
                  step="0.01"
                  value={capexQ4}
                  onChange={(e) => setCapexQ4(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={`text-sm font-medium mb-3 ${headingColor}`}>Loan Payments ($)</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs mb-1 opacity-75">Q1</label>
                <input
                  type="number"
                  step="0.01"
                  value={loanPaymentQ1}
                  onChange={(e) => setLoanPaymentQ1(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q2</label>
                <input
                  type="number"
                  step="0.01"
                  value={loanPaymentQ2}
                  onChange={(e) => setLoanPaymentQ2(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q3</label>
                <input
                  type="number"
                  step="0.01"
                  value={loanPaymentQ3}
                  onChange={(e) => setLoanPaymentQ3(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 opacity-75">Q4</label>
                <input
                  type="number"
                  step="0.01"
                  value={loanPaymentQ4}
                  onChange={(e) => setLoanPaymentQ4(e.target.value)}
                  placeholder="0"
                  className={`w-full px-3 py-2 border text-sm ${inputBg}`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculateCashDisbursements}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate Cash Disbursements
          </button>
        </div>

        {/* Display Errors and Warnings */}
        {cashDisbursementsErrors.length > 0 && (
          <div className="mb-6 p-4 border border-red-500 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
              {cashDisbursementsErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {cashDisbursementsWarnings.length > 0 && (
          <div className="mb-6 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Warnings:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-300">
              {cashDisbursementsWarnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cash Disbursements Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Cash Disbursements Results</h3>
            {cashDisbursementsResult && (
              <button
                onClick={downloadCashDisbursementsCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!cashDisbursementsResult && (
            <p className="text-lg leading-relaxed">
              Calculate Schedules 3-6 first, then enter cash disbursements data and click Calculate Cash Disbursements
            </p>
          )}

          {cashDisbursementsResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <th className={`py-3 px-4 text-left font-semibold text-sm ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q1</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q2</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q3</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q4</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatCashDisbursementsOutput(cashDisbursementsResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q1}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q2}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q3}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q4}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{row.yearly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-lg leading-relaxed">
                ✓ Cash Disbursements Budget calculated successfully
              </p>

              {/* Charts for Cash Disbursements */}
              {showCharts && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>Cash Disbursements Visualization</h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Hide Charts
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <CostTrendChart
                      data={cashDisbursementsResult.totalDisbursements}
                      label="Total Disbursements by Quarter"
                      color="#EF4444"
                      darkMode={darkMode}
                      height={280}
                    />
                    <ExpenseBreakdownChart
                      expenses={[
                        { name: 'Materials', value: cashDisbursementsResult.materialPayments.yearly },
                        { name: 'Labor', value: cashDisbursementsResult.laborPayments.yearly },
                        { name: 'Overhead', value: cashDisbursementsResult.overheadPayments.yearly },
                        { name: 'SG&A', value: cashDisbursementsResult.sgaPayments.yearly },
                        { name: 'Taxes', value: cashDisbursementsResult.incomeTaxPayments.yearly },
                        { name: 'CapEx', value: cashDisbursementsResult.capitalExpenditures.yearly },
                      ].filter(e => e.value > 0)}
                      title="Disbursements by Category (Yearly)"
                      darkMode={darkMode}
                      height={280}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Cash Disbursements Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Cash Disbursements Budget shows when cash is actually paid out for all business expenses. It combines operating expenses from Schedules 3-6 with additional payments like taxes, dividends, capital expenditures, and loan payments.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Formula:</strong> Total Disbursements = Material Payments + Labor + Overhead (cash portion) + SGA (cash portion) + Taxes + Dividends + CapEx + Loan Payments
        </p>

        <hr className={`my-12 ${hrColor}`} />

        {/* ============================================ */}
        {/* SCHEDULE 9: CASH BUDGET */}
        {/* ============================================ */}

        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 9: Cash Budget
        </h2>
        <p className="text-lg mb-8 leading-relaxed">
          The Cash Budget is the master cash planning schedule that forecasts the company's cash position and financing needs by combining cash receipts and disbursements.
        </p>

        {/* Cash Budget Inputs */}
        <div className="mb-8">
          <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Cash Policy</h4>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Beginning Cash Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={beginningCashBalance}
                onChange={(e) => setBeginningCashBalance(e.target.value)}
                placeholder="35000"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Cash on hand at start of year</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Minimum Cash Balance Required ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={minimumCashBalance}
                onChange={(e) => setMinimumCashBalance(e.target.value)}
                placeholder="15000"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Safety cushion for operations</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Interest Rate on Borrowing (Optional)
              </label>
              <input
                type="number"
                step="0.001"
                value={interestRateOnBorrowing}
                onChange={(e) => setInterestRateOnBorrowing(e.target.value)}
                placeholder="0.08 (8% annual)"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">e.g., 0.08 for 8% annual interest</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Interest Rate on Investments (Optional)
              </label>
              <input
                type="number"
                step="0.001"
                value={interestRateOnInvestments}
                onChange={(e) => setInterestRateOnInvestments(e.target.value)}
                placeholder="0.03 (3% annual)"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">e.g., 0.03 for 3% annual return</p>
            </div>
          </div>

          <button
            onClick={handleCalculateCashBudget}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate Cash Budget
          </button>
        </div>

        {/* Display Errors and Warnings */}
        {cashBudgetErrors.length > 0 && (
          <div className="mb-6 p-4 border border-red-500 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
              {cashBudgetErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {cashBudgetWarnings.length > 0 && (
          <div className="mb-6 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Warnings:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-300">
              {cashBudgetWarnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cash Budget Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>Cash Budget Results</h3>
            {cashBudgetResult && (
              <button
                onClick={downloadCashBudgetCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!cashBudgetResult && (
            <p className="text-lg leading-relaxed">
              Calculate Schedules 7 and 8 first, then enter cash budget data and click Calculate Cash Budget
            </p>
          )}

          {cashBudgetResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <th className={`py-3 px-4 text-left font-semibold text-sm ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q1</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q2</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q3</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Q4</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatCashBudgetOutput(cashBudgetResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{row.label}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q1}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q2}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q3}</td>
                        <td className="py-3 px-4 text-sm text-right">{row.q4}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{row.yearly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-lg leading-relaxed">
                ✓ Cash Budget calculated successfully
              </p>

              {/* Charts for Cash Budget */}
              {showCharts && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>Cash Position Visualization</h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Hide Charts
                    </button>
                  </div>
                  <div className="grid md:grid-cols-1 gap-6">
                    <CashFlowChart
                      receipts={cashBudgetResult.cashReceipts}
                      disbursements={cashBudgetResult.cashDisbursements}
                      endingCash={cashBudgetResult.endingCash}
                      darkMode={darkMode}
                      height={320}
                    />
                    <div className="grid md:grid-cols-2 gap-6">
                      <CostTrendChart
                        data={cashBudgetResult.operatingCashFlow}
                        label="Operating Cash Flow by Quarter"
                        color="#3B82F6"
                        darkMode={darkMode}
                        height={250}
                      />
                      <CostTrendChart
                        data={cashBudgetResult.freeCashFlow}
                        label="Free Cash Flow by Quarter"
                        color="#10B981"
                        darkMode={darkMode}
                        height={250}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Cash Budget
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Cash Budget is the master cash planning document that shows the company's projected cash position throughout the year. It identifies periods of cash surplus or deficit and helps plan financing needs.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Key Metrics:</strong> Operating Cash Flow (receipts - disbursements), Free Cash Flow (operating cash flow - capital expenditures), and Financing Requirements (borrowing needed to maintain minimum cash balance).
        </p>

        <hr className={`my-12 ${hrColor}`} />

        {/* ============================================ */}
        {/* SCHEDULE 10: COST OF GOODS MANUFACTURED & SOLD */}
        {/* ============================================ */}

        <h2 className={`text-4xl font-bold mb-4 ${headingColor}`}>
          Schedule 10: Cost of Goods Manufactured & Sold (COGS)
        </h2>
        <p className="text-lg mb-8 leading-relaxed">
          The COGS Schedule calculates the total cost of producing and selling goods by combining direct materials, direct labor, and manufacturing overhead with inventory adjustments.
        </p>

        {/* COGS Inputs */}
        <div className="mb-8">
          <h4 className={`text-lg font-semibold mb-4 ${headingColor}`}>Inventory Values</h4>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Beginning Work-in-Process Inventory ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={beginningWIPInventory}
                onChange={(e) => setBeginningWIPInventory(e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Partially completed goods at start of year</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Ending Work-in-Process Inventory ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={endingWIPInventory}
                onChange={(e) => setEndingWIPInventory(e.target.value)}
                placeholder="0"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Partially completed goods at end of year</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Beginning Finished Goods Inventory ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={beginningFinishedGoodsInventory}
                onChange={(e) => setBeginningFinishedGoodsInventory(e.target.value)}
                placeholder="10000"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Completed goods ready for sale at start of year</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${headingColor}`}>
                Ending Finished Goods Inventory ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={endingFinishedGoodsInventory}
                onChange={(e) => setEndingFinishedGoodsInventory(e.target.value)}
                placeholder="10000"
                className={`w-full px-4 py-2 border ${inputBg}`}
              />
              <p className="text-xs mt-1 opacity-75">Completed goods ready for sale at end of year</p>
            </div>
          </div>

          <button
            onClick={handleCalculateCOGS}
            className={`${buttonBg} font-medium px-8 py-3 text-lg`}
          >
            Calculate COGS
          </button>
        </div>

        {/* Display Errors and Warnings */}
        {cogsErrors.length > 0 && (
          <div className="mb-6 p-4 border border-red-500 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300">
              {cogsErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {cogsWarnings.length > 0 && (
          <div className="mb-6 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Warnings:</h4>
            <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-300">
              {cogsWarnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* COGS Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${headingColor}`}>COGS Results</h3>
            {cogsResult && (
              <button
                onClick={downloadCOGSCSV}
                className={`${buttonBg} font-medium px-6 py-2 text-sm`}
              >
                Download CSV
              </button>
            )}
          </div>

          {!cogsResult && (
            <p className="text-lg leading-relaxed">
              Calculate Schedules 2-5 first, then enter inventory data and click Calculate COGS
            </p>
          )}

          {cogsResult && (
            <div>
              <p className={`text-lg mb-2 ${headingColor}`}>
                <strong>{companyName || 'Your Company'}</strong> — {productName || 'Product'}
              </p>
              <p className={`text-sm mb-6 ${textColor}`}>
                For the Year Ending December 31, {fiscalYear}
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                      <th className={`py-3 px-4 text-left font-semibold text-sm ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right font-semibold text-sm ${headingColor}`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatCOGSOutput(cogsResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${row.label.includes('TOTAL') || row.label.includes('Cost of Goods') ? 'font-semibold' : ''} ${headingColor}`}>{row.label}</td>
                        <td className={`py-3 px-4 text-sm text-right ${row.label.includes('TOTAL') || row.label.includes('Cost of Goods') ? 'font-semibold' : ''}`}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-lg leading-relaxed">
                ✓ COGS Schedule calculated successfully
              </p>

              {/* Charts for COGS */}
              {showCharts && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>Cost of Goods Sold Visualization</h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Hide Charts
                    </button>
                  </div>
                  <div className="grid md:grid-cols-1 gap-6">
                    <COGSBreakdownChart
                      directMaterial={cogsResult.directMaterial}
                      directLabor={cogsResult.directLabor}
                      manufacturingOverhead={cogsResult.manufacturingOverhead}
                      darkMode={darkMode}
                      height={300}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the COGS Schedule
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Cost of Goods Manufactured & Sold schedule combines all manufacturing costs (materials, labor, overhead) and adjusts for inventory changes to determine the final cost of products sold during the period.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Key Formulas:</strong> Cost of Goods Manufactured = Beginning WIP + Total Manufacturing Cost - Ending WIP; Cost of Goods Sold = Beginning FG + COGM - Ending FG
        </p>

        {/* ============================================ */}
        {/* SCHEDULE 11: BUDGETED INCOME STATEMENT        */}
        {/* ============================================ */}

        <div id="schedule11" className="mt-16">
          <h2 className={`text-3xl font-bold mb-6 ${headingColor}`}>
            Schedule 11: Budgeted Income Statement
          </h2>

          <p className="text-lg mb-6 leading-relaxed">
            Project your company's profitability by combining sales revenue, cost of goods sold, and operating expenses into a comprehensive income statement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Interest Expense (optional)
              </label>
              <input
                type="number"
                value={interestExpense}
                onChange={(e) => setInterestExpense(e.target.value)}
                placeholder="e.g., 15000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Income Tax Rate (0-1, e.g., 0.25 for 25%)
              </label>
              <input
                type="number"
                value={incomeTaxRate}
                onChange={(e) => setIncomeTaxRate(e.target.value)}
                placeholder="e.g., 0.25"
                step="0.01"
                min="0"
                max="1"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <button
            onClick={handleCalculateIncomeStatement}
            className={`${buttonBg} font-medium px-8 py-3 text-lg mb-6`}
          >
            Calculate Income Statement
          </button>

          {incomeStatementErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
              <strong>Errors:</strong>
              <ul className="list-disc list-inside">
                {incomeStatementErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {incomeStatementWarnings.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-6">
              <strong>Warnings:</strong>
              <ul className="list-disc list-inside">
                {incomeStatementWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {incomeStatementResult && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-2xl font-semibold ${headingColor}`}>
                  Results
                </h3>
                <button
                  onClick={downloadIncomeStatementCSV}
                  className={`${buttonBg} px-6 py-2 text-sm`}
                >
                  Download CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right text-sm font-semibold ${headingColor}`}>Amount</th>
                      <th className={`py-3 px-4 text-right text-sm font-semibold ${headingColor}`}>% of Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatIncomeStatementOutput(incomeStatementResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${row.label.includes('TOTAL') || row.label.includes('Net Income') || row.label.includes('Gross Margin') || row.label.includes('Operating Income') ? 'font-semibold' : ''} ${headingColor}`}>{row.label}</td>
                        <td className={`py-3 px-4 text-sm text-right ${row.label.includes('TOTAL') || row.label.includes('Net Income') || row.label.includes('Gross Margin') || row.label.includes('Operating Income') ? 'font-semibold' : ''}`}>{row.amount}</td>
                        <td className={`py-3 px-4 text-sm text-right ${row.label.includes('TOTAL') || row.label.includes('Net Income') || row.label.includes('Gross Margin') || row.label.includes('Operating Income') ? 'font-semibold' : ''}`}>{row.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-lg leading-relaxed">
                ✓ Income Statement calculated successfully
              </p>

              {/* Charts for Income Statement */}
              {showCharts && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>Income Statement Visualization</h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Hide Charts
                    </button>
                  </div>
                  <div className="grid md:grid-cols-1 gap-6">
                    <IncomeWaterfallChart
                      salesRevenue={incomeStatementResult.salesRevenue}
                      cogs={incomeStatementResult.costOfGoodsSold}
                      sgaExpenses={incomeStatementResult.sellingAdminExpenses}
                      interestExpense={incomeStatementResult.interestExpense}
                      taxes={incomeStatementResult.incomeTax}
                      darkMode={darkMode}
                      height={350}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Budgeted Income Statement
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Budgeted Income Statement combines data from all previous schedules to project your company's profitability. It shows sales revenue, cost of goods sold, gross margin, operating expenses, and net income with percentage analysis.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Key Formulas:</strong> Gross Margin = Sales Revenue - COGS; Operating Income = Gross Margin - SG&A; Net Income = Operating Income - Interest - Taxes
        </p>

        {/* ============================================ */}
        {/* SCHEDULE 12: BUDGETED STATEMENT OF CASH FLOWS */}
        {/* ============================================ */}

        <div id="schedule12" className="mt-16">
          <h2 className={`text-3xl font-bold mb-6 ${headingColor}`}>
            Schedule 12: Budgeted Statement of Cash Flows
          </h2>

          <p className="text-lg mb-6 leading-relaxed">
            Reconcile net income to operating cash flow and see the complete picture of cash movements by activity (operating, investing, financing) using the direct method.
          </p>

          <h3 className={`text-xl font-semibold mb-4 ${headingColor}`}>Beginning Balances (from Prior Period)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Beginning Cash
              </label>
              <input
                type="number"
                value={cfBeginningCash}
                onChange={(e) => setCfBeginningCash(e.target.value)}
                placeholder="e.g., 35000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Beginning Accounts Receivable
              </label>
              <input
                type="number"
                value={cfBeginningAR}
                onChange={(e) => setCfBeginningAR(e.target.value)}
                placeholder="e.g., 50000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Beginning Inventory
              </label>
              <input
                type="number"
                value={cfBeginningInventory}
                onChange={(e) => setCfBeginningInventory(e.target.value)}
                placeholder="e.g., 60000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Beginning Accounts Payable
              </label>
              <input
                type="number"
                value={cfBeginningAP}
                onChange={(e) => setCfBeginningAP(e.target.value)}
                placeholder="e.g., 40000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <h3 className={`text-xl font-semibold mb-4 ${headingColor}`}>Financing & Investing Activities (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                New Loan Proceeds
              </label>
              <input
                type="number"
                value={cfLoanProceeds}
                onChange={(e) => setCfLoanProceeds(e.target.value)}
                placeholder="e.g., 25000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Stock Issued
              </label>
              <input
                type="number"
                value={cfStockIssued}
                onChange={(e) => setCfStockIssued(e.target.value)}
                placeholder="e.g., 10000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                Proceeds from Asset Sales
              </label>
              <input
                type="number"
                value={cfAssetSales}
                onChange={(e) => setCfAssetSales(e.target.value)}
                placeholder="e.g., 5000"
                className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <button
            onClick={handleCalculateCashFlowStatement}
            className={`${buttonBg} font-medium px-8 py-3 text-lg mb-6`}
          >
            Calculate Cash Flow Statement
          </button>

          {cashFlowErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
              <strong>Errors:</strong>
              <ul className="list-disc list-inside">
                {cashFlowErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {cashFlowWarnings.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-6">
              <strong>Warnings:</strong>
              <ul className="list-disc list-inside">
                {cashFlowWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {cashFlowResult && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-2xl font-semibold ${headingColor}`}>
                  Statement of Cash Flows (Direct Method)
                </h3>
                <button
                  onClick={downloadCashFlowStatementCSV}
                  className={`${buttonBg} px-6 py-2 text-sm`}
                >
                  Download CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Section</th>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right text-sm font-semibold ${headingColor}`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatCashFlowStatementOutput(cashFlowResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} ${row.isTotal ? (darkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                      >
                        <td className={`py-3 px-4 text-sm ${row.section.includes('ACTIVITIES') || row.section === 'SUMMARY' ? 'font-bold' : ''} ${headingColor}`}>{row.section.includes('ACTIVITIES') || row.section === 'SUMMARY' ? row.section : ''}</td>
                        <td className={`py-3 px-4 text-sm ${row.isSubtotal || row.isTotal ? 'font-semibold' : ''} ${headingColor}`}>{row.label}</td>
                        <td className={`py-3 px-4 text-sm text-right ${row.isSubtotal || row.isTotal ? 'font-semibold' : ''}`}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Indirect Method Reconciliation */}
              <h3 className={`text-xl font-semibold mt-8 mb-4 ${headingColor}`}>
                Indirect Method Reconciliation
              </h3>
              <div className="overflow-x-auto">
                <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right text-sm font-semibold ${headingColor}`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatIndirectMethodReconciliation(cashFlowResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} ${row.isSubtotal ? (darkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                      >
                        <td className={`py-3 px-4 text-sm ${row.isSubtotal ? 'font-semibold' : ''} ${headingColor}`}>{row.label}</td>
                        <td className={`py-3 px-4 text-sm text-right ${row.isSubtotal ? 'font-semibold' : ''}`}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quality Metrics */}
              <h3 className={`text-xl font-semibold mt-8 mb-4 ${headingColor}`}>
                Cash Flow Quality Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Metric</th>
                      <th className={`py-3 px-4 text-right text-sm font-semibold ${headingColor}`}>Value</th>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatQualityMetrics(cashFlowResult).map((metric, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{metric.label}</td>
                        <td className={`py-3 px-4 text-sm text-right font-medium`}>{metric.value}</td>
                        <td className={`py-3 px-4 text-sm ${metric.interpretation.includes('Good') || metric.interpretation.includes('Positive') || metric.interpretation.includes('Sustainable') || metric.interpretation.includes('Low') || metric.interpretation.includes('Self') ? 'text-green-600' : 'text-yellow-600'}`}>{metric.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-lg leading-relaxed">
                ✓ Cash Flow Statement calculated successfully
              </p>

              {/* Charts for Cash Flow Statement */}
              {showCharts && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>Cash Flow Visualization</h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Hide Charts
                    </button>
                  </div>
                  <div className="grid md:grid-cols-1 gap-6">
                    <CashFlowActivitiesChart
                      operating={cashFlowResult.netCashFromOperating}
                      investing={cashFlowResult.netCashFromInvesting}
                      financing={cashFlowResult.netCashFromFinancing}
                      darkMode={darkMode}
                      height={300}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Cash Flow Statement
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Budgeted Statement of Cash Flows reconciles net income to operating cash flow and shows the complete picture of cash movements. It uses the direct method for clarity, with reconciliation to the indirect method for comparison.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Key Sections:</strong> Operating Activities (cash from business operations), Investing Activities (capital expenditures and asset sales), Financing Activities (debt and equity transactions). Quality metrics help assess cash flow sustainability.
        </p>

        {/* ============================================ */}
        {/* SCHEDULE 13: BUDGETED BALANCE SHEET          */}
        {/* ============================================ */}

        <div id="schedule13" className="mt-16">
          <h2 className={`text-3xl font-bold mb-6 ${headingColor}`}>
            Schedule 13: Budgeted Balance Sheet
          </h2>

          <p className="text-lg mb-6 leading-relaxed">
            Project your company's financial position (assets, liabilities, equity) at the end of the budget period. Enter beginning balances from your prior period balance sheet.
          </p>

          {/* Beginning Assets */}
          <h3 className={`text-xl font-semibold mb-4 ${headingColor}`}>Beginning Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Cash</label>
              <input type="number" value={bsBeginningCash} onChange={(e) => setBsBeginningCash(e.target.value)} placeholder="e.g., 35000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Accounts Receivable</label>
              <input type="number" value={bsBeginningAR} onChange={(e) => setBsBeginningAR(e.target.value)} placeholder="e.g., 50000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Raw Material Inventory</label>
              <input type="number" value={bsBeginningRawMaterial} onChange={(e) => setBsBeginningRawMaterial(e.target.value)} placeholder="e.g., 20000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>WIP Inventory</label>
              <input type="number" value={bsBeginningWIP} onChange={(e) => setBsBeginningWIP(e.target.value)} placeholder="e.g., 10000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Finished Goods Inventory</label>
              <input type="number" value={bsBeginningFG} onChange={(e) => setBsBeginningFG(e.target.value)} placeholder="e.g., 30000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Other Current Assets</label>
              <input type="number" value={bsBeginningOtherCurrentAssets} onChange={(e) => setBsBeginningOtherCurrentAssets(e.target.value)} placeholder="e.g., 5000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Fixed Assets (PP&E)</label>
              <input type="number" value={bsBeginningFixedAssets} onChange={(e) => setBsBeginningFixedAssets(e.target.value)} placeholder="e.g., 300000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Accumulated Depreciation</label>
              <input type="number" value={bsBeginningAccumDepr} onChange={(e) => setBsBeginningAccumDepr(e.target.value)} placeholder="e.g., 100000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Other Assets</label>
              <input type="number" value={bsBeginningOtherAssets} onChange={(e) => setBsBeginningOtherAssets(e.target.value)} placeholder="e.g., 10000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
          </div>

          {/* Beginning Liabilities */}
          <h3 className={`text-xl font-semibold mb-4 ${headingColor}`}>Beginning Liabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Accounts Payable</label>
              <input type="number" value={bsBeginningAP} onChange={(e) => setBsBeginningAP(e.target.value)} placeholder="e.g., 40000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Wages Payable</label>
              <input type="number" value={bsBeginningWagesPayable} onChange={(e) => setBsBeginningWagesPayable(e.target.value)} placeholder="e.g., 10000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Taxes Payable</label>
              <input type="number" value={bsBeginningTaxesPayable} onChange={(e) => setBsBeginningTaxesPayable(e.target.value)} placeholder="e.g., 15000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Other Accrued Expenses</label>
              <input type="number" value={bsBeginningOtherAccrued} onChange={(e) => setBsBeginningOtherAccrued(e.target.value)} placeholder="e.g., 5000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Short-term Debt</label>
              <input type="number" value={bsBeginningShortTermDebt} onChange={(e) => setBsBeginningShortTermDebt(e.target.value)} placeholder="e.g., 15000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Long-term Debt</label>
              <input type="number" value={bsBeginningLongTermDebt} onChange={(e) => setBsBeginningLongTermDebt(e.target.value)} placeholder="e.g., 100000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
          </div>

          {/* Beginning Equity */}
          <h3 className={`text-xl font-semibold mb-4 ${headingColor}`}>Beginning Equity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Common Stock</label>
              <input type="number" value={bsBeginningCommonStock} onChange={(e) => setBsBeginningCommonStock(e.target.value)} placeholder="e.g., 150000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Retained Earnings</label>
              <input type="number" value={bsBeginningRetainedEarnings} onChange={(e) => setBsBeginningRetainedEarnings(e.target.value)} placeholder="e.g., 75000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
          </div>

          {/* Period Activity */}
          <h3 className={`text-xl font-semibold mb-4 ${headingColor}`}>Period Activity (Optional Adjustments)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>New Long-term Borrowing</label>
              <input type="number" value={bsNewLongTermBorrowing} onChange={(e) => setBsNewLongTermBorrowing(e.target.value)} placeholder="e.g., 20000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Long-term Debt Repayment</label>
              <input type="number" value={bsLongTermDebtRepayment} onChange={(e) => setBsLongTermDebtRepayment(e.target.value)} placeholder="e.g., 10000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textColor}`}>Stock Issued</label>
              <input type="number" value={bsStockIssued} onChange={(e) => setBsStockIssued(e.target.value)} placeholder="e.g., 10000" className={`w-full px-4 py-2 border ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
            </div>
          </div>

          <button
            onClick={handleCalculateBalanceSheet}
            className={`${buttonBg} font-medium px-8 py-3 text-lg mb-6`}
          >
            Calculate Balance Sheet
          </button>

          {balanceSheetErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
              <strong>Errors:</strong>
              <ul className="list-disc list-inside">
                {balanceSheetErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {balanceSheetWarnings.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-6">
              <strong>Warnings:</strong>
              <ul className="list-disc list-inside">
                {balanceSheetWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {balanceSheetResult && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-2xl font-semibold ${headingColor}`}>
                  Budgeted Balance Sheet
                </h3>
                <button
                  onClick={downloadBalanceSheetCSV}
                  className={`${buttonBg} px-6 py-2 text-sm`}
                >
                  Download CSV
                </button>
              </div>

              {/* Balance Check */}
              <div className={`p-4 rounded ${balanceSheetResult.isBalanced ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                <p className={`font-medium ${balanceSheetResult.isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                  {balanceSheetResult.isBalanced
                    ? '✓ Balance Sheet is balanced (Assets = Liabilities + Equity)'
                    : `✗ Balance Sheet does not balance. Difference: $${balanceSheetResult.balanceDifference.toFixed(2)}`}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Section</th>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Item</th>
                      <th className={`py-3 px-4 text-right text-sm font-semibold ${headingColor}`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatBalanceSheetOutput(balanceSheetResult).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} ${row.isTotal ? (darkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                      >
                        <td className={`py-3 px-4 text-sm ${row.section.includes('ASSETS') || row.section.includes('LIABILITIES') || row.section.includes('EQUITY') ? 'font-bold' : ''} ${headingColor}`}>{row.section.includes('ASSETS') || row.section.includes('LIABILITIES') || row.section.includes('EQUITY') ? row.section : ''}</td>
                        <td className={`py-3 px-4 text-sm ${row.isSubtotal || row.isTotal ? 'font-semibold' : ''} ${headingColor}`}>{row.label}</td>
                        <td className={`py-3 px-4 text-sm text-right ${row.isSubtotal || row.isTotal ? 'font-semibold' : ''}`}>{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Ratios */}
              <h3 className={`text-xl font-semibold mt-8 mb-4 ${headingColor}`}>
                Financial Ratios
              </h3>
              <div className="overflow-x-auto">
                <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                    <tr>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Category</th>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Ratio</th>
                      <th className={`py-3 px-4 text-right text-sm font-semibold ${headingColor}`}>Value</th>
                      <th className={`py-3 px-4 text-left text-sm font-semibold ${headingColor}`}>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatFinancialRatios(balanceSheetResult).map((ratio, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`py-3 px-4 text-sm font-medium ${headingColor}`}>{ratio.category}</td>
                        <td className={`py-3 px-4 text-sm ${headingColor}`}>{ratio.label}</td>
                        <td className={`py-3 px-4 text-sm text-right font-medium`}>{ratio.value}</td>
                        <td className={`py-3 px-4 text-sm ${ratio.interpretation.includes('Strong') || ratio.interpretation.includes('Good') || ratio.interpretation.includes('Excellent') || ratio.interpretation.includes('Positive') || ratio.interpretation.includes('Conservative') || ratio.interpretation.includes('Low debt') || ratio.interpretation.includes('Efficient') ? 'text-green-600' : 'text-yellow-600'}`}>{ratio.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-lg leading-relaxed">
                ✓ Balance Sheet calculated successfully
              </p>

              {/* Charts for Balance Sheet */}
              {showCharts && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${headingColor}`}>Balance Sheet Visualization</h4>
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                    >
                      Hide Charts
                    </button>
                  </div>
                  <div className="grid md:grid-cols-1 gap-6">
                    <BalanceSheetChart
                      assets={{
                        current: balanceSheetResult.totalCurrentAssets,
                        fixed: balanceSheetResult.netFixedAssets,
                        other: balanceSheetResult.otherAssets,
                      }}
                      liabilities={{
                        current: balanceSheetResult.totalCurrentLiabilities,
                        longTerm: balanceSheetResult.longTermDebt,
                      }}
                      equity={balanceSheetResult.totalEquity}
                      darkMode={darkMode}
                      height={350}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          About the Balance Sheet
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          The Budgeted Balance Sheet projects your company's financial position at the end of the budget period. It combines data from all previous schedules to show assets, liabilities, and stockholders' equity, with the fundamental equation: Assets = Liabilities + Equity.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Key Ratios:</strong> Current Ratio (liquidity), Quick Ratio (immediate liquidity), Debt-to-Equity (leverage), Return on Assets (asset efficiency), Return on Equity (owner returns), Asset Turnover (sales efficiency).
        </p>

        <hr className={`my-12 ${hrColor}`} />

        <h3 className={`text-2xl font-semibold mb-4 ${headingColor}`}>
          Master Budget Complete
        </h3>
        <p className="text-lg mb-4 leading-relaxed">
          Congratulations! You have completed all 13 schedules of the comprehensive master budget. Your budget now includes sales forecasts, production plans, cost projections, cash flow analysis, profitability projections, and a complete financial position statement.
        </p>
      </main>

      <footer className={`max-w-5xl mx-auto px-6 py-12 border-t ${hrColor} text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
        <p className="mt-2">© 2025 Budget Automation System</p>
      </footer>
    </div>
  );
}

