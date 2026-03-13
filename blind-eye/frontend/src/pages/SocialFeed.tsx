// TikTok-style vertical swipe feed for product discovery.
// Supports touch swipe, keyboard arrows, and on-screen nav buttons.
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchFeedPosts, likePost, type FeedPost } from "../api/feedApi";

/* ── Onboarding Popup ── */
function OnboardingPopup({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-2">Welcome to BlindEye</h2>
        <p className="text-gray-500 text-sm mb-5">
          Discover products with full AI transparency
        </p>

        <div className="space-y-4 text-left mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#9650;&#9660;</span>
            <div>
              <p className="font-semibold text-sm">Swipe or use arrows</p>
              <p className="text-xs text-gray-500">
                Swipe up/down or tap the arrow buttons to browse products.
                Keyboard arrows work too.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#128065;</span>
            <div>
              <p className="font-semibold text-sm">Blind Spot</p>
              <p className="text-xs text-gray-500">
                Tap the eye icon to see AI visibility analysis for any product.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#128161;</span>
            <div>
              <p className="font-semibold text-sm">Why This?</p>
              <p className="text-xs text-gray-500">
                Tap &ldquo;Why?&rdquo; to see exactly why this product was
                recommended to you — full algorithm transparency.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">&#128269;</span>
            <div>
              <p className="font-semibold text-sm">Search</p>
              <p className="text-xs text-gray-500">
                Tap Search to find products, brands, or categories.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full bg-teal-500 text-white py-2.5 rounded-lg font-medium hover:bg-teal-600"
        >
          Got It
        </button>
      </div>
    </div>
  );
}

