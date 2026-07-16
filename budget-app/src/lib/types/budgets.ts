/**
 * Type definitions for Budget Automation System
 * Based on Ronald W. Hilton's 13-Schedule Master Budget Framework
 */

// ============================================================================
// QUARTERLY DATA STRUCTURE
// ============================================================================

export interface QuarterlyData {
  q1: number;  // Quarter 1 (Oct-Dec)
  q2: number;  // Quarter 2 (Jan-Mar)
  q3: number;  // Quarter 3 (Apr-Jun)
  q4: number;  // Quarter 4 (Jul-Sep)
  yearly: number;  // Total for the year
}

// ============================================================================
// COMPANY INFORMATION
// ============================================================================

export interface CompanyInfo {
  name: string;
  industry: string;  // e.g., "Sugar Manufacturing", "Textile", "Food Processing"
  productName: string;  // e.g., "Sugar", "Fabric", "Flour"
  fiscalYearStart: string;  // e.g., "2024-10-01"
  currency: string;  // e.g., "PKR", "USD"
}

// ============================================================================
// 1. SALES BUDGET INPUTS
// ============================================================================

export interface SalesBudgetInputs {
  // Historical sales data (optional - for reference)
  historicalSalesUnits?: QuarterlyData;

  // Forecasted sales for budget year
  forecastedSalesUnits: QuarterlyData;  // In metric tons, units, etc.

  // Pricing information
  sellingPricePerUnit: number;  // Base selling price
  priceInflationRate?: number;  // Expected price increase (e.g., 0.05 for 5%)

  // Growth assumptions
  salesGrowthRate?: number;  // Expected sales volume growth

  // Cash vs Credit Sales (for Cash Receipts Budget - Schedule 8)
  cashSalesPercentage?: number;  // % of sales collected as cash (e.g., 0.40 for 40%)
  creditSalesPercentage?: number;  // % of sales on account (e.g., 0.60 for 60%)
}

// ============================================================================
// 2. PRODUCTION BUDGET INPUTS
// ============================================================================

export interface ProductionBudgetInputs {
  // Sales forecast (from Schedule 1)
  forecastedSalesUnits: QuarterlyData;

  // Inventory policy
  beginningInventory: number;  // Opening inventory (metric tons)
  desiredEndingInventoryRatio: number;  // e.g., 0.10 for 10% of next quarter's sales

  // For Q4, ending inventory for next year's Q1
  nextYearQ1ForecastedSales?: number;

  // Production capacity constraints (optional)
  maxProductionCapacityPerQuarter?: number;

  // Batch size requirements (optional)
  minimumBatchSize?: number;
  optimalBatchSize?: number;

  // Lead time adjustments (optional)
  productionLeadTimeDays?: number;

  // Inventory cost analysis (optional)
  inventoryCarryingCostPerUnit?: number;  // Cost to hold one unit for one quarter

  // Just-in-Time (JIT) settings (optional)
  useJIT?: boolean;  // If true, production = sales with minimal inventory

  // Obsolescence risk (optional)
  productShelfLifeDays?: number;
  obsolescenceRiskPercentage?: number;  // % of inventory expected to become obsolete
}

// ============================================================================
// 3. DIRECT MATERIAL BUDGET INPUTS
// ============================================================================

export interface MaterialType {
  name: string;  // e.g., "Tent Fabric", "Tent Poles"
  requiredPerUnit: number;  // Quantity per finished product
  costPerUnit: number;  // Purchase price per unit
  beginningInventory: number;  // Opening inventory balance
  desiredEndingInventoryRatio: number;  // % of next quarter's production needs
  unit: string;  // e.g., "yards", "kits", "pounds"

  // Optional enhancements
  scrapWastePercentage?: number;  // % of material lost to waste (e.g., 0.05 for 5%)
  supplierLeadTimeDays?: number;  // Days from order to delivery
  useJIT?: boolean;  // Just-in-Time delivery (no ending inventory needed)
  priceInflationRate?: number;  // Expected price increase per quarter
  bulkDiscountThreshold?: number;  // Quantity for discount
  bulkDiscountRate?: number;  // Discount % if threshold met
}

export interface DirectMaterialBudgetInputs {
  // Production requirements (from Schedule 2)
  unitsToBeProduced: QuarterlyData;
  nextYearQ1Production?: number;  // For Q4 ending inventory calculation

  // Material types
  materials: MaterialType[];  // Can have multiple materials (fabric, poles, etc.)

  // Optional: Overall payment terms (for cash disbursements)
  percentPaidInCurrentQuarter?: number;  // e.g., 0.60 for 60% paid in same quarter
  percentPaidInNextQuarter?: number;  // e.g., 0.40 for 40% paid next quarter

