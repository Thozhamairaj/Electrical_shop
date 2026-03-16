import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userService } from '../services/userService';

const UserSync = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const sync = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          await userService.syncUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            profileImageUrl: user.imageUrl,
          });
        } catch (error) {
          console.error('User sync failed:', error);
        }
      }
    };

    sync();
  }, [isLoaded, isSignedIn, user]);

  return null;
};

export default UserSync;
