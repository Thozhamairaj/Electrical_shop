const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`;

export const userService = {
    syncUser: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            return await response.json();
        } catch (error) {
            console.error('Error syncing user:', error);
            throw error;
        }
    },

    getUserProfile: async (clerkId) => {
        try {
            const response = await fetch(`${API_URL}/profile/${clerkId}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Failed to fetch profile');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    },

    updateUserProfile: async (clerkId, profileData) => {
        try {
            const response = await fetch(`${API_URL}/profile/${clerkId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },
};
