import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark-lighter py-4 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <p className="text-sm text-center sm:text-left">© 2024 Fi-Bot. All rights reserved.</p>
        <div className="flex space-x-4 sm:space-x-6 text-sm">
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;