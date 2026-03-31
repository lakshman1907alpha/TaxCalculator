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
        other: { type: Number, default: 0 }
    },
    calculation: {
        totalIncome: { type: Number, default: 0 },
        totalDeductions: { type: Number, default: 0 },
        taxableIncome: { type: Number, default: 0 },
        taxOwed: { type: Number, default: 0 }
    },
    suggestions: [{
        category: String,
        message: String,
        potentialSavings: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('TaxRecord', TaxRecordSchema);
