import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, googleLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Removed automatic redirect useEffect to prevent loops
    // Redirect logic is now handled in handleSubmit and handleGoogleSuccess

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const result = await loginService(formData);

            if (result.success) {
                if (result.data.requiresOtp) {
                    // Redirect to OTP verification
                    navigate('/otp-verify', { state: { userId: result.data.userId } });
                } else {
                    // Direct login (fallback if OTP disabled)
                    login(result.data);
                    const role = result.data.role;
                    if (role === 'Admin') {
                        navigate('/admin/dashboard');
                    } else if (role === 'Employer') {
                        navigate('/employer/dashboard');
                    } else {
                        navigate('/employee/dashboard');
                    }
                }
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const result = await googleLogin(credentialResponse.credential);
            if (result.success) {
                login(result.data);
                const role = result.data.role;
                if (role === 'Admin') {
                    navigate('/admin/dashboard');
                } else if (role === 'Employer') {
                    navigate('/employer/dashboard');
                } else {
                    navigate('/employee/dashboard');
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your TalentTrack account</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="divider">
                    <span>or</span>
                </div>

                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google login failed')}
                />

                <div className="auth-footer">
                    <a href="/forgot-password">Forgot Password?</a>
                </div>

                <div className="auth-footer">
                    Don't have an account?
                    <a href="/register">Register here</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
