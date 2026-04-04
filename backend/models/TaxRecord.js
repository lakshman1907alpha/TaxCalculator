const mongoose = require('mongoose');

const TaxRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    income: {
        salary: { type: Number, default: 0 },
        business: { type: Number, default: 0 },
        freelance: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    deductions: {
        standard: { type: Number, default: 0 },
        investments: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
        investments80C: { type: Number, default: 0 },
        medical80D: { type: Number, default: 0 },
        nps80CCD: { type: Number, default: 0 },
        hraReceived: { type: Number, default: 0 },
        rentPaid: { type: Number, default: 0 },
        cityType: { type: String, enum: ['metro', 'non-metro', ''], default: '' }
    },
    calculation: {
        totalIncome: { type: Number, default: 0 },
        totalDeductions: { type: Number, default: 0 },
        taxableIncome: { type: Number, default: 0 },
        taxOwed: { type: Number, default: 0 }
    },
    regimeComparison: {
        oldRegime: { type: Object },
        newRegime: { type: Object }
    },
    recommendedRegime: {
        type: String, 
        enum: ['old', 'new']
    },
    regimeSavings: {
        type: Number,
        default: 0
    },
    suggestions: [{
        category: String,
        section: String,
        message: String,
        potentialSavings: Number,
        potentialSaving: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('TaxRecord', TaxRecordSchema);
