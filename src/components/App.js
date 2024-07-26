import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Tokens from './Tokens';
import Footer from './Footer';
import Login from './Login';
import { auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
    React.useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(!!user);
      });
  
      return () => unsubscribe();
    }, []);
  
    return (
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={isAuthenticated ? <Tokens /> : <Navigate to="/login" />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    );
  };  

export default App;