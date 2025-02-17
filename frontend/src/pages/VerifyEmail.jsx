import React from 'react';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const email = sessionStorage.getItem('pendingEmail') || 'your email';

  const handleResendEmail = () => {
    console.log('Resending verification email to:', email);
    alert(`Resending verification email to: ${email}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification link to
        </p>
        <p className="text-center text-sm font-medium text-blue-600">
          {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Check your inbox
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Click the link in the email we sent to verify your account. 
                      If you don't see it, check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleResendEmail}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resend verification email
            </button>

            <div className="text-center">
              <a
                href="/signin"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Return to sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
