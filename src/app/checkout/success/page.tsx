import Link from "next/link";

export default function InquirySuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Inquiry Submitted Successfully!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your interest in our products. We have received your
          inquiry and our team will review it shortly.
        </p>

        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-primary-800 mb-2">What happens next?</h3>
          <ul className="text-sm text-primary-700 space-y-2">
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Our team will review your product inquiry</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>You&apos;ll receive wholesale pricing via email</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Expected response time: 24-48 business hours</span>
            </li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          A confirmation email has been sent to your email address with the
          details of your inquiry.
        </p>

        <div className="space-y-3">
          <Link
            href="/shop"
            className="block w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Continue Browsing
          </Link>
          <Link
            href="/"
            className="block w-full py-3 text-gray-700 font-medium hover:text-gray-900"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