  // Optional: Vendor performance tracking
  trackVendorMetrics?: boolean;
  targetOnTimeDeliveryRate?: number;  // e.g., 0.95 for 95%
  targetQualityRate?: number;  // e.g., 0.98 for 98% defect-free
}

// ============================================================================
// 4. DIRECT LABOUR BUDGET INPUTS
// ============================================================================

export interface LaborCategory {
  name: string;  // e.g., "Assembly", "Finishing", "Quality Control"
  hoursPerUnit: number;  // Hours needed per unit for this category
  wageRatePerHour: number;  // Wage rate for this category
  includesFringeBenefits?: boolean;  // If rate already includes benefits
}

export interface DirectLabourBudgetInputs {
  // Production requirements (from Schedule 2)
  unitsToBeProduced: QuarterlyData;

  // Simple single-category approach
  directLaborHoursPerUnit?: number;  // Total hours per unit (all categories combined)
  hourlyWageRate?: number;  // Average wage rate per hour

  // Advanced multi-category approach
  laborCategories?: LaborCategory[];  // Multiple labor types with different rates

  // Optional enhancements
  wageInflationRate?: number;  // Quarterly wage increase (e.g., 0.01 for 1%)
  overtimeThreshold?: number;  // Hours per quarter before overtime kicks in
  overtimeMultiplier?: number;  // e.g., 1.5 for time-and-a-half

  fringeBenefitRate?: number;  // % of wages (e.g., 0.25 for 25% for health, FICA, etc.)
  productivityEfficiencyRate?: number;  // % efficiency (e.g., 0.95 for 95% efficiency)

  turnoverRate?: number;  // Annual turnover rate (e.g., 0.15 for 15%)
  trainingCostPerEmployee?: number;  // Cost to train new employees
  averageHoursPerEmployee?: number;  // For workforce planning
}

// ============================================================================
// 5. MANUFACTURING OVERHEAD BUDGET INPUTS
// ============================================================================

export interface OverheadCostCategory {
  name: string;  // e.g., "Utilities", "Maintenance", "Quality Control"
  costType: 'variable' | 'fixed';  // Variable or fixed cost
  amount: number;  // Cost amount (per unit for variable, per quarter for fixed)
  costDriver?: 'units' | 'labor-hours' | 'machine-hours';  // For variable costs
  isNonCash?: boolean;  // For depreciation, amortization
}

export interface ManufacturingOverheadInputs {
  // Production requirements (from Schedule 2)
  unitsToBeProduced: QuarterlyData;

  // Labor hours (from Schedule 4) - for overhead allocation
  directLaborHours?: QuarterlyData;

  // Simple approach - single variable and fixed rates
  variableOverheadRatePerUnit?: number;  // Variable OH per unit produced
  variableOverheadRatePerLaborHour?: number;  // Variable OH per DL hour
  fixedOverheadPerQuarter?: number;  // Fixed OH per quarter
  depreciationPerQuarter?: number;  // Non-cash depreciation

  // Advanced approach - detailed cost categories
  overheadCategories?: OverheadCostCategory[];  // Detailed breakdown by cost type

  // Activity-Based Costing (ABC) approach
  useActivityBasedCosting?: boolean;
  numberOfProductionRuns?: QuarterlyData;  // Batch-level costs
  costPerProductionRun?: number;  // Setup costs per batch
  numberOfInspections?: QuarterlyData;  // Quality control inspections
  costPerInspection?: number;  // Cost per inspection
  machineHours?: QuarterlyData;  // For machine-hour based allocation
  costPerMachineHour?: number;  // Variable cost per machine hour

  // Facility-level costs (quarterly)
  facilityRent?: number;
  facilityInsurance?: number;
  propertyTaxes?: number;
  utilities?: number;  // Can be variable or fixed
  utilitiesIsVariable?: boolean;  // If true, allocate based on production

  // Supervisory and support labor (indirect labor)
  supervisorySalaries?: number;  // Per quarter
  supportStaffSalaries?: number;  // Per quarter

  // Supplies and indirect materials
  indirectMaterialsPerUnit?: number;  // Consumables per unit
  shopSuppliesPerQuarter?: number;  // Fixed supplies

  // Maintenance
  plannedMaintenancePerQuarter?: number;  // Scheduled maintenance
  maintenancePerMachineHour?: number;  // Variable maintenance

  // Quality control
  qualityControlPerUnit?: number;  // Inspection per unit
  qualityControlLabor?: number;  // Fixed QC labor per quarter

