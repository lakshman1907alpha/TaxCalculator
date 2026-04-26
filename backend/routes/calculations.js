const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TaxRecord = require('../models/TaxRecord');
const { calculateTax } = require('../utils/taxEngine');

// Create or update a calculation for a specific year
router.post('/', auth, async (req, res) => {
    try {
        const { year, income, deductions = {}, age = 'below60' } = req.body;

        // Run Tax Engine Logic
        const engineResult = calculateTax({ incomes: income || {}, deductions, age });

        let record = await TaxRecord.findOne({ user: req.user.id, year });

        // Build the calculation object (backwards compat)
        // Set to whichever regime is recommended so legacy UI isn't broken
        const isOld = engineResult.recommendation.regime === 'old';
        const calcObj = {
            totalIncome: isOld ? engineResult.oldRegime.grossIncome : engineResult.newRegime.grossIncome,
            totalDeductions: isOld ? engineResult.oldRegime.totalDeductions + engineResult.oldRegime.standardDeduction : engineResult.newRegime.standardDeduction,
            taxableIncome: isOld ? engineResult.oldRegime.taxableIncome : engineResult.newRegime.taxableIncome,
            taxOwed: isOld ? engineResult.oldRegime.totalTax : engineResult.newRegime.totalTax
        };

        if (record) {
            // Update
            record.income = income;
            record.deductions = deductions;
            record.calculation = calcObj;
            record.suggestions = engineResult.suggestions;
            record.regimeComparison = { oldRegime: engineResult.oldRegime, newRegime: engineResult.newRegime };
            record.recommendedRegime = engineResult.recommendation.regime;
            record.regimeSavings = engineResult.recommendation.savings;
        } else {
            // Create
            record = new TaxRecord({
                user: req.user.id,
                year,
                income,
                deductions,
                calculation: calcObj,
                suggestions: engineResult.suggestions,
                regimeComparison: { oldRegime: engineResult.oldRegime, newRegime: engineResult.newRegime },
                recommendedRegime: engineResult.recommendation.regime,
                regimeSavings: engineResult.recommendation.savings
            });
        }

        await record.save();
        
        const responseData = record.toJSON();
        responseData.regimeComparison = { oldRegime: engineResult.oldRegime, newRegime: engineResult.newRegime }; // explicitly ensure the frontend gets full object
        responseData.recommendedRegime = engineResult.recommendation.regime;
        responseData.regimeSavings = engineResult.recommendation.savings;
        if (!responseData.recommendation) {
            responseData.recommendation = engineResult.recommendation;
        }

        res.json(responseData);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all calculations for user
router.get('/', auth, async (req, res) => {
    try {
        const records = await TaxRecord.find({ user: req.user.id }).sort({ year: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get specific calculation
router.get('/:year', auth, async (req, res) => {
    try {
        const record = await TaxRecord.findOne({ user: req.user.id, year: req.params.year });
        if (!record) return res.status(404).json({ msg: 'Record not found' });
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin Route: Get all records (stub only for basic admin display)
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Requires admin role' });
        }
        const records = await TaxRecord.find().populate('user', ['name', 'email']).sort({ year: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
