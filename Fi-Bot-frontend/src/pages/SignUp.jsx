import { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockLine, RiUser3Line } from 'react-icons/ri';
import UseLocalStorage from '../utils/UseLocalStorage';

function SignUp({userData, setUserData}) {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

    useEffect(() =>{
      if(userData !== ""){
        navigate('/chat');
      }
    },[userData])

  const baseURL = "https://fi-bot-snowy.vercel.app/api/"; // Replace with your actual API base URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true); // Show loader
    try {
      const response = await fetch(baseURL + "signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("Signup successful:", data);
        navigate('/signin');
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData.error);
        alert(errorData.error || "Signup failed! Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  return (
    <div className="min-h-[calc(100vh-144px)] flex items-center justify-center py-12 px-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="mt-2 text-gray-400">Join Fi-Bot and start your financial journey</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <RiUser3Line className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    required
                    className="input pl-10"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <RiMailLine className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    className="input pl-10"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    className="input pl-10"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    className="input pl-10"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-600 bg-dark-light text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:text-primary-dark">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-dark">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button type="submit" className="btn-primary w-full">
              Create Account
            </button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

export default SignUp;
