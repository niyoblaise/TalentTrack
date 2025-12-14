import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, sendOtp } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const OtpVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // Get userId from location state (passed from login/register if needed)
        if (location.state?.userId) {
            setUserId(location.state.userId);
        } else {
            // If no userId, redirect to login
            navigate('/login');
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const result = await verifyOtp({ userId, code: otp });

            if (result.success) {
                setSuccess('OTP verified successfully! Redirecting...');

                // Login with the received token
                login(result.data);

                setTimeout(() => {
                    const role = result.data.role;
                    if (role === 'Admin') {
                        navigate('/admin/dashboard');
                    } else if (role === 'Employer') {
                        navigate('/employer/dashboard');
                    } else {
                        navigate('/employee/dashboard');
                    }
                }, 1500);
            } else {
                setError(result.message || 'Verification failed');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await sendOtp(userId);
            if (result.success) {
                setSuccess('OTP sent successfully!');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Verification</h1>
                    <p>Enter the 6-digit code sent to your email</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group">
                        <label htmlFor="otp">OTP Code</label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength="6"
                            disabled={loading}
                            style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem' }}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <span className="loading-spinner"></span> : 'Verify OTP'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-btn"
                            style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline' }}
                            disabled={loading}
                        >
                            Resend Code
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OtpVerification;
