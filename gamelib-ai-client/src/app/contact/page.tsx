'use client';

import { useState } from 'react';
import Link from 'next/link';
import WaveBackground from '../components/WaveBackground';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ type: 'success', message: 'Thank you for your message! We\'ll get back to you soon.' });
        setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
      } else {
        setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      <WaveBackground />
      <div className="relative z-10">
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
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {submitStatus && (
                <div className={`p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-600/20 border border-green-600' : 'bg-red-600/20 border border-red-600'}`}>
                  <p className={submitStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                    {submitStatus.message}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Contact Information & Support Options */}
          <div className="space-y-8">
            {/* Social Media & Community */}
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Connect With Us</h2>
              <p className="text-gray-300 text-sm mb-6">
                Follow us on social media for updates, gaming news, and community discussions.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="https://x.com/N3bbo" 
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
                >
                  <img src="/twit_pfp.jpg" alt="Twitter" className="w-8 h-8 rounded mx-auto mb-2 object-cover" />
                  <p className="text-sm font-medium">Twitter</p>
                  <p className="text-xs text-gray-400">@n3bbo</p>
                </a>
                
                <a 
                  href="https://github.com/benseidenberg/GameLib-Backend" 
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors block text-center"
                >
                  <img src="/git_logo.png" alt="GitHub" className="w-8 h-8 rounded mx-auto mb-2 object-cover" />
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
      </div>
      </div>
    </main>
  );
}
