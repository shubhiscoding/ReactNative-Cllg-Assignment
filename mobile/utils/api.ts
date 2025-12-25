import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Post, 
  Comment,
  LoginCredentials,
  RegisterCredentials,
  OTPVerification
} from "@/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || "Request failed",
        };
      }

      return {
        success: true,
        data: data.data || data,
        ...data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ message: string }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async verifyOTP(data: OTPVerification): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async requestLoginOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request("/auth/login-otp/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verifyLoginOTP(data: OTPVerification): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/login-otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Posts endpoints
  async getPosts({ 
    type, 
    page = 1 
  }: { 
    type: "normal" | "hottake"; 
    page?: number 
  }): Promise<PaginatedResponse<Post>> {
    const response = await this.request<Post[]>(
      `/posts?type=${type}&page=${page}&limit=10`
    );
    return {
      success: response.success,
      data: response.data || [],
      page,
      totalPages: (response as any).totalPages || 1,
      hasMore: (response as any).hasMore ?? false,
    };
  }

  async getUserPosts(): Promise<ApiResponse<Post[]>> {
    return this.request("/posts/me");
  }

  async createPost(data: {
    content: string;
    isAnonymous: boolean;
    isHotTake: boolean;
    imageUrl?: string;
  }): Promise<ApiResponse<Post>> {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async votePost(
    postId: string,
    value: 1 | -1
  ): Promise<ApiResponse<{ upvotes: number; downvotes: number; userVote: 1 | -1 | null }>> {
    return this.request(`/posts/${postId}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    });
  }

  // Comments endpoints
  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return this.request(`/posts/${postId}/comments`);
  }

  async createComment(
    postId: string,
    data: { content: string; isAnonymous: boolean }
  ): Promise<ApiResponse<Comment>> {
    return this.request(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Profile endpoint
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request("/profile");
  }
}

export const api = new ApiClient();

