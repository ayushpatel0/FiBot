import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chat from './pages/Chat';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import UseLocalStorage from './utils/UseLocalStorage';

function App() {
  const [userData, setUserData] = UseLocalStorage("userData", "");

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar userData={userData} setUserData={setUserData}/>
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat userData={userData} setUserData={setUserData} />} />
            <Route path="/signin" element={<SignIn userData={userData} setUserData={setUserData} />} />
            <Route path="/signup" element={<SignUp userData={userData} setUserData={setUserData} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;