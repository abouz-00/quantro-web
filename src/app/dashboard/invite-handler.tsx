'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function InviteHandler() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const inviteCode = searchParams.get('inviteCode')

  useEffect(() => {
    async function markInviteAsUsed() {
      if (inviteCode && session?.user?.email) {
        try {
          const response = await fetch('/api/mark-invite-used', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: inviteCode,
              email: session.user.email
            }),
          })

          if (response.ok) {
            console.log('Invite marked as used successfully')
            // Remove the inviteCode from URL
            const url = new URL(window.location.href)
            url.searchParams.delete('inviteCode')
            window.history.replaceState({}, '', url.pathname)
          }
        } catch (error) {
          console.error('Failed to mark invite as used:', error)
        }
      }
    }

    markInviteAsUsed()
  }, [inviteCode, session])

  return null // This component doesn't render anything
}
