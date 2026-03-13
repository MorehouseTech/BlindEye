import client from "./client";

export interface FeedPost {
  id: number;
  businessName: string;
  businessLogo: string;
  productName: string;
  category: string;
  price: number;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  aiScore: number;
  mediaGradient?: string;
  mediaEmoji?: string;
  businessSize?: "local" | "mainstream";
  uniquenessScore?: number;
  relevanceScore?: number;
}

// Fallback feed data if API is unreachable
const FALLBACK_POSTS: FeedPost[] = [
  {
    id: 1, businessName: "Solebound", businessLogo: "SB",
    productName: "Apex Runner", category: "Running Shoes", price: 129.99,
    description: "Sustainable running shoes made from 100% recycled materials. Breathable mesh upper, recycled rubber sole.",
    tags: ["sustainable", "running", "eco-friendly"], likes: 342, comments: 28, aiScore: 71,
    mediaGradient: "linear-gradient(135deg, #34d399, #0d9488)", mediaEmoji: "\uD83D\uDC5F",
    businessSize: "local", uniquenessScore: 82, relevanceScore: 91,
  },
  {
    id: 2, businessName: "GreenThread Co.", businessLogo: "GT",
    productName: "EcoWeave Tee", category: "Apparel", price: 34.99,
    description: "Organic cotton t-shirt with water-based dyes. Carbon-neutral production process.",
    tags: ["organic", "apparel", "carbon-neutral"], likes: 518, comments: 45, aiScore: 85,
    mediaGradient: "linear-gradient(135deg, #a3e635, #16a34a)", mediaEmoji: "\uD83D\uDC55",
    businessSize: "local", uniquenessScore: 67, relevanceScore: 78,
  },
  {
    id: 3, businessName: "PureHome", businessLogo: "PH",
    productName: "BambooBlend Towel Set", category: "Home Goods", price: 49.99,
    description: "Ultra-soft bamboo fiber towels. Naturally antibacterial, quick-drying.",
    tags: ["bamboo", "home", "sustainable"], likes: 203, comments: 15, aiScore: 62,
    mediaGradient: "linear-gradient(135deg, #38bdf8, #2563eb)", mediaEmoji: "\uD83D\uDEC1",
    businessSize: "local", uniquenessScore: 74, relevanceScore: 65,
  },
];

const FALLBACK_CATEGORIES = ["All", "Apparel", "Electronics", "Food & Beverage", "Hiking Boots", "Home Goods", "Running Shoes"];

export async function fetchFeedPosts(
  category?: string,
  search?: string,
  size?: "local" | "mainstream",
): Promise<FeedPost[]> {
  const params: Record<string, string> = {};
  if (category && category !== "All") params.category = category;
  if (search) params.search = search;
  if (size) params.size = size;

  try {
    const { data } = await client.get<{ posts: FeedPost[] }>("/feed/posts", { params });
    return data.posts;
  } catch {
    console.log("[BlindEye] FALLBACK: Using offline feed data");
    return FALLBACK_POSTS;
  }
}

export async function fetchCategories(): Promise<string[]> {
  try {
    const { data } = await client.get<{ categories: string[] }>("/feed/categories");
    return data.categories;
  } catch {
    console.log("[BlindEye] FALLBACK: Using offline categories");
    return FALLBACK_CATEGORIES;
  }
}

export async function likePost(postId: number): Promise<void> {
  try {
    await client.post("/feed/like", { post_id: postId });
  } catch {
    console.log("[BlindEye] FALLBACK: Like recorded locally only (post_id=%d)", postId);
  }
}
