// Menangkap elemen header
const header = document.querySelector('.header');

// Mendengarkan event scroll pada window
window.addEventListener('scroll', () => {
    // Jika halaman di-scroll lebih dari 50px ke bawah
    if (window.scrollY > 50) {
        header.classList.add('scrolled'); // Tambahkan background putih & shadow
    } else {
        header.classList.remove('scrolled'); // Kembalikan ke transparan
    }
});

// =========================================
// 2. LOGIKA MOBILE MENU (HAMBURGER)
// =========================================

// Menangkap elemen yang dibutuhkan
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links li a');

// PENGAMAN: Pastikan elemen menuToggle ada di halaman sebelum menambahkan event
if (menuToggle && navLinks) {
    // Event listener untuk membuka/menutup menu saat hamburger diklik
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Event listener loop untuk setiap link di dalam menu
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// =========================================
// 3. VALIDASI FORM CONTACT & HANDLE SUBMIT
// =========================================

// Menangkap elemen form yang baru
const formContact = document.getElementById('formContact');

if (formContact) {
    formContact.addEventListener('submit', function(e) {
        e.preventDefault();

        // Mengambil nilai dari input yang baru
        const nama = document.getElementById('nama').value.trim();
        const email = document.getElementById('email').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const pesan = document.getElementById('pesan').value.trim();
        const btnSubmit = formContact.querySelector('button[type="submit"]');

        // UX Enhancement: Ubah state tombol
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = 'Mengirim...';
        btnSubmit.disabled = true;

        // Siapkan payload data JSON untuk n8n / Supabase
        const payload = {
            nama: nama,
            email: email,
            whatsapp: whatsapp,
            pesan: pesan,
            source: 'Landing Page Contact Form'
        };

        const webhookUrl = 'URL_WEBHOOK_N8N_ANDA_DISINI'; 

        // Kirim request (Fetch API)
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                alert('Pesan berhasil terkirim! Tim kami akan segera menghubungi Anda.');
                formContact.reset();
            } else {
                alert('Terjadi kesalahan pada server. Mohon coba beberapa saat lagi.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback jika n8n sedang down: Arahkan ke WA manual
            alert('Gagal mengirim pesan otomatis. Anda akan dialihkan ke WhatsApp kami.');
            const waNumber = '6281234567890'; // Nomor WA Anda
            const waText = `Halo, nama saya ${nama}.%0A${pesan}`;
            window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');
        })
        .finally(() => {
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        });
    });
}

// =========================================
// 4. ANIMASI TOOLTIP MEDSOS (INTERSECTION OBSERVER)
// =========================================

const medsosSection = document.querySelector('.store-medsos');
const socialBtns = document.querySelectorAll('.social-btn');

if (medsosSection && socialBtns.length > 0) {
    // Membuat observer untuk memantau scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Jika section sudah terlihat minimal 50% di layar
            if (entry.isIntersecting) {
                
                // Berikan jeda beruntun (stagger) agar tooltip muncul bergantian 
                socialBtns.forEach((btn, index) => {
                    setTimeout(() => {
                        btn.classList.add('show-hint');
                    }, index * 300); // Jeda 300ms antar icon
                });

                // Hentikan pantauan agar animasi ini hanya terjadi 1 kali saja 
                // saat pertama kali dilihat, agar tidak mengganggu jika di-scroll naik-turun
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.5 // Memicu saat 50% elemen terlihat di layar
    });

    // Mulai pantau section store-medsos
    observer.observe(medsosSection);
}



// =========================================
// 5. LOGIKA HALAMAN STORE (store.html)
// =========================================

// Pastikan skrip ini hanya berjalan jika elemen store ada di halaman
const storeHero = document.querySelector('.store-hero');

