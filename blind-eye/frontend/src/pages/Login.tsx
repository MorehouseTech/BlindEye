import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"consumer" | "business">("consumer");
  const isConsumer = mode === "consumer";

  return (
    <main className="flex justify-center items-start pt-10 pb-16">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md overflow-hidden">
        {/* Consumer / Business tabs (always visible) */}
        <div className="relative grid grid-cols-2">
          <button
            className={`py-5 text-center text-xl font-medium transition-colors duration-200 ${
              isConsumer ? "bg-[#D8FFF8] text-[#00B8A3]" : "text-gray-900"
            }`}
            onClick={() => setMode("consumer")}
            type="button"
          >
            Consumer
          </button>
          <button
            className={`py-5 text-center text-xl font-medium transition-colors duration-200 ${
              !isConsumer ? "bg-[#D8FFF8] text-[#00B8A3]" : "text-gray-900"
            }`}
            onClick={() => setMode("business")}
            type="button"
          >
            Business
          </button>

          {/* Teal underline under active tab */}
          <div
            className="absolute bottom-0 left-0 h-1 w-1/2 bg-[#00B8A3] transition-transform duration-300 ease-out"
            style={{ transform: isConsumer ? "translateX(0%)" : "translateX(100%)" }}
          />
        </div>

        {/* Login content (labels never disappear; only content changes/slides) */}
        <div className="overflow-hidden">
          <div
            className="flex w-[200%] transition-transform duration-300 ease-out"
            style={{
              transform: isConsumer ? "translateX(0%)" : "translateX(-50%)",
            }}
          >
            {/* Consumer */}
            <div className="w-1/2 px-16 py-12">
              <h1 className="text-5xl font-medium text-center text-gray-900 mb-10">
                Login
              </h1>

              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Ex. 102205"
                  className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7EEAD4] focus:border-transparent"
                />
              </div>

              <div className="mb-10">
                <label className="block text-sm text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Ex. Constantine"
                  className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7EEAD4] focus:border-transparent"
                />
              </div>

              <div className="flex justify-center">
                <button
                  className="px-10 py-3 rounded-md bg-[#D8FFF8] text-2xl font-medium text-[#00B8A3] shadow-sm hover:bg-[#C8FFF5] transition-colors"
                  onClick={() => navigate("/dashboard")}
                  type="button"
                >
                  Sign-In
                </button>
              </div>
            </div>

            {/* Business */}
            <div className="w-1/2 px-16 py-12">
              <h1 className="text-5xl font-medium text-center text-gray-900 mb-10">
                Login
              </h1>

              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-1">
                  Business ID
                </label>
                <input
                  type="text"
                  placeholder="Ex. STORE-001"
                  className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7EEAD4] focus:border-transparent"
                />
              </div>

              <div className="mb-10">
                <label className="block text-sm text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Business password"
                  className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7EEAD4] focus:border-transparent"
                />
              </div>

              <div className="flex justify-center">
                <button
                  className="px-10 py-3 rounded-md bg-[#D8FFF8] text-2xl font-medium text-[#00B8A3] shadow-sm hover:bg-[#C8FFF5] transition-colors"
                  onClick={() => navigate("/dashboard")}
                  type="button"
                >
                  Sign-In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
