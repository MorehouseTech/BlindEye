import { useEffect, useState } from "react";
import { fetchFeedPosts, fetchCategories, likePost, type FeedPost } from "../api/feedApi";

function ProductCard({ post, onLike }: { post: FeedPost; onLike: () => void }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold">
          {post.businessLogo}
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400">{post.businessName}</p>
        <h3 className="text-sm font-semibold mb-1">{post.productName}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{post.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">${post.price}</span>
          <button onClick={onLike} className="text-gray-400 hover:text-red-500 text-lg">
            &#9829; <span className="text-xs">{post.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFeedPosts(selectedCategory, search)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
    likePost(postId).catch(() => {});
  };

  return (
    <div className="flex-1 p-6">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, brands, tags..."
          className="w-full border rounded-lg px-4 py-2.5 text-sm bg-gray-50"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3 py-1 rounded-full border ${
              selectedCategory === cat
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <ProductCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
