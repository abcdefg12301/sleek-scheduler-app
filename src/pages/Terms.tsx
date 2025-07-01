
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-600 mt-1">Last updated: January 1, 2025</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-500">Breezey</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <p className="text-lg text-gray-600 leading-relaxed">
              Welcome to Breezey! These Terms of Service ("Terms") govern your use of our AI-powered scheduling platform. 
              By accessing or using Breezey, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By creating an account or using Breezey's services, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Breezey is an AI-powered scheduling platform that helps users create, manage, and optimize their calendars 
              and schedules. Our service includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>AI-powered schedule generation and optimization</li>
              <li>Calendar creation and management tools</li>
              <li>Event scheduling and organization features</li>
              <li>Integration capabilities with external calendar systems</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts and Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use certain features of Breezey, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Providing accurate and complete registration information</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Acceptable Use Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use Breezey to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Use the service for any commercial purpose without authorization</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed by our 
              Privacy Policy, which is incorporated into these Terms by reference. By using Breezey, you consent 
              to the collection and use of your information as described in our Privacy Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Subscription and Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Breezey offers both free and paid subscription plans. For paid subscriptions:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Fees are charged in advance on a recurring basis</li>
              <li>You authorize us to charge your payment method</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>We reserve the right to change pricing with notice</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Breezey and its original content, features, and functionality are owned by our company and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws. You retain ownership of content you create using our service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, Breezey shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
              directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to maintain high service availability, we do not guarantee that Breezey will be 
              available at all times. We may experience downtime for maintenance, updates, or unforeseen technical issues.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Either party may terminate these Terms at any time. We reserve the right to suspend or terminate 
              your account if you violate these Terms. Upon termination, your right to use the service ceases immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes 
              via email or through the service. Your continued use of Breezey after changes become effective 
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@breezey.app<br />
                <strong>Address:</strong> Breezey Legal Department<br />
                123 Innovation Drive<br />
                Tech City, TC 12345
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              These Terms of Service are effective as of January 1, 2025, and will remain in effect except with 
              respect to any changes in their provisions in the future, which will be in effect immediately after 
              being posted on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
