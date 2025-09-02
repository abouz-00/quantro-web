'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InviteData {
  valid: boolean
  email: string
  code: string
  expiresAt: string | null
}

interface BetaInvitePageProps {
  code: string | null
}

export default function BetaInvitePage({ code }: BetaInvitePageProps) {
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!code) {
      setError('No invite code provided')
      setLoading(false)
      return
    }

    // Validate the invite code
    fetch(`/api/beta-invite?code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setInviteData(data)
        }
      })
      .catch(err => {
        setError('Failed to validate invite')
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [code])

  const acceptInvite = async () => {
    if (!code) return

    setAccepting(true)
    try {
      const response = await fetch('/api/beta-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          action: 'accept'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAccepted(true)
        // Redirect to sign in with the invite code so it can be marked as used after successful auth
        setTimeout(() => {
          window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard?inviteCode=${code}`)}`
        }, 3000)
      } else {
        setError(data.error || 'Failed to accept invite')
      }
    } catch (err) {
      setError('Failed to accept invite')
      console.error(err)
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your invite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Quantro!</h1>
          <p className="text-gray-600 mb-4">
            Your beta invite has been accepted. You can now sign in to access the app.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard?inviteCode=${code}`)}`}
              className="block w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Sign In Now
            </button>
            <p className="text-sm text-gray-500">
              Or wait 3 seconds for automatic redirect...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="text-blue-500 text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Invited!</h1>
          <p className="text-gray-600">
            You&apos;ve been invited to join the Quantro beta
          </p>
        </div>

        {inviteData && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Invite Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {inviteData.email}
                </div>
                <div>
                  <span className="font-medium">Code:</span>
                  <code className="ml-2 bg-gray-200 px-2 py-1 rounded">{inviteData.code}</code>
                </div>
                {inviteData.expiresAt && (
                  <div>
                    <span className="font-medium">Expires:</span> {new Date(inviteData.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={acceptInvite}
                disabled={accepting}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {accepting ? 'Accepting...' : 'Accept Invite & Join Beta'}
              </button>

              <Link
                href="/"
                className="block w-full text-center bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Maybe Later
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
