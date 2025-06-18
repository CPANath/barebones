import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calculator, TrendingUp, Target, DollarSign, Calendar, Zap, Trophy, AlertCircle, Info } from 'lucide-react';

export default function FireApp() {
    const [inputs, setInputs] = useState({
        currentAge: 30,
        currentIncome: 75000,
        currentSavings: 50000,
        monthlyExpenses: 4000,
        monthlySavings: 2500,
        investmentReturn: 7,
        inflationRate: 3,
        targetRetirementAge: 50,
        safeWithdrawalRate: 4
    });

    const [selectedScenario, setSelectedScenario] = useState('moderate');
    const [showMonteCarlo, setShowMonteCarlo] = useState(false);

    // Calculate key metrics
    const calculations = useMemo(() => {
        const annualExpenses = inputs.monthlyExpenses * 12;
        const fireNumber = annualExpenses * 25;
        const yearsToFire = inputs.targetRetirementAge - inputs.currentAge;
        const currentNetWorth = inputs.currentSavings;
        const savingsRate = (inputs.monthlySavings * 12) / inputs.currentIncome;

        // Generate year-by-year projections
        const projections = [];
        let balance = inputs.currentSavings;
        const monthlyReturn = inputs.investmentReturn / 100 / 12;

        for (let year = 0; year <= 40; year++) {
            const age = inputs.currentAge + year;
            const inflationMultiplier = Math.pow(1 + inputs.inflationRate / 100, year);
            const adjustedExpenses = inputs.monthlyExpenses * inflationMultiplier;
            const adjustedFireNumber = adjustedExpenses * 12 * 25;

            if (year > 0) {
                // Compound monthly
                for (let month = 0; month < 12; month++) {
                    balance = balance * (1 + monthlyReturn) + inputs.monthlySavings;
                }
            }

            const fireProgress = Math.min(balance / adjustedFireNumber * 100, 100);
            const canRetire = balance >= adjustedFireNumber;

            projections.push({
                year: year,
                age: age,
                balance: Math.round(balance),
                fireNumber: Math.round(adjustedFireNumber),
                fireProgress: Math.round(fireProgress),
                canRetire: canRetire,
                monthlyIncome: Math.round(balance * (inputs.safeWithdrawalRate / 100) / 12)
            });
        }

        // Find retirement year
        const retirementYear = projections.find(p => p.canRetire)?.year || 40;

        return {
            fireNumber,
            currentNetWorth,
            amountNeeded: fireNumber - currentNetWorth,
            savingsRate,
            yearsToFire: retirementYear,
            projections,
            monthlyIncomeAtRetirement: Math.round(fireNumber * (inputs.safeWithdrawalRate / 100) / 12)
        };
    }, [inputs]);

    // Achievement system
    const achievements = useMemo(() => {
        const savingsRate = calculations.savingsRate;
        const fireProgress = calculations.currentNetWorth / calculations.fireNumber;

        return [
            {
                name: "First $10K",
                achieved: calculations.currentNetWorth >= 10000,
                icon: "💰",
                description: "Saved your first $10,000"
            },
            {
                name: "High Saver",
                achieved: savingsRate >= 0.2,
                icon: "🎯",
                description: "Saving 20%+ of income"
            },
            {
                name: "Super Saver",
                achieved: savingsRate >= 0.5,
                icon: "🚀",
                description: "Saving 50%+ of income"
            },
            {
                name: "Quarter Way",
                achieved: fireProgress >= 0.25,
                icon: "🏆",
                description: "25% to FIRE goal"
            },
            {
                name: "Halfway Hero",
                achieved: fireProgress >= 0.5,
                icon: "⭐",
                description: "50% to FIRE goal"
            }
        ];
    }, [calculations]);

    // Scenario analysis
    const scenarios = {
        conservative: { return: 5, savings: inputs.monthlySavings * 0.8, name: "Conservative" },
        moderate: { return: 7, savings: inputs.monthlySavings, name: "Moderate" },
        aggressive: { return: 9, savings: inputs.monthlySavings * 1.2, name: "Aggressive" }
    };

    // Monte Carlo simulation (simplified)
    const monteCarloData = useMemo(() => {
        if (!showMonteCarlo) return [];

        const results = [];
        const yearsToShow = Math.min(calculations.yearsToFire + 5, 30);

        // Generate percentiles (10th, 25th, 50th, 75th, 90th)
        for (let year = 0; year <= yearsToShow; year++) {
            const age = inputs.currentAge + year;
            const simulations = [];

            // Run 1000 simulations for this year
            for (let sim = 0; sim < 1000; sim++) {
                let balance = inputs.currentSavings;

                // Simulate each year with random returns
                for (let y = 1; y <= year; y++) {
                    // Normal distribution around expected return with volatility
                    const randomReturn = Math.max(-0.5, Math.min(1.0,
                        (Math.random() + Math.random() + Math.random() + Math.random()) / 4 * 0.6 - 0.2 + inputs.investmentReturn / 100
                    ));
                    balance = balance * (1 + randomReturn) + inputs.monthlySavings * 12;
                }
                simulations.push(balance);
            }

            // Sort and get percentiles
            simulations.sort((a, b) => a - b);
            const getPercentile = (arr, p) => {
                if (!arr.length) return 0;
                const idx = Math.floor(arr.length * p);
                return arr[idx] !== undefined ? arr[idx] : 0;
            };
            const p10 = getPercentile(simulations, 0.1);
            const p25 = getPercentile(simulations, 0.25);
            const p50 = getPercentile(simulations, 0.5);
            const p75 = getPercentile(simulations, 0.75);
            const p90 = getPercentile(simulations, 0.9);

            results.push({
                year,
                age,
                p10: Math.round(p10),
                p25: Math.round(p25),
                p50: Math.round(p50),
                p75: Math.round(p75),
                p90: Math.round(p90),
                expected: calculations.projections[year]?.balance || 0
            });
        }

        return results;
    }, [showMonteCarlo, inputs, calculations.yearsToFire, calculations.projections]);

    const updateInput = (key, value) => {
        setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercentage = (decimal) => {
        return (decimal * 100).toFixed(1) + '%';
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white-800 mb-2 flex items-center justify-center gap-3">
                        <TrendingUp className="text-green-600" />
                        FIRE Calculator Pro
                    </h1>
                    <p className="text-xl text-white-600">Your path to Financial Independence, Retire Early</p>
                </div>

                {/* Achievement Bar */}
                <div className="bg-gray-200 rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg text-gray-700 font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="text-yellow-500" />
                        Your Achievements
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {achievements.map((achievement, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full ${achievement.achieved
                                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                        : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                                    }`}
                            >
                                <span className="text-lg">{achievement.icon}</span>
                                <span className="font-medium">{achievement.name}</span>
                                {achievement.achieved && <Zap className="w-4 h-4 text-yellow-500" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-200 rounded-lg shadow-lg p-6">
                            <h2 className="text-xl  font-semibold mb-4 flex items-center gap-2">
                                <Calculator className="text-blue-600" />
                                Your Financial Profile
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Age
                                    </label>
                                    <input
                                        type="range"
                                        min="18"
                                        max="65"
                                        value={inputs.currentAge}
                                        onChange={(e) => updateInput('currentAge', e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-center text-lg font-semibold text-blue-600">
                                        {inputs.currentAge} years old
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Annual Income
                                    </label>
                                    <input
                                        type="range"
                                        min="30000"
                                        max="200000"
                                        step="5000"
                                        value={inputs.currentIncome}
                                        onChange={(e) => updateInput('currentIncome', e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-center text-lg font-semibold text-green-600">
                                        {formatCurrency(inputs.currentIncome)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Savings
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500000"
                                        step="5000"
                                        value={inputs.currentSavings}
                                        onChange={(e) => updateInput('currentSavings', e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-center text-lg font-semibold text-blue-600">
                                        {formatCurrency(inputs.currentSavings)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monthly Expenses
                                    </label>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="10000"
                                        step="100"
                                        value={inputs.monthlyExpenses}
                                        onChange={(e) => updateInput('monthlyExpenses', e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-center text-lg font-semibold text-red-600">
                                        {formatCurrency(inputs.monthlyExpenses)}/month
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monthly Savings
                                    </label>
                                    <input
                                        type="range"
                                        min="100"
                                        max="8000"
                                        step="100"
                                        value={inputs.monthlySavings}
                                        onChange={(e) => updateInput('monthlySavings', e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-center text-lg font-semibold text-green-600">
                                        {formatCurrency(inputs.monthlySavings)}/month
                                    </div>
                                    <div className="text-center text-sm text-gray-500">
                                        Savings Rate: {formatPercentage(calculations.savingsRate)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expected Investment Return
                                    </label>
                                    <input
                                        type="range"
                                        min="3"
                                        max="12"
                                        step="0.5"
                                        value={inputs.investmentReturn}
                                        onChange={(e) => updateInput('investmentReturn', e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-center text-lg font-semibold text-purple-600">
                                        {inputs.investmentReturn}% annually
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100">FIRE Number</p>
                                        <p className="text-2xl font-bold">{formatCurrency(calculations.fireNumber)}</p>
                                    </div>
                                    <Target className="w-8 h-8 text-green-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100">Years to FIRE</p>
                                        <p className="text-2xl font-bold">{calculations.yearsToFire}</p>
                                    </div>
                                    <Calendar className="w-8 h-8 text-blue-200" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100">Retirement Income</p>
                                        <p className="text-2xl font-bold">{formatCurrency(calculations.monthlyIncomeAtRetirement)}</p>
                                        <p className="text-purple-100 text-sm">per month</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-purple-200" />
                                </div>
                            </div>
                        </div>

                        {/* Progress Chart */}
                        <div className="bg-gray-200 rounded-lg shadow-lg p-6 mb-6">
                            <h3 className="text-lg text-gray-700 font-semibold mb-4">Your Journey to FIRE</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={calculations.projections.slice(0, calculations.yearsToFire + 5)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="age" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                    <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#3B82F6"
                                        fill="#93C5FD"
                                        name="Portfolio Value"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="fireNumber"
                                        stroke="#EF4444"
                                        fill="#FCA5A5"
                                        name="FIRE Target"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Scenario Comparison */}
                        <div className="bg-gray-200 rounded-lg shadow-lg p-6 mb-6">
                            <h3 className="text-lg text-gray-700 font-semibold mb-4">Scenario Analysis</h3>
                            <div className="flex gap-2 mb-4">
                                {Object.entries(scenarios).map(([key, scenario]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedScenario(key)}
                                        className={`px-4 py-2 rounded-lg font-medium ${selectedScenario === key
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {scenario.name}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(scenarios).map(([key, scenario]) => {
                                    // Calculate years to FIRE for each scenario using PMT formula
                                    const monthlyReturn = scenario.return / 100 / 12;
                                    const targetAmount = calculations.fireNumber - inputs.currentSavings;

                                    let scenarioYears = 0;
                                    if (targetAmount > 0 && scenario.savings > 0 && monthlyReturn > 0) {
                                        // Using future value of ordinary annuity formula to solve for n:
                                        // FV = P * [((1 + r)^n - 1) / r]
                                        // n = log((FV * r / P) + 1) / log(1 + r)
                                        const P = scenario.savings * 12;
                                        const r = scenario.return / 100;
                                        const FV = calculations.fireNumber;
                                        const PV = inputs.currentSavings;
                                        // Calculate number of years to reach FV from PV with annual contributions P and annual return r
                                        // FV = PV*(1+r)^n + P*(((1+r)^n - 1)/r)
                                        // Solve for n numerically
                                        let n = 0;
                                        let bal = PV;
                                        while (bal < FV && n < 100) {
                                            bal = bal * (1 + r) + P;
                                            n++;
                                        }
                                        scenarioYears = bal >= FV ? n : Infinity;
                                    }

                                    return (
                                        <div key={key} className={`p-4 rounded-lg border-2 ${selectedScenario === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}>
                                            <h4 className="font-semibold">{scenario.name}</h4>
                                            <p className="text-sm text-gray-600">{scenario.return}% return</p>
                                            <p className="text-sm text-gray-600">{formatCurrency(scenario.savings * 12)}/year savings</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {isFinite(scenarioYears) ? Math.round(scenarioYears) : '∞'} years
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Monte Carlo Toggle */}
                        <div className="bg-gray-200 rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg text-gray-700 font-semibold">Risk Analysis</h3>
                                <button
                                    onClick={() => setShowMonteCarlo(!showMonteCarlo)}
                                    className={`px-4 py-2 rounded-lg font-medium ${showMonteCarlo
                                            ? 'bg-red-600 text-white'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {showMonteCarlo ? 'Hide' : 'Show'} Market Volatility
                                </button>
                            </div>

                            {showMonteCarlo && (
                                <div>
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">Understanding the Risk Ranges:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-200 rounded"></div>
                                                <span>90th percentile: Best 10% of outcomes</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-200 rounded"></div>
                                                <span>10th percentile: Worst 10% of outcomes</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                                <span>Blue line: Expected outcome (50th percentile)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                                <span>Shaded areas: Range of likely outcomes</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={monteCarloData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="age" />
                                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                            <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                                            <Area
                                                type="monotone"
                                                dataKey="p90"
                                                stroke="#10B981"
                                                fill="#D1FAE5"
                                                fillOpacity={0.3}
                                                name="90th Percentile (Best Case)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="p75"
                                                stroke="#059669"
                                                fill="#A7F3D0"
                                                fillOpacity={0.4}
                                                name="75th Percentile"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="p25"
                                                stroke="#DC2626"
                                                fill="#FECACA"
                                                fillOpacity={0.4}
                                                name="25th Percentile"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="p10"
                                                stroke="#B91C1C"
                                                fill="#FEE2E2"
                                                fillOpacity={0.3}
                                                name="10th Percentile (Worst Case)"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="expected"
                                                stroke="#3B82F6"
                                                strokeWidth={3}
                                                name="Expected Path"
                                                dot={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
