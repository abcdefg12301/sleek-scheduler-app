
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Settings, User, Clock, Zap, Check } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="text-2xl font-bold text-blue-500">Breezey</div>
        <div className="hidden md:flex space-x-8">
          <button 
            onClick={scrollToPricing}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pricing
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">Feedback</button>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            Log In
          </Button>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-8 animate-fade-in">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gray-900">
          Schedule With A Breeze
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          AI-powered, beautifully designed scheduling—fast, easy, smart.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/auth')}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            Log In
          </Button>
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            Donate
          </Button>
        </div>
      </section>

      {/* Why Breezey Section */}
      <section className="py-20 px-8 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Breezey?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">AI-Powered Scheduling</h3>
              <p className="text-gray-600">
                Create perfectly optimized schedules in minutes using our advanced AI engine
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">First User-Friendly App</h3>
              <p className="text-gray-600">
                The first web-based AI scheduling tool designed with users in mind
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Seamless Integration</h3>
              <p className="text-gray-600">
                Works perfectly with your existing calendar apps for smooth transitions
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Smart Scheduling Section */}
      <section className="py-20 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Smart, Intuitive Scheduling</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create perfect schedules in minutes with AI assistance and powerful tools
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8">
              <User className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Schedule Generation</h3>
              <p className="text-gray-600">
                Describe your needs and preferences in natural language, and our AI creates your ideal schedule automatically.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8">
              <Clock className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Smart Time Management</h3>
              <p className="text-gray-600">
                Intelligent time blocking with automatic recognition of optimal time slots for different activity types.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8">
              <Zap className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Instant Conflict Detection</h3>
              <p className="text-gray-600">
                Visual indicators automatically highlight scheduling conflicts in real-time as you build your schedule.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-8 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for you
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Up to 3 calendars</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Basic AI scheduling</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Web access</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-white border-blue-500 border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$9</div>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Unlimited calendars</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Advanced AI features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Calendar integrations</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Pro Trial
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$29</div>
                <p className="text-gray-600">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Team collaboration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-600">Dedicated support</span>
                </li>
              </ul>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 px-8">
        <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to streamline your scheduling?</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Join thousands of users who have simplified their scheduling with Breezey.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started For Free
          </Button>
          <Button
            variant="outline"
            onClick={scrollToPricing}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            View Pricing
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold text-blue-500 mb-4">Breezey</div>
            <p className="text-gray-600 mb-4">
              AI-powered, beautifully designed scheduling—fast, easy, smart.
            </p>
            <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
              Support us on Ko-fi
            </a>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><button onClick={scrollToPricing} className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/privacy')} className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</button></li>
              <li><button onClick={() => navigate('/terms')} className="text-gray-600 hover:text-gray-900 transition-colors">Terms</button></li>
              <li><button className="text-gray-600 hover:text-gray-900 transition-colors">Feedback</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