  // Other overhead items
  technologyCosts?: number;  // Software, IT per quarter
  warehouseCosts?: number;  // Storage, handling per quarter
  environmentalComplianceCosts?: number;  // Permits, testing per quarter

  // Overhead allocation method
  allocationBase?: 'units' | 'labor-hours' | 'machine-hours';  // For predetermined rate
}

// ============================================================================
// 6. SELLING & ADMINISTRATIVE EXPENSE BUDGET INPUTS
// ============================================================================

export interface SalesPersonnelCategory {
  name: string;  // e.g., "Field Sales", "Inside Sales", "Account Managers"
  numberOfPersonnel: number;
  baseSalaryPerPerson: number;  // Quarterly salary
  benefitRate?: number;  // % of salary for benefits
  commissionRate?: number;  // % of sales or per-unit commission
  commissionType?: 'revenue' | 'units';  // Commission based on revenue or units sold
}

export interface DistributionChannel {
  name: string;  // e.g., "Direct", "Retail", "Online", "Wholesale"
  variableCostPerUnit?: number;  // Shipping, handling per unit
  fixedCostPerQuarter?: number;  // Channel maintenance costs
  percentOfSales?: number;  // % of total sales through this channel
}

export interface DepartmentBudget {
  name: string;  // e.g., "Sales", "Marketing", "IT", "HR", "Finance"
  salaries: number;  // Quarterly salaries
  supplies: number;  // Office supplies, materials
  otherCosts: number;  // Department-specific costs
}

export interface SellingAdminExpenseInputs {
  // Sales data (from Schedule 1)
  salesRevenue?: QuarterlyData;  // Total sales revenue
  salesUnits?: QuarterlyData;  // Units sold

  // SALES EXPENSES
  // Sales personnel (detailed breakdown)
  salesPersonnelCategories?: SalesPersonnelCategory[];

  // Simple commission approach (if not using personnel categories)
  commissionRate?: number;  // % of revenue (e.g., 0.05 for 5%)
  commissionPerUnit?: number;  // Fixed amount per unit sold

  // Distribution channels
  distributionChannels?: DistributionChannel[];

  // Simple distribution approach
  distributionCostPerUnit?: number;  // Variable cost per unit
  distributionFixedCostPerQuarter?: number;  // Fixed distribution costs

  // Customer service
  customerServiceSalaries?: number;  // Per quarter
  warrantyExpensePerUnit?: number;  // Variable warranty cost
  returnProcessingPerUnit?: number;  // Cost to process returns

  // MARKETING EXPENSES
  advertisingBudgetPerQuarter?: number;  // Media, digital ads
  brandDevelopmentPerQuarter?: number;  // Brand building, PR
  marketingCampaignsPerQuarter?: number;  // Specific campaigns
  marketResearchPerQuarter?: number;  // Customer research, surveys
  tradeshowsEventsPerQuarter?: number;  // Trade shows, events
  contentCreationPerQuarter?: number;  // Content marketing, social media

  // Customer acquisition
  customerAcquisitionCostPerCustomer?: number;  // Cost to gain new customer
  newCustomersPerQuarter?: QuarterlyData;  // Number of new customers

  // ADMINISTRATIVE EXPENSES
  // Fixed administrative salaries
  executiveSalaries?: number;  // Per quarter (CEO, CFO, etc.)
  financeSalaries?: number;  // Accounting, finance team
  hrSalaries?: number;  // Human resources team
  itSalaries?: number;  // IT and systems team
  legalComplianceSalaries?: number;  // Legal, compliance staff
  generalAdminSalaries?: number;  // Reception, admin support

  // Department budgets (alternative to individual salaries)
  departmentBudgets?: DepartmentBudget[];

  // Occupancy costs
  officeRentPerQuarter?: number;  // Office space rental
  warehouseRentPerQuarter?: number;  // Warehouse/storage rental
  utilitiesPerQuarter?: number;  // Power, water, gas
  buildingInsurancePerQuarter?: number;  // Property insurance
  propertyTaxesPerQuarter?: number;  // Real estate taxes
  maintenancePerQuarter?: number;  // Building maintenance

  // Technology costs
  softwareLicensesPerQuarter?: number;  // SaaS, enterprise software
  cloudServicesPerQuarter?: number;  // AWS, Azure, cloud hosting
  telecommunicationsPerQuarter?: number;  // Phone, internet, video conferencing
  itSupportPerQuarter?: number;  // IT maintenance, support

  // Office operations
  officeSuppliesPerQuarter?: number;  // General supplies
  postageShippingPerQuarter?: number;  // Mail, packages
  printingPerQuarter?: number;  // Printing, copying

