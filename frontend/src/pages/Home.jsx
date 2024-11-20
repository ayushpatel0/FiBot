import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiRobot2Fill, RiStockLine, RiLineChartLine, RiShieldUserLine } from 'react-icons/ri';

function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-dark to-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <RiRobot2Fill className="text-primary text-5xl sm:text-7xl mx-auto mb-6 sm:mb-8" />
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6">
              Your AI Financial Advisor
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Get personalized financial advice and stock predictions powered by advanced AI technology
            </p>
            <Link to="/chat" className="btn-primary text-lg">
              Try Fi-Bot Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 sm:py-20 bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">Why Choose Fi-Bot?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
            <FeatureCard
              icon={<RiStockLine />}
              title="Smart Stock Analysis"
              description="Get real-time stock predictions and market insights powered by advanced algorithms"
            />
            <FeatureCard
              icon={<RiLineChartLine />}
              title="Portfolio Management"
              description="Receive personalized portfolio recommendations based on your risk profile"
            />
            <FeatureCard
              icon={<RiShieldUserLine />}
              title="Secure & Private"
              description="Your financial data is protected with enterprise-grade security"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Ready to Start Your Financial Journey?</h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Join thousands of users who trust Fi-Bot for their financial decisions
          </p>
          <Link to="/signup" className="btn-primary text-lg">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card"
    >
      <div className="text-primary text-3xl sm:text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

export default Home;