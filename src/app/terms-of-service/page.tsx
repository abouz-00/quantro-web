import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Quantro',
  description: 'Terms of service for Quantro nutrition tracking app',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using Quantro, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Use License</h2>
            <p className="text-gray-600">
              Permission is granted to temporarily use Quantro for personal, non-commercial transitory
              viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
            <p className="text-gray-600">
              You are responsible for maintaining the confidentiality of your account and password.
              You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
            <p className="text-gray-600">
              You may not use our services for any unlawful purpose or to solicit others to perform
              unlawful acts. You may not violate any international laws or regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-600">
              The information on this service is provided on an &apos;as is&apos; basis. To the fullest extent
              permitted by law, this Company excludes all representations, warranties, conditions
              and terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600">
              If you have questions about these Terms of Service, please contact us at legal@quantro.fit
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-500">
              Last updated: September 5, 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
