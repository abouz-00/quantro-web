'use client'

import { useState, useEffect } from 'react'
import AdminBetaInvitesPage from '../../../components/AdminBetaInvitesPage'

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
  const [invites, setInvites] = useState<BetaInvite[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('')
  const [sendEmail, setSendEmail] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

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
    fetchInvites()
  }, [])

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
