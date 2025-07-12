import { useUserProfile } from "./useUserProfile"

export const useLoggedInState = (): 'loading' | 'logged-in' | 'logged-out' => {
    const { data: userProfile, isLoading } = useUserProfile();
    
    if (isLoading) {
        return 'loading';
    }
    
    return userProfile ? 'logged-in' : 'logged-out';
}