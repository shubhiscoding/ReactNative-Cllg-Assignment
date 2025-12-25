// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  schoolId: string;
  schoolName: string;
  isVerified: boolean;
  createdAt: string;
}

// School types
export interface School {
  id: string;
  domain: string;
  name: string;
  createdAt: string;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  schoolId: string;
  content: string;
  imageUrl?: string;
  isAnonymous: boolean;
  isHotTake: boolean;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: 1 | -1 | null;
  author?: {
    displayName: string;
  };
  createdAt: string;
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  author?: {
    displayName: string;
  };
  createdAt: string;
}

// Vote types
export interface Vote {
  id: string;
  userId: string;
  postId: string;
  value: 1 | -1;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

// Posts state
export interface PostsState {
  posts: Post[];
  hotTakes: Post[];
  userPosts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  totalPages: number;
  hasMore: boolean;
  error?: string;
}

