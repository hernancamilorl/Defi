// src/components/Login.js
import React from 'react';
import { auth, saveUser } from '../firebase';  // Ajusta la ruta según sea necesario
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

class Login extends React.Component {
  handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUser(result.user);
    } catch (error) {
      console.error('Error logging in with Google', error);
    }
  };

  render() {
    return (
      <div>
        <button onClick={this.handleGoogleLogin}>Login with Google</button>
      </div>
    );
  }
}

export default Login;
