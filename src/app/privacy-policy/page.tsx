import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Quantro',
  description: 'Privacy policy for Quantro nutrition tracking app',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600">
              We collect information you provide directly to us, such as when you create an account,
              log food entries, or contact us for support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information to provide, maintain, and improve our services, process transactions,
              and communicate with you about your account and our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at privacy@quantro.fit
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