  // Professional services
  legalFeesPerQuarter?: number;  // Legal counsel
  auditFeesPerQuarter?: number;  // External audit
  consultingFeesPerQuarter?: number;  // Business consultants

  // Professional development
  trainingPerQuarter?: number;  // Employee training
  certificationPerQuarter?: number;  // Professional certifications
  conferencesPerQuarter?: number;  // Industry conferences

  // Travel and entertainment
  salesTravelPerQuarter?: number;  // Sales travel
  executiveTravelPerQuarter?: number;  // Executive travel
  mealsEntertainmentPerQuarter?: number;  // Client entertainment

  // Regulatory and compliance
  licensesPermitsPerQuarter?: number;  // Business licenses
  complianceCostsPerQuarter?: number;  // Regulatory compliance
  insuranceGeneralPerQuarter?: number;  // General liability, D&O

  // Bad debt
  badDebtRate?: number;  // % of sales (e.g., 0.02 for 2%)

  // Depreciation (non-cash)
  depreciationOfficeEquipment?: number;  // Per quarter
  depreciationFurnitureFixtures?: number;  // Per quarter

  // Optional: Simple approach toggle
  useSimpleApproach?: boolean;  // If true, use basic variable/fixed rates
  variableSellingExpenseRate?: number;  // % of sales (simple approach)
  variableAdminExpenseRate?: number;  // % of sales (simple approach)
  fixedSellingExpensePerQuarter?: number;  // Simple approach
  fixedAdminExpensePerQuarter?: number;  // Simple approach
}

// ============================================================================
// 7. CASH RECEIPTS BUDGET INPUTS
// ============================================================================

export interface CashReceiptsInputs {
  // Collection policy
  percentCollectedInSameQuarter: number;  // e.g., 0.70 for 70%
  percentCollectedInNextQuarter: number;  // e.g., 0.28 for 28%
  percentUncollectible?: number;  // e.g., 0.02 for 2% bad debt

  // Beginning accounts receivable
  beginningAccountsReceivable: number;
}

// ============================================================================
// 8. CASH DISBURSEMENT BUDGET INPUTS
// ============================================================================

export interface CashDisbursementInputs {
  // Payment timing for materials
  percentMaterialPaidSameQuarter?: number;
  percentMaterialPaidNextQuarter?: number;
  beginningAccountsPayable?: number;

  // Additional cash expenses
  incomeTaxPayments?: QuarterlyData;
  dividendPayments?: QuarterlyData;
  capitalExpenditures?: QuarterlyData;
  loanPayments?: QuarterlyData;
}

// ============================================================================
// 9. CASH BUDGET INPUTS
// ============================================================================

export interface CashBudgetInputs {
  // Beginning cash balance
  beginningCashBalance: number;

  // Cash policy
  minimumCashBalance: number;  // Desired minimum cash

  // Financing
  interestRateOnBorrowing?: number;  // e.g., 0.08 for 8% annual
  interestRateOnInvestments?: number;
}

// ============================================================================
// COMPREHENSIVE BUDGET INPUTS (All together)
// ============================================================================

export interface ComprehensiveBudgetInputs {
  company: CompanyInfo;
  salesBudget: SalesBudgetInputs;
  productionBudget: ProductionBudgetInputs;
  directMaterial: DirectMaterialBudgetInputs;
  directLabour: DirectLabourBudgetInputs;
  manufacturingOverhead: ManufacturingOverheadInputs;
  sellingAdmin: SellingAdminExpenseInputs;
  cashReceipts: CashReceiptsInputs;
  cashDisbursement: CashDisbursementInputs;
  cashBudget: CashBudgetInputs;
  balanceSheet: BalanceSheetInputs;
}

// ============================================================================
// OUTPUT TYPES FOR EACH SCHEDULE
// ============================================================================

export interface SalesBudgetOutput {
  salesUnits: QuarterlyData;
  sellingPrice: QuarterlyData;  // Can vary by quarter if inflation applied
  salesRevenue: QuarterlyData;
  cashSales?: QuarterlyData;  // Cash portion of sales revenue
  creditSales?: QuarterlyData;  // Credit portion of sales revenue
}

export interface ProductionBudgetOutput {
  salesUnits: QuarterlyData;
  desiredEndingInventory: QuarterlyData;
  totalUnitsRequired: QuarterlyData;
  beginningInventory: QuarterlyData;
  requiredProduction: QuarterlyData;

  // Enhanced analytics (optional)
  capacityUtilization?: QuarterlyData;  // % of max capacity used
  inventoryCarryingCost?: QuarterlyData;  // Cost to hold inventory
  batchAdjustments?: QuarterlyData;  // Production adjusted for batch sizes
  obsolescenceCost?: QuarterlyData;  // Expected cost from obsolescence
  productionEfficiency?: QuarterlyData;  // Ratio of optimal production
}

