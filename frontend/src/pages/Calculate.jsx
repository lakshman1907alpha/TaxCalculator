import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';

const Calculate = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        year: currentYear - 1,
        income: { salary: '', business: '', freelance: '', other: '' },
        deductions: { standard: '', investments: '', medical: '', other: '' }
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleIncomeChange = (e) => {
        setFormData({
            ...formData,
            income: { ...formData.income, [e.target.name]: Number(e.target.value) }
        });
    };

    const handleDeductionChange = (e) => {
        setFormData({
            ...formData,
            deductions: { ...formData.deductions, [e.target.name]: Number(e.target.value) }
        });
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/calculations', formData);
            setResult(res.data);
        } catch (err) {
            console.error('Calculation Error:', err);
            alert('Failed to calculate taxes. Ensure numeric inputs.');
        }
        setLoading(false);
    };

    const handleExtractedData = (data) => {
        setFormData(prev => ({
            ...prev,
            income: { 
                ...prev.income, 
                salary: data.salary || prev.income.salary 
            },
            deductions: { 
                ...prev.deductions, 
                investments: data.deductions?.investments80C || prev.deductions.investments,
                medical: data.deductions?.medical80D || prev.deductions.medical
            }
        }));
    };

    return (
        <div className="animate-fade-in" style={styles.container}>
            <div className="glass-card" style={styles.formSection}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Tax Data Entry</h2>

                <DocumentUpload onExtracted={handleExtractedData} />

                <form onSubmit={handleCalculate}>
                    <div className="form-group">
                        <label className="form-label">Tax Year</label>
                        <input type="number" className="form-control" name="year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} />
                    </div>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Income Streams</h3>
                    <div style={styles.grid}>
                        <div className="form-group">
                            <label className="form-label">Salary (W2/Employment)</label>
                            <input type="number" className="form-control" name="salary" value={formData.income.salary} onChange={handleIncomeChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Business Income</label>
                            <input type="number" className="form-control" name="business" value={formData.income.business} onChange={handleIncomeChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Freelance (1099)</label>
                            <input type="number" className="form-control" name="freelance" value={formData.income.freelance} onChange={handleIncomeChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Other Income</label>
                            <input type="number" className="form-control" name="other" value={formData.income.other} onChange={handleIncomeChange} />
                        </div>
                    </div>

                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Deductions & Credits</h3>
                    <div style={styles.grid}>
                        <div className="form-group">
                            <label className="form-label">Standard Deduction</label>
                            <input type="number" className="form-control" name="standard" value={formData.deductions.standard} onChange={handleDeductionChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Qualified Investments (401k/IRA)</label>
                            <input type="number" className="form-control" name="investments" value={formData.deductions.investments} onChange={handleDeductionChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Medical Expenses</label>
                            <input type="number" className="form-control" name="medical" value={formData.deductions.medical} onChange={handleDeductionChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Other Deductions</label>
                            <input type="number" className="form-control" name="other" value={formData.deductions.other} onChange={handleDeductionChange} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} disabled={loading}>
                        {loading ? 'Crunching numbers...' : 'Calculate Tax Liability'}
                    </button>
                </form>
            </div>

            {result && (
                <div style={styles.resultsSection}>
                    <div className="glass-card animate-fade-in">
                        <h2 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>Calculation Results</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total Income:</span>
                                <strong>₹{result.calculation.totalIncome.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total Allowed Deductions:</span>
                                <strong style={{ color: 'var(--accent-hover)' }}>-₹{result.calculation.totalDeductions.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                <span>Taxable Income:</span>
                                <strong>₹{result.calculation.taxableIncome.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                <span>Total Tax Owed:</span>
                                <span>₹{result.calculation.taxOwed.toLocaleString()}</span>
                            </div>
                        </div>

                        <button onClick={() => navigate(`/report/${result.year}`)} className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                            Generate Filing Report
                        </button>
                    </div>

                    {result.suggestions && result.suggestions.length > 0 && (
                        <div className="glass-card animate-fade-in" style={{ marginTop: '2rem', borderLeft: '4px solid var(--warn-color)' }}>
                            <h3 style={{ color: 'var(--warn-color)', marginBottom: '1rem' }}>You can reduce Tax by :</h3>
                            {result.suggestions.map((s, idx) => (
                                <div key={idx} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: idx === result.suggestions.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>
                                    <h4 style={{ marginBottom: '0.4rem' }}>{s.category || s.section} Strategy</h4>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{s.message}</p>
                                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                                        Potential Tax Savings: ~₹{(s.potentialSaving || s.potentialSavings || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    formSection: {
        flex: '1 1 500px',
    },
    resultsSection: {
        flex: '1 1 400px',
        position: 'sticky',
        top: '100px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
    }
};

export default Calculate;
