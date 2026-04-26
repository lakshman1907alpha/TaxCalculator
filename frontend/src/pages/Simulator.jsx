import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Simulator = () => {
    const [salary, setSalary] = useState(1200000);
    const [inv80c, setInv80c] = useState(150000);
    const [hra, setHra] = useState(0);

    const [taxData, setTaxData] = useState({ oldTax: 0, newTax: 0, takeHomeOld: 0, takeHomeNew: 0 });

    useEffect(() => {
        // Simplified Tax Engine for Simulator
        const calcTax = () => {
            const stdDed = 50000;
            
            // Old Regime
            let taxableOld = Math.max(0, salary - stdDed - Math.min(150000, inv80c) - hra);
            let oldTax = 0;
            if (taxableOld > 250000) {
                if (taxableOld <= 500000) {
                    oldTax = (taxableOld - 250000) * 0.05;
                    if (taxableOld <= 500000) oldTax = 0; // 87A Rebate
                } else if (taxableOld <= 1000000) {
                    oldTax = 12500 + (taxableOld - 500000) * 0.2;
                } else {
                    oldTax = 112500 + (taxableOld - 1000000) * 0.3;
                }
            }
            if (oldTax > 0) oldTax *= 1.04; // Cess

            // New Regime (FY 2024-25)
            let taxableNew = Math.max(0, salary - stdDed); // No 80C, no HRA
            let newTax = 0;
            if (taxableNew > 300000) {
                if (taxableNew <= 600000) newTax += (taxableNew - 300000) * 0.05;
                else if (taxableNew <= 900000) newTax += 15000 + (taxableNew - 600000) * 0.1;
                else if (taxableNew <= 1200000) newTax += 45000 + (taxableNew - 900000) * 0.15;
                else if (taxableNew <= 1500000) newTax += 90000 + (taxableNew - 1200000) * 0.2;
                else newTax += 150000 + (taxableNew - 1500000) * 0.3;
                
                if (taxableNew <= 700000) newTax = 0; // 87A
            }
            if (newTax > 0) newTax *= 1.04;

            setTaxData({
                oldTax: Math.round(oldTax),
                newTax: Math.round(newTax),
                takeHomeOld: Math.round(salary - oldTax),
                takeHomeNew: Math.round(salary - newTax)
            });
        };
        calcTax();
    }, [salary, inv80c, hra]);

    const activeRegime = taxData.newTax < taxData.oldTax ? 'new' : 'old';
    const currentTax = activeRegime === 'new' ? taxData.newTax : taxData.oldTax;
    const currentTakeHome = activeRegime === 'new' ? taxData.takeHomeNew : taxData.takeHomeOld;

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: { position: 'bottom', labels: { color: '#fff' } }
        }
    };

    const chartData = {
        labels: ['Tax Owed', 'Take Home'],
        datasets: [
            {
                data: [currentTax, currentTakeHome],
                backgroundColor: ['#ef4444', '#10b981'],
                borderColor: ['#b91c1c', '#047857'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h1 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Interactive Tax Simulator</h1>
                <p style={{ color: 'var(--text-muted)' }}>Adjust your income and deductions to see the real-time impact on your taxes.</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                {/* Sliders Container */}
                <div className="glass-card" style={{ flex: '1 1 350px', padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Your Financials</h3>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold' }}>Annual Salary</label>
                            <span style={{ color: 'var(--accent-hover)' }}>₹{Number(salary).toLocaleString('en-IN')}</span>
                        </div>
                        <input 
                            type="range" min="300000" max="5000000" step="50000" 
                            value={salary} onChange={(e) => setSalary(Number(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold' }}>80C Investments</label>
                            <span style={{ color: 'var(--accent-hover)' }}>₹{Number(inv80c).toLocaleString('en-IN')}</span>
                        </div>
                        <input 
                            type="range" min="0" max="250000" step="10000" 
                            value={inv80c} onChange={(e) => setInv80c(Number(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                        <small style={{ color: 'var(--text-muted)' }}>*Max ₹1.5L applicable for old regime</small>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold' }}>HRA Exemption</label>
                            <span style={{ color: 'var(--accent-hover)' }}>₹{Number(hra).toLocaleString('en-IN')}</span>
                        </div>
                        <input 
                            type="range" min="0" max="1000000" step="10000" 
                            value={hra} onChange={(e) => setHra(Number(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>
                </div>

                {/* Outputs Container */}
                <div className="glass-card" style={{ flex: '1 1 350px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ marginBottom: '1.5rem', width: '100%', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        Visual Impact ({activeRegime === 'new' ? 'New Regime' : 'Old Regime'})
                    </h3>
                    
                    <div style={{ width: '250px', height: '250px', marginBottom: '1rem', position: 'relative' }}>
                        <Doughnut data={chartData} options={chartOptions} />
                        <div style={{ position: 'absolute', top: '45%', left: '0', width: '100%', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{Number(currentTakeHome).toLocaleString('en-IN')}</span>
                            <br />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Take Home</span>
                        </div>
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Old Regime Tax</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: activeRegime==='old' ? 'bold': 'normal', color: activeRegime==='old' ? '#ef4444' : 'inherit' }}>
                                ₹{Number(taxData.oldTax).toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>New Regime Tax</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: activeRegime==='new' ? 'bold': 'normal', color: activeRegime==='new' ? '#60a5fa' : 'inherit' }}>
                                ₹{Number(taxData.newTax).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulator;
