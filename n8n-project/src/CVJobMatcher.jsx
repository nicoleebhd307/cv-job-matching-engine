import React, { useState } from 'react';
import { Upload, FileText, Target, Award, Loader2, CheckCircle2, TrendingUp, AlertCircle, Sparkles, Brain } from 'lucide-react';

export default function CVJobMatcher() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const N8N_WEBHOOK_URL = 'https://nhivtp234111e.app.n8n.cloud/webhook/274a5ff2-771d-4f02-bf92-ab6846e7273f';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        if (selectedFile.size > 10 * 1024 * 1024) {
          setError('File quá lớn. Vui lòng chọn file dưới 10MB');
          setFile(null);
        } else {
          setFile(selectedFile);
          setError('');
          setResults(null);
        }
      } else {
        setError('Vui lòng chọn file PDF');
        setFile(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Vui lòng chọn file CV');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Server không trả về JSON. Kiểm tra cấu hình n8n webhook.');
      }

      const data = await response.json();

      let jobResults = [];

      if (Array.isArray(data)) {
        jobResults = data;
      } else if (data.results && Array.isArray(data.results)) {
        jobResults = data.results;
      } else if (data.matches && Array.isArray(data.matches)) {
        jobResults = data.matches;
      } else if (data.job_title && (data.semantic_score !== undefined || data.score !== undefined)) {
        jobResults = [data];
      } else {
        throw new Error('Định dạng response không hợp lệ. Vui lòng kiểm tra cấu hình n8n.');
      }

      if (jobResults.length === 0) {
        setError('Không tìm thấy vị trí phù hợp. Vui lòng thử CV khác hoặc cập nhật thêm kỹ năng.');
      } else {
        const normalizedResults = jobResults.map(job => ({
          job_title: job.job_title || 'Unknown Position',
          semantic_score: job.semantic_score || job.score || 0,
          score: job.score || job.semantic_score || 0,
          reasoning: job.reasoning || 'No analysis provided',
          skill_gaps: job.skill_gaps || [],
          strengths: job.strengths || []
        }));
        
        setResults(normalizedResults);
      }

    } catch (err) {
      setError(`Có lỗi xảy ra: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Rất tốt';
    if (score >= 70) return 'Tốt';
    if (score >= 60) return 'Khá';
    return 'Trung bình';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 bg-white rounded-3xl shadow-2xl">
              <Target className="w-16 h-16 text-indigo-600" />
              <Sparkles className="w-7 h-7 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI CV Job Matcher
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Phân tích CV thông minh với AI - Tìm kiếm vị trí phù hợp nhất với kỹ năng của bạn
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 mb-10 border-2 border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <label 
                className="flex flex-col items-center justify-center w-full h-64 md:h-72 border-4 border-dashed rounded-3xl cursor-pointer bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 border-indigo-300 hover:border-indigo-500 transition-all duration-300"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="relative mb-5">
                    <Upload className="w-16 h-16 md:w-20 md:h-20 text-indigo-500 transition-transform hover:scale-110" />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="mb-3 text-base md:text-lg text-gray-700">
                    <span className="font-bold text-indigo-600">Click để upload</span> hoặc kéo thả file
                  </p>
                  <p className="text-sm text-gray-500 font-medium">PDF (Tối đa 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="mt-6 md:mt-8">
                  <div className="flex items-center justify-between bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-5 md:p-6 rounded-2xl border-2 border-indigo-300 shadow-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <div className="ml-4 md:ml-5 flex-1 min-w-0">
                        <p className="text-sm md:text-base font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs md:text-sm text-gray-600 font-medium mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-green-600 flex-shrink-0 ml-4" />
                  </div>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-6">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-3 font-medium">Đang xử lý: {uploadProgress}%</p>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 md:p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    <p className="text-xs text-red-600 mt-1">Vui lòng kiểm tra lại file hoặc thử lại sau</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="mt-8 md:mt-10 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 md:py-5 px-8 md:px-10 rounded-2xl font-bold text-base md:text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-2xl transform hover:-translate-y-1 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 md:w-7 md:h-7 mr-3 animate-spin" />
                    <span>Đang phân tích bằng AI...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6 md:w-7 md:h-7 mr-3" />
                    <span>Phân tích CV với AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && results.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl md:text-5xl">🎯</span>
                Top {results.length} Vị trí phù hợp
              </h2>
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-5 md:px-6 py-3 rounded-2xl border-2 border-green-300 shadow-lg">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                <span className="text-sm md:text-base font-bold text-green-900">Phân tích hoàn tất</span>
              </div>
            </div>

            <div className="grid gap-6 md:gap-8">
              {results.map((job, index) => {
                const score = job.semantic_score || job.score || 0;
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-2 ${getScoreBg(score)} transition-all duration-300 hover:shadow-indigo-500/20 relative overflow-hidden`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 md:gap-8">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
                          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl text-white font-black text-xl md:text-2xl shadow-xl">
                            {index + 1}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black text-gray-900">
                            {job.job_title}
                          </h3>
                        </div>

                        {/* Reasoning */}
                        {job.reasoning && (
                          <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                              <span className="font-bold text-indigo-900">🔍 Đánh giá: </span>
                              {job.reasoning}
                            </p>
                          </div>
                        )}

                        {/* Strengths & Gaps Grid */}
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                          {/* Strengths */}
                          {job.strengths && job.strengths.length > 0 && (
                            <div className="bg-green-50/50 p-4 md:p-6 rounded-2xl border-2 border-green-200">
                              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                <p className="text-sm md:text-base font-black text-gray-900">Điểm mạnh</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {job.strengths.map((strength, i) => (
                                  <span
                                    key={i}
                                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 rounded-xl text-xs md:text-sm font-bold border-2 border-green-300 shadow-sm"
                                  >
                                    ✓ {strength}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Skill Gaps */}
                          {job.skill_gaps && job.skill_gaps.length > 0 && (
                            <div className="bg-orange-50/50 p-4 md:p-6 rounded-2xl border-2 border-orange-200">
                              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                                <p className="text-sm md:text-base font-black text-gray-900">Cần cải thiện</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {job.skill_gaps.map((gap, i) => (
                                  <span
                                    key={i}
                                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 rounded-xl text-xs md:text-sm font-bold border-2 border-orange-300 shadow-sm"
                                  >
                                    📚 {gap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Score */}
                      <div className="flex lg:flex-col items-center lg:items-end gap-6 lg:gap-3">
                        <div className="text-center lg:text-right bg-white/80 p-5 md:p-6 rounded-3xl shadow-xl border-2 border-indigo-100">
                          <div className={`text-6xl md:text-7xl font-black ${getScoreColor(score)} mb-2 md:mb-3`}>
                            {score}
                          </div>
                          <div className="flex items-center gap-2 justify-center lg:justify-end">
                            <Award className={`w-5 h-5 md:w-6 md:h-6 ${getScoreColor(score)}`} />
                            <p className="text-sm md:text-base font-bold text-gray-600">{getScoreLabel(score)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-block bg-white px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-lg border-2 border-gray-100">
            <p className="text-xs md:text-sm text-gray-600 font-medium">
              ✨ Powered by AI • 🧠 Phân tích thông minh • ✓ Kết quả chính xác
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}