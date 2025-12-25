import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { votePost } from "@/store/postsSlice";

interface VoteButtonsProps {
  postId: string;
  upvotes: number;
  downvotes: number;
  userVote?: 1 | -1 | null;
  size?: "sm" | "md";
}

export function VoteButtons({
  postId,
  upvotes,
  downvotes,
  userVote,
  size = "md",
}: VoteButtonsProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleVote = (value: 1 | -1) => {
    dispatch(votePost({ postId, value }));
  };

  const score = upvotes - downvotes;
  const iconSize = size === "sm" ? 18 : 22;
  const padding = size === "sm" ? "p-1" : "p-2";

  return (
    <View className="flex-row items-center">
      {/* Upvote Button */}
      <TouchableOpacity
        onPress={() => handleVote(1)}
        className={`${padding} rounded-lg ${
          userVote === 1 ? "bg-accent/20" : ""
        }`}
        activeOpacity={0.7}
      >
        <Ionicons
          name={userVote === 1 ? "arrow-up-circle" : "arrow-up-circle-outline"}
          size={iconSize}
          color={userVote === 1 ? "#4ECDC4" : "#6B7280"}
        />
      </TouchableOpacity>

      {/* Score */}
      <View className="mx-1 min-w-[30] items-center">
        <Text
          className={`font-bold ${
            score > 0
              ? "text-accent"
              : score < 0
              ? "text-danger"
              : "text-muted"
          } ${size === "sm" ? "text-sm" : "text-base"}`}
        >
          {score}
        </Text>
      </View>

      {/* Downvote Button */}
      <TouchableOpacity
        onPress={() => handleVote(-1)}
        className={`${padding} rounded-lg ${
          userVote === -1 ? "bg-danger/20" : ""
        }`}
        activeOpacity={0.7}
      >
        <Ionicons
          name={userVote === -1 ? "arrow-down-circle" : "arrow-down-circle-outline"}
          size={iconSize}
          color={userVote === -1 ? "#FF6B6B" : "#6B7280"}
        />
      </TouchableOpacity>
    </View>
  );
}

