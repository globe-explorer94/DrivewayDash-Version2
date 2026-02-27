import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Snowflake, 
  MapPin, 
  Clock, 
  Zap, 
  Plus, 
  Search, 
  User, 
  LogOut, 
  ChevronRight, 
  Calendar,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Home,
  Menu,
  X,
  AlertCircle,
  CloudSnow,
  Thermometer,
  Wind,
  Lightbulb
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

// Lazy initialize AI to prevent white screen if API key is missing
let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// --- Types ---

type UserRole = 'helper' | 'homeowner';

interface Job {
  id: string;
  title: string;
  description: string;
  city: string;
  price: number;
  type: 'Shoveling' | 'Salting' | 'Scraping';
  isHighPriority: boolean;
  postedAt: string;
  postedBy: string;
  status: 'open' | 'in-progress' | 'completed';
}

interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

// --- Constants ---

const CITIES = [
  "Mississauga", "Oakville", "Brampton", "Markham", 
  "Vaughan", "Richmond Hill", "Burlington", "Milton", "Guelph"
];

const JOB_TYPES = ["Shoveling", "Salting", "Scraping"];

// --- Mock Data ---

const INITIAL_JOBS: Job[] = [];

// --- Components ---

const Navbar = ({ user, onLogout }: { user: UserProfile | null, onLogout: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-primary-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Snowflake className="text-bright-cyan animate-pulse" />
            <span className="text-xl font-bold tracking-tight">DrivewayDash</span>
          </div>

          {user && (
            <div className="hidden md:flex items-center gap-6">
              <span className="text-sm text-soft-cream">Welcome, {user.name}</span>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm hover:text-bright-cyan transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-dark border-t border-white/10 px-4 py-4 space-y-4"
          >
            {user ? (
              <>
                <div className="text-soft-cream font-medium">Logged in as {user.name}</div>
                <button 
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 py-2 hover:text-bright-cyan"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="text-soft-cream">Please login to continue</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AuthScreen = ({ onLogin }: { onLogin: (user: UserProfile) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('homeowner');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated auth
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      username,
      name: isLogin ? username : name,
      role
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-primary-dark text-white mb-4">
            <Snowflake size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary-dark">DrivewayDash</h1>
          <p className="text-slate-500 mt-2">Fast winter help for the GTA commuter</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medium-blue focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medium-blue focus:border-transparent outline-none transition-all"
              placeholder="johndoe123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medium-blue focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('homeowner')}
                  className={`py-2 px-4 rounded-lg border transition-all ${role === 'homeowner' ? 'bg-primary-dark text-white border-primary-dark' : 'bg-white text-slate-600 border-slate-300'}`}
                >
                  Homeowner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('helper')}
                  className={`py-2 px-4 rounded-lg border transition-all ${role === 'helper' ? 'bg-primary-dark text-white border-primary-dark' : 'bg-white text-slate-600 border-slate-300'}`}
                >
                  Helper
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="w-full py-3 rounded-lg btn-primary font-semibold mt-4">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-medium-blue hover:underline text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const JobCard = ({ job, onAccept, onCancel, userRole, currentUserName }: { 
  job: Job, 
  onAccept?: (id: string) => void, 
  onCancel?: (id: string) => void,
  userRole: UserRole, 
  currentUserName?: string,
  key?: string | number 
}) => {
  const isOwner = job.postedBy === currentUserName;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-5 hover:shadow-xl transition-shadow relative overflow-hidden group"
    >
      {job.isHighPriority && (
        <div className="absolute top-0 right-0 bg-bright-cyan text-primary-dark px-3 py-1 rounded-bl-xl flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
          <Zap size={14} fill="currentColor" />
          High Priority
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${job.type === 'Shoveling' ? 'bg-blue-100 text-blue-600' : job.type === 'Salting' ? 'bg-amber-100 text-amber-600' : 'bg-cyan-100 text-cyan-600'}`}>
            {job.type === 'Shoveling' ? <Snowflake size={20} /> : job.type === 'Salting' ? <AlertCircle size={20} /> : <Zap size={20} />}
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.type}</span>
        </div>
        <span className="text-2xl font-bold text-primary-dark">${job.price}</span>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2">{job.title}</h3>
      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-medium-blue" />
          {job.city}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-medium-blue" />
          {new Date(job.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-1">
          <User size={14} className="text-medium-blue" />
          {isOwner ? 'You' : job.postedBy}
        </div>
      </div>

      <div className="flex gap-2">
        {userRole === 'helper' && job.status === 'open' && (
          <button 
            onClick={() => onAccept?.(job.id)}
            className="flex-grow py-2 rounded-lg btn-secondary font-semibold flex items-center justify-center gap-2"
          >
            Accept Job
            <ChevronRight size={18} />
          </button>
        )}

        {userRole === 'homeowner' && isOwner && job.status === 'open' && (
          <button 
            onClick={() => onCancel?.(job.id)}
            className="flex-grow py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Cancel Job
          </button>
        )}
      </div>

      {job.status === 'in-progress' && (
        <div className="w-full py-2 rounded-lg bg-amber-100 text-amber-700 font-semibold text-center text-sm">
          In Progress
        </div>
      )}

      {job.status === 'completed' && (
        <div className="w-full py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold text-center text-sm">
          Completed
        </div>
      )}
    </motion.div>
  );
};

const HelperDashboard = ({ jobs, onAccept, currentUser }: { jobs: Job[], onAccept: (id: string) => void, currentUser: UserProfile }) => {
  const [filterCity, setFilterCity] = useState<string>('All Cities');
  const [filterType, setFilterType] = useState<string>('All Types');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const cityMatch = filterCity === 'All Cities' || job.city === filterCity;
      const typeMatch = filterType === 'All Types' || job.type === filterType;
      const searchMatch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
      return cityMatch && typeMatch && searchMatch && job.status === 'open';
    });
  }, [jobs, filterCity, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">Live Job Feed</h2>
          <p className="text-slate-500">Find snow clearing tasks in your area</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-medium-blue w-full md:w-48"
            />
          </div>
          <select 
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-medium-blue"
          >
            <option>All Cities</option>
            {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-2 focus:ring-medium-blue"
          >
            <option>All Types</option>
            {JOB_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onAccept={onAccept} userRole="helper" currentUserName={currentUser.name} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
            <Search size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No jobs found</h3>
          <p className="text-slate-500">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
};

const HomeownerDashboard = ({ jobs, onPostJob, onCancelJob, currentUser }: { jobs: Job[], onPostJob: (job: Omit<Job, 'id' | 'postedAt' | 'postedBy' | 'status'>) => void, onCancelJob: (id: string) => void, currentUser: UserProfile }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: CITIES[0],
    price: 30,
    type: 'Shoveling' as Job['type'],
    isHighPriority: false
  });

  const myJobs = jobs.filter(j => j.postedBy === currentUser.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPostJob(formData);
    setIsPosting(false);
    setFormData({
      title: '',
      description: '',
      city: CITIES[0],
      price: 30,
      type: 'Shoveling',
      isHighPriority: false
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">My Requests</h2>
          <p className="text-slate-500">Manage your snow clearing postings</p>
        </div>
        <button 
          onClick={() => setIsPosting(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg btn-primary font-bold"
        >
          <Plus size={20} />
          Post New Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myJobs.map(job => (
          <JobCard key={job.id} job={job} userRole="homeowner" currentUserName={currentUser.name} onCancel={onCancelJob} />
        ))}
        {myJobs.length === 0 && !isPosting && (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl">
            <p className="text-slate-400">You haven't posted any jobs yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-dark">Post a Job</h3>
                <button onClick={() => setIsPosting(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-medium-blue"
                    placeholder="e.g. Clear 2-car driveway"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-medium-blue"
                    placeholder="Provide details like specific areas to clear..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <select 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-medium-blue"
                    >
                      {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                    <input 
                      type="number" 
                      required
                      min="10"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-medium-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {JOB_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type: type as Job['type']})}
                        className={`py-2 px-1 text-xs rounded-lg border transition-all ${formData.type === type ? 'bg-primary-dark text-white border-primary-dark' : 'bg-white text-slate-600 border-slate-300'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="highPriority"
                    checked={formData.isHighPriority}
                    onChange={(e) => setFormData({...formData, isHighPriority: e.target.checked})}
                    className="w-4 h-4 text-bright-cyan rounded focus:ring-bright-cyan"
                  />
                  <label htmlFor="highPriority" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <Zap size={14} className="text-bright-cyan" />
                    High Priority (Needed before 7:30 AM)
                  </label>
                </div>
                <button type="submit" className="w-full py-3 rounded-lg btn-primary font-bold mt-4">
                  Post Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [currentView, setCurrentView] = useState<'find' | 'post'>('find');
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [winterTip, setWinterTip] = useState<string>("Stay warm and salt your walkways early!");
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  const fetchWinterTip = async () => {
    const ai = getAI();
    if (!ai) {
      setWinterTip("Stay safe and keep your driveway clear!");
      return;
    }
    setIsLoadingTip(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give a short, professional, and helpful winter safety or snow clearing tip for a GTA resident. Max 15 words.",
      });
      if (response.text) {
        setWinterTip(response.text.trim());
      }
    } catch (error) {
      console.error("Error fetching tip:", error);
      setWinterTip("Salt your walkways early to prevent ice buildup.");
    } finally {
      setIsLoadingTip(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchWinterTip();
      fetchJobs();
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchJobs, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    // Set default view based on role
    setCurrentView(profile.role === 'helper' ? 'find' : 'post');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAcceptJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-progress' })
      });
      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === id ? { ...job, status: 'in-progress' } : job
        ));
        alert("Job accepted! The homeowner has been notified.");
      }
    } catch (error) {
      console.error("Error accepting job:", error);
    }
  };

  const handleCancelJob = async (id: string) => {
    if (confirm("Are you sure you want to cancel this job?")) {
      try {
        const response = await fetch(`/api/jobs/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setJobs(prev => prev.filter(job => job.id !== id));
        }
      } catch (error) {
        console.error("Error canceling job:", error);
      }
    }
  };

  const handlePostJob = async (newJobData: Omit<Job, 'id' | 'postedAt' | 'postedBy' | 'status'>) => {
    if (!user) return;
    const newJob: Job = {
      ...newJobData,
      id: Math.random().toString(36).substr(2, 9),
      postedAt: new Date().toISOString(),
      postedBy: user.name,
      status: 'open'
    };
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (response.ok) {
        setJobs(prev => [newJob, ...prev]);
      }
    } catch (error) {
      console.error("Error posting job:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={null} onLogout={handleLogout} />
        <AuthScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
          <button 
            onClick={() => setCurrentView('post')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${currentView === 'post' ? 'bg-primary-dark text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Post Jobs
          </button>
          <button 
            onClick={() => setCurrentView('find')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${currentView === 'find' ? 'bg-primary-dark text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Find Jobs
          </button>
        </div>

        {/* Mission Statement Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-primary-dark rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-center"
          >
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">DrivewayDash</h1>
              <p className="text-soft-cream/90 max-w-2xl">
                Fast winter help for the GTA commuter. Shoveling, Salting, and Scaping on-demand.
              </p>
            </div>
            <Snowflake className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">GTA Weather</div>
                <div className="text-2xl font-bold text-primary-dark">-4°C</div>
              </div>
              <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                <CloudSnow size={24} />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Wind size={14} /> Wind</span>
                <span className="font-semibold text-slate-700">15 km/h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Thermometer size={14} /> Feels like</span>
                <span className="font-semibold text-slate-700">-9°C</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
              <div className="mt-1 text-bright-cyan">
                <Lightbulb size={16} fill="currentColor" />
              </div>
              <p className="text-xs text-slate-600 italic">
                {isLoadingTip ? "Generating tip..." : winterTip}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats / Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Jobs</div>
              <div className="text-lg font-bold text-slate-800">{jobs.filter(j => j.status === 'open').length}</div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <User size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Community</div>
              <div className="text-lg font-bold text-slate-800">Active</div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
              <Calendar size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Today</div>
              <div className="text-lg font-bold text-slate-800">Feb 26</div>
            </div>
          </div>
          <button 
            onClick={() => setShowCitiesModal(true)}
            className="glass-card rounded-xl p-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary-dark/10 text-primary-dark">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Cities</div>
              <div className="text-lg font-bold text-slate-800 flex items-center gap-1">
                9 <ChevronRight size={16} />
              </div>
            </div>
          </button>
        </div>

        {/* Dashboard Content */}
        {currentView === 'find' ? (
          <HelperDashboard jobs={jobs} onAccept={handleAcceptJob} currentUser={user} />
        ) : (
          <HomeownerDashboard jobs={jobs} onPostJob={handlePostJob} onCancelJob={handleCancelJob} currentUser={user} />
        )}
      </main>

      {/* Cities Modal */}
      <AnimatePresence>
        {showCitiesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-dark">Service Areas</h3>
                <button onClick={() => setShowCitiesModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CITIES.map(city => (
                  <div key={city} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                    <MapPin size={16} className="text-medium-blue" />
                    {city}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowCitiesModal(false)}
                className="w-full mt-6 py-3 rounded-lg btn-primary font-bold"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50">
        <button 
          onClick={() => setCurrentView('find')}
          className={`flex flex-col items-center gap-1 ${currentView === 'find' ? 'text-medium-blue' : 'text-slate-400'}`}
        >
          <Briefcase size={20} />
          <span className="text-[10px] font-bold uppercase">Find</span>
        </button>
        <button 
          onClick={() => setCurrentView('post')}
          className={`flex flex-col items-center gap-1 ${currentView === 'post' ? 'text-medium-blue' : 'text-slate-400'}`}
        >
          <Plus size={20} />
          <span className="text-[10px] font-bold uppercase">Post</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <User size={20} />
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </div>

      <footer className="hidden md:block py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Snowflake className="text-medium-blue" size={20} />
            <span className="font-bold text-primary-dark">DrivewayDash</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 DrivewayDash. Serving the GTA and Guelph with pride.</p>
        </div>
      </footer>
    </div>
  );
}
