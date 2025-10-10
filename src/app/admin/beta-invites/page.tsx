'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminBetaInvitesPage from '../../../components/admin'

interface BetaInvite {
  id: string
  email: string
  code: string
  used: boolean
  usedAt: string | null
  revoked: boolean
  revokedAt: string | null
  createdAt: string
  expiresAt: string | null
}

export default function AdminBetaInvites() {
  const { status } = useSession()
  const router = useRouter()
  const [invites, setInvites] = useState<BetaInvite[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('')
  const [sendEmail, setSendEmail] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const revokeInvite = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke the invite for ${email}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/beta-invites', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'revoke'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Beta invite for ${email} has been revoked`)
        fetchInvites() // Refresh the list
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error revoking invite: ${error}`)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInvites()
    }
  }, [status])

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/admin/beta-invites')
      const data = await response.json()
      if (data.invites) {
        setInvites(data.invites)
      }
    } catch (error) {
      console.error('Error fetching invites:', error)
    }
  }

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/beta-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          expiresInDays: expiresInDays || undefined,
          sendEmail: sendEmail
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Beta invite created for ${newEmail}`)
        setNewEmail('')
        setExpiresInDays('')
        fetchInvites() // Refresh the list
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error creating invite: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <AdminBetaInvitesPage
      invites={invites}
      setInvites={setInvites}
      newEmail={newEmail}
      setNewEmail={setNewEmail}
      expiresInDays={expiresInDays}
      setExpiresInDays={setExpiresInDays}
      sendEmail={sendEmail}
      setSendEmail={setSendEmail}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      message={message}
      setMessage={setMessage}
      onCreateInvite={createInvite}
      onRevokeInvite={revokeInvite}
    />
  )
}
