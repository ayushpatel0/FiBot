import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockLine } from 'react-icons/ri';
import UseLocalStorage from '../utils/UseLocalStorage';

function SignIn({ userData, setUserData}) {

  // const [userData, setUserData] = UseLocalStorage("userData", "");

  useEffect(() => {
    if (userData !== "") {
        navigate('/chat');
    }
  }, [userData]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const baseURL = "http://localhost:3005/api/"; // Replace with your actual API base URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loader

    try {
      const response = await fetch(baseURL + "signin", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        setUserData({username: data.username, userId: data.userId});
        console.log("Signin successful:", data);
        // navigate('/chat'); // Redirect to /chat
      } else {
        const errorData = await response.json();
        console.error("Signin failed:", errorData);
        alert(errorData.message || "Signin failed! Please try again.");
      }
    } catch (error) {
      console.error("Error during signin:", error);
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
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="mt-2 text-gray-400">Sign in to continue to Fi-Bot</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="hidden items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-600 bg-dark-light text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary-dark font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

export default SignIn;
