// Theme Handling
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const moonSvg = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
const sunSvg = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;

if (themeIcon) {
    themeIcon.innerHTML = savedTheme === 'dark' ? sunSvg : moonSvg;
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        if (themeIcon) {
            themeIcon.innerHTML = newTheme === 'dark' ? sunSvg : moonSvg;
        }

        if (typeof updateChartsTheme === 'function') {
            updateChartsTheme(newTheme);
        }
    });
}

function updateChartsTheme(theme) {
    const textColor = theme === 'dark' ? '#94a3b8' : '#64748B';
    const legendColor = theme === 'dark' ? '#f8fafc' : '#1e293b';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    if (window.inventoryChartInstance) {
        window.inventoryChartInstance.options.scales.y.grid.color = gridColor;
        window.inventoryChartInstance.options.scales.y.ticks.color = textColor;
        window.inventoryChartInstance.options.scales.x.ticks.color = textColor;
        window.inventoryChartInstance.options.plugins.legend.labels.color = legendColor;
        window.inventoryChartInstance.update();
    }
    
    if (window.inventoryPieChartInstance) {
        window.inventoryPieChartInstance.options.plugins.legend.labels.color = legendColor;
        window.inventoryPieChartInstance.update();
    }
}

// Global Auth Check
const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
if (!isLoginPage && localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = '/index.html';
}

// Display User in Topbar
if (!isLoginPage) {
    const storedUsername = localStorage.getItem('username') || 'LAkshay';
    const navUsername = document.getElementById('navUsername');
    const navAvatar = document.getElementById('navAvatar');
    if (navUsername) navUsername.textContent = `Welcome, ${storedUsername}`;
    if (navAvatar) navAvatar.textContent = storedUsername.charAt(0).toUpperCase();
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedIn');
        window.location.href = '/index.html';
    });
}

// Login handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (data.success) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            window.location.href = '/dashboard.html';
        } else {
            alert('Login failed: Invalid credentials');
        }
    });
}

// Dashboard handling
const addItemForm = document.getElementById('addItemForm');
if (addItemForm) {
    loadItems();

    // Dictionary of estimated average prices from current online market data
    const averagePrices = {
        "RAM (DDR3)": 1650,
        "RAM (DDR4)": 3750,
        "RAM (DDR5)": 10000,
        "SSD (SATA)": 3500,
        "SSD (NVMe)": 6500,
        "HDD (SATA)": 4250,
        "Power Supply Unit (PSU)": 5500,
        "Motherboard": 10500,
        "CPU": 18500,
        "Cooling Fan": 1250,
        "Cable (SATA)": 415,
        "Cable (Power)": 650
    };

    const itemNameSelect = document.getElementById('itemName');
    const itemPriceInput = document.getElementById('itemPrice');

    // Auto-fill price when category is selected
    if (itemNameSelect && itemPriceInput) {
        itemNameSelect.addEventListener('change', (e) => {
            const selectedItem = e.target.value;
            if (averagePrices[selectedItem] !== undefined) {
                itemPriceInput.value = averagePrices[selectedItem].toFixed(2);
            }
        });
    }

    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('itemName').value;
        const quantity = document.getElementById('itemQty').value;
        const price = document.getElementById('itemPrice').value;

        const res = await fetch('/add-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, quantity, price })
        });

        if (res.ok) {
            addItemForm.reset();
            loadItems();
        } else {
            alert('Failed to add item');
        }
    });
}

