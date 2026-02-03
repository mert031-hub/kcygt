const products = [
    { id: 1, name: 'Signature Watch', price: 1249.00, stock: 5, tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800' },
    { id: 2, name: 'Premium Bag', price: 599.00, stock: 3, tag: '', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800' },
    { id: 3, name: 'Designer Shades', price: 289.50, stock: 10, tag: 'Beliebt', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800' },
    { id: 4, name: 'Urban Sneakers', price: 349.99, stock: 8, tag: 'Neu', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800' },
    { id: 5, name: 'Cashmere Coat', price: 850.00, stock: 1, tag: '', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800' },
    { id: 6, name: 'Luxury Belt', price: 129.00, stock: 15, tag: '', img: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800' }
];

let cart = JSON.parse(localStorage.getItem('luxeCartArray')) || [];
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

// --- ANA SAYFA FONKSİYONLARI ---
function renderProducts() {
    const grid = document.getElementById('product-grid-container');
    if (!grid) return;
    grid.innerHTML = "";
    products.forEach(p => {
        let displayTag = p.tag;
        if (p.stock > 0 && p.stock <= 3) displayTag = "Fast ausverkauft";
        grid.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="product-card shadow-sm" data-bs-toggle="modal" data-bs-target="#luxeModal" onclick="setupModal(${p.id})">
                    ${displayTag ? `<span class="product-tag ${displayTag === 'Fast ausverkauft' ? 'tag-danger' : 'tag-default'}">${displayTag}</span>` : ''}
                    <div class="product-img-box"><img src="${p.img}"></div>
                    <div class="product-info p-4 text-center">
                        <h3 class="h5 mb-2">${p.name}</h3>
                        <span class="price">${euro.format(p.price)}</span>
                    </div>
                </div>
            </div>`;
    });
}

let selectedProduct = null;
let currentQty = 1;

function setupModal(id) {
    selectedProduct = products.find(p => p.id === id);
    currentQty = 1;
    document.getElementById('mImg').src = selectedProduct.img;
    document.getElementById('mTitle').innerText = selectedProduct.name;
    updateModalUI();
}

function changeQty(val) {
    const inCart = cart.find(i => i.id === selectedProduct.id)?.qty || 0;
    const next = currentQty + val;
    if (next >= 1 && (next + inCart) <= selectedProduct.stock) {
        currentQty = next;
        updateModalUI();
    }
}

function updateModalUI() {
    document.getElementById('qtyInput').value = currentQty;
    document.getElementById('mPriceDisplay').innerText = euro.format(selectedProduct.price * currentQty);
    const inCart = cart.find(i => i.id === selectedProduct.id)?.qty || 0;
    document.getElementById('mStockStatus').innerText = `Vorrätig: ${selectedProduct.stock - inCart}`;
}

function addToCart() {
    const existing = cart.find(i => i.id === selectedProduct.id);
    if (existing) existing.qty += currentQty;
    else cart.push({ id: selectedProduct.id, qty: currentQty });

    saveAndRefresh();
    bootstrap.Modal.getInstance(document.getElementById('luxeModal')).hide();
}

// --- ÖDEME SAYFASI ÖZEL (AMAZON STYLE) ---

function updateCartItemQty(id, delta) {
    const item = cart.find(i => i.id === id);
    const pInfo = products.find(p => p.id === id);

    if (item) {
        const nextQty = item.qty + delta;
        if (nextQty >= 1 && nextQty <= pInfo.stock) {
            item.qty = nextQty;
            saveAndRefresh();
        } else if (nextQty < 1) {
            removeFromCart(id);
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveAndRefresh();
}

function clearFullCart() {
    if (confirm("Warenkorb wirklich leeren?")) {
        cart = [];
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem('luxeCartArray', JSON.stringify(cart));
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? "block" : "none";
    }
    if (window.location.pathname.includes('payment.html')) loadCheckout();
}

function loadCheckout() {
    const container = document.getElementById('checkout-items');
    if (!container) return;

    let subtotal = 0;
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p class='small opacity-50 text-center py-5'>Ihr Warenkorb ist aktuell leer.</p>";
    }

    cart.forEach(item => {
        const p = products.find(x => x.id === item.id);
        const total = p.price * item.qty;
        subtotal += total;

        container.innerHTML += `
            <div class="d-flex align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                <img src="${p.img}" style="width:70px; height:70px; object-fit:cover;" class="me-3 shadow-sm">
                <div class="flex-grow-1">
                    <div class="small fw-bold mb-1">${p.name}</div>
                    <div class="d-flex align-items-center mb-2">
                        <button class="btn btn-xs btn-outline-light py-0 px-2 rounded-0" onclick="updateCartItemQty(${p.id}, -1)">-</button>
                        <span class="mx-3 small fw-bold">${item.qty}</span>
                        <button class="btn btn-xs btn-outline-light py-0 px-2 rounded-0" onclick="updateCartItemQty(${p.id}, 1)">+</button>
                    </div>
                    <button onclick="removeFromCart(${p.id})" class="btn p-0 text-danger small border-0 opacity-75" style="font-size:0.6rem; letter-spacing:1px;">LÖSCHEN</button>
                </div>
                <div class="text-end">
                    <div class="small fw-bold">${euro.format(total)}</div>
                    <div class="small opacity-50" style="font-size:0.65rem;">${euro.format(p.price)} / Stk</div>
                </div>
            </div>`;
    });

    const net = subtotal / 1.19;
    document.getElementById('summary-net').innerText = euro.format(net);
    document.getElementById('summary-tax').innerText = euro.format(subtotal - net);
    document.getElementById('summary-total').innerText = euro.format(subtotal);
}

window.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    saveAndRefresh(); // Badge'i ilk yüklemede göster
});