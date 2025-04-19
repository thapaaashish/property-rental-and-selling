import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last Updated: April 18, 2025</p>

      <section className="mb-6">
        <p>
          At <strong>HomeFinder</strong>, we value your privacy. This Privacy
          Policy outlines how we collect, use, and protect your personal data
          when you use our platform.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <ul className="list-disc ml-6">
          <li>Account information (name, email, phone number, etc.)</li>
          <li>Property listings history</li>
          <li>Messages and interactions with other users</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc ml-6">
          <li>To provide and improve our services</li>
          <li>To communicate with you</li>
          <li>To prevent fraud and ensure security</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">3. Sharing Your Information</h2>
        <p>
          We do not sell your data. We may share data with third-party service
          providers for things like payment processing and analytics. These
          providers are bound by confidentiality agreements.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">4. Cookies and Tracking</h2>
        <p>
          We use cookies to enhance your experience. You can manage your cookie
          preferences through your browser settings.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">5. Data Security</h2>
        <p>
          We use standard security measures to protect your data, but no system
          is completely secure.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">6. Your Rights</h2>
        <p>
          You may access, correct, or delete your personal data by logging into
          your account or contacting us directly.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">7. Contact Us</h2>
        <p>
          📧 Email: privacy@homefinder.com
          <br />
          📍 Address: [Kathmandu, Nepal]
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