const downloadCsv = document.getElementById('downloadCsv');
if (downloadCsv) {
    downloadCsv.addEventListener('click', async () => {
        const res = await fetch('/items');
        const items = await res.json();

        if (!items.length) return alert('No items to download');

        let csv = 'ID,Name,Quantity,Price,Min Stock\n';
        items.forEach(i => {
            csv += `${i.id},"${i.name}",${i.quantity},${i.price},${i.min_stock || 0}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.csv';
        a.click();
    });
}

// Transactions handling
const addTransactionForm = document.getElementById('addTransactionForm');
if (addTransactionForm) {
    loadItems(); // Need to load items to populate dropdown
    loadTransactions();
    loadRecommendations();

    const maxQtyBtn = document.getElementById('maxQtyBtn');
    if (maxQtyBtn) {
        maxQtyBtn.addEventListener('click', () => {
            const selectItem = document.getElementById('transactionItem');
            const qtyInput = document.getElementById('transactionQty');
            if (selectItem.selectedIndex > 0) { // Check if a valid option is selected
                const selectedOption = selectItem.options[selectItem.selectedIndex];
                if (selectedOption.dataset.max) {
                    qtyInput.value = selectedOption.dataset.max;
                }
            } else {
                alert('Please select an item first.');
            }
        });
    }

    addTransactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectItem = document.getElementById('transactionItem');
        const item_id = selectItem.value;
        const quantity_used = parseInt(document.getElementById('transactionQty').value, 10);

        if (selectItem.selectedIndex > 0) {
            const selectedOption = selectItem.options[selectItem.selectedIndex];
            const maxAvailable = parseInt(selectedOption.dataset.max, 10);

            if (quantity_used > maxAvailable) {
                alert(`Cannot use more than available quantity (${maxAvailable})`);
                return;
            }
            if (quantity_used <= 0) {
                alert('Please enter a valid quantity.');
                return;
            }
        } else {
             alert('Please select an item first.');
             return;
        }

        const res = await fetch('/add-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id, quantity_used })
        });

        if (res.ok) {
            addTransactionForm.reset();
            loadItems();
            loadTransactions();
            loadRecommendations();
        } else {
            alert('Failed to log transaction');
        }
    });
}

const downloadTransactionsCsv = document.getElementById('downloadTransactionsCsv');
if (downloadTransactionsCsv) {
    downloadTransactionsCsv.addEventListener('click', async () => {
        const res = await fetch('/transactions');
        const transactions = await res.json();

        if (!transactions.length) return alert('No transactions to download');

        let csv = 'ID,Date & Time,Item Name,Qty Used\n';
        transactions.forEach(t => {
            const date = new Date(t.date).toLocaleString().replace(/,/g, '');
            csv += `${t.id},"${date}","${t.item_name}",${t.quantity_used}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
    });
}

// Employees Handling
const employeesBody = document.getElementById('employeesBody');
if (employeesBody) {
    loadEmployees();
}

// Data Loaders
async function loadItems() {
    const res = await fetch('/items');
    const items = await res.json();

    // Update Chart.js if it exists
    const ctx = document.getElementById('inventoryChart');
    if (ctx) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const textColor = currentTheme === 'dark' ? '#94a3b8' : '#64748B';
        const legendColor = currentTheme === 'dark' ? '#f8fafc' : '#1e293b';
        const gridColor = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

        const labels = items.map(item => item.name);
        const data = items.map(item => item.quantity);
        // Highlight low stock (e.g., < 5) in warning color
        const bgColors = data.map(qty => qty < 5 ? '#ef4444' : '#8b5cf6');

        if (window.inventoryChartInstance) {
            window.inventoryChartInstance.data.labels = labels;
            window.inventoryChartInstance.data.datasets[0].data = data;
            window.inventoryChartInstance.data.datasets[0].backgroundColor = bgColors;
            window.inventoryChartInstance.options.scales.y.grid.color = gridColor;
            window.inventoryChartInstance.options.scales.y.ticks.color = textColor;
            window.inventoryChartInstance.options.scales.x.ticks.color = textColor;
            window.inventoryChartInstance.options.plugins.legend.labels.color = legendColor;
            window.inventoryChartInstance.update();
        } else {
            window.inventoryChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Quantity in Stock',
                        data: data,
                        backgroundColor: bgColors,
                        borderRadius: 6,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: gridColor },
                            ticks: { color: textColor }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: textColor }
                        }
                    },
                    plugins: {
                        legend: { labels: { color: legendColor } }
                    }
                }
            });
        }
    }

    // Update Pie Chart if it exists
    const pieCtx = document.getElementById('inventoryPieChart');
    if (pieCtx) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const legendColor = currentTheme === 'dark' ? '#f8fafc' : '#1e293b';

        // Group quantities by category (if names have similarities, else just use item labels)
        // We'll just use the items array
        const labels = items.filter(item => item.quantity > 0).map(item => item.name);
        const data = items.filter(item => item.quantity > 0).map(item => item.quantity);

        // Generate appealing colors based on length
        const colors = [
            '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
            '#ec4899', '#3b82f6', '#14b8a6', '#84cc16', '#a855f7'
        ];
        const bgColors = data.map((_, i) => colors[i % colors.length]);

        if (window.inventoryPieChartInstance) {
            window.inventoryPieChartInstance.data.labels = labels;
            window.inventoryPieChartInstance.data.datasets[0].data = data;
            window.inventoryPieChartInstance.data.datasets[0].backgroundColor = bgColors;
            window.inventoryPieChartInstance.options.plugins.legend.labels.color = legendColor;
            window.inventoryPieChartInstance.update();
        } else {
            window.inventoryPieChartInstance = new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Stock Quantity',
                        data: data,
                        backgroundColor: bgColors,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: legendColor, boxWidth: 12, padding: 10, font: { size: 11 } }
                        }
                    },
                    cutout: '65%'
                }
            });
        }
    }

    // Fill inventory table if it exists
    const tbody = document.getElementById('itemsBody');
    if (tbody) {
        tbody.innerHTML = '';
        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.min_stock || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Fill transaction dropdown if it exists
    const select = document.getElementById('transactionItem');
    if (select) {
        select.innerHTML = '<option value="" disabled selected>Select item from inventory...</option>';
        items.forEach(item => {
            if (item.quantity > 0) {
                const option = document.createElement('option');
                option.value = item.id;
                option.dataset.max = item.quantity;
                option.textContent = `${item.name} (Stock: ${item.quantity})`;
                select.appendChild(option);
            }
        });
    }
}

