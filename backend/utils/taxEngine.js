const calculateTax = (income, deductions) => {
    // 1. Calculate Totals
    const totalIncome = (income.salary || 0) + (income.business || 0) + (income.freelance || 0) + (income.other || 0);

    // Caps on deductions (Simple generic rules for demonstration)
    const allowedStandard = Math.min((deductions.standard || 0), 10000); // Max 10k
    const allowedInvestments = Math.min((deductions.investments || 0), 15000); // Max 15k
    const allowedMedical = Math.min((deductions.medical || 0), 5000); // Max 5k
    const allowedOther = deductions.other || 0;

    const totalDeductions = allowedStandard + allowedInvestments + allowedMedical + allowedOther;

    // 2. Calculate Taxable Income
    let taxableIncome = totalIncome - totalDeductions;
    if (taxableIncome < 0) taxableIncome = 0;

    // 3. Progressive Tax Brackets (Dummy Generic Configuration)
    // 0 - 20000: 0%
    // 20001 - 60000: 10%
    // 60001 - 120000: 20%
    // 120001+: 30%
    
    let taxOwed = 0;
    
    if (taxableIncome > 120000) {
        taxOwed += (taxableIncome - 120000) * 0.30;
        taxOwed += (120000 - 60000) * 0.20;
        taxOwed += (60000 - 20000) * 0.10;
    } else if (taxableIncome > 60000) {
        taxOwed += (taxableIncome - 60000) * 0.20;
        taxOwed += (60000 - 20000) * 0.10;
    } else if (taxableIncome > 20000) {
        taxOwed += (taxableIncome - 20000) * 0.10;
    }

    // 4. Generate Suggestions
    const suggestions = [];
    if ((deductions.investments || 0) < 15000) {
        const gap = 15000 - (deductions.investments || 0);
        suggestions.push({
            category: 'Investments',
            message: `You can invest $${gap} more in qualified investment vehicles to lower your taxable income further.`,
            potentialSavings: gap * getMarginalRate(taxableIncome)
        });
    }

    if ((deductions.medical || 0) < 5000) {
        const gap = 5000 - (deductions.medical || 0);
        suggestions.push({
            category: 'Medical',
            message: `You have $${gap} remaining in allowable medical deductions. If you have valid receipts, add them!`,
            potentialSavings: gap * getMarginalRate(taxableIncome)
        });
    }

    return {
        calculation: {
            totalIncome,
            totalDeductions,
            taxableIncome,
            taxOwed
        },
        suggestions
    };
};

const getMarginalRate = (income) => {
    if (income > 120000) return 0.30;
    if (income > 60000) return 0.20;
    if (income > 20000) return 0.10;
    return 0.0;
}

module.exports = { calculateTax };