export interface MaterialBudgetDetail {
  name: string;
  unit: string;
  productionNeeds: QuarterlyData;  // Units to be produced
  materialRequiredForProduction: QuarterlyData;  // Material needed for production
  desiredEndingInventory: QuarterlyData;  // Target ending inventory
  totalMaterialRequired: QuarterlyData;  // Production needs + ending inventory
  beginningInventory: QuarterlyData;  // Opening inventory
  materialToBePurchased: QuarterlyData;  // Units to purchase
  costPerUnit: QuarterlyData;  // Unit cost (can vary with inflation/discounts)
  totalPurchaseCost: QuarterlyData;  // Total cost of purchases

  // Optional analytics
  scrapWasteCost?: QuarterlyData;
  bulkDiscountSavings?: QuarterlyData;
  inventoryTurnoverRatio?: number;  // Annual turnover
  daysInventoryOutstanding?: number;  // Average days of inventory
}

export interface DirectMaterialBudgetOutput {
  materials: MaterialBudgetDetail[];  // Detailed breakdown by material type
  totalMaterialPurchaseCost: QuarterlyData;  // Sum of all materials
  cashDisbursements?: QuarterlyData;  // Payment schedule

  // Optional analytics
  totalScrapWasteCost?: QuarterlyData;
  totalBulkDiscountSavings?: QuarterlyData;
  overallInventoryTurnover?: number;
  criticalMaterials?: string[];  // Materials at risk of shortage
}

export interface LaborCategoryDetail {
  name: string;
  hoursRequired: QuarterlyData;
  wageRate: QuarterlyData;
  laborCost: QuarterlyData;
  regularHours?: QuarterlyData;
  overtimeHours?: QuarterlyData;
  overtimeCost?: QuarterlyData;
}

export interface DirectLabourBudgetOutput {
  productionUnits: QuarterlyData;
  totalLaborHoursRequired: QuarterlyData;
  averageLaborRate: QuarterlyData;
  totalLaborCost: QuarterlyData;

  // Multiple categories (if applicable)
  laborCategories?: LaborCategoryDetail[];

  // Optional enhancements
  regularHours?: QuarterlyData;
  overtimeHours?: QuarterlyData;
  overtimeCost?: QuarterlyData;
  fringeBenefitCost?: QuarterlyData;
  totalCostIncludingBenefits?: QuarterlyData;

  // Workforce planning
  averageEmployeesNeeded?: QuarterlyData;
  turnoverCost?: QuarterlyData;
  trainingCost?: QuarterlyData;

  // Efficiency metrics
  laborCostPerUnit?: QuarterlyData;
  productivityRate?: QuarterlyData;
  laborCapacityUtilization?: QuarterlyData;
}

export interface OverheadCategoryDetail {
  name: string;
  costType: 'variable' | 'fixed';
  cost: QuarterlyData;
  costDriver?: string;
  isNonCash?: boolean;
}

export interface ManufacturingOverheadOutput {
  // Production base
  productionUnits: QuarterlyData;
  directLaborHours?: QuarterlyData;

  // Basic overhead breakdown
  variableOverhead: QuarterlyData;
  fixedOverhead: QuarterlyData;
  totalOverhead: QuarterlyData;
  depreciation: QuarterlyData;
  cashDisbursements: QuarterlyData;  // Total OH minus non-cash items

  // Detailed category breakdown (if using categories)
  overheadCategories?: OverheadCategoryDetail[];

  // Activity-Based Costing (ABC) breakdown
  unitLevelCosts?: QuarterlyData;  // Costs that vary with units
  batchLevelCosts?: QuarterlyData;  // Setup and production run costs
  productLevelCosts?: QuarterlyData;  // Product-sustaining costs
  facilityLevelCosts?: QuarterlyData;  // Facility and capacity costs

  // Predetermined overhead rate (for absorption costing)
  predeterminedOverheadRate?: number;  // Rate per cost driver unit
  appliedOverhead?: QuarterlyData;  // Overhead applied to production
  overheadVariance?: QuarterlyData;  // Under/over applied

  // Cost breakdowns
  indirectLaborCost?: QuarterlyData;  // Supervisory and support
  indirectMaterialsCost?: QuarterlyData;  // Supplies and consumables
  facilityCosts?: QuarterlyData;  // Rent, insurance, taxes
  utilitiesCost?: QuarterlyData;  // Power, water, gas
  maintenanceCost?: QuarterlyData;  // Equipment maintenance
  qualityControlCost?: QuarterlyData;  // Inspection and testing

