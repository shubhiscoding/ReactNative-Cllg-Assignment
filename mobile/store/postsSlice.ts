import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { PostsState, Post } from "@/types";
import { api } from "@/utils/api";

const initialState: PostsState = {
  posts: [],
  hotTakes: [],
  userPosts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Fetch normal posts
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ type, page }: { type: "normal"; page: number }, { rejectWithValue }) => {
    try {
      const response = await api.getPosts({ type, page });
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch posts");
      }
      return { posts: response.data || [], page, hasMore: response.hasMore ?? false };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch posts");
    }
  }
);

// Refresh normal posts
export const refreshPosts = createAsyncThunk(
  "posts/refreshPosts",
  async (type: "normal", { rejectWithValue }) => {
    try {
      const response = await api.getPosts({ type, page: 1 });
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to refresh posts");
      }
      return { posts: response.data || [], hasMore: response.hasMore ?? false };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to refresh posts");
    }
  }
);

// Fetch hot takes
export const fetchHotTakes = createAsyncThunk(
  "posts/fetchHotTakes",
  async ({ page }: { page: number }, { rejectWithValue }) => {
    try {
      const response = await api.getPosts({ type: "hottake", page });
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch hot takes");
      }
      return { posts: response.data || [], page, hasMore: response.hasMore ?? false };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch hot takes");
    }
  }
);

// Refresh hot takes
export const refreshHotTakes = createAsyncThunk(
  "posts/refreshHotTakes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getPosts({ type: "hottake", page: 1 });
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to refresh hot takes");
      }
      return { posts: response.data || [], hasMore: response.hasMore ?? false };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to refresh hot takes");
    }
  }
);

// Fetch user's posts
export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getUserPosts();
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to fetch user posts");
      }
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user posts");
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (
    data: { content: string; isAnonymous: boolean; isHotTake: boolean; imageUrl?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.createPost(data);
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || "Failed to create post");
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create post");
    }
  }
);

// Vote on post
export const votePost = createAsyncThunk(
  "posts/votePost",
  async ({ postId, value }: { postId: string; value: 1 | -1 }, { rejectWithValue }) => {
    try {
      const response = await api.votePost(postId, value);
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || "Failed to vote");
      }
      return { postId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to vote");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.hotTakes = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh Posts
      .addCase(refreshPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.page = 1;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(refreshPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Hot Takes
      .addCase(fetchHotTakes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotTakes.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.hotTakes = action.payload.posts;
        } else {
          state.hotTakes = [...state.hotTakes, ...action.payload.posts];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchHotTakes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh Hot Takes
      .addCase(refreshHotTakes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshHotTakes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotTakes = action.payload.posts;
        state.page = 1;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(refreshHotTakes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isHotTake) {
          state.hotTakes = [action.payload, ...state.hotTakes];
        } else {
          state.posts = [action.payload, ...state.posts];
        }
        state.userPosts = [action.payload, ...state.userPosts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Vote Post
      .addCase(votePost.fulfilled, (state, action) => {
        const { postId, upvotes, downvotes, userVote } = action.payload;
        
        // Update in posts array
        const postIndex = state.posts.findIndex((p) => p.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].upvotes = upvotes;
          state.posts[postIndex].downvotes = downvotes;
          state.posts[postIndex].userVote = userVote;
        }
        
        // Update in hotTakes array
        const hotTakeIndex = state.hotTakes.findIndex((p) => p.id === postId);
        if (hotTakeIndex !== -1) {
          state.hotTakes[hotTakeIndex].upvotes = upvotes;
          state.hotTakes[hotTakeIndex].downvotes = downvotes;
          state.hotTakes[hotTakeIndex].userVote = userVote;
        }
        
        // Update in userPosts array
        const userPostIndex = state.userPosts.findIndex((p) => p.id === postId);
        if (userPostIndex !== -1) {
          state.userPosts[userPostIndex].upvotes = upvotes;
          state.userPosts[userPostIndex].downvotes = downvotes;
          state.userPosts[userPostIndex].userVote = userVote;
        }
      });
  },
});

export const { clearPosts } = postsSlice.actions;
export default postsSlice.reducer;

