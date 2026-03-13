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
}

export async function fetchFeedPosts(category?: string, search?: string): Promise<FeedPost[]> {
  const params: Record<string, string> = {};
  if (category && category !== "All") params.category = category;
  if (search) params.search = search;

  const { data } = await client.get<{ posts: FeedPost[] }>("/feed/posts", { params });
  return data.posts;
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await client.get<{ categories: string[] }>("/feed/categories");
  return data.categories;
}

export async function likePost(postId: number): Promise<void> {
  await client.post("/feed/like", { post_id: postId });
}
