// src/components/landing/types.ts
export interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
}

export interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
  isSigningIn: boolean;
}
