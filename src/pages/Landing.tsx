
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Settings, User, Clock, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6">
        <div className="text-2xl font-bold text-blue-400">Breezey</div>
        <div className="hidden md:flex space-x-8">
          <button className="text-gray-300 hover:text-white transition-colors">Pricing</button>
          <button className="text-gray-300 hover:text-white transition-colors">Feedback</button>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/auth')}
            className="border-gray-600 text-white hover:bg-gray-800 transition-all duration-300 hover:scale-105"
          >
            Log In
          </Button>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-8 animate-fade-in">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Schedule With A Breeze
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          AI-powered, beautifully designed scheduling—fast, easy, smart.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/auth')}
            className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-4 transition-all duration-300 hover:scale-105"
          >
            Log In
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-gray-800 text-lg px-8 py-4 transition-all duration-300 hover:scale-105"
          >
            Donate
          </Button>
        </div>
      </section>

      {/* Why Breezey Section */}
      <section className="py-20 px-8">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-300">Why Breezey?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-white">AI-Powered Scheduling</h3>
              <p className="text-gray-400">
                Create perfectly optimized schedules in minutes using our advanced AI engine
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-white">First User-Friendly App</h3>
              <p className="text-gray-400">
                The first web-based AI scheduling tool designed with users in mind
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-white">Seamless Integration</h3>
              <p className="text-gray-400">
                Works perfectly with your existing calendar apps for smooth transitions
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Smart Scheduling Section */}
      <section className="py-20 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-white">Smart, Intuitive Scheduling</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create perfect schedules in minutes with AI assistance and powerful tools
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-8">
              <User className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-white">AI Schedule Generation</h3>
              <p className="text-gray-400">
                Describe your needs and preferences in natural language, and our AI creates your ideal schedule automatically.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-8">
              <Clock className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-white">Smart Time Management</h3>
              <p className="text-gray-400">
                Intelligent time blocking with automatic recognition of optimal time slots for different activity types.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardContent className="p-8">
              <Zap className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-white">Instant Conflict Detection</h3>
              <p className="text-gray-400">
                Visual indicators automatically highlight scheduling conflicts in real-time as you build your schedule.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 px-8">
        <h2 className="text-4xl font-bold mb-6 text-white">Ready to streamline your scheduling?</h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Join thousands of users who have simplified their scheduling with Breezey.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started For Free
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-4 transition-all duration-300 hover:scale-105"
          >
            View Pricing
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-4">Breezey</div>
            <p className="text-gray-400 mb-4">
              AI-powered, beautifully designed scheduling—fast, easy, smart.
            </p>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
              Support us on Ko-fi
            </a>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><button className="text-gray-400 hover:text-white transition-colors">Pricing</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/privacy')} className="text-gray-400 hover:text-white transition-colors">Privacy</button></li>
              <li><button onClick={() => navigate('/terms')} className="text-gray-400 hover:text-white transition-colors">Terms</button></li>
              <li><button className="text-gray-400 hover:text-white transition-colors">Feedback</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
