export const metadata = {
  title: 'Delete Your Account — GGMP Global Gem Marketplace',
  description: 'How to request deletion of your GGMP account and associated data.',
}

export default function DeleteAccountPage() {
  const lastUpdated = 'August 2026'
  const SUPPORT_EMAIL = 'support@ggmp.app'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Your Account</h1>
        <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <p className="text-gray-600 leading-relaxed">
            This page explains how to request deletion of your account and associated data from{' '}
            <strong>GGMP — Gemstone Marketplace</strong> (package <code>com.ggmp.marketplace</code>),
            operated by GGMP — Global Gemstones Marketplace.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* How to request */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to request account deletion</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li>
              Send an email to{' '}
              <a href={`mailto:${SUPPORT_EMAIL}?subject=Account%20deletion%20request`}
                 className="text-gem-600 font-medium hover:text-gem-800">
                {SUPPORT_EMAIL}
              </a>{' '}
              with the subject line <strong>&ldquo;Account deletion request&rdquo;</strong>.
            </li>
            <li>
              Send it from the <strong>email address registered to your GGMP account</strong>, so we can
              verify the request is genuinely yours.
            </li>
            <li>
              We will confirm receipt and delete your account within <strong>30 days</strong>.
              You will receive an email once deletion is complete.
            </li>
          </ol>
          <p className="text-gray-600 leading-relaxed mt-4">
            You may also request deletion from inside the app at any time by contacting us from the
            Account page.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* What is deleted */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What data is deleted</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            When your account is deleted, the following are <strong>permanently removed</strong>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Your profile: name, email address, phone number and password</li>
            <li>Your contact details: WhatsApp number, Telegram username and Line ID</li>
            <li>All gemstone listings you have posted, including every photo and video</li>
            <li>View and contact statistics associated with your listings</li>
            <li>Any saved device tokens used to send you push notifications</li>
            <li>Any one-time verification codes associated with your account</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Deleting your account removes your listings from the marketplace, so they will no longer
            be visible to other users.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* What is kept */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What data is kept, and for how long</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>
              <strong>Backups:</strong> residual copies may remain in encrypted database backups for up
              to <strong>30 days</strong> after deletion, after which they are automatically overwritten.
            </li>
            <li>
              <strong>Anonymised statistics:</strong> aggregate counts (such as total listings viewed)
              that contain no personal information and cannot be linked back to you may be retained.
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            GGMP does not process payments, so we hold no financial or transaction records about you.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about deleting your account or your data, contact us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gem-600 font-medium hover:text-gem-800">
              {SUPPORT_EMAIL}
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
