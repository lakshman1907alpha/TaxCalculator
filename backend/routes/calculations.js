const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TaxRecord = require('../models/TaxRecord');
const { calculateTax } = require('../utils/taxEngine');

// Create or update a calculation for a specific year
router.post('/', auth, async (req, res) => {
    try {
        const { year, income, deductions } = req.body;

        // Run Tax Engine Logic
        const engineResult = calculateTax(income, deductions);

        let record = await TaxRecord.findOne({ user: req.user.id, year });

        if (record) {
            // Update
            record.income = income;
            record.deductions = deductions;
            record.calculation = engineResult.calculation;
            record.suggestions = engineResult.suggestions;
        } else {
            // Create
            record = new TaxRecord({
                user: req.user.id,
                year,
                income,
                deductions,
                calculation: engineResult.calculation,
                suggestions: engineResult.suggestions
            });
        }

        await record.save();
        res.json(record);

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
