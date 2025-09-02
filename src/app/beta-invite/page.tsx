'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BetaInvitePage from '../../components/BetaInvitePage'

function BetaInviteContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  return <BetaInvitePage code={code} />
}

export default function BetaInvite() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BetaInviteContent />
    </Suspense>
  )
}
