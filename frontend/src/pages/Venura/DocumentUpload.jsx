import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, getDocumentStatus, uploadNicDocument } from '../../services/authService';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [documentStatus, setDocumentStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, docStatus] = await Promise.all([
          getProfile(),
          getDocumentStatus(),
        ]);
        setUser(profile);
        setDocumentStatus(docStatus);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleFileSelect = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, and PDF files are allowed.');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setSelectedFile(file);
      setError('');
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('nicDocument', selectedFile);

      await uploadNicDocument(formData);
      setSuccess('Document uploaded successfully! Your ID will be verified by an admin shortly.');
      
      // Refresh document status
      const docStatus = await getDocumentStatus();
      setDocumentStatus(docStatus);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return 'fa-check-circle';
      case 'pending':
        return 'fa-clock';
      case 'rejected':
        return 'fa-times-circle';
      default:
        return 'fa-upload';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Verification';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Uploaded';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-400 mb-4"></i>
          <p className="text-green-200/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1A2F] via-[#1A3A4A] to-[#0D2B3E]">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="20%" x2="30%" y2="80%" stroke="#4ADE80" strokeWidth="1" />
          <line x1="90%" y1="30%" x2="70%" y2="90%" stroke="#22C55E" strokeWidth="1" />
          <line x1="20%" y1="90%" x2="80%" y2="10%" stroke="#16A34A" strokeWidth="1" />
          <circle cx="30%" cy="20%" r="3" fill="#4ADE80" opacity="0.5" />
          <circle cx="70%" cy="80%" r="3" fill="#22C55E" opacity="0.5" />
        </svg>
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 flex items-center justify-center text-white">
                <i className="fas fa-hand-holding-heart text-lg"></i>
              </div>
              <h1 className="text-xl font-light text-white tracking-wider">
                Bridge<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Connect</span>
              </h1>
            </Link>

            {/* Back to Dashboard */}
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-green-200/70 hover:text-white transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
              <span className="text-sm">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-white mb-2">
            ID <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Verification</span>
          </h2>
          <p className="text-green-200/60">Upload your National Identity Card (NIC) for account verification.</p>
        </div>

        {/* Current Status Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-id-card text-green-400 mr-2"></i>
            Document Status
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(documentStatus?.documentStatus)}`}>
                <i className={`fas ${getStatusIcon(documentStatus?.documentStatus)} text-xl`}></i>
              </div>
              <div>
                <p className={`font-medium ${getStatusColor(documentStatus?.documentStatus).split(' ')[0]}`}>
                  {getStatusText(documentStatus?.documentStatus)}
                </p>
                {documentStatus?.nicDocument?.uploadedAt && (
                  <p className="text-xs text-green-200/50">
                    Uploaded: {new Date(documentStatus.nicDocument.uploadedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            {documentStatus?.documentStatus === 'verified' && (
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium border border-green-500/30">
                <i className="fas fa-shield-alt mr-2"></i>Account Verified
              </span>
            )}
          </div>

          {/* Rejection Reason */}
          {documentStatus?.documentStatus === 'rejected' && documentStatus?.documentRejectionReason && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <strong>Rejection Reason:</strong> {documentStatus.documentRejectionReason}
              </p>
              <p className="text-xs text-red-300/70 mt-2">
                Please upload a clearer document to complete verification.
              </p>
            </div>
          )}
        </div>

        {/* Upload Form - Show only if not verified */}
        {documentStatus?.documentStatus !== 'verified' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-upload text-green-400 mr-2"></i>
              Upload Document
            </h3>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Important:</strong> Please upload a clear photo or scan of your National Identity Card (NIC). 
                Accepted formats: JPEG, PNG, PDF. Maximum file size: 5MB.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm text-center">
                <i className="fas fa-check-circle mr-2"></i>{success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                <i className="fas fa-exclamation-circle mr-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-green-400 bg-green-500/10'
                    : selectedFile
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg border border-white/20"
                    />
                    <p className="text-sm text-green-300">
                      <i className="fas fa-file mr-2"></i>
                      {selectedFile?.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-times mr-1"></i>Remove
                    </button>
                  </div>
                ) : selectedFile && selectedFile.type === 'application/pdf' ? (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-xl bg-red-500/20 flex items-center justify-center">
                      <i className="fas fa-file-pdf text-4xl text-red-400"></i>
                    </div>
                    <p className="text-sm text-green-300">
                      <i className="fas fa-file mr-2"></i>
                      {selectedFile?.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-times mr-1"></i>Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                      <i className="fas fa-cloud-upload-alt text-3xl text-green-400"></i>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        Drag & drop your file here
                      </p>
                      <p className="text-sm text-green-200/50">or</p>
                      <label className="mt-2 inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-lg cursor-pointer hover:bg-green-500/30 transition-colors">
                        <i className="fas fa-folder-open mr-2"></i>
                        Browse Files
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-green-200/40">
                      Supported: JPEG, PNG, PDF (max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex items-center justify-between">
                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 text-sm text-green-200/70 hover:text-white transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 hover:shadow-emerald-500/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload"></i>
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Why Verify Card */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-question-circle text-blue-400 mr-2"></i>
            Why Verify?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-shield-alt text-green-400 text-xs"></i>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Build Trust</p>
                <p className="text-xs text-green-200/50">Verified accounts are trusted more by the community.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-unlock text-blue-400 text-xs"></i>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Unlock Features</p>
                <p className="text-xs text-green-200/50">Access all platform features after verification.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-hand-holding-heart text-purple-400 text-xs"></i>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Help & Get Help</p>
                <p className="text-xs text-green-200/50">Start donating or receiving donations after verification.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentUpload;
