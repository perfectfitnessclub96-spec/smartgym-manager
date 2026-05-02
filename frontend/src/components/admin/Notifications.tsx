// src/components/admin/Notifications.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import { 
  Send, Bell, AlertCircle, CheckCircle, ArrowLeft, Loader, 
  Users, MessageSquare, Mail, Clock, Zap,
  TrendingUp, Gift, Eye, FileText, Send as SendIcon
} from 'lucide-react';
import axios from '../../config/axios';
import { useToast } from '../../hooks/useToast';

export default function Notifications() {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sentCount?: number; failedCount?: number; totalMembers?: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [renderKey, setRenderKey] = useState(0);

  // Force re-render on language change
  useEffect(() => {
    const handleLanguageChange = () => {
      setRenderKey(prev => prev + 1);
      setTitle('');
      setMessage('');
      setSelectedTemplate('');
      setCharCount(0);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  // Templates with multilingual support
  const getTemplates = () => {
    const currentLang = i18n.language;
    
    if (currentLang === 'mr') {
      return [
        {
          id: 'holiday',
          name: 'सुट्टीची सूचना',
          title: ' जिम सुट्टीची सूचना',
          message: 'प्रिय सदस्यांनो,\n\n[तारीख] रोजी [कारण] साठी जिम बंद राहील.\n\nतुम्हाला सुट्टीच्या हार्दिक शुभेच्छा!\n\nसमजून घेतल्याबद्दल धन्यवाद.',
          
        },
        {
          id: 'maintenance',
          name: 'देखभाल सूचना',
          title: ' नियोजित देखभाल',
          message: 'प्रिय सदस्यांनो,\n\n[तारीख] रोजी [वेळ] ते [वेळ] दरम्यान जिमची नियोजित देखभाल केली जाईल.\n\nगैरसोयीबद्दल क्षमस्व.\n\nतुमच्या सहकार्याबद्दल धन्यवाद.',
          
        },
        {
          id: 'offer',
          name: 'विशेष ऑफर',
          title: ' विशेष सदस्यत्व ऑफर',
          message: 'प्रिय सदस्यांनो,\n\nवार्षिक सदस्यत्वावर [सवलत]% सवलत मिळवा! ऑफर [तारीख] पर्यंत वैध.\n\nअधिक माहितीसाठी फ्रंट डेस्कशी संपर्क साधा.\n\nघाई करा! मर्यादित कालावधीची ऑफर.',
          
        },
        {
          id: 'event',
          name: 'फिटनेस इव्हेंट',
          title: ' फिटनेस चॅलेंज इव्हेंट',
          message: 'प्रिय सदस्यांनो,\n\n[तारीख] रोजी [वेळ] ला आमच्या फिटनेस चॅलेंजमध्ये सहभागी व्हा.\n\nविजेत्यांसाठी बक्षिसे आणि प्रमाणपत्रे!\n\nफ्रंट डेस्कवर नोंदणी करा.',
          
        },
        {
          id: 'workshop',
          name: 'कार्यशाळा',
          title: ' योग कार्यशाळा',
          message: 'प्रिय सदस्यांनो,\n\n[तारीख] रोजी [वेळ] ला विशेष योग कार्यशाळा.\n\nतज्ञ प्रशिक्षकांकडून शिका.\n\nमर्यादित जागा. आत्ताच नोंदणी करा!',
          
        },
        {
          id: 'reminder',
          name: 'शुल्क स्मरणपत्र',
          title: ' सदस्यत्व नूतनीकरण स्मरणपत्र',
          message: 'प्रिय सदस्यांनो,\n\nतुमचे सदस्यत्व लवकरच संपत आहे. कृपया [तारीख] पूर्वी नूतनीकरण करा.\n\nसहाय्यासाठी फ्रंट डेस्कशी संपर्क साधा.\n\nधन्यवाद!',
      
        }
      ];
    }
    
    // English templates (default)
    return [
      {
        id: 'holiday',
        name: 'Holiday Notice',
        title: ' Gym Holiday Notice',
        message: 'Dear members,\n\nThe gym will remain closed on [DATE] due to [OCCASION].\n\nWe wish you a happy holiday!\n\nThank you for your understanding.',
       
      },
      {
        id: 'maintenance',
        name: 'Maintenance Alert',
        title: ' Scheduled Maintenance',
        message: 'Dear members,\n\nThe gym will undergo scheduled maintenance on [DATE] from [TIME] to [TIME].\n\nWe apologize for the inconvenience.\n\nThank you for your cooperation.',
        
      },
      {
        id: 'offer',
        name: 'Special Offer',
        title: ' Special Membership Offer',
        message: 'Dear members,\n\nGet [DISCOUNT]% off on annual membership! Offer valid till [DATE].\n\nContact front desk for more details.\n\nHurry up! Limited period offer.', 
      },
      {
        id: 'event',
        name: 'Fitness Event',
        title: ' Fitness Challenge Event',
        message: 'Dear members,\n\nJoin our fitness challenge on [DATE] at [TIME].\n\nPrizes and certificates for winners!\n\nRegister at the front desk.',
        
      },
      {
        id: 'workshop',
        name: 'Workshop',
        title: ' Yoga Workshop',
        message: 'Dear members,\n\nSpecial yoga workshop on [DATE] at [TIME].\n\nLearn from expert trainers.\n\nLimited seats available. Register now!',
        
      },
      {
        id: 'reminder',
        name: 'Fee Reminder',
        title: ' Membership Renewal Reminder',
        message: 'Dear members,\n\nYour membership is expiring soon. Please renew before [DATE] to avoid interruption.\n\nContact front desk for assistance.\n\nThank you!',
        
      }
    ];
  };

  const templates = getTemplates();

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setSelectedTemplate(template.id);
    setTitle(template.title);
    setMessage(template.message);
    setCharCount(template.message.length);
  };

  const clearForm = () => {
    setTitle('');
    setMessage('');
    setSelectedTemplate('');
    setCharCount(0);
    setResult(null);
  };

  const handleSendToAll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      showError('Please enter both title and message');
      return;
    }
    
    if (!confirm('Send this email notification to ALL members?')) {
      return;
    }
    
    setSending(true);
    setResult(null);
    
    try {
      const response = await axios.post('/api/notifications/send-email-to-all', { title, message });
      setResult(response.data.data);
      showSuccess(response.data.message);
      clearForm();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to send email notifications');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getText = (key: string, fallback: string): string => {
    try {
      const translated = t(key);
      if (translated === key || !translated) return fallback;
      return translated;
    } catch {
      return fallback;
    }
  };

  const stats = {
    totalMembers: result?.totalMembers || 0,
    sentCount: result?.sentCount || 0,
    failedCount: result?.failedCount || 0,
    successRate: result?.totalMembers ? Math.round((result.sentCount / result.totalMembers) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-white" key={renderKey}>
      <Sidebar role="ADMIN" onLogout={handleLogout} />

      <div className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{getText('admin.notifications', 'Email Notifications')}</h1>
                  <p className="text-gray-500 text-sm mt-1">{getText('notifications.subtitle', 'Send email notifications to all members')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                  <Bell className="text-gray-500" size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">{user?.name?.charAt(0) || 'A'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats Overview */}
            {result && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{getText('admin.totalMembers', 'Total Members')}</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalMembers}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="text-blue-600" size={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{getText('notifications.sentSuccess', 'Successfully Sent')}</p>
                      <p className="text-2xl font-bold text-green-600">{stats.sentCount}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{getText('common.failed', 'Failed')}</p>
                      <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="text-red-600" size={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">{getText('dashboard.successRate', 'Success Rate')}</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.successRate}%</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-purple-600" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Templates */}
              <div className="lg:col-span-1 space-y-6">
                {/* Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{getText('notifications.aboutTitle', 'Email Notifications')}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getText('notifications.aboutDescription', 'Emails will be sent to all active members who have registered their email addresses.')}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{getText('notifications.instantDelivery', 'Instant delivery • Professional templates')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Templates */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="text-red-600" size={18} />
                    <h3 className="font-semibold text-gray-800">{getText('notifications.quickTemplates', 'Quick Templates')}</h3>
                  </div>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                          selectedTemplate === template.id
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{template.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{template.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{template.title.substring(0, 40)}...</p>
                        </div>
                        {selectedTemplate === template.id && <CheckCircle size={16} className="text-red-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                  <div className="flex items-start gap-3">
                    <Zap className="text-yellow-600 mt-0.5" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{getText('notifications.proTips', 'Pro Tips')}</h4>
                      <ul className="text-xs text-gray-600 mt-2 space-y-1">
                        <li>• {getText('notifications.tip1', 'Keep messages concise and clear')}</li>
                        <li>• {getText('notifications.tip2', 'Use emojis to grab attention')}</li>
                        <li>• {getText('notifications.tip3', 'Include call-to-action when needed')}</li>
                        <li>• {getText('notifications.tip4', 'Avoid sending too many emails')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Send Email Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <SendIcon size={20} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">{getText('notifications.sendToAll', 'Send Email to All Members')}</h2>
                        <p className="text-sm text-red-100">{getText('notifications.composeMessage', 'Compose and send professional emails')}</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSendToAll} className="p-6 space-y-5">
                    {/* Title Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getText('notifications.title', 'Email Subject')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={getText('notifications.titlePlaceholder', 'e.g., Gym Holiday, Special Offer, Maintenance Alert')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800"
                          required
                        />
                      </div>
                    </div>

                    {/* Message Input */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {getText('notifications.message', 'Email Body')} <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-xs ${charCount > 5000 ? 'text-red-500' : 'text-gray-400'}`}>
                          {charCount} / 5000 {getText('common.characters', 'characters')}
                        </span>
                      </div>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={10}
                          placeholder={getText('notifications.messagePlaceholder', 'Enter your email content here...')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-800"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                         {getText('notifications.placeholderTip', 'Tip: Use placeholders like [DATE], [TIME], [DISCOUNT] for easy customization')}
                      </p>
                    </div>

                    {/* Preview Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition"
                    >
                      <Eye size={16} />
                      {showPreview ? getText('common.hidePreview', 'Hide Preview') : getText('common.showPreview', 'Show Preview')}
                    </button>

                    {/* Preview Section */}
                    {showPreview && (title || message) && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Mail size={16} className="text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">{getText('notifications.preview', 'Email Preview')}</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <Dumbbell size={14} className="text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">Perfect Fitness Club</p>
                              <p className="text-xs text-gray-400">{getText('notifications.previewTo', 'To: All Members')}</p>
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="font-semibold text-gray-800 text-base mb-2">{title || getText('notifications.previewTitle', 'Your Title Here')}</p>
                            <div className="h-px bg-gray-100 my-3"></div>
                            <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                              {message || getText('notifications.previewMessage', 'Your message will appear here...')}
                            </div>
                            <div className="h-px bg-gray-100 my-3"></div>
                            <div className="text-xs text-gray-400">
                               {new Date().toLocaleDateString()} • 📍 Perfect Fitness Club
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-red-600 text-white py-3.5 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {sending ? (
                        <><Loader size={18} className="animate-spin" /> {getText('notifications.sending', 'Sending emails...')}</>
                      ) : (
                        <><SendIcon size={18} /> {getText('notifications.sendButton', 'Send Email to All Members')}</>
                      )}
                    </button>

                    {/* Clear Button */}
                    {(title || message) && !sending && (
                      <button type="button" onClick={clearForm} className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition">
                        {getText('common.clearForm', 'Clear Form')}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}