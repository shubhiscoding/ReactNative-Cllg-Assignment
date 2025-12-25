import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "@/types";
import { Card } from "@/components/ui/Card";
import { VoteButtons } from "@/components/VoteButtons";
import { CommentSection } from "@/components/CommentSection";

interface PostCardProps {
  post: Post;
  isHotTake?: boolean;
  showActions?: boolean;
}

export function PostCard({ post, isHotTake = false, showActions = true }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View
          className={`w-10 h-10 ${
            isHotTake ? "bg-danger/20" : "bg-primary/20"
          } border-2 border-secondary rounded-full items-center justify-center mr-3`}
        >
          <Text className="text-lg">
            {post.isAnonymous
              ? "🎭"
              : post.isHotTake
              ? "🔥"
              : post.author?.displayName?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-bold text-secondary">
              {post.isAnonymous ? "Anonymous" : post.author?.displayName || "Unknown"}
            </Text>
            {post.isHotTake && (
              <View className="ml-2 bg-danger/20 px-2 py-0.5 rounded-full flex-row items-center">
                <Text className="text-xs">🔥</Text>
                <Text className="font-bold text-danger text-xs ml-0.5">
                  HOT TAKE
                </Text>
              </View>
            )}
          </View>
          <Text className="font-sans text-muted text-xs">
            {formatTime(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text className="font-sans text-secondary text-base leading-6 mb-4">
        {post.content}
      </Text>

      {/* Actions */}
      {showActions && (
        <View className="flex-row items-center justify-between border-t-2 border-secondary/10 pt-3">
          {/* Vote Buttons */}
          <VoteButtons
            postId={post.id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.userVote}
          />

          {/* Comments Button */}
          <TouchableOpacity
            onPress={() => setShowComments(!showComments)}
            className="flex-row items-center p-2"
            activeOpacity={0.7}
          >
            <Ionicons
              name={showComments ? "chatbubble" : "chatbubble-outline"}
              size={20}
              color={showComments ? "#FF6B35" : "#6B7280"}
            />
            <Text
              className={`font-sans text-sm ml-1 ${
                showComments ? "text-primary" : "text-muted"
              }`}
            >
              {post.commentCount || 0}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comment Section */}
      {showActions && (
        <CommentSection
          postId={post.id}
          isVisible={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </Card>
  );
}

