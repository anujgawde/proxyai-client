"use client";

import { Loader2, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    general: "",
  });

  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  // Temp: Pushing all users to demo until app roll-out
  useAuthRedirect("/meetings");

  const validateAuthForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      general: "",
    };

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!showForgotPassword) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (isSignUp) {
        if (!firstName.trim()) {
          newErrors.firstName = "First name is required";
        }
        if (!lastName.trim()) {
          newErrors.lastName = "Last name is required";
        }
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleEmailAuth = async () => {
    if (!validateAuthForm()) return;

    setLoading(true);
    try {
      if (showForgotPassword) {
        await resetPassword(email);
        setResetEmailSent(true);
        setErrors((prev) => ({ ...prev, general: "" }));
      } else if (isSignUp) {
        await signUp(firstName, lastName, email, password);
        router.push("/meetings");
      } else {
        await signIn(email, password);
        router.push("/meetings");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      general: "",
    });
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setErrors((prev) => ({ ...prev, general: "" }));
  };

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">ProxyAI</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-primary">
          {showForgotPassword
            ? "Reset Password"
            : isSignUp
            ? "Create Account"
            : "Welcome Back"}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {showForgotPassword
            ? "Enter your email to receive a password reset link"
            : isSignUp
            ? "Sign up to get started with ProxyAI"
            : "Sign in to your ProxyAI account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {resetEmailSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">
                Password reset email sent! Check your inbox and follow the
                instructions to reset your password.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackToSignIn}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            {/* Todo: Activate Google SSO. Currently disabled until multiple auth providers linking logic is implemented. */}
            {/* Google Auth Button - only show if not forgot password 
            {!showForgotPassword && (
              <Button
                type="button"
                variant="outline"
                className="w-full py-2 text-base border-gray-300 hover:bg-gray-50"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>
            )}

            {/* Divider - only show if not forgot password
            {!showForgotPassword && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>
            )} */}

            {/* General Error */}
            {errors.general && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <div className="space-y-4">
              {/* Name fields for sign up */}
              {isSignUp && !showForgotPassword && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`mt-1 ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      } focus:border-primary focus:ring-primary`}
                      disabled={loading || googleLoading}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`mt-1 ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      } focus:border-primary focus:ring-primary`}
                      disabled={loading || googleLoading}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } focus:border-primary focus:ring-primary`}
                  disabled={loading || googleLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password fields - only show if not forgot password */}
              {!showForgotPassword && (
                <>
                  <div>
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`mt-1 ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      } focus:border-primary focus:ring-primary`}
                      disabled={loading || googleLoading}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password field for sign up */}
                  {isSignUp && (
                    <div>
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`mt-1 ${
                          errors.confirmPassword
                            ? "border-red-300"
                            : "border-gray-300"
                        } focus:border-primary focus:ring-primary`}
                        disabled={loading || googleLoading}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <Button
                type="button"
                className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base cursor-pointer"
                disabled={loading || googleLoading}
                onClick={handleEmailAuth}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {showForgotPassword
                  ? "Send Reset Email"
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </Button>
            </div>

            {/* Navigation Links */}
            {showForgotPassword ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="text-sm font-medium text-primary hover:text-primary/80 underline"
                  disabled={loading || googleLoading}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {/* Toggle Auth Mode */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="ml-1 font-medium text-primary hover:text-primary/80 underline cursor-pointer"
                      disabled={loading || googleLoading}
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </p>
                </div>

                {/* Forgot Password - only show on sign in */}
                {!isSignUp && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:text-primary/80 underline cursor-pointer"
                      disabled={loading || googleLoading}
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