  // Unit cost metrics
  overheadPerUnit?: QuarterlyData;  // Total overhead ÷ units
  variableOverheadPerUnit?: QuarterlyData;  // Variable portion per unit
  fixedOverheadPerUnit?: QuarterlyData;  // Fixed portion per unit

  // Capacity analysis
  budgetedCapacity?: number;  // Planned production capacity
  actualCapacity?: QuarterlyData;  // Actual production
  capacityUtilization?: QuarterlyData;  // Actual ÷ Budgeted (%)
  idleCapacityCost?: QuarterlyData;  // Cost of unused capacity

  // Absorption metrics
  overAbsorbed?: QuarterlyData;  // When applied > actual
  underAbsorbed?: QuarterlyData;  // When applied < actual
}

export interface SalesPersonnelDetail {
  name: string;
  numberOfPersonnel: number;
  baseSalaries: QuarterlyData;
  benefits: QuarterlyData;
  commissions: QuarterlyData;
  totalCost: QuarterlyData;
}

export interface DistributionChannelDetail {
  name: string;
  variableCosts: QuarterlyData;
  fixedCosts: QuarterlyData;
  totalCost: QuarterlyData;
}

export interface DepartmentBudgetDetail {
  name: string;
  salaries: QuarterlyData;
  supplies: QuarterlyData;
  otherCosts: QuarterlyData;
  totalCost: QuarterlyData;
}

export interface SellingAdminExpenseOutput {
  // Sales data reference
  salesRevenue?: QuarterlyData;
  salesUnits?: QuarterlyData;

  // SELLING EXPENSES BREAKDOWN
  salesPersonnelCosts?: SalesPersonnelDetail[];  // Detailed personnel breakdown
  salesCommissions?: QuarterlyData;  // Total commissions
  salesSalariesAndBenefits?: QuarterlyData;  // Total salaries + benefits
  totalSalesPersonnelCosts?: QuarterlyData;  // Combined personnel costs

  distributionChannelCosts?: DistributionChannelDetail[];  // By channel
  distributionVariableCosts?: QuarterlyData;  // Total variable distribution
  distributionFixedCosts?: QuarterlyData;  // Total fixed distribution
  totalDistributionCosts?: QuarterlyData;  // Combined distribution

  customerServiceCosts?: QuarterlyData;  // Service, warranty, returns
  customerAcquisitionCosts?: QuarterlyData;  // New customer acquisition

  totalVariableSellingExpenses?: QuarterlyData;  // All variable selling
  totalFixedSellingExpenses?: QuarterlyData;  // All fixed selling
  totalSellingExpenses?: QuarterlyData;  // Total selling expenses

  // MARKETING EXPENSES BREAKDOWN
  advertisingCosts?: QuarterlyData;
  brandDevelopmentCosts?: QuarterlyData;
  marketingCampaignCosts?: QuarterlyData;
  marketResearchCosts?: QuarterlyData;
  tradeshowsEventsCosts?: QuarterlyData;
  contentCreationCosts?: QuarterlyData;
  totalMarketingExpenses?: QuarterlyData;

  // ADMINISTRATIVE EXPENSES BREAKDOWN
  executiveCosts?: QuarterlyData;  // Executive salaries
  financeCosts?: QuarterlyData;  // Finance department
  hrCosts?: QuarterlyData;  // HR department
  itCosts?: QuarterlyData;  // IT department
  legalComplianceCosts?: QuarterlyData;  // Legal/compliance
  generalAdminCosts?: QuarterlyData;  // General admin

  departmentBudgetCosts?: DepartmentBudgetDetail[];  // Detailed department breakdown
  totalAdministrativeSalaries?: QuarterlyData;

  occupancyCosts?: QuarterlyData;  // Rent, utilities, insurance
  technologyCosts?: QuarterlyData;  // Software, cloud, telecom
  officeOperationsCosts?: QuarterlyData;  // Supplies, postage, printing
  professionalServicesCosts?: QuarterlyData;  // Legal, audit, consulting
  professionalDevelopmentCosts?: QuarterlyData;  // Training, conferences
  travelEntertainmentCosts?: QuarterlyData;  // Travel, meals
  regulatoryComplianceCosts?: QuarterlyData;  // Licenses, compliance, insurance

  badDebtExpense?: QuarterlyData;  // Uncollectible accounts
  depreciationExpense?: QuarterlyData;  // Office equipment depreciation

  totalFixedAdminExpenses?: QuarterlyData;  // All fixed admin
  totalAdministrativeExpenses?: QuarterlyData;  // Total admin expenses