if (storeHero) {
    /* --- A. Galeri Produk Interaktif --- */
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumb');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                mainImage.style.opacity = 0;
                setTimeout(() => {
                    mainImage.src = this.src;
                    mainImage.style.opacity = 1;
                }, 150);
            });
        });
    }

    /* --- B. Kalkulator Harga & Pemilihan Varian --- */
    const variantRadios = document.querySelectorAll('input[name="ukuran"]');
    const displayPrice = document.getElementById('displayPrice');
    const stickyPrice = document.getElementById('stickyPrice');
    const qtyInput = document.getElementById('qty');
    const btnMinus = document.querySelector('.qty-btn.minus');
    const btnPlus = document.querySelector('.qty-btn.plus');
    
    let currentBasePrice = 15000; 

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
        }).format(number);
    }

    function updateTotalPrice() {
        if (!qtyInput) return; // Pengaman jika elemen tidak ditemukan
        let qty = parseInt(qtyInput.value) || 1;
        let total = currentBasePrice * qty;
        let formattedTotal = formatRupiah(total);
        
        if (displayPrice) displayPrice.textContent = formattedTotal;
        if (stickyPrice) stickyPrice.textContent = formattedTotal;
    }

    variantRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentBasePrice = parseInt(this.getAttribute('data-price'));
            updateTotalPrice();
        });
    });

    /* --- C. Tombol Plus & Minus (Quantity) --- */
    if (btnMinus && btnPlus && qtyInput) {
        btnMinus.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value) || 1;
            if (qty > 1) {
                qtyInput.value = qty - 1;
                updateTotalPrice();
            }
        });

        btnPlus.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value) || 1;
            qtyInput.value = qty + 1;
            updateTotalPrice();
        });

        qtyInput.addEventListener('input', () => {
            if (qtyInput.value < 1 || isNaN(qtyInput.value)) {
                qtyInput.value = 1;
            }
            updateTotalPrice();
        });
    }

    /* --- D. Fungsi Tambah ke Keranjang (LocalStorage) --- */
    const btnOrderDesk = document.querySelector('.add-to-cart-btn');


    function addToCart() {
        const checkedVariant = document.querySelector('input[name="ukuran"]:checked');
        
        // Pengaman jika belum ada varian yang dipilih
        if (!checkedVariant) {
            alert("Silakan pilih ukuran kemasan terlebih dahulu.");
            return;
        }

        const selectedVariant = checkedVariant.value;
        const qty = parseInt(qtyInput.value) || 1;
        const price = currentBasePrice;
        const total = price * qty;

        const cartItem = {
            id: 'krupuk-mie-' + selectedVariant,
            name: 'Krupuk Mie Mentah Premium',
            variant: selectedVariant,
            price: price,
            qty: qty,
            total: total
        };

        // Ambil data dari LocalStorage, jika kosong buat array baru []
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex > -1) {
            cart[existingItemIndex].qty += qty;
            cart[existingItemIndex].total = cart[existingItemIndex].qty * price;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('krupukCart', JSON.stringify(cart));
        updateCartBadge(); // Panggil fungsi update angka keranjang
        renderMiniCart(); // <--- Tambahkan baris ini
        alert(`Berhasil! ${qty} bungkus (ukuran ${selectedVariant}) ditambahkan ke keranjang.`);
    }

    if (btnOrderDesk) btnOrderDesk.addEventListener('click', addToCart);

    /* --- E. LOGIKA BOTTOM SHEET MINI CART (MOBILE) --- */
    const bottomSheet = document.getElementById('bottomSheetCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const sheetFooterToggle = document.getElementById('sheetFooterToggle');
    const closeSheetBtn = document.getElementById('closeSheetBtn');
    const miniCartItems = document.getElementById('miniCartItems');
    const miniCartTotal = document.getElementById('miniCartTotal');
    const btnCheckoutNav = document.querySelector('.btn-checkout-nav');

    // Mencegah tombol Checkout memicu tutup/buka panel
    if(btnCheckoutNav) {
        btnCheckoutNav.addEventListener('click', (e) => e.stopPropagation()); 
    }

    // Fungsi spesifik BUKA
    function openSheet() {
        bottomSheet.classList.add('expanded');
        cartOverlay.classList.add('active');
    }

    // Fungsi spesifik TUTUP
    function closeSheet(e) {
        if(e) e.stopPropagation();
        bottomSheet.classList.remove('expanded');
        cartOverlay.classList.remove('active');
    }

    // Pasang Event Listener yang benar
    if (sheetFooterToggle && closeSheetBtn && cartOverlay) {
        // Klik area total harga (Toggle)
        sheetFooterToggle.addEventListener('click', () => {
            if (bottomSheet.classList.contains('expanded')) {
                closeSheet();
            } else {
                openSheet();
            }
        });
        
        // Klik tombol X atau Background Gelap untuk Menutup
        closeSheetBtn.addEventListener('click', closeSheet);
        cartOverlay.addEventListener('click', closeSheet);
    }

    // Fungsi Render Keranjang Mini
    function renderMiniCart() {
        if (!bottomSheet) return;
        
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
        
        if (cart.length === 0) {
            // Sembunyikan bottom sheet sepenuhnya jika keranjang kosong
            bottomSheet.classList.remove('peek');
            bottomSheet.classList.remove('expanded');
            cartOverlay.classList.remove('active');
            return;
        }

        // Tampilkan sheet dalam mode mengintip (peek)
        bottomSheet.classList.add('peek');

        let subtotal = 0;
        let cartHtml = '';

        cart.forEach(item => {
            subtotal += item.total;
            cartHtml += `
                <div class="cart-item-row" data-id="${item.id}" style="border-bottom: 1px solid #F3F4F6; padding-bottom: 10px;">
                    <div class="cart-item-info">
                        <span class="cart-item-title" style="font-size: 0.9rem;">${item.name}</span>
                        <div class="cart-item-actions" style="margin-top: 5px;">
                            <span class="cart-item-variant" style="font-size: 0.8rem;">${item.variant}</span>
                            <span style="color: #E5E7EB; margin: 0 5px;">|</span>
                            
                            <button class="qty-btn-small btn-decrease"><i class="fas fa-minus" style="pointer-events: none;"></i></button>
                            <span class="item-qty-text">${item.qty}</span>
                            <button class="qty-btn-small btn-increase"><i class="fas fa-plus" style="pointer-events: none;"></i></button>
                            
                            <button class="btn-remove-item"><i class="fas fa-trash" style="pointer-events: none;"></i></button>
                        </div>
                    </div>
                    <span class="cart-item-price" style="font-size: 0.9rem;">${formatRupiah(item.total)}</span>
                </div>
            `;
        });

        miniCartItems.innerHTML = cartHtml;
        miniCartTotal.textContent = formatRupiah(subtotal);
    }

    // Delegasi Event untuk Edit Keranjang di Mini Cart
    if (miniCartItems) {
        miniCartItems.addEventListener('click', function(e) {
            const row = e.target.closest('.cart-item-row');
            if (!row) return;

            const itemId = row.getAttribute('data-id');
            let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
            const itemIndex = cart.findIndex(item => item.id === itemId);
            
            if (itemIndex === -1) return;

            if (e.target.classList.contains('btn-increase')) {
                cart[itemIndex].qty += 1;
                cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
            } else if (e.target.classList.contains('btn-decrease')) {
                if (cart[itemIndex].qty > 1) {
                    cart[itemIndex].qty -= 1;
                    cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
                } else {
                    if (confirm('Hapus produk ini dari keranjang?')) {
                        cart.splice(itemIndex, 1);
                    }
                }
            } else if (e.target.classList.contains('btn-remove-item')) {
                if (confirm('Hapus produk ini dari keranjang?')) {
                    cart.splice(itemIndex, 1);
                }
            } else {
                return;
            }

            localStorage.setItem('krupukCart', JSON.stringify(cart));
            renderMiniCart(); // Update UI Mini Cart
            updateCartBadge(); // Update badge merah di Navbar
        });
    }

    // Jalankan renderMiniCart saat halaman dimuat
    renderMiniCart();
 }

