

// Finance Section - Tenant Management and Payment System
class FinanceManager {
    constructor() {
        this.tenants = JSON.parse(localStorage.getItem('tenants')) || [];
        this.payments = JSON.parse(localStorage.getItem('payments')) || [];
        this.currentTenant = null;
        this.init();
    }

    init() {
        this.createFinanceSection();
        this.loadFinanceData();
        this.setupEventListeners();
    }

    createFinanceSection() {
        const financeSection = document.getElementById('finance-section');
        if (!financeSection) return;

        financeSection.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold text-gray-900">Financial Management</h2>
                    <div class="flex space-x-3">
                        <button id="add-payment-btn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>Add Payment
                        </button>
                        <button id="export-reports-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-download mr-2"></i>Export Reports
                        </button>
                    </div>
                </div>

                <!-- Search and Filter -->
                <div class="bg-white rounded-lg shadow mb-6 p-4">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Search Tenants</label>
                            <div class="relative">
                                <input type="text" id="tenant-search" 
                                       class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                       placeholder="Search by name, ID, or house...">
                                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                            <select id="status-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="all">All Tenants</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Tenants List -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Payment</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="finance-tenants-list" class="bg-white divide-y divide-gray-200">
                                <!-- Tenants will be populated here -->
                            </tbody>
                        </table>
                    </div>
                    <div id="no-finance-tenants" class="text-center py-8 text-gray-500 hidden">
                        <i class="fas fa-users text-4xl mb-2"></i>
                        <p>No tenants found. Add tenants from the Tenants section first.</p>
                    </div>
                </div>

                <!-- Payment Modal -->
                <div id="payment-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
                    <div class="flex items-center justify-center min-h-screen p-4">
                        <div class="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 id="payment-modal-title" class="text-lg font-semibold mb-4">Make Payment</h3>
                            <form id="payment-form">
                                <input type="hidden" id="payment-tenant-id">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tenant Name</label>
                                    <input type="text" id="payment-tenant-name" readonly class="w-full px-3 py-2 border rounded-lg bg-gray-100">
                                </div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Amount (KSH)</label>
                                    <input type="number" id="payment-amount" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                                    <input type="date" id="payment-date" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                                </div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                    <select id="payment-method" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                                        <option value="">Select Method</option>
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="mobile">Mobile Money</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <textarea id="payment-notes" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3"></textarea>
                                </div>
                                <div class="flex justify-end space-x-3">
                                    <button type="button" id="payment-cancel" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                                    <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save Payment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Payment History Modal -->
                <div id="history-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
                    <div class="flex items-center justify-center min-h-screen p-4">
                        <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
                            <div class="flex justify-between items-center mb-4">
                                <h3 id="history-modal-title" class="text-lg font-semibold">Payment History</h3>
                                <button onclick="closeHistoryModal()" class="text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div id="payment-history-content">
                                <!-- Payment history will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadFinanceData() {
        this.displayTenants();
        this.setupEventListeners();
    }

    displayTenants() {
        const tbody = document.getElementById('finance-tenants-list');
        if (!tbody) return;

        const filteredTenants = this.filterTenants();
        
        if (filteredTenants.length === 0) {
            document.getElementById('no-finance-tenants').classList.remove('hidden');
            tbody.innerHTML = '';
            return;
        }

        document.getElementById('no-finance-tenants').classList.add('hidden');
        
        tbody.innerHTML = filteredTenants.map(tenant => {
            const lastPayment = this.getLastPayment(tenant.id);
            const status = this.getTenantStatus(tenant.id);
            
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span class="text-indigo-600 font-medium">${tenant.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${tenant.name}</div>
                                <div class="text-sm text-gray-500">${tenant.idNumber}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tenant.house}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusColor(status)}">
                            ${status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${lastPayment ? lastPayment.date : 'No payments'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="financeManager.openPaymentModal('${tenant.id}')" class="text-green-600 hover:text-green-900 mr-3">
                            <i class="fas fa-money-bill-wave"></i> Pay
                        </button>
                        <button onclick="financeManager.openHistoryModal('${tenant.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                            <i class="fas fa-history"></i> History
                        </button>
                        <button onclick="financeManager.printReceipt('${tenant.id}')" class="text-purple-600 hover:text-purple-900">
                            <i class="fas fa-print"></i> Receipt
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterTenants() {
        const searchTerm = document.getElementById('tenant-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        
        return this.tenants.filter(tenant => {
            const matchesSearch = tenant.name.toLowerCase().includes(searchTerm) || 
                                  tenant.idNumber.toLowerCase().includes(searchTerm) ||
                                  tenant.house.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter === 'all' || this.getTenantStatus(tenant.id) === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }

    getLastPayment(tenantId) {
        const payments = this.payments.filter(p => p.tenantId === tenantId);
        return payments.length > 0 ? payments[payments.length - 1] : null;
    }

    getTenantStatus(tenantId) {
        const payments = this.payments.filter(p => p.tenantId === tenantId);
        if (payments.length === 0) return 'No payments';
        
        const lastPayment = payments[payments.length - 1];
        const daysSincePayment = Math.floor((Date.now() - new Date(lastPayment.date).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSincePayment > 30) return 'Overdue';
        return 'Paid';
    }

    getStatusColor(status) {
        switch(status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'No payments': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('tenant-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.displayTenants());
        }

        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.displayTenants());
        }

        // Payment modal
        const addPaymentBtn = document.getElementById('add-payment-btn');
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => this.openPaymentModal());
        }

        // Payment form
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        }

        const paymentCancel = document.getElementById('payment-cancel');
        if (paymentCancel) {
            paymentCancel.addEventListener('click', () => this.closePaymentModal());
        }
    }

    openPaymentModal(tenantId = null) {
        const modal = document.getElementById('payment-modal');
        if (!modal) return;

        const title = document.getElementById('payment-modal-title');
        const tenantNameInput = document.getElementById('payment-tenant-name');
        const tenantIdInput = document.getElementById('payment-tenant-id');

        if (tenantId) {
            const tenant = this.tenants.find(t => t.id === tenantId);
            if (tenant) {
                title.textContent = `Make Payment - ${tenant.name}`;
                tenantNameInput.value = tenant.name;
                tenantIdInput.value = tenant.id;
            }
        } else {
            title.textContent = 'Make Payment';
            tenantNameInput.value = '';
            tenantIdInput.value = '';
        }

        modal.classList.remove('hidden');
    }

    closePaymentModal() {
        const modal = document.getElementById('payment-modal');
        if (modal) modal.classList.add('hidden');
    }

    openHistoryModal(tenantId) {
        const modal = document.getElementById('history-modal');
        if (!modal) return;

        const title = document.getElementById('history-modal-title');
        const content = document.getElementById('payment-history-content');
        
        const tenant = this.tenants.find(t => t.id === tenantId);
        const payments = this.payments.filter(p => p.tenantId === tenantId);

        title.textContent = `Payment History - ${tenant.name}`;
        
        if (payments.length === 0) {
            content.innerHTML = '<p class="text-center text-gray-500">No payments found for this tenant.</p>';
        } else {
            content.innerHTML = `
                <div class="space-y-4">
                    ${payments.map(payment => `
                        <div class="border p-4 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-semibold">Amount: KSH ${payment.amount}</p>
                                    <p class="text-sm text-gray-600">Date: ${payment.date}</p>
                                    <p class="text-sm text-gray-600">Method: ${payment.method}</p>
                                </div>
                                <button onclick="financeManager.printReceipt('${payment.id}')" class="text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-print"></i> Print
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        modal.classList.remove('hidden');
    }

    closeHistoryModal() {
        const modal = document.getElementById('history-modal');
        if (modal) modal.classList.add('hidden');
    }

    printReceipt(identifier) {
        // Handle both tenant ID and payment ID
        let payment, tenant;
        
        // Check if identifier is a payment ID
        payment = this.payments.find(p => p.id === identifier);
        if (payment) {
            tenant = this.tenants.find(t => t.id === payment.tenantId);
        } else {
            // Assume it's a tenant ID and find latest payment
            tenant = this.tenants.find(t => t.id === identifier);
            if (tenant) {
                const payments = this.payments.filter(p => p.tenantId === identifier);
                payment = payments.length > 0 ? payments[payments.length - 1] : null;
            }
        }
        
        if (!tenant) return;

        const receiptContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #1f2937;">RENT RECEIPT</h2>
                    <p style="color: #6b7280;">KANORERO FLATS</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p><strong>Receipt No:</strong> ${payment ? payment.id : 'N/A'}</p>
                    <p><strong>Date:</strong> ${payment ? payment.date : new Date().toISOString().split('T')[0]}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p><strong>Tenant Name:</strong> ${tenant.name}</p>
                    <p><strong>House:</strong> ${tenant.house}</p>
                    <p><strong>ID Number:</strong> ${tenant.idNumber}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p><strong>Amount Paid:</strong> KSH ${payment ? payment.amount : 'N/A'}</p>
                    <p><strong>Payment Method:</strong> ${payment ? payment.method : 'N/A'}</p>
                    <p><strong>Payment Date:</strong> ${payment ? payment.date : 'N/A'}</p>
                    <p><strong>Notes:</strong> ${payment ? (payment.notes || 'N/A') : 'N/A'}</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #6b7280;">Thank you for your payment</p>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.print();
    }

    handlePaymentSubmit(e) {
        e.preventDefault();
        
        // Prevent duplicate submissions
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton.disabled) return;
        
        submitButton.disabled = true;
        
        const tenantId = document.getElementById('payment-tenant-id').value;
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const date = document.getElementById('payment-date').value;
        
        // Check for duplicate payment in the last 5 seconds
        const recentPayment = this.payments.find(p => 
            p.tenantId === tenantId && 
            p.amount === amount && 
            p.date === date &&
            new Date() - new Date(p.createdAt) < 5000
        );
        
        if (recentPayment) {
            alert('This payment has already been processed. Please check the payment history.');
            submitButton.disabled = false;
            return;
        }
        
        const payment = {
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
            tenantId: tenantId,
            amount: amount,
            date: date,
            method: document.getElementById('payment-method').value,
            notes: document.getElementById('payment-notes').value,
            createdAt: new Date().toISOString(),
            status: 'completed'
        };
        
        this.payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(this.payments));
        
        this.displayTenants();
        this.closePaymentModal();
        
        // Re-enable submit button
        submitButton.disabled = false;
    }
}

// Initialize the finance manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.financeManager = new FinanceManager();
});

// Global functions for modal closing
function closeHistoryModal() {
    const modal = document.getElementById('history-modal');
    if (modal) modal.classList.add('hidden');
}
