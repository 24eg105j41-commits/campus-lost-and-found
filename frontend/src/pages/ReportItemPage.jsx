import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  HelpCircle,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Palette,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Lightbulb,
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Books',
  'Clothing',
  'Accessories',
  'Keys',
  'Bags',
  'Other',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ReportItemPage({ defaultType = null }) {
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get('type');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Initial type from prop, query param, or default to 'lost'
  const initialType = defaultType || queryType || 'lost';
  const [type, setType] = useState(initialType.toLowerCase());

  // Form fields
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [color, setColor] = useState('');

  // Image upload & preview state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);

  // AI Description Assistant state
  const [enhancingDescription, setEnhancingDescription] = useState(false);
  const [aiAssistantData, setAiAssistantData] = useState(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (defaultType) {
      setType(defaultType.toLowerCase());
    } else if (queryType) {
      setType(queryType.toLowerCase());
    }
  }, [defaultType, queryType]);

  // Handle file selection with type and size validation
  const handleFileChange = (e) => {
    setFileError(null);
    setImageAnalysisResult(null);
    const file = e.target.files[0];
    if (!file) return;

    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimeTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate size (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFileError(null);
    setImageAnalysisResult(null);
  };

  // FEATURE 3: AI Image Analysis Tool
  const handleAnalyzeImage = async () => {
    if (!selectedFile) return;
    setAnalyzingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await API.post('/ai/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setImageAnalysisResult(res.data.analysis);
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setImageAnalysisResult({
        visionModelAvailable: false,
        message: 'Image validated locally. Vision API is not currently configured in the environment.',
      });
    } finally {
      setAnalyzingImage(false);
    }
  };

  // FEATURE 5: AI Description Assistant
  const handleGenerateDescription = async () => {
    setEnhancingDescription(true);
    setShowAiAssistant(true);
    try {
      const res = await API.post('/ai/generate-description', {
        itemName,
        category,
        rawDescription: description,
        color,
        location,
        date,
      });

      if (res.data.success) {
        setAiAssistantData(res.data);
      }
    } catch (err) {
      console.error('AI Description error:', err);
    } finally {
      setEnhancingDescription(false);
    }
  };

  const handleApplyAiDescription = () => {
    if (aiAssistantData) {
      if (aiAssistantData.enhancedDescription) {
        setDescription(aiAssistantData.enhancedDescription);
      }
      if (aiAssistantData.suggestedCategory && category === 'Other') {
        setCategory(aiAssistantData.suggestedCategory);
      }
      if (aiAssistantData.suggestedColor && !color) {
        setColor(aiAssistantData.suggestedColor);
      }
      setShowAiAssistant(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!itemName.trim()) {
      setError('Please provide the item name');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description of the item');
      return;
    }
    if (!location.trim()) {
      setError(`Please specify where the item was ${type === 'lost' ? 'lost' : 'found'}`);
      return;
    }
    if (!color.trim()) {
      setError('Please specify the color of the item');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('itemName', itemName.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('date', date);
      formData.append('color', color.trim());

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await API.post('/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccess('Item report submitted successfully! AI matching engine is scanning existing listings in the background.');
        setTimeout(() => {
          navigate(type === 'lost' ? '/lost-items' : '/found-items');
        }, 1800);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit item report.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLost = type === 'lost';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a {isLost ? 'Lost' : 'Found'} Item
        </h1>
        <p className="text-sm text-slate-500">
          Provide detailed specifications so our AI matching engine can pair this report with potential opposite listings.
        </p>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Type Selector Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Report Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${
                isLost
                  ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-rose-500" />
              I Lost an Item
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${
                !isLost
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              I Found an Item
            </button>
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={
              isLost
                ? 'e.g. Silver Dell Inspiron Laptop 15"'
                : 'e.g. Blue Hydro Flask Water Bottle'
            }
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
          />
        </div>

        {/* Category & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Primary Color <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Matte Black, Navy Blue, Silver"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
            />
          </div>
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Location {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Science Complex 3rd Floor Lab 304"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Date {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
              />
            </div>
          </div>
        </div>

        {/* Detailed Description with AI Assistant Toolbar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-slate-800">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={enhancingDescription}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-campus-700 bg-campus-50 hover:bg-campus-100 border border-campus-200 px-3 py-1 rounded-lg transition-colors"
              title="Enhance grammar and suggest missing identifying details"
            >
              {enhancingDescription ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              )}
              AI Description Enhancer
            </button>
          </div>

          <textarea
            required
            rows={4}
            placeholder="Include distinctive markings, stickers, brand names, scratches, contents inside, or special circumstances..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-campus-500"
          />

          {/* AI Description Assistant Drawer */}
          {showAiAssistant && (
            <div className="mt-3 p-4 bg-gradient-to-br from-campus-50/70 to-indigo-50/50 border border-campus-200 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-campus-100 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-campus-600" />
                  <span className="font-bold text-xs text-campus-900">
                    AI Description Enhancement & Quality Check
                  </span>
                  {aiAssistantData?.clarityScore && (
                    <span className="px-2 py-0.5 rounded-full bg-white border border-campus-200 text-[10px] font-extrabold text-campus-700">
                      Clarity Score: {aiAssistantData.clarityScore}/100
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiAssistant(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {aiAssistantData && (
                <>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Enhanced Description:
                    </span>
                    <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                      {aiAssistantData.enhancedDescription}
                    </p>
                  </div>

                  {aiAssistantData.improvementTips && aiAssistantData.improvementTips.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        Recommendations for Higher Match Precision:
                      </span>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                        {aiAssistantData.improvementTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAiAssistant(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Keep Current
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyAiDescription}
                      className="px-4 py-1.5 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply to Form
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Image Upload with Preview & AI Analysis */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800">
            Upload Item Image (Optional)
          </label>

          {fileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {!previewUrl ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-campus-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                id="item-image-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="item-image-input" className="cursor-pointer space-y-2 block">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-medium text-slate-700">
                  Click to select an image from your computer
                </div>
                <p className="text-xs text-slate-400">
                  Accepts JPEG, PNG, WebP up to 5MB. Stored on server disk securely.
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 shadow-sm shrink-0">
                  <img
                    src={previewUrl}
                    alt="Selected item preview"
                    className="w-40 h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Remove photo"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{selectedFile?.name}</p>
                    <p className="text-slate-400">
                      {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile?.type}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={analyzingImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors"
                  >
                    {analyzingImage ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    )}
                    Run AI Image Inspection
                  </button>
                </div>
              </div>

              {/* Image Inspection Result Card */}
              {imageAnalysisResult && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Image Analysis Report:
                  </p>
                  <p className="text-slate-600">{imageAnalysisResult.message}</p>
                  {imageAnalysisResult.detectedCategory && (
                    <p className="text-emerald-700 font-medium">
                      ✓ Detected Category: {imageAnalysisResult.detectedCategory} (Confidence: {Math.round(imageAnalysisResult.confidence * 100)}%)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className={`px-7 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
              isLost
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            } disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Submitting Report...
              </>
            ) : (
              `Submit ${isLost ? 'Lost' : 'Found'} Report`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
