class UserService {
  async updateProfile(userId: string, data: ProfileForm): Promise<void>
  async getProfile(userId: string): Promise<UserProfile>
  async updatePreferences(userId: string, preferences: UserPreferences): Promise<void>
  async getPreferences(userId: string): Promise<UserPreferences>
} 