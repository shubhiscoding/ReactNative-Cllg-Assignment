import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Comment } from "@/types";
import { api } from "@/utils/api";

interface CommentSectionProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function CommentSection({ postId, isVisible, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible, postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await api.getComments(postId);
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.createComment(postId, {
        content: newComment.trim(),
        isAnonymous,
      });
      if (response.success && response.data) {
        setComments([response.data, ...comments]);
        setNewComment("");
        setIsAnonymous(false);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!isVisible) return null;

  const renderComment = ({ item }: { item: Comment }) => (
    <View className="bg-cream border-2 border-secondary rounded-xl p-3 mb-2">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 bg-primary/20 border-2 border-secondary rounded-full items-center justify-center mr-2">
          <Text className="text-sm">
            {item.isAnonymous ? "🎭" : item.author?.displayName?.[0] || "?"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-bold text-secondary text-sm">
            {item.isAnonymous ? "Anonymous" : item.author?.displayName || "Unknown"}
          </Text>
          <Text className="font-sans text-muted text-xs">
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
      <Text className="font-sans text-secondary">{item.content}</Text>
    </View>
  );

  return (
    <View className="border-t-2 border-secondary mt-4 pt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-bold text-secondary">
          Comments ({comments.length})
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      {/* New Comment Input */}
      <View className="mb-4">
        <View className="flex-row items-center bg-white border-2 border-secondary rounded-xl overflow-hidden">
          <TextInput
            className="flex-1 px-3 py-2 font-sans text-secondary"
            placeholder="Add a comment..."
            placeholderTextColor="#6B7280"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={280}
          />
          <TouchableOpacity
            onPress={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
            className={`p-3 ${
              newComment.trim() ? "bg-primary" : "bg-muted/20"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={newComment.trim() ? "#FFF" : "#6B7280"}
              />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="flex-row items-center mt-2"
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: "#E5E7EB", true: "#FF6B35" }}
            thumbColor="#FFFEF5"
            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
          />
          <Text className="font-sans text-muted text-sm ml-1">
            Post anonymously
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      {isLoading ? (
        <View className="py-8">
          <ActivityIndicator size="small" color="#FF6B35" />
        </View>
      ) : comments.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-2xl mb-2">💬</Text>
          <Text className="font-sans text-muted">No comments yet</Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

