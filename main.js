const products = [
    { id: 1, name: 'Signature Watch', price: 1249.00, stock: 5, tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800' },
    { id: 2, name: 'Premium Bag', price: 599.00, stock: 3, tag: '', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800' },
    { id: 3, name: 'Designer Shades', price: 289.50, stock: 10, tag: 'Beliebt', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800' },
    { id: 4, name: 'Urban Sneakers', price: 349.99, stock: 8, tag: 'Neu', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800' },
    { id: 5, name: 'Cashmere Coat', price: 850.00, stock: 2, tag: '', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800' },
    { id: 6, name: 'Luxury Belt', price: 129.00, stock: 15, tag: '', img: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800' }
];

let cart = JSON.parse(localStorage.getItem('luxeCartArray')) || [];
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
let selectedProduct = null, currentQty = 1;

function saveAndRefresh() {
    localStorage.setItem('luxeCartArray', JSON.stringify(cart));
    updateCartUI();
    if (document.getElementById('checkout-items')) loadCheckout();
}

// Tüm Sepet UI Elemanlarını Güncelle
function updateCartUI() {
    const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
    const totalPrice = cart.reduce((acc, i) => {
        const p = products.find(x => x.id === i.id);
        return acc + (p.price * i.qty);
    }, 0);

    // Navbar Badge
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.innerText = totalQty; badge.style.display = totalQty > 0 ? "block" : "none";
    }

    // MOBİL YÜZEN ÇUBUK MANTIĞI
    const floatBar = document.getElementById('mobile-floating-cart');
    const floatTotal = document.getElementById('float-total');
    if (floatBar && floatTotal) {
        if (totalQty > 0) {
            floatBar.style.display = "block";
            floatTotal.innerText = euro.format(totalPrice);
        } else {
            floatBar.style.display = "none";
        }
    }
}

function renderProducts() {
    const grid = document.getElementById('product-grid-container');
    if (!grid) return; grid.innerHTML = "";
    products.forEach(p => {
        const inCart = cart.find(i => i.id === p.id)?.qty || 0;
        const avail = p.stock - inCart;
        let tag = avail <= 0 ? "Ausverkauft" : (avail <= 3 ? "Fast ausverkauft" : p.tag);
        grid.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="product-card shadow-sm" data-bs-toggle="modal" data-bs-target="#luxeModal" onclick="setupModal(${p.id})">
                    ${tag ? `<span class="product-tag ${avail <= 0 ? 'tag-dark' : 'tag-danger'}">${tag}</span>` : ''}
                    <div class="product-img-box"><img src="${p.img}"></div>
                    <div class="product-info p-4 text-center"><h3 class="h5 mb-2">${p.name}</h3><span class="price">${euro.format(p.price)}</span></div>
                </div>
            </div>`;
    });
}

function setupModal(id) {
    selectedProduct = products.find(p => p.id === id);
    const inCart = cart.find(i => i.id === selectedProduct.id)?.qty || 0;
    const avail = selectedProduct.stock - inCart;
    currentQty = avail > 0 ? 1 : 0;
    document.getElementById('mStockWarning').style.display = "none";
    document.getElementById('mImg').src = selectedProduct.img;
    document.getElementById('mTitle').innerText = selectedProduct.name;
    updateModalUI();
}

function changeQty(val) {
    const inCart = cart.find(i => i.id === selectedProduct.id)?.qty || 0;
    const avail = selectedProduct.stock - inCart;
    const next = currentQty + val;
    if (next >= 1 && next <= avail) { currentQty = next; document.getElementById('mStockWarning').style.display = "none"; }
    else if (next > avail && avail > 0) { document.getElementById('mStockWarning').style.display = "block"; }
    updateModalUI();
}

function updateModalUI() {
    const inCart = cart.find(i => i.id === selectedProduct.id)?.qty || 0;
    const avail = selectedProduct.stock - inCart;
    document.getElementById('qtyInput').value = currentQty;
    document.getElementById('mPriceDisplay').innerText = euro.format(selectedProduct.price * currentQty);
    const btn = document.getElementById('add-to-cart-btn');
    btn.disabled = avail <= 0;
    document.getElementById('mStockStatus').innerText = avail > 0 ? `Vorrätig: ${avail}` : "Ausverkauft";
}

function addToCart() {
    if (currentQty <= 0) return;
    const item = cart.find(i => i.id === selectedProduct.id);
    if (item) item.qty += currentQty; else cart.push({ id: selectedProduct.id, qty: currentQty });
    saveAndRefresh(); renderProducts(); bootstrap.Modal.getInstance(document.getElementById('luxeModal')).hide();
}

function updateCartItemQty(id, delta) {
    const item = cart.find(i => i.id === id), p = products.find(x => x.id === id);
    if (item && item.qty + delta <= p.stock && item.qty + delta >= 1) { item.qty += delta; saveAndRefresh(); }
    else if (item && item.qty + delta < 1) removeFromCart(id);
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveAndRefresh(); if (document.getElementById('product-grid-container')) renderProducts(); }
function clearFullCart() { if (confirm("Leeren?")) { cart = []; saveAndRefresh(); if (document.getElementById('product-grid-container')) renderProducts(); } }

function loadCheckout() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    let sub = 0; container.innerHTML = cart.length ? "" : "<div class='text-center py-5 opacity-50'>Warenkorb leer.</div>";
    cart.forEach(item => {
        const p = products.find(x => x.id === item.id);
        const tot = p.price * item.qty; sub += tot;
        container.innerHTML += `
            <div class="d-flex align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-10">
                <img src="${p.img}" style="width:50px; height:50px; object-fit:cover;" class="me-3">
                <div class="flex-grow-1">
                    <div class="small fw-bold mb-1">${p.name}</div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-xs btn-outline-light py-0 px-2" onclick="updateCartItemQty(${p.id}, -1)">-</button>
                        <span class="mx-2 small">${item.qty}</span>
                        <button class="btn btn-xs btn-outline-light py-0 px-2" onclick="updateCartItemQty(${p.id}, 1)">+</button>
                        <button onclick="removeFromCart(${p.id})" class="btn p-0 text-danger border-0 ms-3" style="font-size:0.6rem; font-weight:700;">LÖSCHEN</button>
                    </div>
                </div>
                <div class="text-end small fw-bold">${euro.format(tot)}</div>
            </div>`;
    });
    const net = sub / 1.19;
    document.getElementById('summary-net').innerText = euro.format(net);
    document.getElementById('summary-tax').innerText = euro.format(sub - net);
    document.getElementById('summary-total').innerText = euro.format(sub);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI(); renderProducts();
    if (document.getElementById('checkout-items')) loadCheckout();
});