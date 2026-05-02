// src/components/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, Calendar, Users, Award, Shield, Zap, 
  ArrowRight, CheckCircle, Star, Clock, Activity,
  Heart, Sparkles, TrendingUp, MapPin, Phone, Mail,
  Instagram, Facebook, Twitter, Menu, X, Smartphone,
  LogIn, UserPlus, RefreshCw, Bell, ChevronRight,
  Target, Flame, HeartPulse, Leaf, Gift, CalendarCheck,
  ShieldCheck, Sparkle, Lock, Droplets
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [logoError, setLogoError] = useState(false); 

  // Refs for scroll animations
  const whyUsRef = useRef<HTMLElement>(null);
  const equipmentRef = useRef<HTMLElement>(null);
  const memberExperienceRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const timingsRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const [visibleSections, setVisibleSections] = useState({
    whyUs: false,
    equipment: false,
    memberExperience: false,
    about: false,
    timings: false,
    portal: false,
    cta: false
  });

  // Handle scroll for navbar and section animations
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Check which sections are visible
      const sections = [
        { ref: whyUsRef, name: 'whyUs' },
        { ref: equipmentRef, name: 'equipment' },
        { ref: memberExperienceRef, name: 'memberExperience' },
        { ref: aboutRef, name: 'about' },
        { ref: timingsRef, name: 'timings' },
        { ref: portalRef, name: 'portal' },
        { ref: ctaRef, name: 'cta' }
      ];

      const newVisibility = { ...visibleSections };
      const windowHeight = window.innerHeight;

      sections.forEach(({ ref, name }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isVisible = rect.top < windowHeight - 100 && rect.bottom > 100;
          if (isVisible && !visibleSections[name as keyof typeof visibleSections]) {
            newVisibility[name as keyof typeof visibleSections] = true;
          }
        }
      });

      setVisibleSections(newVisibility);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const equipmentItems = [
    { 
      name: "PREMIUM TREADMILLS", 
      categories: ["CARDIO", "RUNNING"], 
      image: "https://i.pinimg.com/1200x/80/7a/59/807a59aa74c23dcbeed35104f1547337.jpg",
      description: "Latest technology with heart rate monitoring and incline control",
      icon: <Activity size={20} />
    },
    { 
      name: "SMITH MACHINE", 
      categories: ["STRENGTH", "POWERLIFTING"], 
      image: "https://i.pinimg.com/1200x/e2/df/de/e2dfdea694be924c1b904e1e5ffdab47.jpg",
      description: "Commercial grade strength training with safety locks",
      icon: <Dumbbell size={20} />
    },
    { 
      name: "DUMBBELLS SET", 
      categories: ["FREE WEIGHTS", "STRENGTH"], 
      image: "https://i.pinimg.com/1200x/5b/ef/2c/5bef2c7a9194a11dcf9eb3e1a5eec37e.jpg",
      description: "2kg to 50kg pairs available with rack storage",
      icon: <Target size={20} />
    },
    { 
      name: "FUNCTIONAL TRAINING", 
      categories: ["TRAINING", "HIIT"], 
      image: "https://i.pinimg.com/1200x/4a/b9/32/4ab932cf13dca94a9822e191eef8b0a6.jpg",
      description: "Kettlebells, battle ropes, TRX, medicine balls & plyo boxes",
      icon: <Flame size={20} />
    },
    { 
      name: "CARDIO ZONE", 
      categories: ["CARDIO", "ENDURANCE"], 
      image: "https://i.pinimg.com/736x/2d/ad/82/2dad82e9b128e2cd7734c6f0d427b574.jpg",
      description: "Premium treadmills, ellipticals, cycles & rowing machines",
      icon: <HeartPulse size={20} />
    },
    { 
      name: "PREMIUM LOCKER ROOM", 
      categories: ["FACILITIES", "CHANGING ROOM"], 
      image: "https://i.pinimg.com/1200x/d9/d0/52/d9d0520b4580b116df30ee62c164cd5c.jpg",
      description: "Spacious lockers, premium showers & modern changing area",
      icon: <Droplets size={20} />
    }
  ];

  const whyChoosePoints = [
    { text: "Clean workout environment", icon: <Leaf size={18} />, color: "emerald" },
    { text: "Modern strength & cardio equipment", icon: <Dumbbell size={18} />, color: "blue" },
    { text: "Easy member management", icon: <Users size={18} />, color: "purple" },
    { text: "Supportive fitness atmosphere", icon: <Heart size={18} />, color: "pink" },
    { text: "Convenient location", icon: <MapPin size={18} />, color: "orange" },
    { text: "Personalized guidance available", icon: <Award size={18} />, color: "amber" }
  ];

  const memberExperiencePoints = [
    {
      title: "SMOOTH CHECK-IN",
      description: "Quick and hassle-free entry with our digital check-in system",
      icon: <LogIn size={24} />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "MEMBERSHIP REMINDERS",
      description: "Automated email notifications for renewals and updates",
      icon: <Mail size={24} />,
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "DIGITAL SUPPORT",
      description: "24/7 online assistance for all your fitness queries",
      icon: <Smartphone size={24} />,
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "EXCLUSIVE OFFERS",
      description: "Special discounts and offers available only for members",
      icon: <Gift size={24} />,
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "EASY RENEWALS",
      description: "One-click membership renewal through member portal",
      icon: <RefreshCw size={24} />,
      gradient: "from-violet-500 to-purple-500"
    }
  ];

