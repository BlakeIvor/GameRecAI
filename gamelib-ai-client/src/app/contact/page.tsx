'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation back to dashboard */}
      <div className="p-6">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have questions, feedback, or need support? We&apos;re here to help! Reach out to our team and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white resize-vertical"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information & Support Options */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 rounded-lg p-3 flex-shrink-0">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-gray-300 text-sm mb-2">Get help with technical issues and account questions</p>
                    <p className="text-blue-400">support@gamelib.ai</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-600 rounded-lg p-3 flex-shrink-0">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">General Inquiries</h3>
                    <p className="text-gray-300 text-sm mb-2">Business partnerships and general questions</p>
                    <p className="text-blue-400">hello@gamelib.ai</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-lg p-3 flex-shrink-0">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Feedback & Suggestions</h3>
                    <p className="text-gray-300 text-sm mb-2">Share your ideas to help us improve</p>
                    <p className="text-blue-400">feedback@gamelib.ai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Information */}
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Office Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Headquarters</h3>
                  <p className="text-gray-300 text-sm">
                    [Company Address Line 1]<br />
                    [City, State/Province, ZIP/Postal Code]<br />
                    [Country]
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-gray-300 text-sm">
                    Monday - Friday: 9:00 AM - 6:00 PM [Timezone]<br />
                    Saturday - Sunday: Closed<br />
                    <span className="text-blue-400">Email support available 24/7</span>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-gray-300 text-sm">
                    Support: [Support Phone Number]<br />
                    Business: [Business Phone Number]
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media & Community */}
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Connect With Us</h2>
              <p className="text-gray-300 text-sm mb-6">
                Follow us on social media for updates, gaming news, and community discussions.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="[Twitter URL]" 
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
                >
                  <div className="w-8 h-8 bg-blue-400 rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Twitter</p>
                  <p className="text-xs text-gray-400">@gamelib_ai</p>
                </a>
                
                <a 
                  href="[Discord URL]" 
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
                >
                  <div className="w-8 h-8 bg-indigo-400 rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Discord</p>
                  <p className="text-xs text-gray-400">Join Server</p>
                </a>
                
                <a 
                  href="[Reddit URL]" 
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
                >
                  <div className="w-8 h-8 bg-orange-400 rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Reddit</p>
                  <p className="text-xs text-gray-400">r/GameLibAI</p>
                </a>
                
                <a 
                  href="[GitHub URL]" 
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
                >
                  <div className="w-8 h-8 bg-gray-400 rounded mx-auto mb-2"></div>
                  <p className="text-sm font-medium">GitHub</p>
                  <p className="text-xs text-gray-400">Open Source</p>
                </a>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Quick Help</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-400 pl-4">
                  <h3 className="font-semibold mb-1">Response Time</h3>
                  <p className="text-gray-300 text-sm">We typically respond to emails within 24 hours during business days.</p>
                </div>
                
                <div className="border-l-4 border-green-400 pl-4">
                  <h3 className="font-semibold mb-1">Bug Reports</h3>
                  <p className="text-gray-300 text-sm">Include your Steam ID and browser information for faster resolution.</p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-4">
                  <h3 className="font-semibold mb-1">Feature Requests</h3>
                  <p className="text-gray-300 text-sm">We love hearing your ideas! Detailed suggestions help us prioritize development.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Support */}
        <div className="mt-12 bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-2 text-red-400">Critical Issues?</h2>
          <p className="text-gray-300 mb-4">
            For urgent security concerns or account compromises, contact us immediately at:
          </p>
          <p className="text-red-400 font-bold">emergency@gamelib.ai</p>
        </div>
      </div>
    </main>
  );
}
