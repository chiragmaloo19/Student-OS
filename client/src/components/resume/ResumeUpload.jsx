import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button, Input } from '../ui';

/** ResumeUpload — handles drag-and-drop PDF selection, size/format validation, and version labeling */
export default function ResumeUpload({ onUpload, loading = false, uploadProgress = null }) {
  const [file, setFile] = useState(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      setFile(null);
      return false;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      return false;
    }

    setError('');
    setFile(selectedFile);
    return true;
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
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    if (!versionLabel.trim()) {
      setError('Version label is required');
      return;
    }

    onUpload(file, versionLabel.trim(), () => {
      // Success callback to reset form
      setFile(null);
      setVersionLabel('');
      setError('');
    });
  };

  return (
    <div className="glass p-6 rounded-3xl border border-surface-800/60 flex flex-col gap-5">
      <h3 className="text-sm font-bold text-surface-200 uppercase tracking-wider">
        Upload Resume PDF
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] bg-surface-950/20 ${
            dragActive
              ? 'border-brand-500 bg-brand-500/5'
              : file
              ? 'border-brand-500/40 bg-surface-950/40'
              : 'border-surface-700 hover:border-surface-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 text-brand-400" />
              <p className="text-sm font-bold text-surface-100 max-w-[240px] truncate">
                {file.name}
              </p>
              <p className="text-xs text-surface-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={handleClearFile}
                className="mt-1 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold border border-red-500/20 px-2 py-1 rounded-lg bg-red-500/5"
              >
                <X className="w-3 h-3" /> Remove File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-surface-500" />
              <p className="text-sm font-bold text-surface-200">
                Drag & drop your PDF here, or <span className="text-brand-400">browse</span>
              </p>
              <p className="text-xs text-surface-550">
                Only PDF format, maximum 5MB
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-400 font-semibold bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        {/* Version label */}
        <Input
          label="Version Label"
          placeholder="e.g. v1 - Internship"
          value={versionLabel}
          onChange={(e) => {
            setVersionLabel(e.target.value);
            if (error && e.target.value.trim()) setError('');
          }}
          disabled={loading}
          required
          className="bg-surface-950"
        />

        {/* Upload Button */}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!file || !versionLabel.trim() || loading}
          className="w-full rounded-xl mt-1 h-11"
        >
          {loading && uploadProgress !== null
            ? `Uploading ${uploadProgress}%...`
            : 'Upload Resume'}
        </Button>
      </form>
    </div>
  );
}
