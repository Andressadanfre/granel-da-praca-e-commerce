import { Suspense } from 'react'

import { MfaChallengeForm } from '@/components/admin/MfaChallengeForm'

export const dynamic = 'force-dynamic'

export default function AdminMfaChallengePage() {
  return (
    <Suspense fallback={null}>
      <MfaChallengeForm />
    </Suspense>
  )
}
