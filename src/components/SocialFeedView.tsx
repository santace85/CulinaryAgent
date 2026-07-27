import React, { useState } from "react";
import { CommunityPost, Recipe } from "../types";
import { saveStoredPosts } from "../utils/storage";
import {
  Heart,
  MessageSquare,
  Share2,
  Users,
  Plus,
  Send,
  Star,
  CheckCircle2,
  Sparkles,
  Utensils,
  Maximize2,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface SocialFeedViewProps {
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  favoriteRecipes: Recipe[];
  onCookRecipe: (recipe: Recipe) => void;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  posts,
  setPosts,
  favoriteRecipes,
  onCookRecipe,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [authorName, setAuthorName] = useState("Chef Gourmet");
  const [captionText, setCaptionText] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentRatings, setCommentRatings] = useState<Record<string, number>>({});

  // Toggle Like on post
  const handleToggleLike = (postId: string) => {
    const updated = posts.map((post) => {
      if (post.id === postId) {
        const hasLiked = !post.hasLiked;
        return {
          ...post,
          hasLiked,
          likesCount: hasLiked ? post.likesCount + 1 : post.likesCount - 1,
        };
      }
      return post;
    });
    setPosts(updated);
    saveStoredPosts(updated);
  };

  // Add Comment on post
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const rating = commentRatings[postId] || 5;

    const updated = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: "c_" + Date.now(),
              authorName: authorName || "Home Chef",
              text,
              createdAt: "Just now",
              rating,
            },
          ],
        };
      }
      return post;
    });

    setPosts(updated);
    saveStoredPosts(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  // Submit New Post
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionText.trim()) return;

    const recipeToAttach =
      favoriteRecipes.find((r) => r.id === selectedRecipeId) || favoriteRecipes[0];

    const newPost: CommunityPost = {
      id: "post_" + Date.now(),
      authorName: authorName.trim() || "Passionate Foodie",
      authorBadge: "Culinary Community Member",
      caption: captionText.trim(),
      recipe: recipeToAttach || {
        id: "custom_" + Date.now(),
        title: "Home Cooked Special",
        summary: "A delicious home cooked creation!",
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
        servings: 4,
        difficulty: "Easy",
        calories: 450,
        cuisine: "Homemade",
        dietaryTags: ["Chef Special"],
        ingredients: [],
        steps: [],
        substitutions: [],
      },
      likesCount: 1,
      hasLiked: true,
      comments: [],
      createdAt: "Just now",
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    saveStoredPosts(updated);

    setShowShareModal(false);
    setCaptionText("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Culinary Creations Feed
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20">
                Community 🍝
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Share your cooked dishes, view friends' creations, leave comments & ratings
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-xs sm:text-sm hover:brightness-110 shadow-md shadow-orange-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Share My Creation</span>
        </button>
      </div>

      {/* Share Creation Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" /> Share Your Culinary Creation
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Your Chef Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Attach Saved Recipe (Optional)</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select a recipe from your favorites...</option>
                  {favoriteRecipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Caption / Culinary Experience</label>
                <textarea
                  rows={3}
                  placeholder="How did your dish turn out? Any special tweaks or substitutions you made?"
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!captionText.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold hover:brightness-110 disabled:opacity-50"
                >
                  Publish Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feed Posts Stream */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            {/* Author Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md text-sm">
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {post.authorName}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400">{post.authorBadge || "Home Chef"} • {post.createdAt}</p>
                </div>
              </div>
            </div>

            {/* Caption */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">{post.caption}</p>

            {/* Attached Recipe Box */}
            {post.recipe && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Utensils className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-sm text-white">{post.recipe.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{post.recipe.summary}</p>
                </div>

                <button
                  onClick={() => onCookRecipe(post.recipe)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold hover:bg-orange-500/30 transition-all shrink-0"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Interactive Cooking View</span>
                </button>
              </div>
            )}

            {/* Social Action Bar: Likes & Comment Count */}
            <div className="flex items-center space-x-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <button
                onClick={() => handleToggleLike(post.id)}
                className={`flex items-center space-x-1.5 font-semibold transition-all ${
                  post.hasLiked ? "text-rose-400" : "hover:text-rose-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${post.hasLiked ? "fill-rose-400 text-rose-400" : ""}`} />
                <span>{post.likesCount} Likes</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>{post.comments.length} Comments</span>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-2 pt-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-amber-300">{comment.authorName}</span>
                    <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-slate-300">{comment.text}</p>
                </div>
              ))}

              {/* Add Comment Box */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="Write a comment or rating..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  disabled={!commentInputs[post.id]?.trim()}
                  className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
