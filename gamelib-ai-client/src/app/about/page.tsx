import Link from 'next/link';

export default function AboutPage() {
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
            About GameLib.AI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing game discovery through artificial intelligence. We help gamers find their next favorite game 
            by analyzing their preferences and gaming patterns.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To eliminate the overwhelming choice paradox in gaming by providing personalized, AI-driven recommendations 
              that help every gamer discover titles they'll truly love. We believe every gamer deserves to find their perfect game.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Our Vision</h2>
            <p className="text-gray-300 leading-relaxed">
              To become the leading platform where gamers worldwide discover new experiences, connect with like-minded players, 
              and never run out of exciting games to play. We envision a future where every gaming recommendation is perfectly tailored.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How GameLib.AI Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              {/* Image placeholder */}
              <div className="bg-gray-700 rounded-lg p-8 mb-6 h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 font-semibold">Step 1 Icon</p>
                  <p className="text-xs text-gray-500 mt-2">Suggested: Steam/library analysis icon</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Analyze Your Library</h3>
              <p className="text-gray-300">
                Connect your Steam account and let our AI analyze your gaming history, preferences, and playtime patterns.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-700 rounded-lg p-8 mb-6 h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 font-semibold">Step 2 Icon</p>
                  <p className="text-xs text-gray-500 mt-2">Suggested: AI/brain processing icon</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">AI Processing</h3>
              <p className="text-gray-300">
                Our advanced machine learning algorithms process your data alongside community insights and game metadata.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-700 rounded-lg p-8 mb-6 h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 font-semibold">Step 3 Icon</p>
                  <p className="text-xs text-gray-500 mt-2">Suggested: Personalized recommendations icon</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Get Recommendations</h3>
              <p className="text-gray-300">
                Receive personalized game suggestions ranked by compatibility with your preferences and gaming style.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gray-800 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Real-time Updates</h3>
              <p className="text-gray-300 text-sm">Recommendations that evolve as your tastes change</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Genre Discovery</h3>
              <p className="text-gray-300 text-sm">Find new genres you might love based on subtle preferences</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Privacy First</h3>
              <p className="text-gray-300 text-sm">Your gaming data stays secure and is never shared</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-700 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Founder Photo</p>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ben Seidenberg</h3>
              <p className="text-blue-400 mb-2">Founder</p>
              <p className="text-gray-300 text-sm">
                Ben is a passionate data scientist and visionary leader dedicated to revolutionizing the gaming experience through AI.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gray-700 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Founder Photo</p>
              </div>
              <h3 className="text-xl font-semibold mb-2">Blake Shea</h3>
              <p className="text-blue-400 mb-2">Founder</p>
              <p className="text-gray-300 text-sm">
                Blake is a seasoned software engineer with a deep love for gaming and a knack for building user-centric applications.
              </p>
            </div>

          </div>
        </div>

        {/* Company Stats */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">GameLib.AI by the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">[X]K+</p>
              <p className="text-gray-300">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">[X]M+</p>
              <p className="text-gray-300">Games Analyzed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">[X]%</p>
              <p className="text-gray-300">Recommendation Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">[X]</p>
              <p className="text-gray-300">Countries Served</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Discover Your Next Favorite Game?</h2>
          <p className="text-gray-300 mb-6">
            Join thousands of gamers who have already found their perfect matches with GameLib.AI
          </p>
          <Link 
            href="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </main>
  );
}
