import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

ChartJS.register(ArcElement, Tooltip, Legend);

const Report = () => {
    const { year } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef(null);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const res = await axios.get(`/api/calculations/${year}`);
                setRecord(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchRecord();
    }, [year]);

    const handleDownloadPdf = async () => {
        const element = reportRef.current;
        if (!element) return;
        
        // Use html2canvas to capture the element
        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Tax_Report_${year}.pdf`);
    };

    if (loading) return <div>Loading report...</div>;
    if (!record) return <div>No record found for year {year}. <Link to="/calculate">Calculate now</Link></div>;

    const { calculation } = record;
    const takeHome = calculation.totalIncome - calculation.taxOwed;

    const chartData = {
        labels: ['Tax Owed', 'Take Home Pay'],
        datasets: [
            {
                data: [calculation.taxOwed, takeHome],
                backgroundColor: ['rgba(218, 54, 51, 0.8)', 'rgba(35, 134, 54, 0.8)'],
                borderColor: ['rgba(218, 54, 51, 1)', 'rgba(35, 134, 54, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const downloadDate = new Date().toLocaleString('en-IN');

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to={`/compare/${year}`} className="btn btn-outline">Compare Old & New Regimes</Link>
                <button onClick={handleDownloadPdf} className="btn btn-primary">Download Official PDF</button>
            </div>

            <div className="glass-card" style={styles.reportContainer} ref={reportRef}>
                <div style={styles.header}>
                    <div>
                        <h1 style={{ color: 'var(--accent-color)', margin: 0 }}>Official Tax Report</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Financial Year: {record.year}</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div>Date Generated: {downloadDate}</div>
                        <div style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>
                            Recommended Regime: {record.recommendedRegime ? record.recommendedRegime.toUpperCase() : 'N/A'}
                        </div>
                    </div>
                </div>

                <div style={styles.flexRow}>
                    <div style={styles.details}>
                        <h3 style={styles.sectionTitle}>Income Breakdown</h3>
                        <div style={styles.row}><span>Salary:</span> <span>₹{record.income.salary.toLocaleString('en-IN')}</span></div>
                        <div style={styles.row}><span>Business:</span> <span>₹{record.income.business.toLocaleString('en-IN')}</span></div>
                        <div style={styles.row}><span>Freelance:</span> <span>₹{record.income.freelance.toLocaleString('en-IN')}</span></div>
                        <div style={styles.row}><span>Other:</span> <span>₹{record.income.other.toLocaleString('en-IN')}</span></div>
                        <div style={{ ...styles.row, fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                            <span>Gross Total Income:</span> <span>₹{calculation.totalIncome.toLocaleString('en-IN')}</span>
                        </div>

                        <h3 style={styles.sectionTitle}>Deductions & Exemptions</h3>
                        <div style={styles.row}><span>Standard Deduction:</span> <span>₹{record.deductions.standard.toLocaleString('en-IN')}</span></div>
                        <div style={styles.row}><span>Investments (Sec 80C):</span> <span>₹{record.deductions.investments.toLocaleString('en-IN')}</span></div>
                        <div style={styles.row}><span>Medical (Sec 80D):</span> <span>₹{record.deductions.medical.toLocaleString('en-IN')}</span></div>
                        <div style={{ ...styles.row, fontWeight: 'bold', color: 'var(--success-color)', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                            <span>Total Eligible Deductions:</span> <span>-₹{calculation.totalDeductions.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div style={styles.visuals} data-html2canvas-ignore="true">
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Take Home vs Tax</h3>
                        <div style={{ width: '250px', margin: '0 auto' }}>
                            <Doughnut data={chartData} />
                        </div>
                    </div>
                </div>

                <div style={styles.finalBox}>
                    <div style={{ flex: '1', textAlign: 'center', padding: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Net Taxable Income</h4>
                        <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>₹{calculation.taxableIncome.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ flex: '1', textAlign: 'center', padding: '1rem', borderLeft: '1px solid var(--glass-border)' }}>
                        <h4 style={{ margin: 0, color: 'var(--danger-color)' }}>Total Tax Owed</h4>
                        <div style={{ fontSize: '2rem', color: 'var(--danger-color)', fontWeight: 'bold', marginTop: '0.5rem' }}>₹{calculation.taxOwed.toLocaleString('en-IN')}</div>
                    </div>
                </div>
                
                <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    This is an automatically generated document from your Tax Assistant. Not a substitute for professional CPA advice.
                </div>
            </div>
        </div>
    );
};

const styles = {
    reportContainer: {
        width: '100%',
        maxWidth: '900px',
        padding: '3rem',
        background: '#161b22', 
        color: '#e6edf3'
    },
    header: {
        borderBottom: '2px solid var(--glass-border)',
        paddingBottom: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    flexRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4rem'
    },
    details: {
        flex: '1 1 350px',
    },
    visuals: {
        flex: '1 1 250px',
        display: 'flex',
        flexDirection: 'column',
    },
    sectionTitle: {
        marginTop: '2rem',
        marginBottom: '1rem',
        color: 'var(--accent-hover)',
        borderBottom: '1px solid var(--glass-border)',
        paddingBottom: '0.5rem'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0.5rem 0'
    },
    finalBox: {
        marginTop: '3rem',
        display: 'flex',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.02)'
    }
};

export default Report;