// =========================================
// 6. FUNGSI GLOBAL (Berjalan di Semua Halaman)
// =========================================
function updateCartBadge() {
    const cartBadges = document.querySelectorAll('.cart-badge');
    let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
    
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.qty;
    });

    cartBadges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    });
}

// Jalankan saat HTML selesai dimuat
document.addEventListener('DOMContentLoaded', updateCartBadge);

// =========================================
// 7. LOGIKA HALAMAN CHECKOUT (checkout.html)
// =========================================

const checkoutPage = document.querySelector('.checkout-page');

if (checkoutPage) {
    const cartItemsContainer = document.getElementById('checkoutCartItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const ongkirEl = document.getElementById('checkoutOngkir');
    const totalEl = document.getElementById('checkoutTotal');
    const btnPayNow = document.getElementById('btnPayNow');
    
    let ongkirAmount = 15000;

    function formatRupiahCheckout(number) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
        }).format(number);
    }

    // Fungsi utama untuk me-render keranjang
    function renderCheckoutSummary() {
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];

        // State: Keranjang Kosong
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 1rem 0;">
                    <i class="fas fa-cart-arrow-down" style="font-size: 2rem; color: #E5E7EB; margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">Keranjang Anda masih kosong.</p>
                    <a href="store.html" style="display: inline-block; margin-top: 0.5rem; color: var(--primary-yellow); font-weight: 600; text-decoration: underline;">Belanja Sekarang</a>
                </div>
            `;
            
            subtotalEl.textContent = formatRupiahCheckout(0);
            ongkirEl.textContent = formatRupiahCheckout(0);
            totalEl.textContent = formatRupiahCheckout(0);
            
            btnPayNow.disabled = true;
            btnPayNow.style.opacity = '0.5';
            btnPayNow.style.cursor = 'not-allowed';
            return; 
        }

        // State: Keranjang Terisi
        let subtotal = 0;
        let cartHtml = '';

        cart.forEach(item => {
            subtotal += item.total;
            // Menambahkan struktur tombol di dalam item
            cartHtml += `
                <div class="cart-item-row" data-id="${item.id}">
                    <div class="cart-item-info">
                        <span class="cart-item-title">${item.name}</span>
                        <div class="cart-item-actions">
                            <span class="cart-item-variant">${item.variant}</span>
                            <span style="color: #E5E7EB; margin: 0 5px;">|</span>
                            
                            <button class="qty-btn-small btn-decrease" title="Kurangi"><i class="fas fa-minus" style="pointer-events: none;"></i></button>
                            <span class="item-qty-text">${item.qty}</span>
                            <button class="qty-btn-small btn-increase" title="Tambah"><i class="fas fa-plus" style="pointer-events: none;"></i></button>
                            
                            <button class="btn-remove-item" title="Hapus Item"><i class="fas fa-trash" style="pointer-events: none;"></i></button>
                        </div>
                    </div>
                    <span class="cart-item-price">${formatRupiahCheckout(item.total)}</span>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHtml;
        subtotalEl.textContent = formatRupiahCheckout(subtotal);
        ongkirEl.textContent = formatRupiahCheckout(ongkirAmount);
        
        let grandTotal = subtotal + ongkirAmount;
        totalEl.textContent = formatRupiahCheckout(grandTotal);
        
        btnPayNow.disabled = false;
        btnPayNow.style.opacity = '1';
        btnPayNow.style.cursor = 'pointer';
    }

    // Jalankan pertama kali saat halaman dimuat
    renderCheckoutSummary();

    // -------------------------------------------------------------
    // LOGIKA INTERAKSI TOMBOL EDIT (Event Delegation)
    // -------------------------------------------------------------
    cartItemsContainer.addEventListener('click', function(e) {
        // Ambil elemen baris yang diklik untuk mengetahui ID produknya
        const row = e.target.closest('.cart-item-row');
        if (!row) return; // Jika klik di luar baris item, abaikan

        const itemId = row.getAttribute('data-id');
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return; // Pengaman jika data tidak ditemukan

        // Cek tombol mana yang ditekan
        if (e.target.classList.contains('btn-increase')) {
            // Tambah Qty
            cart[itemIndex].qty += 1;
            cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
            
        } else if (e.target.classList.contains('btn-decrease')) {
            // Kurangi Qty
            if (cart[itemIndex].qty > 1) {
                cart[itemIndex].qty -= 1;
                cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
            } else {
                // Jika qty 1 dan dikurangi, konfirmasi penghapusan
                if (confirm('Hapus produk ini dari keranjang?')) {
                    cart.splice(itemIndex, 1);
                }
            }
            
        } else if (e.target.classList.contains('btn-remove-item')) {
            // Hapus Item
            if (confirm('Hapus produk ini dari keranjang?')) {
                cart.splice(itemIndex, 1);
            }
        } else {
            return; // Mengklik teks/kosong, jangan lakukan apa-apa
        }

        // 1. Simpan data baru ke memori
        localStorage.setItem('krupukCart', JSON.stringify(cart));
        
        // 2. Render ulang layar checkout dengan harga baru
        renderCheckoutSummary();
        
        // 3. Update angka keranjang merah di navbar
        updateCartBadge(); 
    });

    // Aksi Tombol Bayar
    btnPayNow.addEventListener('click', function() {
        alert('Keranjang belanja siap diproses! Kita bisa lanjut ke integrasi API Logistik.');
    });
}