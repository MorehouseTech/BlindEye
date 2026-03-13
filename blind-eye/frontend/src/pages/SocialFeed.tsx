// TikTok-style vertical swipe feed for product discovery.
// Supports touch swipe, keyboard arrows, and on-screen nav buttons.
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchFeedPosts, likePost, type FeedPost } from "../api/feedApi";

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
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBlindSpot, setShowBlindSpot] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  // Touch tracking
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [posts.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
    setShowBlindSpot(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSearch) return;
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
  }, [goNext, goPrev, showSearch]);

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
      <div className="flex-1 flex items-center justify-center bg-black text-white">
        Loading feed...
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
          {post.mediaEmoji || "📦"}
        </span>

        {/* Product info overlay (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
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
          onClick={() => setShowBlindSpot(!showBlindSpot)}
          className="flex flex-col items-center"
          title="Blind Spot Analysis"
        >
          <span className="text-2xl">&#128065;</span>
          <span className="text-white text-[10px]">Blind Spot</span>
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
        <button
          onClick={() => setShowSearch(true)}
          className="text-white bg-white/10 rounded-full px-3 py-1.5 text-sm hover:bg-white/20"
        >
          &#128269; Search
        </button>
      </div>

      {/* ── On-screen nav arrows ── */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-1/2 top-16 -translate-x-1/2 text-white/40 hover:text-white text-3xl z-20"
        >
          &#9650;
        </button>
      )}
      {currentIndex < posts.length - 1 && (
        <button
          onClick={goNext}
          className="absolute left-1/2 bottom-4 -translate-x-1/2 text-white/40 hover:text-white text-3xl z-20"
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
      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onSearch={(q) => loadPosts(q)}
          categories={categories}
        />
      )}
    </div>
  );
}
