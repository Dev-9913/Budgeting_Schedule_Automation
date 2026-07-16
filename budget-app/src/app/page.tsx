'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { siteConfig, shouldShowSection } from '@/lib/config/siteConfig';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Save preferences to localStorage when they change
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
  };

  const textColor = darkMode ? 'text-gray-100' : 'text-[#454545]';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#111] text-gray-100' : 'bg-white text-[#454545]'}`}>
      {/* Simple Header */}
      <header className="max-w-3xl mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
          Budget Automation
        </h1>
        <div className="flex items-center gap-4">
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

      {/* Content */}
      <main className={`max-w-3xl mx-auto px-6 py-12 ${textColor}`}>
        <h2 className={`text-5xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-black'}`}>
          Budget Generator
        </h2>

        <p className="text-xl mb-6 leading-relaxed">
          Create comprehensive financial budgets for manufacturing companies.
        </p>

        <p className="text-lg mb-12 leading-relaxed">
          No signup required. All calculations happen in your browser.
        </p>

        <div className="flex gap-4 mb-16">
          <Link
            href="/input"
            className={`inline-block ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-medium px-8 py-4 text-lg`}
          >
            Start New Budget
          </Link>
          <Link
            href="/dashboard"
            className={`inline-block ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} border font-medium px-8 py-4 text-lg`}
          >
            View Dashboard
          </Link>
        </div>

        <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />

        <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
          How it works
        </h3>

        <p className="text-lg mb-6 leading-relaxed">
          You enter your company's financial data—sales forecasts, costs, inventory policies,
          and economic assumptions. The system automatically calculates all 13 interconnected
          budget schedules that companies use for financial planning.
        </p>

        <p className="text-lg mb-12 leading-relaxed">
          The formulas follow the standard methodology taught in business schools and used by
          Fortune 500 companies. No spreadsheet formulas to debug. No manual calculations.
          Just clean, accurate budgets in minutes.
        </p>

        <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
          The 13 Schedules
        </h3>

        <ol className="space-y-2 mb-12 text-lg leading-relaxed list-decimal list-inside">
          <li>Sales Budget</li>
          <li>Production Budget</li>
          <li>Direct-Material Budget</li>
          <li>Direct-Labour Budget</li>
          <li>Manufacturing Overhead Budget</li>
          <li>Selling & Administrative Budget</li>
          <li>Admin Expense Budget</li>
          <li>Cash Receipts Budget</li>
          <li>Cash Disbursement Budget</li>
          <li>Cash Budget</li>
          <li>Cost of Goods Manufactured & Sold</li>
          <li>Budgeted Income Statement</li>
          <li>Budgeted Balance Sheet</li>
        </ol>

        <p className="text-lg mb-6 leading-relaxed">
          Plus the Budgeted Cash Flow Statement.
        </p>

        <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />

        <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
          What's built
        </h3>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 1: Sales Budget</strong> — Fully functional. Input quarterly sales data,
          set pricing and inflation rates, get automatic calculations.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 2: Production Budget</strong> — Fully functional. Calculate production requirements
          with inventory management, capacity constraints, batch sizing, JIT mode, and cost analysis.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 3: Direct Material Budget</strong> — Fully functional. Multi-material support with scrap/waste
          allowance, bulk discounts, price inflation, JIT delivery, inventory turnover metrics, and critical material identification.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 4: Direct Labor Budget</strong> — Fully functional. Single or multi-category labor tracking,
          wage inflation, overtime calculations, fringe benefits, and workforce planning metrics.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 5: Manufacturing Overhead Budget</strong> — Fully functional. Traditional costing and Activity-Based
          Costing (ABC) with four-level cost hierarchy, predetermined overhead rates, and flexible allocation bases.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 6: Selling & Administrative Expense Budget</strong> — Fully functional. Track sales, marketing,
          and administrative expenses with detailed breakdowns by category and performance metrics.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 7: Cash Receipts Budget</strong> — Fully functional. Calculate when cash is actually collected
          from sales with collection timing tracking, accounts receivable management, and bad debt allowance.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 8: Cash Disbursements Budget</strong> — Fully functional. Track all cash outflows including
          material payments, payroll, overhead, SGA expenses, taxes, dividends, capital expenditures, and loan payments.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 9: Cash Budget</strong> — Fully functional. Master cash planning schedule combining receipts
          and disbursements to forecast cash position, identify financing needs, and calculate operating and free cash flow.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 10: Cost of Goods Manufactured & Sold</strong> — Fully functional. Calculate the total cost
          of producing and selling goods with Work-in-Process and Finished Goods inventory tracking, per-unit cost analysis,
          and automatic integration with material, labor, and overhead schedules.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 11: Budgeted Income Statement</strong> — Fully functional. Project your company's profitability
          with complete income statement including gross margin, operating income, interest expense, income tax, and net income
          with comprehensive percentage analysis of all line items.
        </p>

        <p className="text-lg mb-6 leading-relaxed">
          <strong>Schedule 12: Budgeted Statement of Cash Flows</strong> — Fully functional. Complete cash flow analysis using
          the direct method with indirect method reconciliation. Includes operating, investing, and financing activities plus
          quality metrics like free cash flow, debt service coverage, and cash flow adequacy ratios.
        </p>

        <p className="text-lg mb-12 leading-relaxed">
          <strong>Schedule 13: Budgeted Balance Sheet</strong> — Fully functional. Project your company's financial position
          with complete asset, liability, and equity tracking. Includes financial ratios (current ratio, quick ratio, ROA, ROE,
          debt-to-equity) and balance check validation.
        </p>

        <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />

        <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
          Why this exists
        </h3>

        <p className="text-lg mb-6 leading-relaxed">
          Making master budgets manually in Excel is tedious and error-prone. You spend hours
          linking formulas across 13 worksheets. One mistake breaks everything downstream.
        </p>

        <p className="text-lg mb-12 leading-relaxed">
          This tool automates the boring parts so you can focus on strategy and analysis.
          Enter your assumptions once. Get all 13 schedules instantly. Change an assumption.
          See the impact across all schedules immediately.
        </p>

        <Link
          href="/input"
          className={`inline-block ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-medium px-8 py-4 text-lg mb-16`}
        >
          Try it now
        </Link>

        {/* Dynamic Sections - Only show if enabled and have content */}

        {/* Projects Section */}
        {shouldShowSection('projects') && (
          <>
            <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />
            <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
              {siteConfig.sections.projects.title}
            </h3>
            {siteConfig.sections.projects.description && (
              <p className="text-lg mb-8 leading-relaxed">
                {siteConfig.sections.projects.description}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {siteConfig.sections.projects.items?.map((project: any, idx: number) => (
                <div key={idx} className={`p-6 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} hover:shadow-lg transition-shadow`}>
                  <h4 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {project.title}
                  </h4>
                  <p className="text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  {project.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag: string, tagIdx: number) => (
                        <span key={tagIdx} className={`text-xs px-2 py-1 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={project.link}
                    className={`text-sm ${darkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} underline`}
                  >
                    View Project →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Experience Section */}
        {shouldShowSection('experience') && (
          <>
            <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />
            <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
              {siteConfig.sections.experience.title}
            </h3>
            {siteConfig.sections.experience.description && (
              <p className="text-lg mb-8 leading-relaxed">
                {siteConfig.sections.experience.description}
              </p>
            )}
            <div className="space-y-6 mb-16">
              {siteConfig.sections.experience.items?.map((exp: any, idx: number) => (
                <div key={idx} className={`p-6 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
                  <h4 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {exp.position}
                  </h4>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {exp.company} • {exp.period}
                  </p>
                  <p className="text-base leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tech Stack Section */}
        {shouldShowSection('techStack') && (
          <>
            <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />
            <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
              {siteConfig.sections.techStack.title}
            </h3>
            {siteConfig.sections.techStack.description && (
              <p className="text-lg mb-8 leading-relaxed">
                {siteConfig.sections.techStack.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mb-16">
              {siteConfig.sections.techStack.items?.map((tech: string, idx: number) => (
                <span key={idx} className={`px-4 py-2 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'} text-sm`}>
                  {tech}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Writing Section */}
        {shouldShowSection('writing') && (
          <>
            <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />
            <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
              {siteConfig.sections.writing.title}
            </h3>
            {siteConfig.sections.writing.description && (
              <p className="text-lg mb-8 leading-relaxed">
                {siteConfig.sections.writing.description}
              </p>
            )}
            <div className="space-y-4 mb-16">
              {siteConfig.sections.writing.items?.map((article: any, idx: number) => (
                <a
                  key={idx}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-6 border ${darkMode ? 'border-gray-700 bg-gray-900 hover:bg-gray-800' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'} transition-colors`}
                >
                  <h4 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {article.title}
                  </h4>
                  {article.date && (
                    <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                  <p className="text-base leading-relaxed">
                    {article.description}
                  </p>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Testimonials Section */}
        {shouldShowSection('testimonials') && (
          <>
            <hr className={`my-16 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />
            <h3 className={`text-3xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
              {siteConfig.sections.testimonials.title}
            </h3>
            {siteConfig.sections.testimonials.description && (
              <p className="text-lg mb-8 leading-relaxed">
                {siteConfig.sections.testimonials.description}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {siteConfig.sections.testimonials.items?.map((testimonial: any, idx: number) => (
                <div key={idx} className={`p-6 border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
                  <p className="text-base leading-relaxed mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                      {testimonial.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.position} at {testimonial.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className={`max-w-3xl mx-auto px-6 py-12 border-t ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'} text-sm`}>
        <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
        <p className="mt-2">© 2025 Budget Automation System</p>
      </footer>
    </div>
  );
}

