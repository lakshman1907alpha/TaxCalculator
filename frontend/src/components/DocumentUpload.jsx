import React, { useState, useRef } from 'react';
import axios from 'axios';

const DocumentUpload = ({ onExtracted }) => {
    const [uiState, setUiState] = useState('IDLE'); // IDLE, UPLOADING, SUCCESS, ERROR
    const [extractedData, setExtractedData] = useState(null);
    const [confidence, setConfidence] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;

        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setErrorMsg('Invalid file type. Please upload a PDF, JPG, or PNG.');
            setUiState('ERROR');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('File too large. Maximum size is 5MB.');
            setUiState('ERROR');
            return;
        }

        uploadFile(file);
    };

    const uploadFile = async (file) => {
        setUiState('UPLOADING');
        const formData = new FormData();
        formData.append('document', file);

        const token = localStorage.getItem('token');

        try {
            const res = await axios.post('/api/upload/parse', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            setExtractedData(res.data.extractedData);
            setConfidence(res.data.confidence);
            setUiState('SUCCESS');
        } catch (err) {
            console.error('Upload Error', err);
            setErrorMsg(err.response?.data?.error || 'Could not extract data from document. Please fill manually.');
            setUiState('ERROR');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (uiState === 'UPLOADING') return;
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const formatNumber = (num) => Number(num || 0).toLocaleString('en-IN');

    const handleUseData = () => {
        if (!extractedData) return;
        
        onExtracted({
            salary: extractedData.grossSalary || extractedData.grossTotalIncome || 0,
            deductions: {
                investments80C: extractedData.deductions80C || 0,
                medical80D: extractedData.deductions80D || 0
            }
        });
        // We could theoretically hide this component, but parent will control that if it wants to.
        setUiState('IDLE');
        setExtractedData(null);
    };

    const handleDiscard = () => {
        setUiState('IDLE');
        setExtractedData(null);
        setConfidence('');
        setErrorMsg('');
    };

    return (
        <div style={containerStyle}>
            {uiState === 'IDLE' && (
                <div 
                    style={dropZoneStyle} 
                    onDragOver={handleDragOver} 
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Upload Form 16 or salary slip (PDF or Image, max 5MB)</div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Drag and drop your file here, or click to browse</div>
                    <button style={btnOutlineStyle}>Browse files</button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                </div>
            )}

            {uiState === 'UPLOADING' && (
                <div style={{ ...dropZoneStyle, cursor: 'wait' }}>
                    <div className="spinner" style={spinnerStyle}></div>
                    <div style={{ marginTop: '1rem', fontWeight: 'bold', color: '#4b5563' }}>Analysing your document with AI...</div>
                </div>
            )}

            {uiState === 'SUCCESS' && extractedData && (
                <div style={successCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: '#065f46' }}>Extracted from your document:</h4>
                        <span style={getBadgeStyle(confidence)}>
                            Confidence: {confidence.toUpperCase()}
                        </span>
                    </div>
                    
                    <div style={tableStyle}>
                        {Object.entries(extractedData).map(([key, value]) => (
                            <div key={key} style={tableRowStyle}>
                                <span style={{ fontWeight: '600', color: '#4b5563' }}>{key}</span>
                                <span>₹{formatNumber(value)}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={handleUseData} style={btnPrimaryStyle}>Use this data</button>
                        <button onClick={handleDiscard} style={btnOutlineStyle}>Discard</button>
                    </div>
                </div>
            )}

            {uiState === 'ERROR' && (
                <div style={errorCardStyle}>
                    <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '0.5rem' }}>Error</div>
                    <p style={{ margin: '0 0 1rem 0' }}>{errorMsg}</p>
                    <button onClick={handleDiscard} style={btnOutlineStyle}>Try again</button>
                </div>
            )}
        </div>
    );
};

// Inline Styles
const containerStyle = { marginBottom: '2rem', fontFamily: 'sans-serif' };

const dropZoneStyle = {
    border: '2px dashed #9ca3af',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.2s',
};

const successCardStyle = {
    padding: '1.5rem',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '12px'
};

const errorCardStyle = {
    padding: '1.5rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px'
};

const tableStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid #d1d5db',
    marginBottom: '1rem'
};

const tableRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e5e7eb'
};

const btnPrimaryStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1
};

const btnOutlineStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1
};

const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
};

const getBadgeStyle = (confidence) => {
    const base = { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' };
    if (confidence === 'high') return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    if (confidence === 'medium') return { ...base, backgroundColor: '#fef3c7', color: '#b45309' };
    return { ...base, backgroundColor: '#fee2e2', color: '#b91c1c' };
};

export default DocumentUpload;