  // OVERALL TOTALS
  totalVariableExpenses: QuarterlyData;  // All variable SG&A
  totalFixedExpenses: QuarterlyData;  // All fixed SG&A
  totalSGAExpenses: QuarterlyData;  // Total SG&A
  cashDisbursementsForSGA?: QuarterlyData;  // Total minus depreciation

  // METRICS AND ANALYTICS
  sgaAsPercentOfSales?: QuarterlyData;  // SG&A ÷ Sales Revenue
  variableSGAPerUnit?: QuarterlyData;  // Variable SG&A ÷ Units
  fixedSGAPerUnit?: QuarterlyData;  // Fixed SG&A ÷ Units
  totalSGAPerUnit?: QuarterlyData;  // Total SG&A ÷ Units

  // Marketing effectiveness
  marketingAsPercentOfSales?: QuarterlyData;  // Marketing ÷ Sales
  costPerNewCustomer?: QuarterlyData;  // If customer acquisition tracked

  // Department efficiency
  salesExpenseRatio?: QuarterlyData;  // Selling expenses ÷ Sales revenue
  adminExpenseRatio?: QuarterlyData;  // Admin expenses ÷ Sales revenue
}

export interface CashReceiptsOutput {
  salesRevenue: QuarterlyData;
  collectionsSameQuarter: QuarterlyData;
  collectionsNextQuarter: QuarterlyData;
  totalCashReceipts: QuarterlyData;
  endingAccountsReceivable: QuarterlyData;
}

export interface CashDisbursementOutput {
  materialPayments: QuarterlyData;
  laborPayments: QuarterlyData;
  overheadPayments: QuarterlyData;
  sgaPayments: QuarterlyData;
  incomeTaxPayments: QuarterlyData;
  dividendPayments: QuarterlyData;
  capitalExpenditures: QuarterlyData;
  loanPayments: QuarterlyData;
  totalDisbursements: QuarterlyData;
  endingAccountsPayable: QuarterlyData;
}

export interface CashBudgetOutput {
  beginningCash: QuarterlyData;
  cashReceipts: QuarterlyData;
  cashAvailable: QuarterlyData;
  cashDisbursements: QuarterlyData;
  excessOrDeficiency: QuarterlyData;
  financing: QuarterlyData;  // Borrowing or repayments
  endingCash: QuarterlyData;
  operatingCashFlow: QuarterlyData;
  freeCashFlow: QuarterlyData;
}

// ============================================================================
// 10. COST OF GOODS MANUFACTURED & SOLD (COGS) INPUTS
// ============================================================================

export interface COGSInputs {
  // Work-in-Process Inventory
  beginningWIPInventory: number;
  endingWIPInventory: number;

  // Finished Goods Inventory
  beginningFinishedGoodsInventory: number;
  endingFinishedGoodsInventory: number;
}

export interface COGSOutput {
  // Manufacturing costs (from Schedules 3, 4, 5)
  directMaterial: number;
  directLabor: number;
  manufacturingOverhead: number;
  totalManufacturingCost: number;

  // Work-in-Process
  beginningWIPInventory: number;
  endingWIPInventory: number;
  costOfGoodsManufactured: number;

  // Finished Goods
  beginningFinishedGoodsInventory: number;
  endingFinishedGoodsInventory: number;
  costOfGoodsAvailableForSale: number;
  costOfGoodsSold: number;

  // Per-unit metrics
  unitsProduced: number;
  unitsSold: number;
  costPerUnitManufactured: number;
  costPerUnitSold: number;
}

// ============================================================================
// 11. BUDGETED INCOME STATEMENT INPUTS & OUTPUT
// ============================================================================

export interface IncomeStatementInputs {
  interestExpense?: number;
  incomeTaxRate?: number; // 0-1 (e.g., 0.25 for 25%)
}

export interface IncomeStatementOutput {
  salesRevenue: number;
  costOfGoodsSold: number;
  grossMargin: number;
  grossMarginPercentage: number;
  sellingAdminExpenses: number;
  operatingIncome: number;
  operatingMarginPercentage: number;
  interestExpense: number;
  netIncomeBeforeTax: number;
  incomeTax: number;
  netIncome: number;
  netProfitMarginPercentage: number;
}

// ============================================================================
// 13. BUDGETED BALANCE SHEET INPUTS & OUTPUT
// ============================================================================

export interface BalanceSheetInputs {
  // Beginning Balances (from prior period balance sheet)
  beginningCash: number;
  beginningAccountsReceivable: number;
  beginningRawMaterialInventory: number;
  beginningWIPInventory: number;
  beginningFinishedGoodsInventory: number;
  beginningOtherCurrentAssets: number;
  beginningFixedAssets: number;
  beginningAccumulatedDepreciation: number;
  beginningOtherAssets: number;