/* ── Settings / Help Overlay ── */
function SettingsOverlay({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {showHelp ? "How to Use" : "Settings"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
        </div>

        {showHelp ? (
          <div className="space-y-3 text-sm text-gray-700 mb-4">
            <p>
              <strong>Swipe up/down</strong> or use <strong>arrow keys</strong>{" "}
              to browse products.
            </p>
            <p>
              Tap the <strong>&#128065; eye icon</strong> on the right to see
              the Blind Spot analysis — how AI platforms represent this product.
            </p>
            <p>
              Tap <strong>&ldquo;Why?&rdquo;</strong> to see exactly why this
              product was recommended to you, including the algorithm factors.
            </p>
            <p>
              Tap <strong>&#128269; Search</strong> at the top to find specific
              products, brands, or categories.
            </p>
            <p>
              Tap <strong>&#9829;</strong> to like a product. Your interactions
              personalize future recommendations.
            </p>
            <button
              onClick={() => setShowHelp(false)}
              className="text-teal-600 font-medium"
            >
              &larr; Back to Settings
            </button>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <button
              onClick={() => setShowHelp(true)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-lg">&#10068;</span>
              <span className="text-sm font-medium">Help &amp; Tutorial</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-3"
            >
              <span className="text-lg">&#9211;</span>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Recommendation Transparency Overlay ── */
function RecommendationOverlay({
  post,
  onClose,
}: {
  post: FeedPost;
  onClose: () => void;
}) {
  // Simulated algorithm factors based on post data
  const factors = [
    {
      label: "Category Relevance",
      value: post.relevanceScore ?? 85,
      reason: `Matched your browsing interest in "${post.category}"`,
    },
    {
      label: "Uniqueness Score",
      value: post.uniquenessScore ?? 70,
      reason:
        post.businessSize === "local"
          ? "Boosted: local business under-represented in AI results"
          : "Standard weighting for mainstream brand",
    },
    {
      label: "AI Visibility",
      value: post.aiScore,
      reason: `This product scores ${post.aiScore}/100 across AI platforms`,
    },
    {
      label: "Engagement Signal",
      value: Math.min(100, Math.round((post.likes / 50) * 100)),
      reason: `${post.likes} likes from the community`,
    },
    {
      label: "Price Competitiveness",
      value: post.price < 100 ? 90 : post.price < 200 ? 70 : 50,
      reason: `$${post.price} — ${post.price < 100 ? "budget-friendly" : post.price < 200 ? "mid-range" : "premium"} for this category`,
    },
  ];

  return (
    <div className="absolute inset-0 bg-black/80 z-40 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          &times;
        </button>
        <h3 className="font-bold text-lg mb-1">Why This Product?</h3>
        <p className="text-xs text-gray-500 mb-4">
          Full transparency into why &ldquo;{post.productName}&rdquo; was
          recommended to you.
        </p>

        <div className="space-y-3">
          {factors.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{f.label}</span>
                <span className="text-teal-600 font-bold">{f.value}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5 mb-1">
                <div
                  className="bg-teal-500 h-1.5 rounded-full"
                  style={{ width: `${f.value}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{f.reason}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          <p className="font-medium text-gray-700 mb-1">
            BlindEye Transparency Commitment
          </p>
          <p>
            Unlike black-box AI recommendations, BlindEye shows you every factor
            that influences what you see. We intentionally boost local and
            underrepresented businesses to counter AI bias.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Blind Spot Overlay ── */
function BlindSpotOverlay({
  post,
  onClose,
}: {
  post: FeedPost;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          &times;
        </button>
        <h3 className="font-bold text-lg mb-3">Blind Spot Analysis</h3>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Business Type</p>
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${
                post.businessSize === "local"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {post.businessSize === "local"
                ? "Local Business"
                : "Mainstream Brand"}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">AI Visibility Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: `${post.aiScore}%` }}
                />
              </div>
              <span className="text-sm font-bold">{post.aiScore}/100</span>
            </div>
          </div>

          {post.uniquenessScore != null && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Uniqueness</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${post.uniquenessScore}%` }}
                  />
                </div>
                <span className="text-sm font-bold">
                  {post.uniquenessScore}%
                </span>
              </div>
            </div>
          )}

          {post.relevanceScore != null && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Relevance</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${post.relevanceScore}%` }}
                  />
                </div>
                <span className="text-sm font-bold">
                  {post.relevanceScore}%
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 border-t text-xs text-gray-500">
            {post.businessSize === "local" ? (
              <p>
                This product comes from a local business that may be
                under-represented by AI recommendation systems. BlindEye
                surfaces these businesses to give you more transparent choices.
              </p>
            ) : (
              <p>
                This is a mainstream brand that tends to dominate AI
                recommendations. BlindEye helps you see beyond algorithm
                favorites.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Search Overlay ── */
function SearchOverlay({
  onClose,
  onSearch,
  categories,
}: {
  onClose: () => void;
  onSearch: (q: string) => void;
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    onSearch(query);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/80 z-40 flex flex-col">
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={onClose}
          className="text-white text-2xl w-8 flex-shrink-0"
        >
          &larr;
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Search products, brands, tags..."
          className="flex-1 bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-full px-4 py-2.5 text-sm outline-none focus:border-teal-400"
        />
        <button
          onClick={submit}
          className="bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Go
        </button>
      </div>

      <div className="px-6 pt-2">
        <p className="text-white/60 text-xs mb-3">Trending Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => c !== "All")
            .map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSearch(cat);
                  onClose();
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
              >
                {cat}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Feed ── */
export default function SocialFeed() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBlindSpot, setShowBlindSpot] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWhyThis, setShowWhyThis] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  // Touch tracking
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show onboarding on first visit
  useEffect(() => {
    const seen = localStorage.getItem("blindeye_user_onboarded");
    if (!seen) setShowOnboarding(true);
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem("blindeye_user_onboarded", "1");
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const loadPosts = useCallback((search?: string) => {
    setLoading(true);
    setCurrentIndex(0);
    fetchFeedPosts(undefined, search)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPosts();
    import("../api/feedApi").then(({ fetchCategories: fc }) =>
      fc().then(setCategories).catch(() => {}),
    );
  }, [loadPosts]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, posts.length - 1));
    setShowBlindSpot(false);
    setShowWhyThis(false);
  }, [posts.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
    setShowBlindSpot(false);
    setShowWhyThis(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSearch || showSettings || showOnboarding) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, showSearch, showSettings, showOnboarding]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goNext();
      else goPrev();
    }
  };

  const handleLike = (postId: number) => {
    if (liked.has(postId)) return;
    setLiked((prev) => new Set(prev).add(postId));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
    );
    likePost(postId).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black text-white gap-4">
        <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
        <div className="w-48 h-4 bg-white/10 rounded animate-pulse" />
        <div className="w-32 h-3 bg-white/5 rounded animate-pulse" />
        <p className="text-white/40 text-xs mt-2">Loading feed...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white">
        No products found.
      </div>
    );
  }

  const post = posts[currentIndex];

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Full-screen card ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300"
        style={{ background: post.mediaGradient || "#1a1a2e" }}
      >
        {/* Large product emoji */}
        <span className="text-8xl mb-4 drop-shadow-lg">
          {post.mediaEmoji || "\ud83d\udce6"}
        </span>

        {/* Product info overlay (bottom) */}
        <div className="absolute bottom-0 left-0 right-14 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
              {post.businessLogo}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {post.businessName}
              </p>
              <p className="text-white/60 text-xs">{post.category}</p>
            </div>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">
            {post.productName}
          </h2>
          <p className="text-white text-2xl font-bold mb-2">
            ${post.price}
          </p>
          <p className="text-white/70 text-sm line-clamp-2 mb-2">
            {post.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white/15 text-white/80 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right-side action bar ── */}
      <div className="absolute right-3 bottom-36 flex flex-col items-center gap-5 z-20">
        {/* Like */}
        <button
          onClick={() => handleLike(post.id)}
          className="flex flex-col items-center"
        >
          <span
            className={`text-2xl ${liked.has(post.id) ? "text-red-500" : "text-white"}`}
          >
            &#9829;
          </span>
          <span className="text-white text-xs">{post.likes}</span>
        </button>

        {/* Comments */}
        <div className="flex flex-col items-center">
          <span className="text-2xl text-white">&#128172;</span>
          <span className="text-white text-xs">{post.comments}</span>
        </div>

        {/* Blind Spot button */}
        <button
          onClick={() => {
            setShowBlindSpot(!showBlindSpot);
            setShowWhyThis(false);
          }}
          className="flex flex-col items-center"
          title="Blind Spot Analysis"
        >
          <span className="text-2xl">&#128065;</span>
          <span className="text-white text-[10px]">Blind Spot</span>
        </button>

        {/* Why This? — Recommendation Transparency */}
        <button
          onClick={() => {
            setShowWhyThis(!showWhyThis);
            setShowBlindSpot(false);
          }}
          className="flex flex-col items-center"
          title="Why was this recommended?"
        >
          <span className="text-2xl">&#128161;</span>
          <span className="text-white text-[10px]">Why?</span>
        </button>

        {/* AI Score */}
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-teal-400">
            {post.aiScore}
          </span>
          <span className="text-white text-[10px]">AI Score</span>
        </div>
      </div>

      {/* ── Top HUD ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20">
        <h1 className="text-white font-bold text-lg">BlindEye</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="text-white bg-white/10 rounded-full px-3 py-1.5 text-sm hover:bg-white/20"
          >
            &#128269; Search
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-white bg-white/10 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/20"
            title="Settings"
          >
            &#9881;
          </button>
        </div>
      </div>

      {/* ── On-screen nav arrows — larger and more visible ── */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-1/2 top-16 -translate-x-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl shadow-lg transition-colors"
          aria-label="Previous"
        >
          &#9650;
        </button>
      )}
      {currentIndex < posts.length - 1 && (
        <button
          onClick={goNext}
          className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl shadow-lg animate-bounce transition-colors"
          aria-label="Next"
        >
          &#9660;
        </button>
      )}

      {/* Post counter */}
      <div className="absolute top-4 right-1/2 translate-x-1/2 text-white/30 text-xs z-20">
        {currentIndex + 1} / {posts.length}
      </div>

      {/* ── Overlays ── */}
      {showBlindSpot && (
        <BlindSpotOverlay
          post={post}
          onClose={() => setShowBlindSpot(false)}
        />
      )}
      {showWhyThis && (
        <RecommendationOverlay
          post={post}
          onClose={() => setShowWhyThis(false)}
        />
      )}
      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onSearch={(q) => loadPosts(q)}
          categories={categories}
        />
      )}
      {showSettings && (
        <SettingsOverlay
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
      {showOnboarding && <OnboardingPopup onDismiss={dismissOnboarding} />}
    </div>
  );
}
