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
            window.location.href = '/dashboard.html';
        } else {
            alert('Login failed: Invalid credentials');
        }
    });
}

// Dashboard handling
const addItemForm = document.getElementById('addItemForm');
if (addItemForm) {
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = '/index.html';
    }

    loadItems();

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

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('loggedIn');
        window.location.href = '/index.html';
    });

    document.getElementById('downloadCsv').addEventListener('click', async () => {
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

async function loadItems() {
    const res = await fetch('/items');
    const items = await res.json();
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';

    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price}</td>
            <td>${item.min_stock || 'N/A'}</td>
        `;
        tbody.appendChild(tr);
    });
}