  // Beginning Liabilities
  beginningAccountsPayable: number;
  beginningWagesPayable: number;
  beginningTaxesPayable: number;
  beginningOtherAccruedExpenses: number;
  beginningShortTermDebt: number;
  beginningLongTermDebt: number;

  // Beginning Equity
  beginningCommonStock: number;
  beginningRetainedEarnings: number;

  // Period Activity (if not from other schedules)
  newLongTermBorrowing?: number;
  longTermDebtRepayment?: number;
  stockIssued?: number;
  otherCurrentAssetChange?: number;
  otherAssetChange?: number;
}

export interface BalanceSheetOutput {
  // Current Assets
  cash: number;
  accountsReceivable: number;
  inventoryRawMaterial: number;
  inventoryWIP: number;
  inventoryFinishedGoods: number;
  totalInventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;

  // Fixed Assets
  fixedAssets: number;
  accumulatedDepreciation: number;
  netFixedAssets: number;

  // Other Assets
  otherAssets: number;
  totalAssets: number;

  // Current Liabilities
  accountsPayable: number;
  wagesPayable: number;
  taxesPayable: number;
  otherAccruedExpenses: number;
  shortTermDebt: number;
  totalCurrentLiabilities: number;

  // Long-term Liabilities
  longTermDebt: number;
  totalLiabilities: number;

  // Stockholders' Equity
  commonStock: number;
  beginningRetainedEarnings: number;
  netIncome: number;
  dividendsPaid: number;
  endingRetainedEarnings: number;
  totalEquity: number;

  // Balance Check
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  balanceDifference: number;

  // Financial Ratios
  workingCapital: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquityRatio: number;
  debtToAssetsRatio: number;
  returnOnAssets: number;
  returnOnEquity: number;
  assetTurnover: number;
}

// ============================================================================
// 12. BUDGETED STATEMENT OF CASH FLOWS INPUTS & OUTPUT
// ============================================================================

export interface CashFlowStatementInputs {
  // Beginning balances (from prior period balance sheet)
  beginningCash: number;
  beginningAccountsReceivable: number;
  beginningInventory: number;
  beginningAccountsPayable: number;

  // Financing activities
  loanProceeds?: number;  // New borrowings
  stockIssued?: number;   // Equity raised

  // Asset sales (if any)
  proceedsFromAssetSales?: number;
}

export interface CashFlowStatementOutput {
  // Operating Activities (Direct Method)
  cashReceiptsFromCustomers: number;
  cashPaidForMaterials: number;
  cashPaidForLabor: number;
  cashPaidForOverhead: number;
  cashPaidForSGA: number;
  cashPaidForTaxes: number;
  netCashFromOperating: number;

  // Investing Activities
  capitalExpenditures: number;
  proceedsFromAssetSales: number;
  netCashFromInvesting: number;

  // Financing Activities
  loanProceeds: number;
  loanRepayments: number;
  stockIssued: number;
  dividendsPaid: number;
  netCashFromFinancing: number;

  // Summary
  netChangeInCash: number;
  beginningCash: number;
  endingCash: number;

  // Reconciliation to Indirect Method
  netIncome: number;
  depreciation: number;
  changeInAccountsReceivable: number;
  changeInInventory: number;
  changeInAccountsPayable: number;
  indirectMethodOperatingCash: number;

  // Quality Metrics
  freeCashFlow: number;
  operatingCashToNetIncomeRatio: number;
  capitalIntensityRatio: number;  // CapEx as % of sales
  dividendCoverageRatio: number;  // Operating cash / dividends
  debtServiceCoverageRatio: number;  // Operating cash / debt payments
  cashFlowAdequacyRatio: number;  // Operating cash / (CapEx + Dividends + Debt)
}

// ============================================================================
// COMPLETE BUDGET OUTPUT (All 13 Schedules + Cash Flow)
// ============================================================================

export interface CompleteBudgetOutput {
  salesBudget: SalesBudgetOutput;
  productionBudget: ProductionBudgetOutput;
  directMaterialBudget: DirectMaterialBudgetOutput;
  directLabourBudget: DirectLabourBudgetOutput;
  manufacturingOverhead: ManufacturingOverheadOutput;
  sellingAdminExpense: SellingAdminExpenseOutput;
  cashReceipts: CashReceiptsOutput;
  cashDisbursement: CashDisbursementOutput;
  cashBudget: CashBudgetOutput;
  cogs: COGSOutput;
  incomeStatement: IncomeStatementOutput;
  balanceSheet: BalanceSheetOutput;
  cashFlowStatement: CashFlowStatementOutput;
}

