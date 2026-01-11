import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X, Send, History } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import clsx from 'clsx';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CampaignManager = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [recentUploads, setRecentUploads] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('birthday'); // 'birthday' | 'appointment'
  const [starting, setStarting] = useState(false);
  const [startResult, setStartResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Simulate fetching history
    const timer = setTimeout(() => {
      setRecentUploads([
        { id: 1, name: 'leads_nov_2024.csv', date: '2 days ago', status: 'completed' },
        { id: 2, name: 'webinar_attendees.csv', date: '5 days ago', status: 'completed' },
        { id: 3, name: 'churned_users.csv', date: '1 week ago', status: 'failed' }
      ]);
      setLoadingHistory(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      alert("Please upload a CSV file");
      return;
    }
    setFile(file);
    setStatus('idle');
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setStatus('uploading');
      setProgress(0);
      setStartResult(null);
      const form = new FormData();
      form.append('file', file);
      form.append('name', file.name.replace('.csv',''));
      form.append('templateName', 'unspecified');
      const resp = await api.post('/campaigns', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded * 100) / (evt.total || file.size));
          setProgress(pct);
        }
      });
      setCampaign(resp.data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleStartCampaign = async () => {
    if (!campaign) return;
    try {
      setStarting(true);
      setStartResult(null);
      const resp = await api.post('/campaigns/start', {
        campaignId: campaign._id || campaign.id,
        templateType: selectedTemplate
      });
      setStartResult(resp.data);
      // Refresh campaign stats client side
      setCampaign({ ...campaign, status: resp.data.status, stats: { ...(campaign.stats||{}), sent: resp.data.sent }, audienceCount: resp.data.total });
    } catch (err) {
      setStartResult({ success: false, error: err?.response?.data?.message || 'Failed to start campaign' });
    } finally {
      setStarting(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Campaign Manager</h2>
        <p className="text-slate-400">Upload CSV to start a new broadcast campaign</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <div 
              className={clsx(
                "border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer relative overflow-hidden",
                dragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50",
                status === 'success' && "border-emerald-500 bg-emerald-500/10"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input 
                ref={inputRef}
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={handleChange}
              />
              
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Upload size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Recipient List</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                      Drag and drop your CSV file here, or click to browse files
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText size={14} />
                      <span>Supported format: .csv</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center w-full"
                  >
                    {status === 'success' ? (
                      <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                        <CheckCircle size={40} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                        <FileText size={40} className="text-white" />
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-white mb-1">{file.name}</h3>
                    <p className="text-slate-400 text-sm mb-6">{(file.size / 1024).toFixed(2)} KB</p>

                    {status === 'uploading' || status === 'success' ? (
                      <div className="w-full max-w-md space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className={status === 'success' ? "text-emerald-400" : "text-blue-400"}>
                            {status === 'success' ? 'Upload Complete' : 'Uploading...'}
                          </span>
                          <span className="text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            className={clsx("h-full rounded-full", status === 'success' ? "bg-emerald-500" : "bg-blue-500")}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                          Remove
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); handleUpload(); }}>
                          Start Upload
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* Validation Report */}
          {status === 'success' && campaign && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">CSV Uploaded</h3>
                      <p className="text-sm text-slate-400">Ready to launch campaign</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Rows</p>
                      <p className="text-xl font-bold text-white">{campaign.audienceCount || 0}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Valid Numbers</p>
                      <p className="text-xl font-bold text-emerald-400">{campaign.audienceCount || 0}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Errors</p>
                      <p className="text-xl font-bold text-red-400">0</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/5 pt-4 space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Select Template</p>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {isEcommerce ? (
                            <>
                                <option value="promo">New Product Promo</option>
                                <option value="notification">Order Update Notification</option>
                                <option value="abandoned">Abandoned Cart Recovery</option>
                            </>
                        ) : (
                            <>
                                <option value="birthday">Birthday Wish</option>
                                <option value="appointment">Appointment Reminder</option>
                            </>
                        )}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button onClick={handleStartCampaign} disabled={starting}>
                        <Send size={16} className="mr-2" />
                        {starting ? 'Starting...' : 'Start Campaign'}
                      </Button>
                      {startResult && (
                        <p className={clsx("text-sm", startResult.success ? "text-emerald-400" : "text-red-400")}>
                          {startResult.success ? `Sent ${startResult.sent}/${startResult.total}` : (startResult.error || 'Failed')}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
             </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none">
            <h3 className="text-lg font-bold text-white mb-2">Pro Tip</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-4">
              Ensure your CSV has a "phone" column. You can also include "name" and "custom_field" for personalization.
            </p>
            <Button className="bg-white/10 hover:bg-white/20 text-white border-none w-full justify-start">
              <FileText size={16} className="mr-2" /> Download Template
            </Button>
          </Card>

          <Card className="h-full flex flex-col">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-white">Recent Uploads</h3>
               <button 
                 onClick={() => setRecentUploads([])} // Demo purpose: Clear list to show empty state
                 className="text-xs text-slate-500 hover:text-white transition-colors"
               >
                 Clear
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
               {loadingHistory ? (
                 <div className="space-y-3">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-center gap-3 p-3 border border-white/5 rounded-xl">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                     </div>
                   ))}
                 </div>
               ) : recentUploads.length > 0 ? (
                 <div className="space-y-3">
                   {recentUploads.map((upload) => (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={upload.id} 
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors relative">
                          <FileText size={18} />
                          {upload.status === 'failed' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-300 group-hover:text-white truncate">{upload.name}</p>
                          <p className="text-xs text-slate-500">{upload.date}</p>
                        </div>
                        <div className={clsx(
                          "w-2 h-2 rounded-full",
                          upload.status === 'completed' ? "bg-emerald-500" : "bg-red-500"
                        )} />
                     </motion.div>
                   ))}
                 </div>
               ) : (
                 <EmptyState 
                   icon={History}
                   title="No recent uploads"
                   description="Your upload history will appear here once you start campaigns."
                   className="py-8"
                 />
               )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;
