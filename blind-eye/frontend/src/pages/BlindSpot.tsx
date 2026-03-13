import { useEffect, useState } from "react";
import { fetchFeedPosts, type FeedPost } from "../api/feedApi";

function ProductCard({ post }: { post: FeedPost }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold">
          {post.businessLogo}
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1">{post.businessName}</p>
        <h3 className="text-sm font-semibold mb-1">{post.productName}</h3>
        <p className="text-sm font-bold text-gray-900">${post.price}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>
            {post.businessSize === "local" ? "Local Business" : "Mainstream Brand"}
          </span>
          <span>AI: {post.aiScore}/100</span>
        </div>
        {post.uniquenessScore != null && (
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <p className="text-xs text-gray-400">Uniqueness</p>
              <div className="bg-gray-200 rounded-full h-1.5 mt-0.5">
                <div
                  className="bg-teal-500 h-1.5 rounded-full"
                  style={{ width: `${post.uniquenessScore}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Relevance</p>
              <div className="bg-gray-200 rounded-full h-1.5 mt-0.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${post.relevanceScore ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlindSpot() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [sizeFilter, setSizeFilter] = useState<"local" | "mainstream">("local");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFeedPosts(undefined, undefined, sizeFilter)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sizeFilter]);

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-1">Blind Spot</h1>
      <p className="text-gray-500 text-sm mb-4">
        See what's behind the algorithm. Discover local businesses or compare with mainstream brands.
      </p>

      {/* Local / Mainstream Toggle */}
      <div className="flex gap-0 mb-6 border rounded-lg overflow-hidden w-fit">
        <button
          onClick={() => setSizeFilter("local")}
          className={`px-6 py-2 text-sm font-medium ${
            sizeFilter === "local"
              ? "bg-teal-100 text-teal-700"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setSizeFilter("mainstream")}
          className={`px-6 py-2 text-sm font-medium border-l ${
            sizeFilter === "mainstream"
              ? "bg-teal-100 text-teal-700"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Mainstream
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading products...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <ProductCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
