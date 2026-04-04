const calculateTax = ({ incomes = {}, deductions = {}, age = 'below60' }) => {
    // 1. Gross income = sum of all income streams
    const grossIncome = (incomes.salary || 0) + (incomes.business || 0) + (incomes.freelance || 0) + (incomes.other || 0);

    // HRA Exemption Math (min of three)
    let hraExemption = 0;
    if (deductions.hraReceived > 0 && deductions.rentPaid > 0) {
        const rentMinus10PercentSalary = Math.max(0, deductions.rentPaid - 0.10 * (incomes.salary || 0));
        const percentageSalary = deductions.cityType === 'metro' ? 0.50 * (incomes.salary || 0) : 0.40 * (incomes.salary || 0);
        hraExemption = Math.min(deductions.hraReceived, rentMinus10PercentSalary, percentageSalary);
    }
    
    // Map backwards compatible deductions arrays to specific ones
    const mapped80C = deductions.investments80C || deductions.investments || 0;
    const mapped80D = deductions.medical80D || deductions.medical || 0;
    
    // Limits
    const actual80C = Math.min(mapped80C, 150000);
    
    // 80D limits based on age
    const max80D = (age === 'senior' || age === 'superSenior') ? 50000 : 25000;
    const actual80D = Math.min(mapped80D, max80D);
    
    // 80CCD(1B) NPS limit
    const actualNPS = Math.min(deductions.nps80CCD || 0, 50000);
    
    const otherDeductions = deductions.other || 0;

    // ----- Old Regime -----
    const stdDeductionOld = Math.min(50000, grossIncome);
    const grossAfterStdOld = grossIncome - stdDeductionOld;
    
    const totalDeductionsOld = actual80C + actual80D + actualNPS + hraExemption + otherDeductions;
    let netTaxableOld = Math.max(0, grossAfterStdOld - totalDeductionsOld);

    // Old Regime slabs based on age
    let oldExemptionLimit = 250000;
    if (age === 'senior') oldExemptionLimit = 300000;
    if (age === 'superSenior') oldExemptionLimit = 500000;

    const calculateOldRegimeSlabTax = (income, exemptionLimit) => {
        let tax = 0;
        let breakdown = [];
        if (income > 1000000) {
            let amount = (income - 1000000) * 0.30;
            tax += amount;
            breakdown.push({ slab: 'Above 10L', rate: 30, amount });
            
            let bracket2 = 1000000 - 500000;
            let amount2 = bracket2 * 0.20;
            tax += amount2;
            breakdown.push({ slab: '5L-10L', rate: 20, amount: amount2 });
            
            let bracket1 = 500000 - exemptionLimit;
            if (bracket1 > 0) {
                let amount1 = bracket1 * 0.05;
                tax += amount1;
                breakdown.push({ slab: `${exemptionLimit/100000}L-5L`, rate: 5, amount: amount1 });
            }
        } else if (income > 500000) {
            let amount = (income - 500000) * 0.20;
            tax += amount;
            breakdown.push({ slab: '5L-10L', rate: 20, amount });
            
            let bracket1 = 500000 - exemptionLimit;
            if (bracket1 > 0) {
                let amount1 = bracket1 * 0.05;
                tax += amount1;
                breakdown.push({ slab: `${exemptionLimit/100000}L-5L`, rate: 5, amount: amount1 });
            }
        } else if (income > exemptionLimit) {
            let amount = (income - exemptionLimit) * 0.05;
            tax += amount;
            breakdown.push({ slab: `${exemptionLimit/100000}L-5L`, rate: 5, amount });
        }
        return { tax, breakdown: breakdown.reverse() };
    };

    const { tax: slabTaxOld, breakdown: breakdownOld } = calculateOldRegimeSlabTax(netTaxableOld, oldExemptionLimit);

    // Surcharge for Old Regime
    const calculateSurchargeOld = (income, slabTax) => {
        if (income <= 5000000) return { surcharge: 0, marginalRelief: 0 };
        let rate = 0;
        let threshold = 0;
        if (income > 50000000) { rate = 0.37; threshold = 50000000; }
        else if (income > 20000000) { rate = 0.25; threshold = 20000000; }
        else if (income > 10000000) { rate = 0.15; threshold = 10000000; }
        else if (income > 5000000) { rate = 0.10; threshold = 5000000; }

        let baseSurcharge = slabTax * rate;
        
        // Marginal Relief Calculation
        const { tax: taxAtThreshold } = calculateOldRegimeSlabTax(threshold, oldExemptionLimit);
        let surchargeAtThreshold = 0;
        if (threshold === 50000000) surchargeAtThreshold = taxAtThreshold * 0.25;
        else if (threshold === 20000000) surchargeAtThreshold = taxAtThreshold * 0.15;
        else if (threshold === 10000000) surchargeAtThreshold = taxAtThreshold * 0.10;
        else if (threshold === 5000000) surchargeAtThreshold = 0;

        const maxTaxInclSurcharge = taxAtThreshold + surchargeAtThreshold + (income - threshold);
        let marginalRelief = 0;
        if ((slabTax + baseSurcharge) > maxTaxInclSurcharge) {
            marginalRelief = (slabTax + baseSurcharge) - maxTaxInclSurcharge;
        }

        return { surcharge: baseSurcharge, marginalRelief };
    };

    const { surcharge: baseSurchargeOld, marginalRelief: marginalReliefOld } = calculateSurchargeOld(netTaxableOld, slabTaxOld);
    const surchargeAndReliefOld = Math.max(0, baseSurchargeOld - marginalReliefOld);

    // 87A rebate old
    let rebate87aOld = 0;
    if (netTaxableOld <= 500000 && netTaxableOld > 0 && slabTaxOld > 0) {
        rebate87aOld = Math.min(slabTaxOld, 12500);
    }
    
    const taxBeforeCessOld = Math.max(0, slabTaxOld + surchargeAndReliefOld - rebate87aOld);
    const cessOld = taxBeforeCessOld * 0.04;
    const finalTaxOld = taxBeforeCessOld + cessOld;

    const oldEffectiveRate = grossIncome > 0 ? (finalTaxOld / grossIncome) * 100 : 0;

    // ----- New Regime -----
    const stdDeductionNew = Math.min(75000, grossIncome);
    const netTaxableNew = Math.max(0, grossIncome - stdDeductionNew);

    const calculateNewRegimeSlabTax = (income) => {
        let tax = 0;
        let breakdown = [];
        
        if (income > 1500000) {
            let amount = (income - 1500000) * 0.30;
            tax += amount;
            breakdown.push({ slab: 'Above 15L', rate: 30, amount });
        }
        if (income > 1200000) {
            let limitVal = Math.min(income, 1500000);
            let amount = (limitVal - 1200000) * 0.20;
            tax += amount;
            breakdown.push({ slab: '12L-15L', rate: 20, amount });
        }
        if (income > 1000000) {
            let limitVal = Math.min(income, 1200000);
            let amount = (limitVal - 1000000) * 0.15;
            tax += amount;
            breakdown.push({ slab: '10L-12L', rate: 15, amount });
        }
        if (income > 700000) {
            let limitVal = Math.min(income, 1000000);
            let amount = (limitVal - 700000) * 0.10;
            tax += amount;
            breakdown.push({ slab: '7L-10L', rate: 10, amount });
        }
        if (income > 300000) {
            let limitVal = Math.min(income, 700000);
            let amount = (limitVal - 300000) * 0.05;
            tax += amount;
            breakdown.push({ slab: '3L-7L', rate: 5, amount });
        }
        return { tax, breakdown: breakdown.reverse() };
    };

    const { tax: slabTaxNew, breakdown: breakdownNew } = calculateNewRegimeSlabTax(netTaxableNew);

    const calculateSurchargeNew = (income, slabTax) => {
        if (income <= 5000000) return { surcharge: 0, marginalRelief: 0 };
        let rate = 0;
        let threshold = 0;
        // Cap is 25% for new regime
        if (income > 20000000) { rate = 0.25; threshold = 20000000; }
        else if (income > 10000000) { rate = 0.15; threshold = 10000000; }
        else if (income > 5000000) { rate = 0.10; threshold = 5000000; }

        let baseSurcharge = slabTax * rate;
        
        const { tax: taxAtThreshold } = calculateNewRegimeSlabTax(threshold);
        let surchargeAtThreshold = 0;
        if (threshold === 20000000) surchargeAtThreshold = taxAtThreshold * 0.15;
        else if (threshold === 10000000) surchargeAtThreshold = taxAtThreshold * 0.10;
        else if (threshold === 5000000) surchargeAtThreshold = 0;

        const maxTaxInclSurcharge = taxAtThreshold + surchargeAtThreshold + (income - threshold);
        let marginalRelief = 0;
        if ((slabTax + baseSurcharge) > maxTaxInclSurcharge) {
            marginalRelief = (slabTax + baseSurcharge) - maxTaxInclSurcharge;
        }

        return { surcharge: baseSurcharge, marginalRelief };
    };

    const { surcharge: baseSurchargeNew, marginalRelief: marginalReliefNew } = calculateSurchargeNew(netTaxableNew, slabTaxNew);
    const surchargeAndReliefNew = Math.max(0, baseSurchargeNew - marginalReliefNew);

    // 87A rebate new
    let rebate87aNew = 0;
    if (netTaxableNew <= 700000 && netTaxableNew > 0 && slabTaxNew > 0) {
        rebate87aNew = Math.min(slabTaxNew, 25000); 
    }
    
    // Marginal relief for 87A in New Regime (if income just above 7L)
    let marginalRelief87ANew = 0;
    if (netTaxableNew > 700000 && netTaxableNew <= 727777) {
        const taxExceedingIncome = slabTaxNew - (netTaxableNew - 700000);
        if (taxExceedingIncome > 0) {
            marginalRelief87ANew = taxExceedingIncome;
        }
    }

    const taxBeforeCessNew = Math.max(0, slabTaxNew + surchargeAndReliefNew - rebate87aNew - marginalRelief87ANew);
    const cessNew = taxBeforeCessNew * 0.04;
    const finalTaxNew = taxBeforeCessNew + cessNew;

    const newEffectiveRate = grossIncome > 0 ? (finalTaxNew / grossIncome) * 100 : 0;

    // ----- Recommendation Logic -----
    let recommendedRegime = 'new';
    let savings = 0;
    let reasons = [];

    const taxDiff = finalTaxOld - finalTaxNew;
    
    if (taxDiff > 0) {
        recommendedRegime = 'new';
        savings = taxDiff;
        reasons.push(`New regime saves ₹${savings.toLocaleString('en-IN')} because your deductions (₹${totalDeductionsOld.toLocaleString('en-IN')}) are not high enough to beat the lower tax slabs and higher standard deduction of the new regime.`);
    } else if (taxDiff < 0) {
        recommendedRegime = 'old';
        savings = Math.abs(taxDiff);
        reasons.push(`Old regime is better because your total deductions of ₹${totalDeductionsOld.toLocaleString('en-IN')} (including 80C, 80D, HRA etc) exceed the breakeven point, saving you ₹${savings.toLocaleString('en-IN')}.`);
    } else {
        recommendedRegime = 'new';
        savings = 0;
        reasons.push('Both regimes result in the exact same tax liability. We recommend the New regime for its simpler filing process and fewer documentation requirements.');
    }

    // ----- Suggestions -----
    const suggestions = [];
    if (actual80C < 150000) {
        suggestions.push({
            section: '80C',
            message: `You can invest ₹${(150000 - actual80C).toLocaleString('en-IN')} more in PPF, ELSS, or LIPC to maximize 80C deductions (Old Regime only).`,
            potentialSaving: (150000 - actual80C) * (netTaxableOld > 1000000 ? 0.312 : (netTaxableOld > 500000 ? 0.208 : 0.052))
        });
    }
    if (actual80D < max80D) {
        suggestions.push({
            section: '80D',
            message: `You can claim up to ₹${max80D.toLocaleString('en-IN')} in medical insurance premiums. You currently claimed ₹${actual80D.toLocaleString('en-IN')}.`,
            potentialSaving: (max80D - actual80D) * (netTaxableOld > 1000000 ? 0.312 : (netTaxableOld > 500000 ? 0.208 : 0.052))
        });
    }
    if (actualNPS < 50000) {
        suggestions.push({
            section: '80CCD(1B)',
            message: `You can invest ₹${(50000 - actualNPS).toLocaleString('en-IN')} more in Tier 1 NPS for additional deduction under 80CCD(1B).`,
            potentialSaving: (50000 - actualNPS) * (netTaxableOld > 1000000 ? 0.312 : (netTaxableOld > 500000 ? 0.208 : 0.052))
        });
    }

    return {
        oldRegime: {
            grossIncome,
            standardDeduction: stdDeductionOld,
            totalDeductions: totalDeductionsOld,
            taxableIncome: netTaxableOld,
            slabTax: slabTaxOld,
            surcharge: surchargeAndReliefOld,
            rebate87A: rebate87aOld,
            cess: cessOld,
            totalTax: finalTaxOld,
            effectiveRate: oldEffectiveRate,
            breakdown: breakdownOld
        },
        newRegime: {
            grossIncome,
            standardDeduction: stdDeductionNew,
            taxableIncome: netTaxableNew,
            slabTax: Math.max(0, slabTaxNew - marginalRelief87ANew),
            surcharge: surchargeAndReliefNew,
            rebate87A: rebate87aNew,
            cess: cessNew,
            totalTax: finalTaxNew,
            effectiveRate: newEffectiveRate,
            breakdown: breakdownNew
        },
        recommendation: {
            regime: recommendedRegime,
            savings,
            reasons
        },
        suggestions
    };
};

module.exports = { calculateTax };
