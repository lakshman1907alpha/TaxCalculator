import React from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RegimeComparison = ({ comparisonData, deductions = {} }) => {
  if (!comparisonData || !comparisonData.oldRegime) return <p>No comparison data available.</p>;

  const userDeductions = comparisonData.deductions || deductions || {};
  const { oldRegime, newRegime, recommendation, suggestions } = comparisonData;

  const isNewWins = recommendation.regime === 'new';
  const bannerColor = isNewWins ? '#d4edda' : '#fff3cd';
  const bannerTextColor = isNewWins ? '#155724' : '#856404';
  const bannerBorderColor = isNewWins ? '#c3e6cb' : '#ffeeba';

  // Chart data
  const chartData = {
    labels: ['Old Regime', 'New Regime'],
    datasets: [
      {
        label: 'Total Tax (₹)',
        data: [oldRegime.totalTax || 0, newRegime.totalTax || 0],
        backgroundColor: ['#f87171', '#60a5fa'],
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tax Comparison' },
    },
  };

  const formatNumber = (num) => Number(num || 0).toLocaleString('en-IN');

  const containerStyle = { padding: '20px', fontFamily: 'sans-serif' };
  const bannerStyle = {
    padding: '15px',
    backgroundColor: bannerColor,
    color: bannerTextColor,
    border: `1px solid ${bannerBorderColor}`,
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    textAlign: 'center'
  };

  const cardContainerStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' };
  const cardStyle = {
    flex: '1',
    minWidth: '300px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };
  const titleStyle = { marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' };
  const infoRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dotted #e5e7eb' };
  
  const meterContainerStyle = { marginTop: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' };
  const meterRowStyle = { marginBottom: '15px' };
  const progressBarStyle = { width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '20px', overflow: 'hidden' };
  
  const renderMeter = (label, used, max) => {
    const percentage = Math.min(100, Math.max(0, (used / max) * 100)) || 0;
    return (
      <div style={meterRowStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>{label}</span>
          <span>₹{formatNumber(used)} / ₹{formatNumber(max)}</span>
        </div>
        <div style={progressBarStyle}>
          <div style={{ width: `${percentage}%`, backgroundColor: '#4f46e5', height: '100%' }}></div>
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={bannerStyle}>
        {isNewWins 
            ? `New Regime saves you ₹${formatNumber(recommendation.savings)} this year!` 
            : `Old Regime saves you ₹${formatNumber(recommendation.savings)} this year!`}
      </div>

      <div style={cardContainerStyle}>
        <div style={cardStyle}>
          <h3 style={{...titleStyle, color: '#f87171'}}>Old Regime</h3>
          <div style={infoRowStyle}><span>Taxable Income:</span> <strong>₹{formatNumber(oldRegime.taxableIncome)}</strong></div>
          <div style={infoRowStyle}><span>Slab Tax:</span> <strong>₹{formatNumber(oldRegime.slabTax)}</strong></div>
          <div style={infoRowStyle}><span>Surcharge:</span> <strong>₹{formatNumber(oldRegime.surcharge)}</strong></div>
          <div style={infoRowStyle}><span>Cess:</span> <strong>₹{formatNumber(oldRegime.cess)}</strong></div>
          <div style={infoRowStyle}><span>Total Tax:</span> <strong style={{fontSize:'1.1rem'}}>₹{formatNumber(oldRegime.totalTax)}</strong></div>
          <div style={infoRowStyle}><span>Effective Rate:</span> <strong>{Number(oldRegime.effectiveRate || 0).toFixed(2)}%</strong></div>
        </div>

        <div style={cardStyle}>
          <h3 style={{...titleStyle, color: '#60a5fa'}}>New Regime</h3>
          <div style={infoRowStyle}><span>Taxable Income:</span> <strong>₹{formatNumber(newRegime.taxableIncome)}</strong></div>
          <div style={infoRowStyle}><span>Slab Tax:</span> <strong>₹{formatNumber(newRegime.slabTax)}</strong></div>
          <div style={infoRowStyle}><span>Surcharge:</span> <strong>₹{formatNumber(newRegime.surcharge)}</strong></div>
          <div style={infoRowStyle}><span>Cess:</span> <strong>₹{formatNumber(newRegime.cess)}</strong></div>
          <div style={infoRowStyle}><span>Total Tax:</span> <strong style={{fontSize:'1.1rem'}}>₹{formatNumber(newRegime.totalTax)}</strong></div>
          <div style={infoRowStyle}><span>Effective Rate:</span> <strong>{Number(newRegime.effectiveRate || 0).toFixed(2)}%</strong></div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto 30px auto' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Why?</h3>
        <ul>
          {recommendation.reasons && recommendation.reasons.map((reason, idx) => (
            <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.5' }}>{reason}</li>
          ))}
        </ul>
      </div>

      <div style={meterContainerStyle}>
        <h3>Deduction Usage Meter (Old Regime)</h3>
        {renderMeter('80C (Investments)', userDeductions.investments80C || userDeductions.investments || 0, 150000)}
        {renderMeter('80D (Medical)', userDeductions.medical80D || userDeductions.medical || 0, 50000)}
        {renderMeter('80CCD(1B) (NPS)', userDeductions.nps80CCD || 0, 50000)}
        {renderMeter('HRA Exemption / Rent Paid', userDeductions.hraReceived || userDeductions.rentPaid || 0, Math.max(userDeductions.hraReceived || 0, 100000))}
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '10px' }}>*HRA max shown is estimated dynamically against your actual HRA cap or dummy max 1L if neither present.</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Optimization Suggestions</h3>
        {suggestions && suggestions.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {suggestions.map((s, idx) => (
              <li key={idx} style={{ padding: '15px', borderLeft: '4px solid #10b981', backgroundColor: '#ecfdf5', marginBottom: '10px', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontWeight: 'bold', color: '#065f46', marginBottom: '5px' }}>{s.section || s.category}</div>
                <div style={{ marginBottom: '5px', color: '#047857' }}>{s.message}</div>
                <div style={{ fontWeight: 'bold' }}>Potential Saving: ₹{formatNumber(s.potentialSaving || s.potentialSavings)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have fully optimized your tax profile!</p>
        )}
      </div>

    </div>
  );
};

export default RegimeComparison;
