// Enhanced Finance Section with finance.js integration
// This file will integrate finance.js utilities into the rent management system

// Import finance.js functions (will be available globally after script tag is added)
// Note: finance.js should be loaded before this file

class FinanceManager {
    constructor() {
        this.transactions = [];
        this.rentalIncome = 0;
        this.expenses = 0;
        this.netProfit = 0;
    }

    init() {
        this.loadFinanceData();
        this.setupEventListeners();
        this.calculateFinancialMetrics();
        this.renderFinanceDashboard();
    }

    loadFinanceData() {
        // Load existing data from localStorage
        const savedData = localStorage.getItem('financeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.transactions = data.transactions || [];
            this.rentalIncome = data.rentalIncome || 0;
            this.expenses = data.expenses || 0;
        }
    }

    saveFinanceData() {
        const data = {
            transactions: this.transactions,
            rentalIncome: this.rentalIncome,
            expenses: this.expenses,
            netProfit: this.netProfit
        };
        localStorage.setItem('financeData', JSON.stringify(data));
    }

    setupEventListeners() {
        // Add transaction form
        const addTransactionBtn = document.getElementById('add-transaction-btn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => this.showAddTransactionModal());
        }

        // Calculate button
        const calculateBtn = document.getElementById('calculate-finances-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateFinancialMetrics());
        }
    }

    calculateFinancialMetrics() {
        // Use finance.js utilities if available
        if (typeof window.calculateMonthlyRevenue === 'function') {
            this.rentalIncome = window.calculateMonthlyRevenue(this.getAllRents());
        } else {
            this.rentalIncome = this.calculateRentalIncome();
        }

        if (typeof window.calculateTotalExpenses === 'function') {
            this.expenses = window.calculateTotalExpenses(this.getAllExpenses());
        } else {
            this.expenses = this.calculateExpenses();
        }

        this.netProfit = this.rentalIncome - this.expenses;
        this.saveFinanceData();
    }

    calculateRentalIncome() {
        // Get all active tenants and their rent amounts
        const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
        return tenants.reduce((total, tenant) => {
            return total + (parseFloat(tenant.rentAmount) || 0);
        }, 0);
    }

    calculateExpenses() {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((total, transaction) => total + transaction.amount, 0);
    }

    getAllRents() {
        const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
        return tenants.map(tenant => ({
            amount: parseFloat(tenant.rentAmount) || 0,
            property: tenant.house,
            tenant: tenant.name
        }));
    }

    getAllExpenses() {
        return this.transactions.filter(t => t.type === 'expense');
    }

    renderFinanceDashboard() {
        const container = document.getElementById('finance-section-content');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Financial Overview Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Monthly Rental Income</h3>
                        <p class="text-3xl font-bold text-green-600">${this.formatCurrency(this.rentalIncome)}</p>
                        <p class="text-sm text-gray-500">Current month</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Monthly Expenses</h3>
                        <p class="text-3xl font-bold text-red-600">${this.formatCurrency(this.expenses)}</p>
                        <p class="text-sm text-gray-500">Current month</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Net Profit</h3>
                        <p class="text-3xl font-bold ${this.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}">
                            ${this.formatCurrency(this.netProfit)}
                        </p>
                        <p class="text-sm text-gray-500">Current month</p>
                    </div>
                </div>

                <!-- Financial Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-700 mb-4">Revenue vs Expenses</h3>
                        <canvas id="financeChart" width="400" height="200"></canvas>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-700 mb-4">Transaction History</h3>
                        <div id="transaction-list" class="space-y-2 max-h-96 overflow-y-auto">
                            ${this.renderTransactions()}
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                    <div class="flex space-x-4">
                        <button id="add-transaction-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            Add Transaction
                        </button>
                        <button id="generate-report-btn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            Generate Report
                        </button>
                        <button id="export-data-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Export Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderFinanceChart();
    }

    renderTransactions() {
        return this.transactions.map(transaction => `
            <div class="flex justify-between items-center p-3 border rounded-lg">
                <div>
                    <p class="font-medium">${transaction.description}</p>
                    <p class="text-sm text-gray-500">${transaction.date}</p>
                </div>
                <p class="font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${this.formatCurrency(transaction.amount)}
                </p>
            </div>
        `).join('');
    }

    renderFinanceChart() {
        const ctx = document.getElementById('financeChart');
        if (!ctx) return;

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Income',
                        data: [2700000, 2850000, 2900000, 2750000, 2700000, 2800000],
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: [1800000, 1900000, 1850000, 1950000, 2000000, 1880000],
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₦' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    showAddTransactionModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Add Transaction</h3>
                <form id="transaction-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Type</label>
                        <select id="transaction-type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Amount</label>
                        <input type="number" id="transaction-amount" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" id="transaction-description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" id="transaction-date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                    </div>
                    <div class="flex space-x-3">
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            Add Transaction
                        </button>
                        <button type="button" id="cancel-transaction" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction({
                type: document.getElementById('transaction-type').value,
                amount: parseFloat(document.getElementById('transaction-amount').value),
                description: document.getElementById('transaction-description').value,
                date: document.getElementById('transaction-date').value
            });
            modal.remove();
        });

        // Handle cancel
        document.getElementById('cancel-transaction').addEventListener('click', () => {
            modal.remove();
        });
    }

    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.calculateFinancialMetrics();
        this.renderFinanceDashboard();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    }
}

// Initialize the finance manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const financeManager = new FinanceManager();
    financeManager.init();
});
                    
