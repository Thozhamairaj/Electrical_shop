import { SignIn, SignUp } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import './Auth.css';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const isSignUp = mode === 'signup';

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isSignUp ? (
          <SignUp
            appearance={{
              elements: {
                rootBox: 'auth-clerk-root',
                card: 'auth-clerk-card',
              },
            }}
            routing="hash"
            signInUrl="/auth"
            afterSignUpUrl="/"
          />
        ) : (
          <SignIn
            appearance={{
              elements: {
                rootBox: 'auth-clerk-root',
                card: 'auth-clerk-card',
              },
            }}
            routing="hash"
            signUpUrl="/auth?mode=signup"
            afterSignInUrl="/"
          />
        )}
      </div>
    </div>
  );
}
