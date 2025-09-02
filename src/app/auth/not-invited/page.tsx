"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotInvitedPage from '../../../components/NotInvitedPage';

export default function NotInvited() {
  const [betaCode, setBetaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!betaCode.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Validate the beta code
      const response = await fetch(`/api/beta-invite?code=${betaCode.trim()}`);
      const data = await response.json();

      if (data.valid) {
        // Redirect to the beta invite page to accept the invite
        router.push(`/beta-invite?code=${betaCode.trim()}`);
      } else {
        setError(data.error || 'Invalid beta code. Please check your code and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NotInvitedPage
      betaCode={betaCode}
      setBetaCode={setBetaCode}
      isSubmitting={isSubmitting}
      error={error}
      onSubmitCode={handleSubmitCode}
    />
  );
}
