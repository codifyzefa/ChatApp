import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
        );
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }
        
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email
                }),
            });
            const data = await response.json();
            
            if (response.ok) {
                navigate("/login");
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError("Network error. Please try again");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div ref={containerRef} className="bg-black border-2 border-white rounded-3xl w-full max-w-4xl flex opacity-0" style={{ height: '600px' }}>
                {/* Left Side - Signup Title */}
                <div className="w-1/2 p-8 flex items-center justify-center border-r-2 border-white">
                    <h1 className="text-6xl font-black tracking-tighter">SIGN UP</h1>
                </div>

                {/* Right Side - Form */}
                <div className="w-1/2 p-8 flex flex-col justify-center">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500 text-white rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300">USERNAME</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-transparent border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
                                placeholder="Enter username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300">EMAIL</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-transparent border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
                                placeholder="Enter email"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-gray-300">PASSWORD</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-transparent border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors pr-10"
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-gray-300">CONFIRM PASSWORD</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-transparent border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors pr-10"
                                    placeholder="Confirm password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-2"
                        >
                            {loading ? 'SIGNING UP...' : 'SIGN UP'}
                        </button>
                    </form>

                    <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-gray-600"></div>
                        <span className="px-3 text-gray-400 text-xs">OR</span>
                        <div className="flex-1 border-t border-gray-600"></div>
                    </div>

                    <div className="flex justify-center space-x-4 mb-4">
                        <button 
                            type="button"
                            className="p-2 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.8 12.2c0-.6-.1-1.3-.2-1.8H12v3.4h5.5c-.2 1.1-.9 2.1-1.9 2.7v2.4h3.1c1.8-1.7 2.8-4.2 2.8-7.1z" fill="#4285F4" />
                                <path d="M12 22c2.5 0 4.6-.8 6.1-2.2l-3.1-2.4c-.8.6-1.9.9-3 .9-2.3 0-4.3-1.6-5-3.7H3.9v2.5C5.4 19.4 8.4 22 12 22z" fill="#34A853" />
                                <path d="M7 13.6c-.2-.6-.2-1.2 0-1.8V9.3H3.9c-.7 1.4-.7 3.1 0 4.5l3.1-2.4z" fill="#FBBC05" />
                                <path d="M12 6.9c1.3 0 2.5.5 3.4 1.4l2.5-2.5C16.6 4.2 14.5 3.3 12 3.3c-3.6 0-6.6 2.6-7.1 6h3.1c.7-2.1 2.7-3.7 5-3.7z" fill="#EA4335" />
                            </svg>
                        </button>

                        <button 
                            type="button"
                            className="p-2 border-2 border-white rounded-lg hover:bg-white hover:text-black transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-400 text-xs">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={handleLoginRedirect}
                                className="text-white font-bold hover:underline focus:outline-none"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;