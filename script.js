document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration and API Endpoints ---
    const API_BASE_URL = '/api'; // Assuming your PHP API is in a folder named 'api'
    // Example PHP backend files for these endpoints:
    // - /api/products.php (Handles GET, POST, PUT, DELETE for Products)
    // - /api/manufacturers.php (Handles GET for Manufacturers)
    // - /api/inventory.php (Handles GET, POST, PUT, DELETE for Inventory)
    // - /api/sales.php (Handles GET, POST, DELETE for Sales)
    // - /api/customers.php (Handles GET for Customers)
    // - /api/products_count.php (Returns {"count": X})
    // - /api/inventory_count.php (Returns {"count": X})
    // - /api/sales_today_total.php (Returns {"total": Y})

    // --- DOM Elements ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const alertContainer = document.getElementById('alert-container');

    // Dashboard elements
    const totalProductsEl = document.getElementById('total-products');
    const totalInventoryEl = document.getElementById('total-inventory');
    const todaysSalesEl = document.getElementById('todays-sales');
    const quickAddProductBtn = document.getElementById('quick-add-product');
    const quickNewSaleBtn = document.getElementById('quick-new-sale');

    // Product elements
    const productsTableBody = document.getElementById('products-table-body');
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const productModalTitle = document.getElementById('product-modal-title');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const manufacturerIdSelect = document.getElementById('manufacturer-id');
    const productSearchInput = document.getElementById('product-search');

    // Inventory elements
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const addInventoryBtn = document.getElementById('add-inventory-btn');
    const inventoryModal = document.getElementById('inventory-modal');
    const inventoryModalTitle = document.getElementById('inventory-modal-title');
    const inventoryForm = document.getElementById('inventory-form');
    const inventoryIdInput = document.getElementById('inventory-id');
    const inventoryProductIdSelect = document.getElementById('inventory-product-id');
    const inventorySearchInput = document.getElementById('inventory-search');

    // Sale elements
    const salesTableBody = document.getElementById('sales-table-body');
    const addSaleBtn = document.getElementById('add-sale-btn');
    const saleModal = document.getElementById('sale-modal');
    const saleModalTitle = document.getElementById('sale-modal-title');
    const saleForm = document.getElementById('sale-form');
    const saleIdInput = document.getElementById('sale-id'); // Not used for simplified sales, but kept for consistency
    const customerIdSelect = document.getElementById('customer-id');
    const saleSearchInput = document.getElementById('sale-search');


    // Confirmation modal elements
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    let itemToDelete = null; // To store context for deletion (type and ID)

    // --- Utility Functions ---

    /**
     * Helper function for making API requests.
     * @param {string} endpoint - The API endpoint (e.g., 'products', 'inventory').
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
     * @param {object} [body=null] - Request body for POST/PUT.
     * @returns {Promise<object>} - JSON response from the API.
     */
    async function fetchData(endpoint, method = 'GET', body = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}.php`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            showAlert(`Error: ${error.message}`, 'error');
            throw error; // Re-throw to allow calling functions to handle
        }
    }

    /**
     * Shows a specific content section and hides others.
     * Also updates the active navigation link styling.
     * @param {string} sectionId - The ID of the section to show (e.g., 'products-section').
     */
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none'; // Ensure it's hidden
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block'; // Or 'flex', 'grid' as per layout
        }

        navLinks.forEach(link => {
            link.classList.remove('bg-gray-700'); // Remove active style from all
            if (link.dataset.section === sectionId.replace('-section', '')) {
                link.classList.add('bg-gray-700'); // Add active style to current
            }
        });
    }

    /**
     * Shows a modal with a smooth transition.
     * @param {HTMLElement} modalElement - The modal DOM element.
     */
    function showModal(modalElement) {
        modalElement.classList.remove('hidden');
        // Trigger reflow to ensure transition plays
        void modalElement.offsetWidth;
        const modalContent = modalElement.querySelector('[data-modal-content]');
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
    }

    /**
     * Hides a modal with a smooth transition.
     * @param {HTMLElement} modalElement - The modal DOM element.
     */
    function hideModal(modalElement) {
        const modalContent = modalElement.querySelector('[data-modal-content]');
        modalContent.classList.remove('opacity-100', 'scale-100');
        modalContent.classList.add('opacity-0', 'scale-95');
        modalElement.addEventListener('transitionend', () => {
            modalElement.classList.add('hidden');
        }, { once: true });
    }

    /**
     * Clears all input fields in a given form.
     * @param {HTMLFormElement} formElement - The form DOM element.
     */
    function clearForm(formElement) {
        formElement.reset();
        // Manually clear hidden inputs if needed
        const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => input.value = '');
        // Reset checkboxes
        const checkboxes = formElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }

    /**
     * Displays an alert message.
     * @param {string} message - The message to display.
     * @param {'success'|'error'|'info'} type - Type of alert for styling.
     */
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `p-4 rounded-lg shadow-md mb-3 flex items-center transition-opacity duration-300 ease-in-out`;

        let iconClass = '';
        let bgColor = '';
        let textColor = '';

        switch (type) {
            case 'success':
                iconClass = 'las la-check-circle';
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                break;
            case 'error':
                iconClass = 'las la-times-circle';
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                break;
            case 'info':
                iconClass = 'las la-info-circle';
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                break;
            default:
                iconClass = 'las la-info-circle';
                bgColor = 'bg-gray-100';
                textColor = 'text-gray-800';
        }

        alertDiv.classList.add(bgColor, textColor);
        alertDiv.innerHTML = `
            <i class="${iconClass} text-2xl mr-3"></i>
            <span class="flex-1">${message}</span>
            <button class="ml-auto text-current opacity-75 hover:opacity-100" onclick="this.parentElement.remove()">
                <i class="las la-times text-xl"></i>
            </button>
        `;

        alertContainer.prepend(alertDiv); // Add to top

        // Auto-remove after 5 seconds
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.addEventListener('transitionend', () => alertDiv.remove());
        }, 5000);
    }

    // --- Dashboard Functions ---
    async function loadDashboard() {
        showSection('dashboard-section');
        try {
            // Fetch counts from backend (assuming API endpoints for counts)
            const productCount = await fetchData('products_count'); // e.g., /api/products_count.php -> {"count": 123}
            const inventoryCount = await fetchData('inventory_count'); // e.g., /api/inventory_count.php -> {"count": 456}
            const salesToday = await fetchData('sales_today_total'); // e.g., /api/sales_today_total.php -> {"total": 789.50}

            totalProductsEl.textContent = productCount.count || 0;
            totalInventoryEl.textContent = inventoryCount.count || 0;
            todaysSalesEl.textContent = `$${(salesToday.total || 0).toFixed(2)}`;
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            showAlert('Failed to load dashboard statistics.', 'error');
        }
    }

    // --- Product Management Functions ---

    /**
     * Fetches and displays products in the table.
     * @param {string} searchTerm - Optional search term to filter products.
     */
    async function loadProducts(searchTerm = '') {
        showSection('products-section');
        productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading products...</td></tr>';
        try {
            const products = await fetchData('products'); // Assumes products.php handles GET (all products)
            const filteredProducts = searchTerm
                ? products.filter(p =>
                    p.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (p.GenericName && p.GenericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (p.ManufacturerName && p.ManufacturerName.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                : products;

            renderProductsTable(filteredProducts);
        } catch (error) {
            productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-red-500">Failed to load products.</td></tr>';
        }
    }

    /**
     * Renders product data into the table.
     * @param {Array<object>} products - Array of product objects.
     */
    function renderProductsTable(products) {
        productsTableBody.innerHTML = ''; // Clear existing rows
        if (products.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No products found.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = productsTableBody.insertRow();
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-6 whitespace-nowrap">${product.ProductName}</td>
                <td class="py-3 px-6 whitespace-nowrap">${product.GenericName || 'N/A'}</td>
                <td class="py-3 px-6 whitespace-nowrap">${product.Strength || 'N/A'}</td>
                <td class="py-3 px-6 whitespace-nowrap">${product.PharmaceuticalForm || 'N/A'}</td>
                <td class="py-3 px-6 whitespace-nowrap">${product.ManufacturerName || 'N/A'}</td>
                <td class="py-3 px-6 whitespace-nowrap">
                    <span class="px-2 py-1 font-semibold leading-tight ${product.PrescriptionRequired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} rounded-full">
                        ${product.PrescriptionRequired ? 'Yes' : 'No'}
                    </span>
                </td>
                <td class="py-3 px-6 text-center">
                    <div class="flex item-center justify-center">
                        <button class="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center mr-2 edit-product-btn" data-id="${product.ProductID}" title="Edit">
                            <i class="las la-edit text-lg"></i>
                        </button>
                        <button class="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center delete-product-btn" data-id="${product.ProductID}" title="Delete">
                            <i class="las la-trash-alt text-lg"></i>
                        </button>
                    </div>
                </td>
            `;
        });

        // Attach event listeners using delegation
        productsTableBody.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', (e) => openProductModal(e.currentTarget.dataset.id));
        });
        productsTableBody.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (e) => confirmDelete('product', e.currentTarget.dataset.id));
        });
    }

    /**
     * Populates the manufacturer dropdown in the product form.
     */
    async function populateManufacturersDropdown() {
        try {
            const manufacturers = await fetchData('manufacturers'); // Assumes manufacturers.php handles GET
            manufacturerIdSelect.innerHTML = '<option value="">Select Manufacturer</option>';
            manufacturers.forEach(m => {
                const option = document.createElement('option');
                option.value = m.ManufacturerID;
                option.textContent = m.ManufacturerName;
                manufacturerIdSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load manufacturers:', error);
            showAlert('Failed to load manufacturers for the form.', 'error');
        }
    }

    /**
     * Opens the product modal for adding or editing.
     * @param {string} [productId=null] - The ID of the product to edit, or null for new product.
     */
    async function openProductModal(productId = null) {
        clearForm(productForm);
        productIdInput.value = productId; // Set hidden ID
        await populateManufacturersDropdown(); // Always populate dropdown

        if (productId) {
            productModalTitle.textContent = 'Edit Product';
            try {
                const product = await fetchData(`products?id=${productId}`); // Assumes products.php handles GET with ID
                if (product) {
                    document.getElementById('product-name').value = product.ProductName;
                    document.getElementById('generic-name').value = product.GenericName;
                    document.getElementById('strength').value = product.Strength;
                    document.getElementById('pharmaceutical-form').value = product.PharmaceuticalForm;
                    document.getElementById('route-of-administration').value = product.RouteOfAdministration;
                    document.getElementById('manufacturer-id').value = product.ManufacturerID;
                    document.getElementById('atc-code').value = product.ATC_Code;
                    document.getElementById('description').value = product.Description;
                    document.getElementById('prescription-required').checked = product.PrescriptionRequired == 1; // MySQL tinyint(1) comes as 0 or 1
                    document.getElementById('drug-identification-number').value = product.DrugIdentificationNumber;
                }
            } catch (error) {
                showAlert('Failed to load product details for editing.', 'error');
                hideModal(productModal);
                return;
            }
        } else {
            productModalTitle.textContent = 'Add New Product';
        }
        showModal(productModal);
    }

    /**
     * Handles product form submission (add/edit).
     * @param {Event} event - The form submit event.
     */
    async function saveProduct(event) {
        event.preventDefault();
        const productId = productIdInput.value;
        const formData = new FormData(productForm);
        const data = Object.fromEntries(formData.entries());

        // Convert checkbox value (on/off) to 1/0
        data.PrescriptionRequired = document.getElementById('prescription-required').checked ? 1 : 0;

        try {
            if (productId) {
                // Update existing product
                data.ProductID = productId; // Add ID to the data payload for PUT request
                await fetchData(`products?id=${productId}`, 'PUT', data); // Assumes products.php handles PUT
                showAlert('Product updated successfully!', 'success');
            } else {
                // Add new product
                await fetchData('products', 'POST', data); // Assumes products.php handles POST
                showAlert('Product added successfully!', 'success');
            }
            hideModal(productModal);
            loadProducts(); // Reload products to show changes
            loadDashboard(); // Update dashboard stats
        } catch (error) {
            showAlert(`Failed to save product: ${error.message}`, 'error');
        }
    }

    // --- Inventory Management Functions ---

    /**
     * Fetches and displays inventory items in the table.
     * @param {string} searchTerm - Optional search term to filter inventory.
     */
    async function loadInventory(searchTerm = '') {
        showSection('inventory-section');
        inventoryTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Loading inventory...</td></tr>';
        try {
            // Assumes inventory.php joins with Products to get ProductName
            const inventoryItems = await fetchData('inventory');
            const filteredItems = searchTerm
                ? inventoryItems.filter(item =>
                    (item.ProductName && item.ProductName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (item.BatchNumber && item.BatchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (item.Location && item.Location.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                : inventoryItems;

            renderInventoryTable(filteredItems);
        } catch (error) {
            inventoryTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-red-500">Failed to load inventory.</td></tr>';
        }
    }

    /**
     * Renders inventory data into the table.
     * @param {Array<object>} items - Array of inventory item objects.
     */
    function renderInventoryTable(items) {
        inventoryTableBody.innerHTML = '';
        if (items.length === 0) {
            inventoryTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No inventory items found.</td></tr>';
            return;
        }

        items.forEach(item => {
            const row = inventoryTableBody.insertRow();
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-6 whitespace-nowrap">${item.ProductName || 'N/A'}</td>
                <td class="py-3 px-6 whitespace-nowrap">${item.BatchNumber}</td>
                <td class="py-3 px-6 whitespace-nowrap">${item.ExpiryDate}</td>
                <td class="py-3 px-6 whitespace-nowrap">${item.QuantityInStock}</td>
                <td class="py-3 px-6 whitespace-nowrap">${item.Location || 'N/A'}</td>
                <td class="py-3 px-6 whitespace-nowrap">$${parseFloat(item.CostPrice).toFixed(2)}</td>
                <td class="py-3 px-6 whitespace-nowrap">$${parseFloat(item.SellingPrice).toFixed(2)}</td>
                <td class="py-3 px-6 text-center">
                    <div class="flex item-center justify-center">
                        <button class="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center mr-2 edit-inventory-btn" data-id="${item.InventoryID}" title="Edit">
                            <i class="las la-edit text-lg"></i>
                        </button>
                        <button class="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center delete-inventory-btn" data-id="${item.InventoryID}" title="Delete">
                            <i class="las la-trash-alt text-lg"></i>
                        </button>
                    </div>
                </td>
            `;
        });

        inventoryTableBody.querySelectorAll('.edit-inventory-btn').forEach(button => {
            button.addEventListener('click', (e) => openInventoryModal(e.currentTarget.dataset.id));
        });
        inventoryTableBody.querySelectorAll('.delete-inventory-btn').forEach(button => {
            button.addEventListener('click', (e) => confirmDelete('inventory', e.currentTarget.dataset.id));
        });
    }

    /**
     * Populates the product dropdown in the inventory form.
     */
    async function populateInventoryProductsDropdown() {
        try {
            const products = await fetchData('products');
            inventoryProductIdSelect.innerHTML = '<option value="">Select Product</option>';
            products.forEach(p => {
                const option = document.createElement('option');
                option.value = p.ProductID;
                option.textContent = `${p.ProductName} (${p.Strength || 'N/A'})`;
                inventoryProductIdSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load products for inventory dropdown:', error);
            showAlert('Failed to load products for inventory form.', 'error');
        }
    }

    /**
     * Opens the inventory modal for adding or editing.
     * @param {string} [inventoryId=null] - The ID of the inventory item to edit, or null for new.
     */
    async function openInventoryModal(inventoryId = null) {
        clearForm(inventoryForm);
        inventoryIdInput.value = inventoryId;
        await populateInventoryProductsDropdown();

        if (inventoryId) {
            inventoryModalTitle.textContent = 'Edit Inventory Item';
            try {
                const item = await fetchData(`inventory?id=${inventoryId}`);
                if (item) {
                    document.getElementById('inventory-product-id').value = item.ProductID;
                    document.getElementById('batch-number').value = item.BatchNumber;
                    document.getElementById('expiry-date').value = item.ExpiryDate; // Assumes YYYY-MM-DD format from DB
                    document.getElementById('quantity-in-stock').value = item.QuantityInStock;
                    document.getElementById('location').value = item.Location;
                    document.getElementById('cost-price').value = item.CostPrice;
                    document.getElementById('selling-price').value = item.SellingPrice;
                }
            } catch (error) {
                showAlert('Failed to load inventory item details for editing.', 'error');
                hideModal(inventoryModal);
                return;
            }
        } else {
            inventoryModalTitle.textContent = 'Add New Inventory Item';
        }
        showModal(inventoryModal);
    }

    /**
     * Handles inventory form submission (add/edit).
     * @param {Event} event - The form submit event.
     */
    async function saveInventory(event) {
        event.preventDefault();
        const inventoryId = inventoryIdInput.value;
        const formData = new FormData(inventoryForm);
        const data = Object.fromEntries(formData.entries());

        // Ensure numeric values are parsed correctly
        data.QuantityInStock = parseInt(data.QuantityInStock);
        data.CostPrice = parseFloat(data.CostPrice);
        data.SellingPrice = parseFloat(data.SellingPrice);

        try {
            if (inventoryId) {
                data.InventoryID = inventoryId;
                await fetchData(`inventory?id=${inventoryId}`, 'PUT', data);
                showAlert('Inventory item updated successfully!', 'success');
            } else {
                await fetchData('inventory', 'POST', data);
                showAlert('Inventory item added successfully!', 'success');
            }
            hideModal(inventoryModal);
            loadInventory();
            loadDashboard(); // Update dashboard stats
        } catch (error) {
            showAlert(`Failed to save inventory item: ${error.message}`, 'error');
        }
    }

    // --- Sales Management Functions (Simplified) ---

    /**
     * Fetches and displays sales in the table.
     * @param {string} searchTerm - Optional search term to filter sales.
     */
    async function loadSales(searchTerm = '') {
        showSection('sales-section');
        salesTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Loading sales...</td></tr>';
        try {
            // Assumes sales.php joins with Customers to get CustomerName (if CustomerID is present)
            const sales = await fetchData('sales');
            const filteredSales = searchTerm
                ? sales.filter(s =>
                    s.SaleID.toString().includes(searchTerm) ||
                    (s.CustomerName && s.CustomerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (s.SaleDate && s.SaleDate.includes(searchTerm))
                  )
                : sales;

            renderSalesTable(filteredSales);
        } catch (error) {
            salesTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Failed to load sales.</td></tr>';
        }
    }

    /**
     * Renders sales data into the table.
     * @param {Array<object>} sales - Array of sale objects.
     */
    function renderSalesTable(sales) {
        salesTableBody.innerHTML = '';
        if (sales.length === 0) {
            salesTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No sales found.</td></tr>';
            return;
        }

        sales.forEach(sale => {
            const row = salesTableBody.insertRow();
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-6 whitespace-nowrap">${sale.SaleID}</td>
                <td class="py-3 px-6 whitespace-nowrap">${sale.SaleDate}</td>
                <td class="py-3 px-6 whitespace-nowrap">${sale.CustomerName || 'Walk-in Customer'}</td>
                <td class="py-3 px-6 whitespace-nowrap">$${parseFloat(sale.TotalAmount).toFixed(2)}</td>
                <td class="py-3 px-6 text-center">
                    <div class="flex item-center justify-center">
                        <button class="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center mr-2 view-sale-btn" data-id="${sale.SaleID}" title="View Details">
                            <i class="las la-eye text-lg"></i>
                        </button>
                        <button class="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center delete-sale-btn" data-id="${sale.SaleID}" title="Delete">
                            <i class="las la-trash-alt text-lg"></i>
                        </button>
                    </div>
                </td>
            `;
        });

        salesTableBody.querySelectorAll('.view-sale-btn').forEach(button => {
            // For a simple system, this might just show an alert or log to console.
            // A full system would open a modal with sale details and SaleDetails items.
            button.addEventListener('click', (e) => {
                showAlert(`Viewing details for Sale ID: ${e.currentTarget.dataset.id}`, 'info');
                // Implement actual view logic here, e.g., fetching SaleDetails
            });
        });
        salesTableBody.querySelectorAll('.delete-sale-btn').forEach(button => {
            button.addEventListener('click', (e) => confirmDelete('sale', e.currentTarget.dataset.id));
        });
    }

    /**
     * Populates the customer dropdown in the sale form.
     */
    async function populateCustomersDropdown() {
        try {
            const customers = await fetchData('customers'); // Assumes customers.php handles GET
            customerIdSelect.innerHTML = '<option value="">Select Customer (Optional)</option>';
            customers.forEach(c => {
                const option = document.createElement('option');
                option.value = c.CustomerID;
                option.textContent = c.CustomerName;
                customerIdSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load customers for sale dropdown:', error);
            showAlert('Failed to load customers for sale form.', 'error');
        }
    }

    /**
     * Opens the sale modal for creating a new sale.
     */
    async function openSaleModal() {
        clearForm(saleForm);
        saleModalTitle.textContent = 'Create New Sale';
        document.getElementById('sale-date').valueAsDate = new Date(); // Set default date to today
        await populateCustomersDropdown();
        showModal(saleModal);
    }

    /**
     * Handles sale form submission (add).
     * @param {Event} event - The form submit event.
     */
    async function saveSale(event) {
        event.preventDefault();
        const formData = new FormData(saleForm);
        const data = Object.fromEntries(formData.entries());

        // Ensure TotalAmount is a number
        data.TotalAmount = parseFloat(data.TotalAmount);
        // CustomerID might be empty string, convert to null if optional
        if (data.CustomerID === "") {
            data.CustomerID = null;
        }

        try {
            // This simplified sale only records the main sale entry.
            // A full implementation would involve adding multiple sale_details items
            // and updating inventory quantities.
            await fetchData('sales', 'POST', data);
            showAlert('Sale recorded successfully!', 'success');
            hideModal(saleModal);
            loadSales();
            loadDashboard(); // Update dashboard stats
        } catch (error) {
            showAlert(`Failed to record sale: ${error.message}`, 'error');
        }
    }


    // --- General Deletion Logic ---

    /**
     * Shows the confirmation modal for deletion.
     * @param {'product'|'inventory'|'sale'} type - The type of item being deleted.
     * @param {string} id - The ID of the item to delete.
     */
    function confirmDelete(type, id) {
        itemToDelete = { type, id };
        confirmationMessage.textContent = `Are you sure you want to delete this ${type}? This action cannot be undone.`;
        showModal(confirmationModal);
    }

    /**
     * Executes the deletion based on the stored itemToDelete context.
     */
    async function executeDelete() {
        if (!itemToDelete) return;

        const { type, id } = itemToDelete;
        let endpoint = '';
        let successMessage = '';
        let errorMessage = '';
        let reloadFunction = null;

        switch (type) {
            case 'product':
                endpoint = `products?id=${id}`;
                successMessage = 'Product deleted successfully!';
                errorMessage = 'Failed to delete product.';
                reloadFunction = loadProducts;
                break;
            case 'inventory':
                endpoint = `inventory?id=${id}`;
                successMessage = 'Inventory item deleted successfully!';
                errorMessage = 'Failed to delete inventory item.';
                reloadFunction = loadInventory;
                break;
            case 'sale':
                endpoint = `sales?id=${id}`;
                successMessage = 'Sale deleted successfully!';
                errorMessage = 'Failed to delete sale.';
                reloadFunction = loadSales;
                break;
            default:
                showAlert('Unknown item type for deletion.', 'error');
                hideModal(confirmationModal);
                return;
        }

        try {
            await fetchData(endpoint, 'DELETE');
            showAlert(successMessage, 'success');
            hideModal(confirmationModal);
            reloadFunction();
            // Always update dashboard stats after any CRUD operation on core entities
            if (type === 'product' || type === 'inventory' || type === 'sale') {
                loadDashboard();
            }
        } catch (error) {
            showAlert(`${errorMessage} ${error.message}`, 'error');
            hideModal(confirmationModal);
        } finally {
            itemToDelete = null; // Clear context
        }
    }

    // --- Event Listeners ---

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.currentTarget.dataset.section + '-section';
            // Determine which function to call based on sectionId
            switch (sectionId) {
                case 'dashboard-section':
                    loadDashboard();
                    break;
                case 'products-section':
                    loadProducts();
                    break;
                case 'inventory-section':
                    loadInventory();
                    break;
                case 'sales-section':
                    loadSales();
                    break;
                // Add calls for other sections as they are implemented
                case 'purchases-section':
                case 'manufacturers-section':
                case 'suppliers-section':
                    showSection(sectionId); // Just show placeholder for now
                    showAlert(`Content for ${e.currentTarget.textContent.trim()} is under development!`, 'info');
                    break;
                default:
                    console.warn(`No handler for section: ${sectionId}`);
                    showSection(sectionId);
            }
        });
    });

    // Modal Close Buttons (for all modals)
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.currentTarget.closest('.modal');
            if (modal) {
                hideModal(modal);
            }
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });


    // Product Section Event Listeners
    addProductBtn.addEventListener('click', () => openProductModal());
    productForm.addEventListener('submit', saveProduct);
    // Debounce search input for performance (optional, but good practice for frequent events)
    let productSearchTimeout;
    productSearchInput.addEventListener('input', (e) => {
        clearTimeout(productSearchTimeout);
        productSearchTimeout = setTimeout(() => {
            loadProducts(e.target.value);
        }, 300); // Wait 300ms after last input
    });
    quickAddProductBtn.addEventListener('click', () => openProductModal()); // Dashboard quick action

    // Inventory Section Event Listeners
    addInventoryBtn.addEventListener('click', () => openInventoryModal());
    inventoryForm.addEventListener('submit', saveInventory);
    let inventorySearchTimeout;
    inventorySearchInput.addEventListener('input', (e) => {
        clearTimeout(inventorySearchTimeout);
        inventorySearchTimeout = setTimeout(() => {
            loadInventory(e.target.value);
        }, 300);
    });

    // Sales Section Event Listeners
    addSaleBtn.addEventListener('click', () => openSaleModal());
    saleForm.addEventListener('submit', saveSale);
    let saleSearchTimeout;
    saleSearchInput.addEventListener('input', (e) => {
        clearTimeout(saleSearchTimeout);
        saleSearchTimeout = setTimeout(() => {
            loadSales(e.target.value);
        }, 300);
    });
    quickNewSaleBtn.addEventListener('click', () => openSaleModal()); // Dashboard quick action

    // Confirmation Modal Event Listeners
    confirmDeleteBtn.addEventListener('click', executeDelete);
    cancelDeleteBtn.addEventListener('click', () => hideModal(confirmationModal));

    // --- Initial Load ---
    loadDashboard(); // Load the dashboard by default on page load
});