async function loadTransactions() {
    try {
        const res = await fetch('/transactions');
        const transactions = await res.json();
        const tbody = document.getElementById('transactionsBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        transactions.forEach(t => {
            const tr = document.createElement('tr');
            const date = new Date(t.date).toLocaleString();
            tr.innerHTML = `
                <td>${t.id}</td>
                <td>${date}</td>
                <td>${t.item_name}</td>
                <td>${t.quantity_used}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Error loading transactions:", e);
    }
}

async function loadEmployees() {
    try {
        const res = await fetch('/users');
        const users = await res.json();
        const tbody = document.getElementById('employeesBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.id}</td>
                <td><b>${u.username}</b></td>
                <td><span style="background: var(--primary); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">System Access</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("Error loading employees:", e);
    }
}

async function loadRecommendations() {
    try {
        const recommendationsBody = document.getElementById('recommendationsBody');
        if (!recommendationsBody) return;

        // Clear previous content
        recommendationsBody.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 0.5rem 1rem;">Analyzing transaction data...</div>';

        const [itemsRes, transRes] = await Promise.all([
            fetch('/items'),
            fetch('/transactions')
        ]);

        const items = await itemsRes.json();
        const transactions = await transRes.json();

        // Group transactions by item name and calculate total quantity used
        const consumption = {};
        let firstTransactionDate = new Date(); // To find the oldest transaction

        transactions.forEach(t => {
            const date = new Date(t.date);
            if (date < firstTransactionDate) firstTransactionDate = date;

            if (!consumption[t.item_name]) {
                consumption[t.item_name] = 0;
            }
            consumption[t.item_name] += t.quantity_used;
        });

        // Calculate days elapsed since the very first transaction to determine average daily rate
        // Minimum 1 day to prevent division by zero
        const daysElapsed = Math.max(1, Math.ceil((new Date() - firstTransactionDate) / (1000 * 60 * 60 * 24)));

        let alertsHtml = '';
        let hasAlerts = false;

        items.forEach(item => {
            if (consumption[item.name]) {
                const totalUsed = consumption[item.name];
                const dailyRate = totalUsed / daysElapsed;

                if (dailyRate > 0) {
                    const daysLeft = Math.floor(item.quantity / dailyRate);

                    if (daysLeft <= 3 && item.quantity > 0) {
                        hasAlerts = true;
                        alertsHtml += `
                            <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; margin: 0 1rem;">
                                <div>
                                    <strong style="color: #f8fafc;">${item.name}</strong> 
                                    <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 0.5rem;">Current Stock: ${item.quantity}</span>
                                </div>
                                <div style="color: #f59e0b; font-weight: 600; font-size: 0.9rem;">
                                    Stock gonna finish in ${daysLeft === 0 ? 'less than 1' : daysLeft} day(s)!
                                </div>
                            </div>
                        `;
                    } else if (item.quantity === 0) {
                        hasAlerts = true;
                        alertsHtml += `
                            <div style="background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 0.75rem 1rem; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; margin: 0 1rem;">
                                <div>
                                    <strong style="color: #f8fafc;">${item.name}</strong>
                                </div>
                                <div style="color: #ef4444; font-weight: 600; font-size: 0.9rem;">
                                    Out of stock!
                                </div>
                            </div>
                        `;
                    }
                }
            } else if (item.quantity === 0) {
                hasAlerts = true;
                alertsHtml += `
                    <div style="background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 0.75rem 1rem; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; margin: 0 1rem;">
                        <div>
                            <strong style="color: #f8fafc;">${item.name}</strong>
                        </div>
                        <div style="color: #ef4444; font-weight: 600; font-size: 0.9rem;">
                            Out of stock!
                        </div>
                    </div>
                `;
            }
        });

        if (!hasAlerts) {
            alertsHtml = `
                <div style="background-color: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 0.75rem 1rem; border-radius: 4px; display: flex; align-items: center; margin: 0 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span style="color: #10b981; font-weight: 500;">All stock levels are stable. No immediate restock required based on usage.</span>
                </div>
            `;
        }

        recommendationsBody.innerHTML = alertsHtml;

    } catch (e) {
        console.error("Error loading recommendations:", e);
        const recommendationsBody = document.getElementById('recommendationsBody');
        if (recommendationsBody) {
            recommendationsBody.innerHTML = '<div style="color: #ef4444; font-size: 0.9rem; padding: 0.5rem 1rem;">Failed to load recommendations.</div>';
        }
    }
}