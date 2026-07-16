<div align="center">

# Budget Automation System

### Enterprise-Grade Master Budget Generator for Manufacturing Companies

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://your-deployment-url-here.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*Automates all 13 interconnected budget schedules based on Hilton's Managerial Accounting framework*

[**Try It Live**](https://your-deployment-url-here.vercel.app/) · [**Report Bug**](https://github.com/Dev-9913/Budgeting_Schedule_Automation/issues) · [**Request Feature**](https://github.com/Dev-9913/Budgeting_Schedule_Automation/issues)

</div>

---

## 🎯 Project Goals

- **Automate Complexity:** Eliminate manual Excel errors by automating the calculation of all 13 interconnected budget schedules.
- **Strategic Focus:** Shift the user's focus from data entry and formula linking to high-level financial strategy and analysis.
- **Real-time Insights:** Provide immediate visual feedback on how changing assumptions impacts the entire financial position.
- **Educational Value:** Implement the rigorous Hilton Managerial Accounting framework as a production-ready web application.

---

## 🏗️ System Architecture

### Data Flow Diagram

```
                              ┌──────────────────┐
                              │   USER INPUTS    │
                              │                  │
                              │  • Sales Data    │
                              │  • Cost Drivers  │
                              │  • Policies      │
                              └────────┬─────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          OPERATING BUDGETS                                   │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────────┐ │
│  │ Schedule 1  │────▶│ Schedule 2  │────▶│ Schedule 3  │────▶│ Schedule 4 │ │
│  │   SALES     │     │ PRODUCTION  │     │  MATERIAL   │     │   LABOR    │ │
│  │   BUDGET    │     │   BUDGET    │     │   BUDGET    │     │   BUDGET   │ │
│  └─────────────┘     └─────────────┘     └─────────────┘     └────────────┘ │
│         │                                       │                    │       │
│         │            ┌─────────────┐            │                    │       │
│         │            │ Schedule 5  │◀───────────┴────────────────────┘       │
│         │            │  OVERHEAD   │                                         │
│         │            │   BUDGET    │                                         │
│         │            └──────┬──────┘                                         │
│         │                   │                                                │
│         ▼                   ▼                                                │
│  ┌─────────────────────────────────────────┐                                │
│  │           Schedule 6: SG&A BUDGET        │                                │
│  │  (Selling & Administrative Expenses)     │                                │
│  └─────────────────────────────────────────┘                                │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CASH BUDGETS                                      │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                    │
│  │ Schedule 7  │     │ Schedule 8  │     │ Schedule 9  │                    │
│  │    CASH     │────▶│    CASH     │────▶│    CASH     │                    │
│  │  RECEIPTS   │     │DISBURSEMENTS│     │   BUDGET    │                    │
│  └─────────────┘     └─────────────┘     └─────────────┘                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        FINANCIAL STATEMENTS                                  │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────────┐ │
│  │ Schedule 10 │────▶│ Schedule 11 │────▶│ Schedule 12 │────▶│Schedule 13 │ │
│  │    COGS     │     │   INCOME    │     │  CASH FLOW  │     │  BALANCE   │ │
│  │  SCHEDULE   │     │  STATEMENT  │     │  STATEMENT  │     │   SHEET    │ │
│  └─────────────┘     └─────────────┘     └─────────────┘     └────────────┘ │
│                                                                              │
│                              ┌─────────────────────────────────┐            │
│                              │         FINAL OUTPUTS           │            │
│                              │                                 │            │
│                              │  • Profitability Ratios         │            │
│                              │  • Liquidity Metrics            │            │
│                              │  • Financial Health Scores      │            │
│                              └─────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Roadmap

### ✅ Completed
- [x] All 13 budget schedules (Hilton Framework)
- [x] Automatic schedule integration and cross-linking
- [x] Executive Dashboard with real-time KPI visualization
- [x] Interactive data charts for all schedules using Recharts
- [x] CSV Export functionality for all generated schedules
- [x] Full TypeScript implementation for robust financial calculations

### 🚧 Future Enhancements
- [ ] **Multi-Product Support:** Extend the engine to handle complex product mixes and multi-SKU scenarios.
- [ ] **Scenario Modeling:** Side-by-side comparison of Best, Base, and Worst-case assumptions.
- [ ] **Professional Reporting:** Automated PDF generation with embedded analysis and visualizations.
- [ ] **Sensitivity Analysis:** Tornado charts to identify which variables most significantly impact the bottom line.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **Visualization:** Recharts
- **Deployment:** Vercel

---

## 📖 Theoretical Foundation

This system implements the **Master Budget** framework as described in:
> **Ronald W. Hilton's Managerial Accounting: Creating Value in a Dynamic Business Environment**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch.
3. Commit your changes with a clear message.
4. Push to your branch and open a Pull Request.

---

## 📜 License

© 2025 Budget Automation System. All rights reserved. Licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for the future of financial automation.**

[**Live Demo**](https://your-deployment-url-here.vercel.app/) · [**Report Issue**](https://github.com/Dev-9913/Budgeting_Schedule_Automation/issues)

</div>

