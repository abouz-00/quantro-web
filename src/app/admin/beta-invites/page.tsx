'use client'

import { useState, useEffect } from 'react'

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Beta Invites Admin</h1>
      
      {/* Create New Invite Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Beta Invite</h2>
        
        <form onSubmit={createInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="expires" className="block text-sm font-medium text-gray-700 mb-1">
              Expires In (Days) - Optional
            </label>
            <input
              type="number"
              id="expires"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
              min="1"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-700">
              Send email invitation to user
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Invite'}
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-3 rounded-md bg-gray-100">
            {message}
          </div>
        )}
      </div>

      {/* Existing Invites List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Beta Invites</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Code</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Created</th>
                <th className="text-left py-2 px-4">Expires</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No beta invites found
                  </td>
                </tr>
              ) : (
                invites.map((invite) => {
                  const getStatusInfo = () => {
                    if (invite.revoked) {
                      return { text: 'Revoked', class: 'bg-red-100 text-red-800' }
                    } else if (invite.used) {
                      return { text: 'Used', class: 'bg-green-100 text-green-800' }
                    } else if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
                      return { text: 'Expired', class: 'bg-gray-100 text-gray-800' }
                    } else {
                      return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' }
                    }
                  }
                  
                  const status = getStatusInfo()
                  const canRevoke = !invite.used && !invite.revoked && (!invite.expiresAt || new Date(invite.expiresAt) > new Date())
                  
                  return (
                    <tr key={invite.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{invite.email}</td>
                      <td className="py-2 px-4 font-mono text-sm">{invite.code}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-600">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 text-sm text-gray-600">
                        {invite.expiresAt 
                          ? new Date(invite.expiresAt).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="py-2 px-4">
                        {canRevoke ? (
                          <button
                            onClick={() => revokeInvite(invite.id, invite.email)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {invite.revoked ? 'Revoked' : invite.used ? 'Used' : 'Expired'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Hardcoded Emails */}
      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tip</h3>
        <p className="text-gray-700">
          For immediate access, you can also add emails directly to the hardcoded list in{' '}
          <code className="bg-gray-200 px-2 py-1 rounded">src/lib/betaAccess.ts</code>
        </p>
      </div>
    </div>
  )
}
