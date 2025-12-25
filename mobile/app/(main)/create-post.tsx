import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { createPost } from "@/store/postsSlice";
import { Button } from "@/components/ui/Button";

export default function CreatePost() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.posts);
  const { user } = useSelector((state: RootState) => state.auth);

  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isHotTake, setIsHotTake] = useState(false);

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Oops!", "Please write something before posting.");
      return;
    }

    const result = await dispatch(
      createPost({
        content: content.trim(),
        isAnonymous,
        isHotTake,
      })
    );

    if (createPost.fulfilled.match(result)) {
      setContent("");
      setIsAnonymous(false);
      setIsHotTake(false);
      Alert.alert("Posted! 🎉", "Your yap is now live.", [
        {
          text: "View Feed",
          onPress: () => router.push(isHotTake ? "/(main)/hot-takes" : "/(main)/feed"),
        },
        { text: "Post Another", style: "cancel" },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-4 py-4 border-b-3 border-secondary">
            <Text className="font-bold text-2xl text-secondary">New Yap</Text>
            <Text className="font-sans text-muted text-sm">
              Share with {user?.schoolName || "your college"}
            </Text>
          </View>

          <View className="flex-1 p-4">
            {/* Post Author Preview */}
            <View className="flex-row items-center mb-4 bg-white border-3 border-secondary rounded-xl p-3 shadow-brutal-sm">
              <View className="w-10 h-10 bg-primary border-2 border-secondary rounded-full items-center justify-center mr-3">
                <Text className="text-lg">
                  {isAnonymous ? "🎭" : user?.displayName?.[0]?.toUpperCase() || "Y"}
                </Text>
              </View>
              <View>
                <Text className="font-bold text-secondary">
                  {isAnonymous ? "Anonymous" : user?.displayName || "You"}
                </Text>
                <Text className="font-sans text-muted text-xs">
                  Posting to {user?.schoolName || "your college"}
                </Text>
              </View>
            </View>

            {/* Content Input */}
            <View className="bg-white border-3 border-secondary rounded-xl p-4 shadow-brutal mb-4">
              <TextInput
                className="font-sans text-secondary text-base min-h-[150]"
                placeholder="What's on your mind? Start yapping..."
                placeholderTextColor="#6B7280"
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={maxLength}
                textAlignVertical="top"
              />
              <View className="flex-row justify-end mt-2">
                <Text
                  className={`font-sans text-sm ${
                    remainingChars < 50 ? "text-danger" : "text-muted"
                  }`}
                >
                  {remainingChars}
                </Text>
              </View>
            </View>

            {/* Options */}
            <View className="space-y-3">
              {/* Anonymous Toggle */}
              <TouchableOpacity
                className="flex-row items-center justify-between bg-white border-3 border-secondary rounded-xl p-4 shadow-brutal-sm"
                onPress={() => setIsAnonymous(!isAnonymous)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">🎭</Text>
                  <View>
                    <Text className="font-bold text-secondary">Post Anonymously</Text>
                    <Text className="font-sans text-muted text-xs">
                      Your name won't be shown
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: "#E5E7EB", true: "#FF6B35" }}
                  thumbColor={isAnonymous ? "#FFFEF5" : "#FFFEF5"}
                />
              </TouchableOpacity>

              {/* Hot Take Toggle */}
              <TouchableOpacity
                className="flex-row items-center justify-between bg-white border-3 border-secondary rounded-xl p-4 shadow-brutal-sm"
                onPress={() => setIsHotTake(!isHotTake)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">🔥</Text>
                  <View>
                    <Text className="font-bold text-secondary">Hot Take</Text>
                    <Text className="font-sans text-muted text-xs">
                      Spicy opinion? Mark it hot!
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isHotTake}
                  onValueChange={setIsHotTake}
                  trackColor={{ false: "#E5E7EB", true: "#FF6B6B" }}
                  thumbColor={isHotTake ? "#FFFEF5" : "#FFFEF5"}
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <View className="mt-6">
              <Button
                title={isLoading ? "Posting..." : "Post Yap 🗣️"}
                onPress={handleSubmit}
                disabled={isLoading || !content.trim()}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

