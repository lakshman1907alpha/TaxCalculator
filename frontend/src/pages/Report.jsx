import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Report = () => {
    const { year } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="glass-card" style={styles.reportContainer}>
                <div style={styles.header}>
                    <h1 style={{ color: 'var(--accent-color)' }}>Tax Filing Report</h1>
                    <h2 style={{ color: 'var(--text-muted)' }}>Year {record.year}</h2>
                </div>

                <div style={styles.flexRow}>
                    <div style={styles.details}>
                        <h3 style={styles.sectionTitle}>Income Breakdown</h3>
                        <div style={styles.row}><span>Salary:</span> <span>${record.income.salary.toLocaleString()}</span></div>
                        <div style={styles.row}><span>Business:</span> <span>${record.income.business.toLocaleString()}</span></div>
                        <div style={styles.row}><span>Freelance:</span> <span>${record.income.freelance.toLocaleString()}</span></div>
                        <div style={styles.row}><span>Other:</span> <span>${record.income.other.toLocaleString()}</span></div>
                        <div style={{ ...styles.row, fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                            <span>Total Income:</span> <span>${calculation.totalIncome.toLocaleString()}</span>
                        </div>

                        <h3 style={styles.sectionTitle}>Deductions Breakdown</h3>
                        <div style={styles.row}><span>Standard:</span> <span>${record.deductions.standard.toLocaleString()}</span></div>
                        <div style={styles.row}><span>Investments:</span> <span>${record.deductions.investments.toLocaleString()}</span></div>
                        <div style={styles.row}><span>Medical:</span> <span>${record.deductions.medical.toLocaleString()}</span></div>
                        <div style={{ ...styles.row, fontWeight: 'bold', color: 'var(--success-color)', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                            <span>Total Deductions:</span> <span>-${calculation.totalDeductions.toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={styles.visuals}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Take Home vs Tax</h3>
                        <div style={{ width: '250px', margin: '0 auto' }}>
                            <Doughnut data={chartData} />
                        </div>
                        <div style={styles.finalBox}>
                            <h4>Taxable Income</h4>
                            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>${calculation.taxableIncome.toLocaleString()}</div>
                            <h4>Estimated Tax Owed</h4>
                            <div style={{ fontSize: '2rem', color: 'var(--danger-color)', fontWeight: 'bold' }}>${calculation.taxOwed.toLocaleString()}</div>
                        </div>
                    </div>
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
        background: '#161b22', // Solid enough for PDF export
    },
    header: {
        borderBottom: '2px solid var(--glass-border)',
        paddingBottom: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    flexRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4rem'
    },
    details: {
        flex: '1 1 300px',
    },
    visuals: {
        flex: '1 1 300px',
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
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)'
    }
};

export default Report;
