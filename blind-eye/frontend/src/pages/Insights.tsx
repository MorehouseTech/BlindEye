export default function Insights() {
    return (
      <div className="min-h-screen bg-[#F9FBFD] flex flex-col">
        {/* Top bar with logo and navigation */}
        <header className="w-full px-16 pt-8 pb-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-9 w-9 rounded-full border border-gray-800">
              <div className="h-4 w-4 rounded-full border border-gray-800 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#7EEAD4]" />
              </div>
              <div className="absolute -right-2 h-px w-3 bg-gray-800 rotate-[15deg]" />
              <div className="absolute -left-2 h-px w-3 bg-gray-800 -rotate-[15deg]" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-gray-900">
              BlindEye
            </span>
          </div>
  
          {/* Navigation links with active Insights pill */}
          <nav className="flex items-center gap-10 text-sm font-medium text-[#4B5563]">
            <button className="hover:text-gray-900 transition-colors">Home</button>
            <button className="px-4 py-1.5 rounded-full bg-[#7EEAD4] text-[#03776B] shadow-sm">
              Insights
            </button>
            <button className="hover:text-gray-900 transition-colors">
              User Metrics
            </button>
          </nav>
        </header>
  
        {/* Main insights content */}
        <main className="flex-1 px-16 pb-10">
          {/* Page title */}
          <h1 className="text-4xl font-semibold text-gray-900 mb-8">Insights</h1>
  
          {/* Top row cards */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Data Refresh Cycle */}
            <section className="bg-white rounded-xl shadow-sm px-8 py-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00B8A3]">
                  Data Refresh Cycle
                </h2>
                <span className="text-xs text-gray-400 border border-gray-300 rounded-full h-5 w-5 flex items-center justify-center">
                  i
                </span>
              </div>
  
              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🕒</span>
                  <span className="font-semibold">Weekly Market Scan</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bullet1</li>
                  <li>Bullet2</li>
                  <li>Bullet 3</li>
                </ul>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>Last Scan: March 10, 2026</p>
                  <p>Next Scan: March 17, 2026</p>
                </div>
              </div>
            </section>
  
            {/* Visibility Pipeline */}
            <section className="bg-white rounded-xl shadow-sm px-8 py-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00B8A3]">
                  Visibility Pipeline
                </h2>
                <span className="text-xs text-gray-400 border border-gray-300 rounded-full h-5 w-5 flex items-center justify-center">
                  i
                </span>
              </div>
  
              <div className="space-y-3 text-sm text-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👁️</span>
                  <span className="font-semibold">Signals Analyzed:</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Search keyword ranking</li>
                  <li>Product listing optimization</li>
                  <li>Competitor product positioning</li>
                  <li>Marketplace discovery signals</li>
                  <li>Engagement indicators</li>
                </ul>
              </div>
            </section>
          </div>
  
          {/* Insight Generation Pipeline card */}
          <section className="bg-white rounded-xl shadow-sm px-8 py-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#00B8A3]">
                Insight Generation Pipeline/ System Flow
              </h2>
              <span className="text-xs text-gray-400 border border-gray-300 rounded-full h-5 w-5 flex items-center justify-center">
                i
              </span>
            </div>
  
            {/* Horizontal flow diagram */}
            <div className="grid grid-cols-5 gap-6 text-center text-sm text-gray-800">
              {[
                { title: "Data Collection", paragraph: "Quick lil Paragraph1" },
                { title: "Data Aggregation", paragraph: "Quick lil Paragraph2" },
                { title: "Visibility Scoring", paragraph: "Quick lil Paragraph3" },
                { title: "AI Analysis", paragraph: "Quick lil Paragraph4" },
                {
                  title: "Insights Generation",
                  paragraph: "Quick lil Paragraph5",
                },
              ].map((step, idx, arr) => (
                <div key={step.title} className="relative flex flex-col items-center">
                  <div className="mb-3 text-xs font-medium text-gray-700">
                    {step.title}
                  </div>
                  <div className="h-14 w-14 rounded-full bg-gray-300 mb-2" />
                  <div className="text-xs text-gray-700">{step.paragraph}</div>
                  {idx < arr.length - 1 && (
                    <div className="hidden md:block absolute top-10 -right-7 w-7 h-0.5 bg-gray-500">
                      <span className="absolute -right-1 -top-1 text-lg">➜</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }
  