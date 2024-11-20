import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiRobot2Fill, RiMenuLine, RiCloseLine } from 'react-icons/ri';
import UseLocalStorage from '../utils/UseLocalStorage';

function Navbar({ userData, setUserData }) {
  // const [userData, setUserData] = UseLocalStorage("userData", "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const deleteData = ()=>{
    localStorage.clear();
    setUserData("");
    navigate('/');
  }

  // useEffect(()=>{

  // }, [userData]);

  return (
    <nav className="bg-dark-lighter py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <RiRobot2Fill className="text-primary text-3xl" />
          <span className="text-2xl font-bold text-white">Fi-Bot</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/chat" className="text-gray-300 hover:text-white">Chat</Link>
          {
            userData !== ""? (
              <div
                className="text-gray-300 hover:text-white py-2 btn-outline cursor-pointer"
                onClick={deleteData}
              >
                Logout
              </div>
            ) : (
              <div className="flex items-center space-x-4">
            <Link to="/signin" className="btn-outline">Sign In</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </div>
            )
          }
          {/* {!userData && } */}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-dark-lighter p-4 border-t border-gray-700">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </Link>
            <Link 
              to="/signin" 
              className="btn-outline w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="btn-primary w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;