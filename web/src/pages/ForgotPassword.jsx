import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../stylesheets/ForgotPassword.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation states
    const [emailError, setEmailError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();

    // Timer for resend code
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0 && !canResend) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer, canResend]);

    // useEffect(() => {
    //     handleSendOTP();
    // }, []);

    // Auto-focus for verification code inputs
    const handleCodeChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple characters

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleCodeKeyDown = (index, e) => {
        // Handle backspace to focus previous input
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    // Handle sending OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();

        let isValid = true;
        setEmailError('');

        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }

        if (isValid) {
            setIsLoading(true);

            try {
                const response = await fetch("http://localhost:5000/send-otp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.success) {
                    setStep(2);
                    setTimer(60);
                    setCanResend(false);
                    setSuccessMessage('OTP sent successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    setEmailError(data.message || 'Failed to send OTP');
                }
            } catch (error) {
                setEmailError('Network error. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handle verifying OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        const code = verificationCode.join('');
        setCodeError('');

        if (code.length !== 6) {
            setCodeError('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5000/verity-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    otp: code
                })
            });

            const data = await response.json();
            alert(data.message);

            if (data.success) {
                setStep(3);
                setSuccessMessage('OTP verified successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setCodeError(data.message || 'Invalid verification code');
            }
        } catch (error) {
            setCodeError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resending OTP
    const handleResendOTP = async () => {
        setCanResend(false);
        setTimer(60);

        try {
            await fetch("http://localhost:5000/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            setSuccessMessage('OTP resent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setCodeError('Failed to resend OTP');
        }
    };

    // Handle resetting password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        let isValid = true;
        setPasswordError('');
        setConfirmPasswordError('');

        if (!newPassword) {
            setPasswordError('New password is required');
            isValid = false;
        } else if (!validatePassword(newPassword)) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        }

        if (isValid) {
            setIsLoading(true);

            try {
                const response = await fetch("http://localhost:5000/reset-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        newPassword
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccessMessage('Password reset successfully!');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    setPasswordError(data.message || 'Failed to reset password');
                }
            } catch (error) {
                setPasswordError('Network error. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="login-page forgot-password-page">
            <div className="container">
                <div className="content">
                    {/* Logo Section */}
                    <div className="logo-section">
                        <div className="logo">
                            <span className="logo-icon"></span>
                            <span className="logo-text">GramSetu</span>
                        </div>
                        <p className="tagline">Digitalizing Gram Services Management System</p>
                    </div>

                    {/* Welcome Text */}
                    <div className="welcome-text">
                        <h2>
                            {step === 1 && 'Forgot Password'}
                            {step === 2 && 'Verify OTP'}
                            {step === 3 && 'Reset Password'}
                        </h2>
                        <p className="subtitle">
                            {step === 1 && 'Enter your email to receive a verification code'}
                            {step === 2 && `We've sent a 6-digit code to ${email}`}
                            {step === 3 && 'Create a new password for your account'}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="step-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Email</span>
                        </div>
                        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Verify</span>
                        </div>
                        <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <span className="step-number">3</span>
                            <span className="step-label">Reset</span>
                        </div>
                    </div>

                    {/* Step 1: Email Form */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <label className="label">Email Address</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        disabled={isLoading}
                                    />
                                    {emailError && <span className="error-message show">{emailError}</span>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="sign-in-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verification Code Form */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="form-group">
                                <label className="label">Verification Code</label>
                                <div className="code-input-wrapper">
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`code-${index}`}
                                            type="text"
                                            className="code-input"
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                            maxLength="1"
                                            disabled={isLoading}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                {codeError && <span className="error-message show">{codeError}</span>}
                            </div>

                            <div className="timer-text">
                                {timer > 0 ? (
                                    <p>Resend code in <span className="timer">{timer}s</span></p>
                                ) : (
                                    <p>Didn't receive code?</p>
                                )}
                            </div>

                            {canResend && (
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleResendOTP}
                                    disabled={isLoading}
                                >
                                    Resend Code
                                </button>
                            )}

                            <button
                                type="submit"
                                className="sign-in-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password Form */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label className="label">New Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? '👁️‍🗨️' : '👁️'}
                                    </button>
                                    {passwordError && <span className="error-message show">{passwordError}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Confirm Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                                    </button>
                                    {confirmPasswordError && <span className="error-message show">{confirmPasswordError}</span>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="sign-in-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Resetting Password...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Back to Login Link */}
                    <div className="back-to-login">
                        <Link to="/login">
                            ← Back to Login
                        </Link>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="success-message show">{successMessage}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;