import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, GraduationCap, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 1. Create user in Firebase Auth
      const { user } = await register(formData.email, formData.password);
      const token = await user.getIdToken();
      
      // 2. Register profile in our Backend
      await axios.post('/api/auth/register', {
        name: formData.name,
        role: formData.role,
        studentId: formData.role === 'student' ? formData.studentId : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/');
    } catch (err) {
      console.error("Registration Error Details:", err);
      // Show specific Firebase error messages or Backend messages
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create account';
      setError(`${errorMessage} (${err.code || 'Internal Error'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(23,209,90,0.05)_0%,transparent_50%)]">
      <div className="w-full max-w-lg space-y-8 glass-card p-10 relative">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="text-text-secondary mt-2">Join the KSAC Event Management portal</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'student', label: 'Student', icon: User },
              { id: 'fic', label: 'Faculty', icon: GraduationCap },
              { id: 'ksac_core', label: 'Core', icon: ShieldCheck }
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: role.id })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                  formData.role === role.id 
                  ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(23,209,90,0.1)]' 
                  : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                }`}
              >
                <role.icon size={20} />
                <span className="text-xs font-semibold">{role.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-text-muted" size={18} />
                <input
                  name="name"
                  type="text"
                  required
                  className="glass-input w-full pl-10"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-text-muted" size={18} />
                  <input
                    name="email"
                    type="email"
                    required
                    className="glass-input w-full pl-10 text-sm"
                    placeholder="email@kiit.ac.in"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary ml-1">Roll Number</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3.5 text-text-muted" size={18} />
                    <input
                      name="studentId"
                      type="text"
                      required
                      className="glass-input w-full pl-10 text-sm"
                      placeholder="2205xxxx"
                      value={formData.studentId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-text-muted" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  className="glass-input w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-text-secondary text-sm pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
