import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../data/firebase';

import assets from '../assets/assets';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        if (user) {
          navigate('/admin');
        }
      } catch (err) {
        setError('Invalid email or password');
      }
    };
  
    return (
      <div className='min-h-screen flex flex-col lg:flex-row'>
        <div className='flex-1 flex items-center justify-center p-6 lg:p-12'>
            <div className='w-full max-w-md space-y-8'>
                <div className='space-y-6'>
                    <h2 className='text-2xl font-bold tracking-tight mb-10'>Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="font-medium text-[14px]">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Emailni kiriting!"
                                className='block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:ring-green-500'
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="font-medium text-[14px]">Parol:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Parolni kiriting!"
                                className='block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:ring-green-500'
                            />
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <button type="submit" className='w-full rounded-md bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'>Kirish</button>
                    </form>
                </div>
            </div>
        </div>
        <div className="hidden lg:block lg:flex-1">
            <div className="relative h-screen w-full">
                <img src={assets.Leaf} alt="leaf" className='object-cover' />
            </div>
        </div>
      </div>
    );
};

export default Login;