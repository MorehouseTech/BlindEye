export default function Dashboard() {
  return (
    <main className="px-16 pb-10 pt-4">
      <h1 className="text-4xl font-semibold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-[1.4fr,1.4fr] gap-6 mb-6">
        <section className="bg-white rounded-xl shadow-sm px-8 py-6 flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-[#00B8A3] mb-4">
            Shopping Score
          </h2>
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-2xl">⏱</span>
              </div>
              <p className="text-sm text-gray-700">Summary text.</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm px-8 py-6 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#00B8A3]">
              AI Visibility Analytics
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <svg
              viewBox="0 0 140 60"
              className="w-full h-32 text-gray-700"
              aria-hidden="true"
            >
              <line
                x1="5"
                y1="55"
                x2="135"
                y2="55"
                stroke="#9CA3AF"
                strokeWidth="1.5"
              />
              <polyline
                fill="none"
                stroke="#6B7280"
                strokeWidth="1.5"
                points="10,40 50,20 90,35 130,10"
              />
            </svg>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {[
          { name: "GPT", text: "GPT overview text." },
          { name: "Gemini", text: "Gemini overview text." },
          { name: "Claude", text: "Claude overview text." },
        ].map((model) => (
          <section
            key={model.name}
            className="bg-white rounded-xl shadow-sm px-6 py-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#00B8A3]">
                {model.name}
              </h3>
              <span className="text-xs text-gray-400 border border-gray-300 rounded-full h-5 w-5 flex items-center justify-center">
                i
              </span>
            </div>
            <p className="text-sm text-gray-800">{model.text}</p>
          </section>
        ))}
      </div>

      <section className="bg-white rounded-xl shadow-sm px-8 py-6">
        <h2 className="text-xl font-semibold mb-4 text-[#00B8A3]">
          Recommend Next Steps
        </h2>

        <div className="space-y-4 text-sm leading-relaxed">
          <div>
            <span className="font-semibold text-[#F97373]">
              Immediate Action{" "}
            </span>
            <span className="text-gray-800">
              Low visibility detected for{" "}
              <span className="font-semibold italic">
                “handmade silver bracelet”
              </span>
            </span>
            <div className="text-gray-600">
              <span className="font-semibold">Suggested Action:</span> Update SEO
              metadata and add this keyword to product descriptions
            </div>
          </div>

          <div>
            <span className="font-semibold text-[#F59E0B]">
              Optimization Opportunity{" "}
            </span>
            <span className="text-gray-800">
              Competitors rank higher for{" "}
              <span className="font-semibold italic">
                “custom charm bracelet”
              </span>
            </span>
            <div className="text-gray-600">
              <span className="font-semibold">Suggested Action:</span> Update SEO
              metadata and add this keyword to product descriptions
            </div>
          </div>

          <div>
            <span className="font-semibold text-[#10B981]">
              Visibility Strength{" "}
            </span>
            <span className="text-gray-800">
              Your product ranks{" "}
              <span className="font-semibold">Top 5 on Etsy search results</span>
            </span>
            <div className="text-gray-600">
              <span className="font-semibold">Suggested Action:</span> Update SEO
              metadata and add this keyword to product descriptions
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
