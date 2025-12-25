import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { fetchUserPosts } from "@/store/postsSlice";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/Button";
import { Post } from "@/types";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userPosts, isLoading } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    dispatch(fetchUserPosts());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchUserPosts());
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await dispatch(logout());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const renderPost = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} showActions={false} />,
    []
  );

  const renderHeader = () => (
    <View className="mb-6">
      {/* Profile Card */}
      <View className="bg-white border-3 border-secondary rounded-2xl p-6 shadow-brutal">
        {/* Avatar */}
        <View className="items-center mb-4">
          <View className="w-20 h-20 bg-primary border-3 border-secondary rounded-full items-center justify-center mb-3 shadow-brutal-sm">
            <Text className="text-3xl">
              {user?.displayName?.[0]?.toUpperCase() || "Y"}
            </Text>
          </View>
          <Text className="font-bold text-2xl text-secondary">
            {user?.displayName || "Yapper"}
          </Text>
          <Text className="font-sans text-muted">{user?.email}</Text>
        </View>

        {/* School Badge */}
        <View className="bg-cream border-2 border-secondary rounded-xl p-3 items-center mb-4">
          <Text className="text-xl mb-1">🎓</Text>
          <Text className="font-bold text-secondary">
            {user?.schoolName || "Your School"}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around border-t-2 border-secondary pt-4">
          <View className="items-center">
            <Text className="font-bold text-2xl text-secondary">
              {userPosts.length}
            </Text>
            <Text className="font-sans text-muted text-sm">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold text-2xl text-secondary">
              {userPosts.reduce((acc, post) => acc + post.upvotes, 0)}
            </Text>
            <Text className="font-sans text-muted text-sm">Upvotes</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold text-2xl text-secondary">
              {userPosts.filter((p) => p.isHotTake).length}
            </Text>
            <Text className="font-sans text-muted text-sm">Hot Takes</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        className="mt-4 bg-danger/10 border-2 border-danger rounded-xl p-4 items-center"
        onPress={handleLogout}
      >
        <Text className="font-bold text-danger">Logout</Text>
      </TouchableOpacity>

      {/* My Posts Header */}
      <View className="mt-6 mb-2">
        <Text className="font-bold text-xl text-secondary">My Yaps</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="items-center py-10">
      <Text className="text-4xl mb-3">🤫</Text>
      <Text className="font-bold text-secondary">No posts yet</Text>
      <Text className="font-sans text-muted text-center mt-1">
        Start yapping to see your posts here!
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 border-b-3 border-secondary bg-cream">
        <Text className="font-bold text-2xl text-secondary">Profile</Text>
      </View>

      <FlatList
        data={userPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View className="h-4" />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#FF6B35"
            colors={["#FF6B35"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

