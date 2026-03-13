// User-side Social Feed — product discovery with search and filtering.
import { useEffect, useState } from "react";
import { fetchFeedPosts, fetchCategories, likePost, type FeedPost } from "../api/feedApi";

function PostCard({ post, onLike }: { post: FeedPost; onLike: () => void }) {
  return (
    <div className="border rounded-lg p-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
          {post.businessLogo}
        </div>
        <div>
          <p className="text-sm font-medium">{post.businessName}</p>
          <p className="text-xs text-gray-400">{post.category}</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-lg font-bold">${post.price}</span>
        </div>
      </div>

      <h3 className="font-semibold mb-1">{post.productName}</h3>
      <p className="text-sm text-gray-600 mb-2">{post.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <button onClick={onLike} className="hover:text-red-500 transition-colors">
          &#9829; {post.likes}
        </button>
        <span>&#128172; {post.comments}</span>
        <span className="ml-auto text-xs">
          AI Score: <span className="font-medium">{post.aiScore}/100</span>
        </span>
      </div>
    </div>
  );
}

export default function SocialFeed() {
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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Discover Products</h1>
      <p className="text-gray-500 text-sm mb-4">
        Browse products from businesses with transparent AI visibility scores.
      </p>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products, brands, tags..."
        className="w-full border rounded px-3 py-2 text-sm mb-3"
      />

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

      {/* Posts */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading feed...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No products found.</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
        ))
      )}
    </div>
  );
}
