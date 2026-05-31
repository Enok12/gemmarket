export const metadata = {
  title: 'Privacy Policy — GGMP Global Gem Marketplace',
  description: 'Privacy policy for GGMP Global Gem Marketplace',
}

export default function PrivacyPage() {
  const lastUpdated = 'May 2025'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        {/* Introduction */}
        <section>
          <p className="text-gray-600 leading-relaxed">
            Welcome to <strong>GGMP — Global Gem Marketplace</strong> ("we", "our", or "us"). 
            This Privacy Policy explains how we collect, use, and protect your personal information 
            when you use our website and mobile application (collectively, the "Service").
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            By using GGMP, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Information we collect */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>

          <h3 className="text-base font-semibold text-gray-800 mb-2">Information you provide to us</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Password (stored in encrypted form)</li>
            <li>Gemstone listing details including title, description, price, photos and videos</li>
            <li>WhatsApp contact number (used only to generate contact links — never displayed publicly)</li>
          </ul>

          <h3 className="text-base font-semibold text-gray-800 mb-2">Information collected automatically</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>IP address (used for rate limiting and security)</li>
            <li>Device type and browser information</li>
            <li>Pages visited and time spent on the platform</li>
            <li>WhatsApp button click counts per listing (anonymous)</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* How we use your information */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>To create and manage your account</li>
            <li>To verify your email address via OTP</li>
            <li>To display your gemstone listings to potential buyers</li>
            <li>To generate WhatsApp contact links for buyers to reach you</li>
            <li>To send transactional emails (OTP verification, listing status updates)</li>
            <li>To review and approve listings before they go live</li>
            <li>To protect the platform from spam and abuse via rate limiting</li>
            <li>To improve our services based on usage patterns</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* How we share your information */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Share Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            We do not sell, trade, or rent your personal information to third parties. 
            We only share your information in the following limited circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Service providers</strong> — We use trusted third-party services including Cloudinary (image/video storage), Resend (email delivery), Neon (database hosting) and Vercel (app hosting). These providers process data only as needed to deliver our service.</li>
            <li><strong>Legal requirements</strong> — We may disclose information if required by law or to protect the rights and safety of our users.</li>
            <li><strong>Business transfers</strong> — In the event of a merger or acquisition, your information may be transferred as part of that transaction.</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* WhatsApp numbers */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. WhatsApp Contact Numbers</h2>
          <p className="text-gray-600 leading-relaxed">
            When you post a listing, you provide a WhatsApp number for buyers to contact you. 
            This number is <strong>never displayed publicly</strong> on our platform. 
            Instead, we generate a secure redirect link that opens WhatsApp with a pre-filled message. 
            Your number is stored securely in our database and is only used to create this contact link.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Data security */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>All passwords are hashed using bcrypt with 12 salt rounds — never stored in plain text</li>
            <li>All data is transmitted over HTTPS (TLS encryption)</li>
            <li>Authentication uses JWT tokens with expiry</li>
            <li>Rate limiting is applied to all sensitive endpoints to prevent abuse</li>
            <li>Database access is restricted and credentials are never exposed</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            While we take reasonable measures to protect your data, no method of transmission over 
            the internet is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Data retention */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your personal information for as long as your account is active or as needed 
            to provide the Service. You may request deletion of your account and associated data 
            at any time by contacting us. OTP verification codes are automatically invalidated 
            after 10 minutes.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Your rights */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information via your Account page</li>
            <li>Request deletion of your account and personal data</li>
            <li>Withdraw consent at any time by deleting your account</li>
            <li>Lodge a complaint with a data protection authority in your jurisdiction</li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        {/* Cookies */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            GGMP uses minimal browser storage. We store your authentication token in 
            localStorage to keep you logged in between sessions. We do not use advertising 
            cookies or track you across other websites.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Children */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            GGMP is intended for users aged 18 and older. We do not knowingly collect personal 
            information from children under 18. If we become aware that a child has provided 
            us with personal information, we will delete it immediately.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Changes */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of significant 
            changes by updating the "Last updated" date at the top of this page. Continued use of 
            the Service after changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <hr className="border-gray-100" />

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle your data, 
            please contact us at:
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-1">
            <p><strong>GGMP — Global Gem Marketplace</strong></p>
            <p>Email: privacy@ggmp.com</p>
            <p>Website: <a href="/" className="text-gem-600 hover:underline">ggmp.com</a></p>
          </div>
        </section>

      </div>
    </div>
  )
}