import { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPosts, refreshPosts } from "@/store/postsSlice";
import { PostCard } from "@/components/PostCard";
import { Post } from "@/types";

export default function Feed() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, isLoading, hasMore, page } = useSelector(
    (state: RootState) => state.posts
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchPosts({ type: "normal", page: 1 }));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(refreshPosts("normal"));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      dispatch(fetchPosts({ type: "normal", page: page + 1 }));
    }
  }, [dispatch, hasMore, isLoading, page]);

  const renderPost = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} />,
    []
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-6xl mb-4">📭</Text>
      <Text className="font-bold text-xl text-secondary">No posts yet</Text>
      <Text className="font-sans text-muted text-center mt-2 px-8">
        Be the first to share something with your college community!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || posts.length === 0) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#FF6B35" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 border-b-3 border-secondary bg-cream">
        <Text className="font-bold text-2xl text-secondary">Yappers</Text>
        <Text className="font-sans text-muted text-sm">
          {user?.schoolName || "Your College Feed"}
        </Text>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
            tintColor="#FF6B35"
            colors={["#FF6B35"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

