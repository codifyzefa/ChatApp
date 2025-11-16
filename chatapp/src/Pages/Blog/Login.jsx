import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
        );
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }

        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success) {
                setSuccessMessage('Login successful! Redirecting...');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                gsap.to(containerRef.current, {
                    scale: 1.05,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        setTimeout(() => {
                            navigate(`/${data.user.username}/dashboard`);
                        }, 1000);
                    }
                });
            } else {
                throw new Error(data.message || 'Login failed');
            }

        } catch (error) {
            setErrors({
                submit: error.message || 'An error occurred during login. Please try again.'
            });

            gsap.to(containerRef.current, {
                x: -10,
                duration: 0.1,
                yoyo: true,
                repeat: 5,
                ease: "power1.inOut"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleSignupRedirect = () => {
        navigate('/signup');
    };

    const handleSocialLogin = (provider) => {
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
            <div ref={containerRef} className="bg-black border-2 border-white rounded-3xl w-full max-w-4xl flex opacity-0">
                <div className="w-1/2 p-12 flex items-center justify-center border-r-2 border-white">
                    <h1 className="text-8xl font-black tracking-tighter">LOGIN</h1>
                </div>

                <div className="w-1/2 p-12">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-900 border border-green-600 rounded-xl text-green-200">
                            {successMessage}
                        </div>
                    )}

                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-xl text-red-200">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300">EMAIL</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className={`w-full bg-transparent border-2 rounded-xl p-4 text-white focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-600 focus:border-white'
                                    }`}
                                placeholder="Enter your email"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300">PASSWORD</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className={`w-full bg-transparent border-2 rounded-xl p-4 text-white focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-600 focus:border-white'
                                    }`}
                                placeholder="Enter your password"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="text-right">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-gray-400 hover:text-white text-sm underline focus:outline-none disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    LOGGING IN...
                                </>
                            ) : (
                                'LOGIN'
                            )}
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-600"></div>
                        <span className="px-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-1 border-t border-gray-600"></div>
                    </div>

                    <div className="flex justify-center space-x-6 mb-6">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                            className="p-3 border-2 border-white rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21.8 12.2c0-.6-.1-1.3-.2-1.8H12v3.4h5.5c-.2 1.1-.9 2.1-1.9 2.7v2.4h3.1c1.8-1.7 2.8-4.2 2.8-7.1z" fill="#4285F4" />
                                <path d="M12 22c2.5 0 4.6-.8 6.1-2.2l-3.1-2.4c-.8.6-1.9.9-3 .9-2.3 0-4.3-1.6-5-3.7H3.9v2.5C5.4 19.4 8.4 22 12 22z" fill="#34A853" />
                                <path d="M7 13.6c-.2-.6-.2-1.2 0-1.8V9.3H3.9c-.7 1.4-.7 3.1 0 4.5l3.1-2.4z" fill="#FBBC05" />
                                <path d="M12 6.9c1.3 0 2.5.5 3.4 1.4l2.5-2.5C16.6 4.2 14.5 3.3 12 3.3c-3.6 0-6.6 2.6-7.1 6h3.1c.7-2.1 2.7-3.7 5-3.7z" fill="#EA4335" />
                            </svg>
                        </button>

                        <button
                            onClick={() => handleSocialLogin('github')}
                            disabled={isLoading}
                            className="p-3 border-2 border-white rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={handleSignupRedirect}
                                className="text-white font-bold hover:underline focus:outline-none disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;