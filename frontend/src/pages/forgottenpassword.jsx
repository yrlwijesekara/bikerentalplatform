import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { HiMail, HiArrowLeft, HiKey, HiLockClosed } from "react-icons/hi";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: email, 2: otp & password, 3: success

    const backgroundImages = ["/loginbg3.jpg", "/loginbg4.jpg", "/loginbg2.jpg"];
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        const preloadImages = async () => {
            const imagePromises = backgroundImages.map((src) =>
                new Promise((resolve) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = src;
                })
            );
            await Promise.all(imagePromises);
            setImagesLoaded(true);
        };
        preloadImages();
    }, []);

    useEffect(() => {
        if (!imagesLoaded) return;
        const interval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 20000);
        return () => clearInterval(interval);
    }, [imagesLoaded]);

    async function handleSendOTP() {
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/api/users/send-reset-password-otp",
                { email }
            );
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (error) {
            console.error("Error sending OTP:", error);
            if (error.response?.status === 404) {
                toast.error("No account found with this email address");
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword() {
        if (!otp) {
            toast.error("Please enter the OTP");
            return;
        }
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/api/users/reset-password",
                { email, otp, newPassword }
            );
            toast.success("Password reset successful!");
            setStep(3);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error("Error resetting password:", error);
            if (error.response?.status === 404) {
                toast.error("OTP not found or expired");
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message || "Invalid OTP");
            } else {
                toast.error("Failed to reset password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="w-full min-h-screen bg-cover bg-center flex justify-center items-center transition-all duration-1000 p-4 sm:p-6 lg:p-8"
            style={{
                backgroundImage: imagesLoaded
                    ? `url('${backgroundImages[currentBgIndex]}')`
                    : 'linear-gradient(135deg, #0A2540 0%, #1F3C88 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="w-full max-w-sm sm:max-w-md backdrop-blur-xl bg-white/20 shadow-2xl rounded-2xl border border-white/30 flex flex-col items-center gap-6 text-white py-8 px-6 sm:px-8 overflow-y-auto">
                {/* Back to Login Link */}
                <Link 
                    to="/login" 
                    className="flex items-center gap-2 text-(--brand-primary) hover:text-(--brand-secondary) transition-colors self-start"
                >
                    <HiArrowLeft className="text-xl" />
                    <span className="text-sm">Back to Login</span>
                </Link>

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--button-primary-bg)' }}>
                        {step === 1 ? <HiMail className="text-3xl text-white" /> : 
                         step === 2 ? <HiKey className="text-3xl text-white" /> :
                         <HiLockClosed className="text-3xl text-white" />}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-(--brand-primary) mb-2">
                        {step === 1 ? "Forgot Password?" : 
                         step === 2 ? "Verify OTP" : 
                         "Password Reset!"}
                    </h1>
                    <p className="text-sm text-white/80">
                        {step === 1 ? "No worries! Enter your email and we'll send you an OTP." :
                         step === 2 ? "Enter the OTP sent to your email and create a new password." :
                         "Your password has been reset successfully!"}
                    </p>
                </div>

                {step === 1 ? (
                    // Step 1: Email Input
                    <>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                            className="w-full h-12.5 sm:h-13.75 rounded-md p-3 sm:p-4 text-gray-800 bg-(--card-background) border-2 border-(--section-divider) outline-none transition-all duration-300 hover:border-(--brand-primary) hover:scale-[1.02] focus:border-(--brand-primary) focus:shadow-lg placeholder-gray-500 text-sm sm:text-base"
                            disabled={loading}
                        />

                        <button
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="w-full h-12.5 sm:h-13.75 rounded-md text-white font-semibold flex justify-center items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            style={{ backgroundColor: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--button-primary-bg)')}
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>

                        <p className="text-sm text-white text-center">
                            Remember your password?{" "}
                            <Link to="/login" className="text-(--brand-primary) hover:text-(--brand-secondary) hover:underline font-medium cursor-pointer">
                                Sign in
                            </Link>
                        </p>
                    </>
                ) : step === 2 ? (
                    // Step 2: OTP & Password Reset
                    <>
                        <div className="w-full rounded-lg p-3 text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--button-primary-bg) 20%, transparent)', border: '1px solid color-mix(in srgb, var(--button-primary-bg) 50%, transparent)' }}>
                            <p className="text-(--brand-primary) text-sm">
                                OTP sent to <strong>{email}</strong>
                            </p>
                        </div>

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="w-full h-12.5 sm:h-13.75 rounded-md p-3 sm:p-4 text-gray-800 bg-(--card-background) border-2 border-(--section-divider) outline-none transition-all duration-300 hover:border-(--brand-primary) hover:scale-[1.02] focus:border-(--brand-primary) focus:shadow-lg tracking-widest text-center font-semibold text-sm sm:text-base"
                            disabled={loading}
                        />

                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-12.5 sm:h-13.75 rounded-md p-3 sm:p-4 text-gray-800 bg-(--card-background) border-2 border-(--section-divider) outline-none transition-all duration-300 hover:border-(--brand-primary) hover:scale-[1.02] focus:border-(--brand-primary) focus:shadow-lg placeholder-gray-500 text-sm sm:text-base"
                            disabled={loading}
                        />

                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                            className="w-full h-12.5 sm:h-13.75 rounded-md p-3 sm:p-4 text-gray-800 bg-(--card-background) border-2 border-(--section-divider) outline-none transition-all duration-300 hover:border-(--brand-primary) hover:scale-[1.02] focus:border-(--brand-primary) focus:shadow-lg placeholder-gray-500 text-sm sm:text-base"
                            disabled={loading}
                        />

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full h-12.5 sm:h-13.75 rounded-md text-white font-semibold flex justify-center items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            style={{ backgroundColor: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--button-primary-bg)')}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-white/80 mb-2">
                                Didn't receive the OTP?
                            </p>
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setOtp("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                className="text-(--brand-primary) hover:text-(--brand-secondary) hover:underline font-semibold text-sm cursor-pointer"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </>
                ) : (
                    // Step 3: Success State
                    <>
                        <div className="w-full bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                            <p className="text-green-200 text-sm">
                                Your password has been reset successfully!
                            </p>
                        </div>

                        <Link
                            to="/login"
                            className="w-full h-12.5 sm:h-13.75 rounded-md font-semibold flex justify-center items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg text-sm sm:text-base"
                            style={{ backgroundColor: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
                        >
                            Go to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}