// ✅ FIXED - Logo Component with working image
  const Logo = () => (
  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
    {!logoError ? (
      <img 
        src="/logo.png" 
        alt="Gym Logo" 
        className="w-10 h-10 object-contain transition-all duration-300 group-hover:scale-105"
        onError={() => setLogoError(true)}
      />
    ) : (
      <Dumbbell className="text-red-600" size={28} />
    )}
    <div>
        <span className="text-xl font-bold tracking-wide text-black">PERFECT</span>
        <span className="text-xl font-bold tracking-wide text-red-600"> FITNESS </span>
        <p className="text-[10px] tracking-[0.2em] text-gray-500">CLUB</p>
      </div>
    </div>
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const getPointColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100",
      blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-100",
      purple: "text-purple-600 bg-purple-50 group-hover:bg-purple-100",
      pink: "text-pink-600 bg-pink-50 group-hover:bg-pink-100",
      orange: "text-orange-600 bg-orange-50 group-hover:bg-orange-100",
      amber: "text-amber-600 bg-amber-50 group-hover:bg-amber-100"
    };
    return colors[color] || "text-green-600 bg-green-50 group-hover:bg-green-100";
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl' : 'bg-white border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo />
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['HOME', 'FACILITIES', 'MEMBER PORTAL', 'TIMINGS'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="text-xs tracking-wide text-black hover:text-red-600 transition-all duration-300 font-semibold relative group py-2"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>
            
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => navigate('/member-login')}
                className="px-5 py-2 text-xs tracking-wide text-red-600 border-2 border-red-600 hover:bg-red-50 hover:border-red-700 transition-all duration-300 font-semibold rounded-lg hover:shadow-md"
              >
                MEMBER
              </button>
              <button
                onClick={() => navigate('/admin-login')}
                className="px-5 py-2 text-xs tracking-wide bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold rounded-lg shadow-md hover:shadow-lg"
              >
                ADMIN 
              </button>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 transition-colors duration-300 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div className={`md:hidden bg-white border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 px-4">
            <div className="flex flex-col gap-3">
              {['HOME', 'FACILITIES', 'MEMBER PORTAL', 'TIMINGS'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="text-xs tracking-wide text-black hover:text-red-600 transition-colors duration-300 font-semibold py-2 text-left px-3 hover:bg-red-50 rounded-lg"
                >
                  {item}
                </button>
              ))}
              <div className="flex gap-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => navigate('/member-login')}
                  className="flex-1 py-2 text-xs tracking-wide text-red-600 border-2 border-red-600 hover:bg-red-50 transition-all duration-300 font-semibold rounded-lg"
                >
                  MEMBER
                </button>
                <button
                  onClick={() => navigate('/admin-login')}
                  className="flex-1 py-2 text-xs tracking-wide bg-red-600 text-white hover:bg-red-700 transition-all duration-300 font-semibold rounded-lg"
                >
                  ADMIN 
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen pt-20 px-4 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop"
            alt="Gym Interior"
            className="w-full h-full object-cover animate-scale-slow"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center min-h-[calc(100vh-5rem)]">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-block mb-6 px-4 py-1 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-500/30">
              <span className="text-xs font-medium text-red-400 tracking-wide">✦ PREMIUM FITNESS CLUB ✦</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              TRAIN BETTER.
              <br />
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                STAY CONSISTENT.
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl">
              Modern fitness space with quality equipment and seamless member experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/member-login')}
                className="group px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-sm tracking-wide rounded-lg hover:scale-105 hover:shadow-xl flex items-center gap-2"
              >
                MEMBER
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('timings')}
                className="px-8 py-3 border-2 border-gray-500 text-gray-300 hover:bg-white/10 hover:border-red-500 transition-all duration-300 font-semibold text-sm tracking-wide rounded-lg flex items-center gap-2"
              >
                CONTACT US
              </button>
            </div>

            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-white">600+</p>
                <p className="text-xs text-gray-400">Active Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">30+</p>
                <p className="text-xs text-gray-400">Equipment</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-gray-400">Support</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section 
        ref={whyUsRef}
        id="facilities" 
        className={`py-24 px-4 bg-white relative transition-all duration-700 ${
          visibleSections.whyUs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-600 mx-auto mb-4"></div>
              <p className="text-sm font-medium text-red-600 tracking-wide mb-2">WHY CHOOSE US</p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-black tracking-tight mb-4">
              WHY CHOOSE <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">US</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience fitness at its finest with our premium facilities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoosePoints.map((point, idx) => (
              <div 
                key={idx}
                className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-lg border border-gray-100 hover:border-red-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${getPointColor(point.color)}`}>
                  {point.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Section */}
      <section 
        ref={equipmentRef}
        id="equipment" 
        className={`py-24 px-4 bg-gradient-to-b from-gray-50 to-white transition-all duration-700 ${
          visibleSections.equipment ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-600 mx-auto mb-4"></div>
              <p className="text-sm font-medium text-red-600 tracking-wide mb-2">OUR FACILITIES</p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-black tracking-tight mb-4">
              TRAIN WITH THE <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">RIGHT EQUIPMENT</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              State-of-the-art machines for an unparalleled workout experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipmentItems.map((item, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group transform transition-all duration-500 hover:-translate-y-2"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl transition-all duration-500 group-hover:shadow-2xl">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?background=ef4444&color=fff&name=${encodeURIComponent(item.name)}&length=2&size=120&font-size=40&bold=true`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {item.categories.map((cat, catIdx) => (
                        <span key={catIdx} className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-md">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-5 bg-white">
                    <h3 className="text-base font-bold text-black tracking-wide mb-2 group-hover:text-red-600 transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 transform transition-all duration-300 max-h-0 overflow-hidden group-hover:max-h-20 group-hover:pt-2">
                      <div className="flex items-center gap-2 text-red-600 text-xs font-medium">
                        {item.icon}
                        <span>Learn more →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Experience Section */}
      <section 
        ref={memberExperienceRef}
        id="member-portal" 
        className={`py-24 px-4 bg-white relative transition-all duration-700 ${
          visibleSections.memberExperience ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-600 mx-auto mb-4"></div>
              <p className="text-sm font-medium text-red-600 tracking-wide mb-2">DIGITAL EXPERIENCE</p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-black tracking-tight mb-4">
              MEMBER <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">EXPERIENCE</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seamless digital experience for all our members
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memberExperiencePoints.map((point, idx) => (
              <div 
                key={idx}
                className="group text-center p-8 rounded-2xl bg-white border border-gray-100 hover:border-red-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${point.gradient} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                  {point.icon}
                </div>
                <h3 className="text-sm font-bold text-black tracking-wide mb-2 group-hover:text-red-600 transition-colors duration-300">{point.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Gym Section */}
      <section 
        ref={aboutRef}
        className={`py-24 px-4 bg-gradient-to-b from-gray-50 to-white transition-all duration-700 ${
          visibleSections.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-600 mb-4"></div>
                <p className="text-sm font-medium text-red-600 tracking-wide mb-2">OUR STORY</p>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-black tracking-tight">
                ABOUT <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">THE GYM</span>
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Built to help members stay consistent with quality training space, disciplined environment, and modern systems.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Perfect Fitness Club provides a premium workout environment with state-of-the-art equipment, 
                professional guidance, and a supportive community. Our mission is to help you achieve your fitness goals 
                through consistency, discipline, and modern fitness management systems.
              </p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => scrollToSection('timings')} className="px-6 py-2.5 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold text-sm">
                  Visit Us
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <h3 className="text-lg font-bold text-black tracking-wide mb-6 flex items-center gap-2">
                <Award size={20} className="text-red-600" />
                WHY MEMBERS LOVE US
              </h3>
              <ul className="space-y-4">
                {[
                  "Clean and hygienic environment",
                  "Well-maintained equipment",
                  "Professional trainers available",
                  "Flexible membership plans",
                  "Digital member portal access"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 hover:text-red-600 transition-colors duration-300 cursor-pointer group">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition">
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timings & Location Section */}
      <section 
        ref={timingsRef}
        id="timings" 
        className={`py-24 px-4 bg-gradient-to-b from-gray-50 to-white transition-all duration-700 ${
          visibleSections.timings ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block">
              <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-600 mx-auto mb-4"></div>
              <p className="text-sm font-medium text-red-600 tracking-wide mb-2">VISIT US</p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-black tracking-tight mb-4">
              TIMINGS & <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">LOCATION</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit us at our convenient location
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                  <Clock size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-wide">OPENING HOURS</h3>
              </div>
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                  <div key={idx} className="flex justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                    <span className="text-gray-600 font-medium">{day}</span>
                    <span className="font-semibold text-black">5:00 AM - 10:00 PM</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 px-4 bg-green-50 rounded-lg mt-2">
                  <span className="text-gray-600 font-medium">Parking</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Available</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                  <MapPin size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-wide">LOCATION</h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 flex items-start gap-2">
                  <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Kartiki Enterprises(Perfect Fitness Club), Kolwadi, Maharashtra - 412110</span>
                </p>
                <div className="rounded-xl overflow-hidden shadow-md h-64 w-full">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.5!2d73.856!3d18.520!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c2c4b0366b47%3A0x8ba574f881f5fd0d!2z4KSV4KWA4KSu4KSw4KS-4KS14KS-4KSf4KS-IOCkleCkv-CkpOCkvuCksuCkq-CkvuCksg!5e0!3m2!1sen!2sin!4v1745512312345!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    allowFullScreen 
                    loading="lazy"
                    title="Perfect Fitness Club Location"
                  ></iframe>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-500" />
                  Free parking available for members
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Portal Section */}
      <section 
        ref={portalRef}
        className={`py-24 px-4 bg-gradient-to-br from-red-700 to-red-900 relative overflow-hidden transition-all duration-700 ${
          visibleSections.portal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6">
            <div className="w-12 h-0.5 bg-white mx-auto mb-4"></div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
            MEMBER <span className="text-white">PORTAL</span>
          </h2>
          <p className="text-red-100 max-w-2xl mx-auto mb-10 text-lg">
            Members can manage profile, receive updates, and stay connected digitally.
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            <button
              onClick={() => navigate('/member-login')}
              className="group px-8 py-3.5 bg-white text-red-600 hover:bg-gray-100 transition-all duration-300 font-semibold text-sm tracking-wide rounded-xl hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            >
              LOGIN
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

{/* Footer */}
<footer className="py-16 px-4 bg-black border-t border-gray-800">
  <div className="max-w-7xl mx-auto">
    <div className="grid md:grid-cols-4 gap-10">
      <div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="Gym Logo" 
                className="w-8 h-8 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Dumbbell className="text-red-500" size={22} />
            )}
            <div>
              <span className="text-xl font-bold tracking-wide text-white">PERFECT</span>
              <span className="text-xl font-bold tracking-wide text-red-600"> FITNESS</span>
              <p className="text-[10px] tracking-[0.2em] text-gray-400">CLUB</p>
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed tracking-wide">
          Perfect Fitness Club, Kolwadi - Your journey to a healthier you starts here.
        </p>
      </div>
      <div>
        <h4 className="text-xs font-bold text-white tracking-wide mb-5 relative inline-block">
          QUICK LINKS
          <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-600"></span>
        </h4>
        <ul className="space-y-3 text-gray-400 text-xs tracking-wide">
          <li><button onClick={() => scrollToSection('home')} className="hover:text-red-400 transition-colors duration-300 flex items-center gap-1 group"> <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" /> HOME</button></li>
          <li><button onClick={() => scrollToSection('equipment')} className="hover:text-red-400 transition-colors duration-300 flex items-center gap-1 group"> <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" /> FACILITIES</button></li>
          <li><button onClick={() => scrollToSection('member-portal')} className="hover:text-red-400 transition-colors duration-300 flex items-center gap-1 group"> <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" /> MEMBER PORTAL</button></li>
          <li><button onClick={() => scrollToSection('timings')} className="hover:text-red-400 transition-colors duration-300 flex items-center gap-1 group"> <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" /> TIMINGS</button></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-bold text-white tracking-wide mb-5 relative inline-block">
          CONTACT INFO
          <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-600"></span>
        </h4>
        <ul className="space-y-4 text-gray-400 text-xs tracking-wide">
          <li className="flex items-start gap-3 hover:text-white transition-colors duration-300 group">
            <MapPin size={14} className="text-red-500 mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0" /> 
            <span>KOLWADI, MAHARASHTRA - 412110</span>
          </li>
          <li className="flex items-center gap-3 hover:text-white transition-colors duration-300 group">
            <Phone size={14} className="text-red-500 group-hover:scale-110 transition-transform" /> 
            <span>+91 8788864345</span>
          </li>
          <li className="flex items-center gap-3 hover:text-white transition-colors duration-300 group">
            <Mail size={14} className="text-red-500 group-hover:scale-110 transition-transform" /> 
            <span>perfectfitnessclub96@gmail.com</span>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-bold text-white tracking-wide mb-5 relative inline-block">
          FOLLOW US
          <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-600"></span>
        </h4>
        <div className="flex gap-4">
          <a 
            href="https://www.instagram.com/_perfectfitnessclub?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110"
          >
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-800 mt-10 pt-8 text-center text-gray-500 text-[10px] tracking-wide">
      <p>&copy; 2024 PERFECT FITNESS CLUB. ALL RIGHTS RESERVED. | KOLWADI, MAHARASHTRA - 412110</p>
    </div>
  </div>
</footer>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-red-600 text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:scale-110 flex items-center justify-center ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ArrowRight size={20} className="rotate-[-90deg]" />
      </button>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleSlow {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%) translateX(-50%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(0) translateX(-50%); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-scale-slow {
          animation: scaleSlow 20s ease-in-out infinite alternate;
        }
        
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
        
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}