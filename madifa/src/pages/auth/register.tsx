import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function getPasswordStrength(pass: string): { score: number; message: string; color: string } {
  const hasLower = /[a-z]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  const length = pass.length;

  let score = 0;
  if (length >= 8) score++;
  if (hasLower && hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (length >= 12) score++;

  const messages = [
    { message: 'Very weak', color: 'bg-red-500' },
    { message: 'Weak', color: 'bg-orange-500' },
    { message: 'Fair', color: 'bg-yellow-500' },
    { message: 'Good', color: 'bg-blue-500' },
    { message: 'Strong', color: 'bg-green-500' }
  ];

  return { score, ...messages[score] };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const strengthId = 'password-strength';

  return (
    <div className="mt-1" id={strengthId}>
      <Progress
        value={strength.score}
        max={4}
        segments={5}
        color={strength.color}
        valueText={`Password strength: ${strength.message}`}
        label="Password strength indicator"
      />
      <p className={`mt-1 text-sm ${strength.score > 2 ? 'text-green-600' : 'text-red-600'}`}>
        Password strength: {strength.message}
      </p>
      <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
        <li className={password.length >= 8 ? 'text-green-600' : ''}>
          <span className="inline-flex items-center">
            {password.length >= 8 ? '✓' : '○'} At least 8 characters
          </span>
        </li>
        <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-600' : ''}>
          <span className="inline-flex items-center">
            {/[a-z]/.test(password) && /[A-Z]/.test(password) ? '✓' : '○'} Mix of uppercase & lowercase letters
          </span>
        </li>
        <li className={/\d/.test(password) ? 'text-green-600' : ''}>
          <span className="inline-flex items-center">
            {/\d/.test(password) ? '✓' : '○'} At least one number
          </span>
        </li>
        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}>
          <span className="inline-flex items-center">
            {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} At least one special character
          </span>
        </li>
      </ul>
    </div>
  );
}

export function Register() {
  const [formData, setFormData] = useState<FormData>(() => {
    const savedData = localStorage.getItem('registerForm');
    return savedData ? JSON.parse(savedData) : {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('registerForm', JSON.stringify(formData));
  }, [formData]);

  const clearSavedForm = () => {
    localStorage.removeItem('registerForm');
  };

  const validateForm = (): boolean => {
    const validationErrors: FormErrors = {};
    
    if (!formData.fullName.trim()) {
      validationErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      validationErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      validationErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      validationErrors.email = 'Invalid email address';
    }

    const strength = getPasswordStrength(formData.password);
    if (strength.score < 3) {
      validationErrors.password = 'Password is not strong enough';
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.fullName);
      clearSavedForm();
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit} 
          noValidate
          aria-live="polite"
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="full-name" className="sr-only">
                Full name
              </label>
              <input  

                id="full-name"
                name="fullName"
                type="text"
                required
                
                aria-describedby={errors.fullName ? 'fullname-error' : undefined}
                className={cn(
                  'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                  errors.fullName && 'border-red-300'
                )}
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && (
                <p 
                  className="mt-1 text-sm text-red-600" 
                  id="fullname-error"
                  role="alert"
                >
                  {errors.fullName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={cn(
                  'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                  errors.email && 'border-red-300'
                )}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p 
                  className="mt-1 text-sm text-red-600" 
                  id="email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
               
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={cn(
                  'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                  errors.password && 'border-red-300'
                )}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p 
                  className="mt-1 text-sm text-red-600" 
                  id="password-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                className={cn(
                  'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                  errors.confirmPassword && 'border-red-300'
                )}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p 
                  className="mt-1 text-sm text-red-600" 
                  id="confirm-password-error"
                  role="alert"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <PasswordStrengthIndicator password={formData.password} />

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; 