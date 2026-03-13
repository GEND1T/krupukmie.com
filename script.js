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

    // ==========================================
    // FITUR HARGA DINAMIS DARI SUPABASE
    // ==========================================
    // Catatan: Kunci Anonim ini AMAN ditaruh di sini karena tabel products hanya bisa dibaca (READ-ONLY) oleh publik
    const SUPABASE_DB_URL = 'https://uomqqcntuniodhfbpxvh.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbXFxY250dW5pb2RoZmJweHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDY5NTUsImV4cCI6MjA4ODM4Mjk1NX0.yO1lV5Qw-0U0HSRKlkASaL2Ol9qi6UJqzXfJFxKT7c0';

    async function syncProductPrices() {
        try {
            const response = await fetch(`${SUPABASE_DB_URL}/rest/v1/products?select=*&is_active=eq.true`, {
                headers: { 'apikey': SUPABASE_ANON_KEY }
            });
            const products = await response.json();

           // Cocokkan harga dari database dengan tombol radio di HTML
           products.forEach(prod => {
            const radio = document.querySelector(`input[name="ukuran"][value="${prod.variant}"]`);
            
            if (radio) {
                // 1. Update nilai tersembunyi untuk mesin kalkulator
                radio.setAttribute('data-price', prod.price);
                
                // 2. KECERDASAN VISUAL: Cari elemen <span class="price"> di dalam label yang sama
                const priceLabel = radio.closest('.variant-card').querySelector('.price');
                if (priceLabel) {
                    // Timpa teks lama dengan harga baru menggunakan format Rupiah
                    priceLabel.textContent = formatRupiah(prod.price);
                }
            }
        });

            // Update harga utama di layar berdasarkan varian yang sedang terpilih
            const activeRadio = document.querySelector('input[name="ukuran"]:checked');
            if (activeRadio) {
                currentBasePrice = parseInt(activeRadio.getAttribute('data-price'));
                updateTotalPrice();
            }
        } catch (error) {
            console.error("Mode Offline: Gagal menarik harga terbaru, menggunakan harga standar.");
        }
    }

    // Panggil fungsi sinkronisasi harga secara diam-diam saat halaman dimuat
    syncProductPrices();

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
// 7. LOGIKA HALAMAN CHECKOUT ALA TIKTOK/SHOPEE
// =========================================

const checkoutPage = document.querySelector('.mobile-checkout-page');

if (checkoutPage) {
    // Variabel Kalkulasi Global
    let fetchRatesTimeout = null;
    let subtotalAmount = 0;
    let ongkirAmount = 0;
    let adminFee = 500; // Ubah dari 2500 menjadi 0 (karena menunggu user milih)

    // Format Rupiah
    function formatRupiahCheckout(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    // --- A. RENDER KERANJANG & FITUR EDIT ITEM ---
    function renderCheckoutItems() {
        const cartContainer = document.getElementById('checkoutCartItems');
        const subtotalEl = document.getElementById('checkoutSubtotal');
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];

        if (cart.length === 0) {
            alert('Keranjang kosong! Mengarahkan kembali ke toko.');
            window.location.href = 'store.html';
            return;
        }

        let cartHtml = '';
        subtotalAmount = 0;

        cart.forEach((item, index) => {
            subtotalAmount += item.total;
            cartHtml += `
                <div class="checkout-item-card" data-index="${index}">
                    <div class="item-info-area">
                        <span class="item-title">${item.name}</span>
                        <span class="item-variant">Varian: ${item.variant}</span>
                        <span class="item-price-checkout">${formatRupiahCheckout(item.total)}</span>
                    </div>
                    
                    <div class="item-action-area">
                        <div class="qty-control">
                            <button class="qty-btn-small btn-decrease-checkout"><i class="fas fa-minus" style="pointer-events: none;"></i></button>
                            <span class="qty-text">${item.qty}</span>
                            <button class="qty-btn-small btn-increase-checkout"><i class="fas fa-plus" style="pointer-events: none;"></i></button>
                        </div>
                        <button class="btn-remove-checkout"><i class="fas fa-trash" style="pointer-events: none;"></i></button>
                    </div>
                </div>
            `;
        });

        cartContainer.innerHTML = cartHtml;
        subtotalEl.textContent = formatRupiahCheckout(subtotalAmount);
        updateGrandTotal(); // Memperbarui total harga di bawah
    }

    // ========================================================
    // Delegasi Event untuk Tombol Edit di Checkout
    // ========================================================
    const checkoutCartContainer = document.getElementById('checkoutCartItems');
    
    if (checkoutCartContainer) {
        checkoutCartContainer.addEventListener('click', function(e) {
            const card = e.target.closest('.checkout-item-card');
            if (!card) return; 

            const itemIndex = card.getAttribute('data-index');
            let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
            if (!cart[itemIndex]) return; 

            // Deteksi apakah tombol ditekan
            let isChanged = false;

            if (e.target.closest('.btn-increase-checkout')) {
                cart[itemIndex].qty += 1;
                cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
                isChanged = true;
                
            } else if (e.target.closest('.btn-decrease-checkout')) {
                if (cart[itemIndex].qty > 1) {
                    cart[itemIndex].qty -= 1;
                    cart[itemIndex].total = cart[itemIndex].qty * cart[itemIndex].price;
                    isChanged = true;
                } else {
                    if (confirm('Hapus produk ini dari pesanan?')) {
                        cart.splice(itemIndex, 1);
                        isChanged = true;
                    }
                }
                
            } else if (e.target.closest('.btn-remove-checkout')) {
                if (confirm('Hapus produk ini dari pesanan?')) {
                    cart.splice(itemIndex, 1);
                    isChanged = true;
                }
            }

            // JIKA ADA PERUBAHAN JUMLAH BARANG, LAKUKAN RESET ONGKIR!
            if (isChanged) {
                localStorage.setItem('krupukCart', JSON.stringify(cart));
                renderCheckoutItems(); 
                
                // 1. Reset tampilan UI Ongkir menjadi 0
                document.getElementById('displayShipping').textContent = 'Pilih Opsi Pengiriman';
                document.getElementById('displayShippingCost').textContent = 'Rp 0';
                ongkirAmount = 0;
                
                // 2. Kosongkan pilihan radio kurir (agar user wajib milih ulang)
                const checkedRadio = document.querySelector('input[name="kurirRadio"]:checked');
                if (checkedRadio) checkedRadio.checked = false;

                // 3. Panggil ulang API Biteship dengan berat barang yang baru (DENGAN PENAHAN SPAM)
                const savedAddress = JSON.parse(localStorage.getItem('krupukmie_user_address'));
                if (savedAddress && savedAddress.areaId && savedAddress.postalCode) {
                    document.getElementById('shippingOptionsContainer').innerHTML = `<p style="text-align: center; padding: 2rem 0; color: #F59E0B;"><i class="fas fa-sync-alt fa-spin"></i> Menyesuaikan tarif ongkir...</p>`;
                    
                    // Batalkan tembakan API sebelumnya jika pembeli masih menekan tombol (+)
                    if (fetchRatesTimeout) clearTimeout(fetchRatesTimeout);
                    
                    // Tahan selama 1 detik. Jika tidak ada klik lagi, baru tembak!
                    fetchRatesTimeout = setTimeout(() => {
                        fetchShippingRates(savedAddress.areaId, savedAddress.postalCode);
                    }, 1500); 
                }
                
                updateGrandTotal(); // Perbarui perhitungan total akhir
            }
        });
    }
    // --- B. MANAJEMEN MULTI-BOTTOM SHEET ---
    const overlay = document.getElementById('checkoutOverlay');
    
    function openSheet(sheetId) {
        document.getElementById(sheetId).classList.add('expanded');
        overlay.classList.add('active');
    }

    function closeAllSheets() {
        document.querySelectorAll('.bottom-sheet-container').forEach(sheet => {
            sheet.classList.remove('expanded');
        });
        overlay.classList.remove('active');
    }

    // Event Listener untuk Buka Sheet
    document.getElementById('btnOpenAddress').addEventListener('click', () => openSheet('sheetAddress'));
    document.getElementById('btnOpenShipping').addEventListener('click', () => openSheet('sheetShipping'));
    document.getElementById('btnOpenPayment').addEventListener('click', () => openSheet('sheetPayment'));

    // Event Listener untuk Tutup Sheet (Tombol X & Overlay)
    document.querySelectorAll('.close-sheet-btn').forEach(btn => {
        btn.addEventListener('click', closeAllSheets);
    });
    overlay.addEventListener('click', closeAllSheets);


    // --- C & D. LOGIKA PENCARIAN ALAMAT & LOCAL STORAGE CACHE ---
    
    const btnTriggerLocationSheet = document.getElementById('btnTriggerLocationSheet');
    const textSelectedLocation = document.getElementById('textSelectedLocation');
    const biteshipAreaId = document.getElementById('biteshipAreaId');
    const kodeposHidden = document.getElementById('kodeposHidden');
    const inputSearchLocation = document.getElementById('inputSearchLocation');
    const locationResultsList = document.getElementById('locationResultsList');

    // 1. CEK CACHE ALAMAT SAAT HALAMAN DIMUAT
    const cachedAddress = JSON.parse(localStorage.getItem('krupukmie_user_address'));
    if (cachedAddress) {
        // Isi otomatis form di belakang layar
        document.getElementById('fullname').value = cachedAddress.name;
        document.getElementById('phone').value = cachedAddress.phone;
        document.getElementById('alamatLengkap').value = cachedAddress.addressDetail;
        biteshipAreaId.value = cachedAddress.areaId;
        kodeposHidden.value = cachedAddress.postalCode;
        textSelectedLocation.textContent = cachedAddress.areaName;
        textSelectedLocation.style.color = '#1F2937';

        // Tampilkan langsung di kartu layar utama
        document.getElementById('emptyAddressState').style.display = 'none';
        document.getElementById('filledAddressState').style.display = 'block';
        document.getElementById('displayCustName').textContent = `${cachedAddress.name} | ${cachedAddress.phone}`;
        document.getElementById('displayCustAddress').textContent = `${cachedAddress.addressDetail}, ${cachedAddress.areaName} (${cachedAddress.postalCode})`;
        
        // Buka Kunci Kurir
        document.getElementById('btnOpenShipping').style.opacity = '1';
        document.getElementById('btnOpenShipping').style.pointerEvents = 'auto';
        fetchShippingRates(cachedAddress.areaId, cachedAddress.postalCode);
    }

    // 2. NAVIGASI ANTAR SHEET ALAMAT & LOKASI
    btnTriggerLocationSheet.addEventListener('click', () => {
        document.getElementById('sheetLocation').classList.add('expanded');
    });

    document.getElementById('btnBackToAddress').addEventListener('click', () => {
        document.getElementById('sheetLocation').classList.remove('expanded');
    });

    // --- 3. LOGIKA PENCARIAN SHOPEE STYLE & GPS ---
    const btnCurrentLocation = document.getElementById('btnCurrentLocation');
    const gpsBtnText = document.getElementById('gpsBtnText');
    const dynamicRegionList = document.getElementById('dynamicRegionList');
    const locationTracker = document.getElementById('locationTracker');
    const breadcrumbList = document.getElementById('breadcrumbList');
    const btnResetLocation = document.getElementById('btnResetLocation');

    // Variabel state untuk melacak hierarki (Shopee style)
    let currentRegionState = 'province'; // province -> regency -> district
    let selectedProvince = '';
    let selectedRegency = '';

    // A. FITUR GPS (REVERSE GEOCODING) + SIMPAN KOORDINAT
    btnCurrentLocation.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("Browser Anda tidak mendukung fitur lokasi GPS.");
            return;
        }

        gpsBtnText.textContent = "Mencari koordinat Anda...";
        btnCurrentLocation.disabled = true;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    gpsBtnText.textContent = "Menerjemahkan alamat...";
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // SIMPAN KOORDINAT KE KANTONG RAHASIA
                    document.getElementById('hiddenLat').value = lat;
                    document.getElementById('hiddenLon').value = lon;
                    
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                    const data = await response.json();
                    const address = data.address;
                    
                    const queryForBiteship = address.postcode || address.city_district || address.town || address.city;
                    
                    if(queryForBiteship) {
                        inputSearchLocation.value = queryForBiteship; 
                        searchBiteshipDirectly(queryForBiteship);     
                    } else {
                        alert("Gagal mendeteksi area Anda. Silakan cari manual.");
                    }
                } catch (error) {
                    alert("Koneksi gagal saat menerjemahkan lokasi.");
                } finally {
                    resetGpsButton();
                }
            },
            (error) => {
                resetGpsButton();
                if (error.code === 1) {
                    alert("Akses Lokasi Ditolak 🔒\n\nKami butuh izin untuk menemukan Anda. Silakan klik ikon gembok 🔒 di pojok kiri atas browser, lalu pilih 'Izinkan Lokasi', dan muat ulang halaman.");
                } else {
                    alert("Sinyal GPS lemah. Silakan ketik nama kecamatan Anda.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });

    function resetGpsButton() {
        gpsBtnText.textContent = "Gunakan Lokasi Saat Ini";
        btnCurrentLocation.disabled = false;
    }


    // B. FITUR HIERARKI LOKASI (PROVINSI -> KOTA -> KECAMATAN)
    const wilayahApiUrl = 'https://www.emsifa.com/api-wilayah-indonesia/api';
    async function loadProvinces() {
        dynamicRegionList.innerHTML = '<p style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Memuat Provinsi...</p>';
        try {
            const res = await fetch(`${wilayahApiUrl}/provinces.json`);
            const provinces = await res.json();
            renderList(provinces, 'regency', 'Pilih Provinsi');
        } catch (e) {
            dynamicRegionList.innerHTML = '<p style="text-align:center; color:red;">Gagal memuat data wilayah.</p>';
        }
    }

    async function loadRegencies(provinceId, provinceName) {
        selectedProvince = provinceName;
        updateBreadcrumb(provinceName, false);
        dynamicRegionList.innerHTML = '<p style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Memuat Kota/Kabupaten...</p>';
        try {
            const res = await fetch(`${wilayahApiUrl}/regencies/${provinceId}.json`);
            const regencies = await res.json();
            renderList(regencies, 'district', 'Pilih Kota/Kabupaten');
        } catch (e) {}
    }

    async function loadDistricts(regencyId, regencyName) {
        selectedRegency = regencyName;
        updateBreadcrumb(regencyName, false);
        dynamicRegionList.innerHTML = '<p style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Memuat Kecamatan...</p>';
        try {
            const res = await fetch(`${wilayahApiUrl}/districts/${regencyId}.json`);
            const districts = await res.json();
            renderList(districts, 'biteship', 'Pilih Kecamatan');
        } catch (e) {}
    }

    // Fungsi menggambar daftar list untuk diklik
    function renderList(dataArray, nextStep, placeholderText) {
        dynamicRegionList.innerHTML = `<p style="font-size: 0.8rem; color: #9CA3AF; margin: 10px 0;">${placeholderText}</p>`;
        dataArray.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 15px 0; border-bottom: 1px solid #E5E7EB; cursor: pointer; color: #1F2937; font-size: 0.95rem; text-transform: capitalize;';
            div.innerHTML = item.name.toLowerCase();
            
            div.addEventListener('click', () => {
                if (nextStep === 'regency') loadRegencies(item.id, item.name);
                else if (nextStep === 'district') loadDistricts(item.id, item.name);
                else if (nextStep === 'biteship') {
                    updateBreadcrumb(item.name, true);
                    searchBiteshipDirectly(`${item.name}, ${selectedRegency}`);
                }
            });
            dynamicRegionList.appendChild(div);
        });
    }

    // Fungsi merender riwayat (Lokasi Terpilih) ala Shopee
    function updateBreadcrumb(name, isLast) {
        locationTracker.style.display = 'block';
        const li = document.createElement('li');
        li.style.cssText = `position: relative; padding-bottom: 15px; padding-left: 20px; font-size: 0.9rem; text-transform: capitalize; color: ${isLast ? '#EF4444' : '#6B7280'}; font-weight: ${isLast ? '600' : '400'};`;
        
        // Buat bulatan merah ala Shopee
        const dot = document.createElement('div');
        dot.style.cssText = `position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: ${isLast ? '#EF4444' : '#D1D5DB'}; border: 2px solid #fff;`;
        
        li.appendChild(dot);
        li.appendChild(document.createTextNode(name.toLowerCase()));
        breadcrumbList.appendChild(li);
    }

    // Reset UI kembali ke pilih provinsi
    btnResetLocation.addEventListener('click', () => {
        breadcrumbList.innerHTML = '';
        locationTracker.style.display = 'none';
        loadProvinces();
    });

    // C. PENCARIAN MANUAL (KETIK) -> TETAP MENGGUNAKAN BITESHIP API
    let searchTimeout;
    inputSearchLocation.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        // FITUR BARU: Jika kotak pencarian dikosongkan (dihapus semua)
        if (query.length <= 2) {
            // Reset dan kembalikan ke tampilan Hierarki (Provinsi)
            breadcrumbList.innerHTML = '';
            locationTracker.style.display = 'none';
            loadProvinces();
            return;
        }

        // Jika baru ngetik 1-2 huruf, suruh lanjut ngetik
        if (query.length < 3) {
            dynamicRegionList.innerHTML = '<div style="padding: 20px; text-align: center; color: #9CA3AF; font-size: 0.9rem;">Ketik minimal 3 huruf untuk mencari...</div>';
            return; 
        }

        // Jika sudah 3 huruf atau lebih, sembunyikan hierarki dan mulai mencari ke Biteship
        locationTracker.style.display = 'none'; 
        dynamicRegionList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6B7280;"><i class="fas fa-spinner fa-spin"></i> Mencari area pengiriman...</div>';
        
        searchTimeout = setTimeout(() => { searchBiteshipDirectly(query); }, 600);
    });

    // D. FUNGSI FINAL: JEMBATAN KE BITESHIP (VIA N8N PROXY)
    async function searchBiteshipDirectly(query) {
        dynamicRegionList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6B7280;"><i class="fas fa-spinner fa-spin"></i> Memverifikasi dengan Kurir...</div>';
        try {
            // PERUBAHAN DI SINI: Tembak ke n8n, bukan ke Biteship langsung
            // Tambahkan parameter headers di fetch ini
            const response = await fetch(`https://earnestine-fruitful-arla.ngrok-free.dev/webhook/proxy-biteship-areas?input=${encodeURIComponent(query)}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await response.json();
            
            if (data.success && data.areas.length > 0) {
                dynamicRegionList.innerHTML = '';
                data.areas.forEach(area => {
                    const li = document.createElement('div');
                    li.style.cssText = 'padding: 15px 0; border-bottom: 1px solid #E5E7EB; cursor: pointer; display: flex; flex-direction: column; gap: 4px;';
                    
                    // --- ALGORITMA PEMBERSIH TEKS BITESHIP ---
                    let namaKecamatan = area.name;
                    let detailWilayah = `${area.administrative_division_level_2_name || ''}, ${area.administrative_division_level_1_name || ''}`.replace(/^,\s*|,\s*$/g, '');
                    let kodeposAsli = area.postal_code;

                    // Jika Biteship membandel dan mengirimkan 1 kalimat super panjang (mengandung koma)
                    if (area.name.includes(',')) {
                        let pecah = area.name.split(',');
                        namaKecamatan = pecah[0].trim(); // Ambil nama depannya saja (Kecamatannya)
                        detailWilayah = pecah.slice(1).join(',').trim(); // Sisanya (Kota, Provinsi, dll) turunkan ke bawah
                        
                        // Jika ternyata kodeposnya kosong/null, coba kita cari angka 5 digit di dalam teks panjangnya
                        if (!kodeposAsli) {
                            let cariAngka = detailWilayah.match(/\d{5}/);
                            if (cariAngka) kodeposAsli = cariAngka[0];
                        }
                    }
                    
                    // Sembunyikan tulisan "Kode Pos:" jika memang datanya tidak ada
                    let htmlKodepos = kodeposAsli ? `<span style="font-size: 0.75rem; color: #9CA3AF;">Kode Pos: ${kodeposAsli}</span>` : '';

                    li.innerHTML = `
                        <strong style="font-size: 0.95rem; color: #1F2937;">${namaKecamatan}</strong>
                        <span style="font-size: 0.8rem; color: #6B7280;">${detailWilayah}</span>
                        ${htmlKodepos}
                    `;
                    
                    li.addEventListener('click', () => {
                        biteshipAreaId.value = area.id;
                        kodeposHidden.value = kodeposAsli || '';
                        
                        // Tampilkan di UI utama (Contoh: Adiwerna, Kab. Tegal)
                        const namaKota = area.administrative_division_level_2_name || detailWilayah.split(',')[0];
                        textSelectedLocation.textContent = `${namaKecamatan}, ${namaKota}`;
                        textSelectedLocation.style.color = '#1F2937';
                        
                        document.getElementById('sheetLocation').classList.remove('expanded');
                    });
                    dynamicRegionList.appendChild(li);
                });
            } else {
                dynamicRegionList.innerHTML = '<div style="padding: 20px; text-align: center; color: #EF4444;">Area ini belum terjangkau kurir.</div>';
            }
        } catch (error) {
            dynamicRegionList.innerHTML = '<div style="padding: 20px; text-align: center; color: #EF4444;">Koneksi terputus cik.</div>';
        }
    }
    // Panggil Provinsi saat sheet lokasi pertama kali dibuka
    document.getElementById('btnTriggerLocationSheet').addEventListener('click', () => {
        document.getElementById('sheetLocation').classList.add('expanded');
        
        // PERBAIKAN: Cek apakah tidak ada elemen <li> di dalamnya, bukan mengecek string kosong
        if(breadcrumbList.children.length === 0) {
            loadProvinces(); 
        }
    });

    // 4. SIMPAN DATA ALAMAT & MASUKKAN KE CACHE
    document.getElementById('btnSaveAddress').addEventListener('click', function() {
        const fullname = document.getElementById('fullname').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const areaId = biteshipAreaId.value;
        const postalCode = kodeposHidden.value;
        const areaName = textSelectedLocation.textContent;
        const addressDetail = document.getElementById('alamatLengkap').value.trim();
        const lat = document.getElementById('hiddenLat').value;
        const lon = document.getElementById('hiddenLon').value;

        if (!fullname || !phone || !areaId || !addressDetail) {
            alert('Mohon lengkapi data, termasuk memilih Kecamatan dari fitur pencarian.');
            return;
        }

        // Simpan ke Cache Browser (LocalStorage)
        const addressData = {
            name: fullname, phone: phone, areaId: areaId, 
            postalCode: postalCode, areaName: areaName, addressDetail: addressDetail,
            lat: lat, lon: lon // <--- INI YANG BARU
        };
        localStorage.setItem('krupukmie_user_address', JSON.stringify(addressData));

        // Update UI Utama
        document.getElementById('emptyAddressState').style.display = 'none';
        document.getElementById('filledAddressState').style.display = 'block';
        document.getElementById('displayCustName').textContent = `${fullname} | ${phone}`;
        document.getElementById('displayCustAddress').textContent = `${addressDetail}, ${areaName} (${postalCode})`;

        // Buka Kunci Opsi Pengiriman
        const btnShipping = document.getElementById('btnOpenShipping');
        btnShipping.style.opacity = '1';
        btnShipping.style.pointerEvents = 'auto';

        closeAllSheets();

        // Kosongkan Pilihan Kurir Lama agar user disuruh milih ulang jika ganti alamat
        document.getElementById('displayShipping').textContent = 'Pilih Opsi Pengiriman';
        document.getElementById('displayShippingCost').textContent = 'Rp 0';
        ongkirAmount = 0;
        updateGrandTotal();
        
        // Panggil Tarik Ongkir (Akan kita kerjakan di Tahap 2)
        fetchShippingRates(areaId, postalCode);


    });


    // ========================================================
    // LOGIKA TAB PENGIRIMAN VS AMBIL DI TOKO
    // ========================================================
    const tabDelivery = document.getElementById('tabDelivery');
    const tabPickup = document.getElementById('tabPickup');
    const viewDelivery = document.getElementById('viewDelivery');
    const viewPickup = document.getElementById('viewPickup');

    if (tabDelivery && tabPickup) {
        tabDelivery.addEventListener('click', () => {
            tabDelivery.style.color = '#EF4444';
            tabDelivery.style.borderBottom = '2px solid #EF4444';
            tabDelivery.style.fontWeight = '600';

            tabPickup.style.color = '#6B7280';
            tabPickup.style.borderBottom = '2px solid transparent';
            tabPickup.style.fontWeight = '500';

            viewDelivery.style.display = 'block';
            viewPickup.style.display = 'none';
        });

        tabPickup.addEventListener('click', () => {
            tabPickup.style.color = '#EF4444';
            tabPickup.style.borderBottom = '2px solid #EF4444';
            tabPickup.style.fontWeight = '600';

            tabDelivery.style.color = '#6B7280';
            tabDelivery.style.borderBottom = '2px solid transparent';
            tabDelivery.style.fontWeight = '500';

            viewPickup.style.display = 'block';
            viewDelivery.style.display = 'none';
        });
    }

    // LOGIKA PEMILIHAN CABANG (AMBIL DI TOKO)
    const pickupRadios = document.querySelectorAll('input[name="pickupStore"]');
    pickupRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Beri efek visual pada radio button yang dipilih
            document.querySelectorAll('input[name="pickupStore"] + .shipping-content .radio-custom').forEach(el => {
                el.style.background = 'transparent';
                el.style.borderColor = '#D1D5DB';
            });
            const customRadio = this.nextElementSibling.querySelector('.radio-custom');
            customRadio.style.background = '#EF4444';
            customRadio.style.borderColor = '#EF4444';
            this.nextElementSibling.style.borderColor = '#EF4444';

            // Ubah UI Utama
            const namaToko = this.getAttribute('data-name');
            document.getElementById('displayShipping').innerHTML = `<strong style="color:#1F2937;"><i class="fas fa-store"></i> AMBIL DI TOKO</strong><br><span style="font-size:0.8rem; color:#6B7280;">${namaToko}</span>`;
            document.getElementById('displayShippingCost').textContent = "Rp 0";
            
            // Set Ongkir jadi 0 dan hitung ulang Grand Total
            ongkirAmount = 0;
            updateGrandTotal();
            
            setTimeout(() => {
                document.getElementById('sheetShipping').classList.remove('expanded');
                document.getElementById('checkoutOverlay').classList.remove('active');
            }, 300);
        });
    });

    
    // --- E. LOGIKA OPSI PENGIRIMAN DINAMIS & KATEGORISASI (ALA SHOPEE) ---
    async function fetchShippingRates(areaId, postalCode) {
        const container = document.getElementById('shippingOptionsContainer');
        container.innerHTML = `<p style="text-align: center; padding: 2rem 0; color: #6B7280;"><i class="fas fa-spinner fa-spin"></i> Memilah kurir terbaik untuk Anda...</p>`;

        // 1. HITUNG BERAT KERANJANG
        let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
        let totalWeightGram = 0;
        let totalValue = 0;

        cart.forEach(item => {
            let itemWeight = 500; 
            if (item.variant && item.variant.includes('1kg')) itemWeight = 1000;
            else if (item.variant && item.variant.includes('500g')) itemWeight = 500;
            else if (item.variant && item.variant.includes('250g')) itemWeight = 250;
            
            totalWeightGram += (itemWeight * item.qty);
            totalValue += item.total; 
        });

        if (totalWeightGram < 1000) totalWeightGram = 1000;
        
        // 2. PAYLOAD UNTUK BITESHIP (Kombinasi Kodepos & Koordinat)
        // Ambil data alamat dari cache untuk mengecek apakah ada koordinat GPS
        const savedAddress = JSON.parse(localStorage.getItem('krupukmie_user_address')) || {};
        
        const payload = {
            origin_postal_code: 52194, 
            
            // TITIK KOORDINAT TOKO ANDA (Wajib untuk layanan Instan)
            // Ganti angka ini dengan titik koordinat asli toko KrupukMie di Tegal
            origin_latitude: -6.947171048679825,  
            origin_longitude: 109.12651595025321, 

            
            
            destination_postal_code: parseInt(postalCode), 
            couriers: "jne,sicepat,jnt,idexpress,tiki,ninja,lion,anteraja,pos,wahana,rpx,sap,gojek,grab,lalamove", 
            items: [
                {
                    name: "Pesanan KrupukMie",
                    description: "Makanan ringan",
                    value: parseInt(totalValue) || 15000, 
                    length: 15, width: 15, height: 10,
                    weight: parseInt(totalWeightGram),
                    quantity: 1
                }
            ]
        };

        // Jika pembeli menggunakan tombol GPS, masukkan koordinat mereka ke payload
        if (savedAddress.lat && savedAddress.lon) {
            payload.destination_latitude = parseFloat(savedAddress.lat);
            payload.destination_longitude = parseFloat(savedAddress.lon);
        }

        try {
            // GANTI DENGAN URL NGROK / N8N ANDA
            const response = await fetch("https://earnestine-fruitful-arla.ngrok-free.dev/webhook/proxy-biteship-rates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Tambahkan baris ini:
                    "ngrok-skip-browser-warning": "true" 
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            // ... (kode bawahnya biarkan sama) ...

            if (data.success && data.pricing.length > 0) {
                
                // ========================================================
                // 3. ALGORITMA KATEGORISASI (THE MAGIC LIES HERE)
                // ========================================================
                
                // Siapkan wadah untuk masing-masing kategori
                const groupedRates = {
                    instan: { title: "Instan & Same Day", desc: "Tiba di hari yang sama", icon: "fa-motorcycle", data: [], disabledMsg: "" },
                    reguler: { title: "Reguler", desc: "Harga & Waktu seimbang", icon: "fa-truck", data: [], disabledMsg: "" },
                    ekonomi: { title: "Hemat / Ekonomi", desc: "Harga lebih terjangkau", icon: "fa-piggy-bank", data: [], disabledMsg: "" },
                    kargo: { title: "Kargo", desc: "Khusus barang berat/besar", icon: "fa-truck-loading", data: [], disabledMsg: "" }
                };

                // Filter & Sortir ke wadah yang tepat
                data.pricing.forEach(rate => {
                    const typeStr = rate.type.toLowerCase();
                    const companyStr = rate.company.toLowerCase();
                    const serviceName = rate.courier_service_name.toLowerCase();

                    // Filter Instan
                    if (typeStr.includes('instant') || typeStr.includes('same') || companyStr.includes('gojek') || companyStr.includes('grab') || companyStr.includes('lalamove')) {
                        groupedRates.instan.data.push(rate);
                    } 
                    // Filter Kargo (JTR, Gokil, Trucking, Cargo)
                    else if (typeStr.includes('cargo') || typeStr.includes('trucking') || typeStr.includes('jtr') || serviceName.includes('gokil') || serviceName.includes('kargo')) {
                        groupedRates.kargo.data.push(rate);
                    } 
                    // Filter Ekonomi (Halu, Eco, Economy, OKE)
                    else if (typeStr.includes('economy') || typeStr.includes('eco') || typeStr.includes('oke') || serviceName.includes('halu') || serviceName.includes('hemat')) {
                        groupedRates.ekonomi.data.push(rate);
                    } 
                    // Sisanya masuk Reguler
                    else {
                        groupedRates.reguler.data.push(rate);
                    }
                });
                if (totalWeightGram < 5000) {
                    groupedRates.kargo.disabledMsg = "Pesanan belum memenuhi berat minimum kargo (5kg).";
                    groupedRates.kargo.data = []; 
                }
                
                // LOGIKA CERDAS UNTUK KURIR INSTAN
                if (!savedAddress.lat || !savedAddress.lon) {
                    // Jika pembeli tidak pakai GPS, kunci layanan instan
                    groupedRates.instan.disabledMsg = "Gunakan tombol GPS (Gunakan Lokasi Saat Ini) di menu alamat untuk mengaktifkan kurir Instan.";
                    groupedRates.instan.data = [];
                } else if (groupedRates.instan.data.length === 0) {
                    // Jika pakai GPS tapi jaraknya lebih dari 40km (aturan Gojek/Grab)
                    groupedRates.instan.disabledMsg = "Jarak melebihi batas pengiriman Instan (Maks ~40km).";
                }
                
                // ========================================================
                // 4. MERENDER UI ACCORDION ALA SHOPEE
                // ========================================================
                let html = `<div style="background: #ECFDF5; border: 1px solid #10B981; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; color: #047857; font-size: 0.85rem; font-weight: 600;">
                                <i class="fas fa-balance-scale"></i> Total Berat: ${(totalWeightGram/1000).toFixed(1)} kg
                            </div>`;

                // Urutan render layar: Instan -> Reguler -> Ekonomi -> Kargo
                const renderOrder = ['instan', 'reguler', 'ekonomi', 'kargo'];

                renderOrder.forEach(key => {
                    const group = groupedRates[key];
                    
                    if (group.data.length > 0 && !group.disabledMsg) {
                        // Urutkan harga termurah di kategori ini
                        group.data.sort((a, b) => a.price - b.price);
                        const cheapest = group.data[0];

                        // KARTU AKTIF (Bisa di-klik untuk buka daftar kurir)
                        html += `
                        <div class="category-card" style="margin-bottom: 12px; border: 1px solid #E5E7EB; border-radius: 8px; background: #fff; overflow: hidden;">
                            <div style="padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #F9FAFB;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                                <div>
                                    <strong style="color: #1F2937; font-size: 0.95rem; display: block;"><i class="fas ${group.icon}" style="margin-right: 8px; color: #6B7280;"></i> ${group.title}</strong>
                                    <span style="font-size: 0.75rem; color: #6B7280; margin-top: 2px;">Mulai dari <span style="color: #EF4444; font-weight: 600;">${formatRupiahCheckout(cheapest.price)}</span></span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 0.75rem; color: #3B82F6;">Pilih Kurir</span>
                                    <i class="fas fa-chevron-down" style="color: #9CA3AF;"></i>
                                </div>
                            </div>
                            
                            <div style="padding: 0 15px; display: none; border-top: 1px solid #E5E7EB;">
                        `;

                        group.data.forEach((rate, index) => {
                            const isCheapest = index === 0;
                            const badgeHtml = isCheapest ? `<span style="background: #FEF3C7; color: #D97706; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 8px;">TERMURAH</span>` : '';

                            html += `
                                <label style="display: block; padding: 12px 0; border-bottom: 1px solid #F3F4F6; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                                    <div style="display: flex; align-items: center; flex: 1;">
                                        <input type="radio" name="kurirRadio" value="${rate.company}-${rate.type}" data-name="${rate.courier_name} ${rate.courier_service_name} (${group.title})" data-price="${rate.price}" style="margin-right: 12px; width: 18px; height: 18px; accent-color: #EF4444;">
                                        <div>
                                            <strong style="display: block; color: #1F2937; font-size: 0.9rem;">${rate.company.toUpperCase()} - ${rate.courier_service_name} ${badgeHtml}</strong>
                                            <span style="font-size: 0.75rem; color: #6B7280;">Estimasi ${rate.duration}</span>
                                        </div>
                                    </div>
                                    <strong style="color: #EF4444; font-size: 0.95rem;">${formatRupiahCheckout(rate.price)}</strong>
                                </label>
                            `;
                        });

                        html += `
                            </div>
                        </div>
                        `;
                    } else {
                        // KARTU TERKUNCI / DISABLED (Ala Shopee)
                        html += `
                        <div class="category-card disabled" style="margin-bottom: 12px; border: 1px solid #E5E7EB; border-radius: 8px; background: #F9FAFB; opacity: 0.7;">
                            <div style="padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="color: #9CA3AF; font-size: 0.95rem;"><i class="fas ${group.icon}" style="margin-right: 8px;"></i> ${group.title}</strong>
                                    <span style="display: block; font-size: 0.75rem; color: #EF4444; margin-top: 4px;">${group.disabledMsg || 'Layanan Tidak Tersedia'}</span>
                                </div>
                                <i class="fas fa-lock" style="color: #D1D5DB;"></i>
                            </div>
                        </div>
                        `;
                    }
                });

                container.innerHTML = html;

                // 5. PASANG EVENT LISTENER PADA SEMUA RADIO BUTTON
                const kurirRadios = container.querySelectorAll('input[name="kurirRadio"]');
                kurirRadios.forEach(radio => {
                    radio.addEventListener('change', function() {
                        const namaKurir = this.getAttribute('data-name');
                        const hargaOngkir = parseInt(this.getAttribute('data-price'));
                        
                        document.getElementById('displayShipping').innerHTML = `<strong style="color:#1F2937;">${this.value.toUpperCase()}</strong><br><span style="font-size:0.8rem; color:#6B7280;">${namaKurir}</span>`;
                        document.getElementById('displayShippingCost').textContent = formatRupiahCheckout(hargaOngkir);
                        
                        ongkirAmount = hargaOngkir;
                        updateGrandTotal();
                        
                        // Jeda sedikit agar pengguna melihat efek klik sebelum ditutup
                        setTimeout(() => {
                            document.getElementById('sheetShipping').classList.remove('expanded');
                            document.getElementById('checkoutOverlay').classList.remove('active');
                        }, 250);
                    });
                });

            } else {
                container.innerHTML = `<div style="padding: 20px; text-align: center; color: #EF4444;">Maaf, rute ini belum didukung.</div>`;
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: #EF4444;">Gagal terhubung ke server ekspedisi.</div>`;
        }
    }

    // --- F. LOGIKA METODE PEMBAYARAN & ADMIN DINAMIS ---
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // 1. Update Teks di Layar Utama
            const paymentName = this.nextElementSibling.querySelector('.kurir-name').textContent;
            document.getElementById('displayPayment').textContent = paymentName;
            
            // 2. LOGIKA PERHITUNGAN BIAYA ADMIN
            const method = this.value;
            
            // Kelompok Virtual Account (BCA, BNI, BRI, Mandiri, Permata) -> Rp 4.000 flat
            if (['bca_va', 'bni_va', 'bri_va', 'permata_va', 'echannel'].includes(method)) {
                adminFee = 4000;
            } 
            // Kelompok E-Wallet / QRIS -> Rp 1.500 flat
            else if (['gopay', 'qris', 'shopeepay'].includes(method)) {
                adminFee = 1500; 
            } 
            // Kelompok Gerai Retail (Indomaret, Alfamart) -> Midtrans biasanya potong Rp 5.000
            else if (['indomaret', 'alfamart'].includes(method)) {
                adminFee = 5000;
            }
            // Kelompok Kartu Kredit (Opsional jika Anda aktifkan nanti) -> Biasanya 3%
            else if (method === 'credit_card') {
                // Tampilkan sebagai persentase dari subtotal
                adminFee = Math.round((subtotalAmount + ongkirAmount) * 0.03); 
            }
            // Default keamanan
            else {
                adminFee = 2500;
            }

            // 3. Update Angka di Rincian Pembayaran
            updateGrandTotal();
            
            // 4. Tutup sheet dengan efek smooth
            setTimeout(closeAllSheets, 300);
        });
    });


    // --- G. FUNGSI UPDATE GRAND TOTAL ---
    function updateGrandTotal() {
        const grandTotal = subtotalAmount + ongkirAmount + adminFee;
        
        // Update rincian di bawah
        document.getElementById('checkoutOngkir').textContent = formatRupiahCheckout(ongkirAmount);
        document.getElementById('checkoutAdmin').textContent = formatRupiahCheckout(adminFee);
        
        // Update Sticky Footer (Tombol Buat Pesanan)
        document.getElementById('checkoutGrandTotal').textContent = formatRupiahCheckout(grandTotal);
    }

    // Jalankan render awal
    renderCheckoutItems();
    
    // ========================================================
    // H. AKSI TOMBOL BUAT PESANAN (INTEGRASI N8N & MIDTRANS)
    // ========================================================
    const btnPlaceOrder = document.getElementById('btnPlaceOrder'); // Pastikan ID ini sesuai dengan tombol di HTML Anda
    
    if (btnPlaceOrder) {
        btnPlaceOrder.addEventListener('click', async function() {
            if (ongkirAmount === 0) {
                alert('Mohon lengkapi Alamat dan pilih Opsi Pengiriman terlebih dahulu.');
                openSheet('sheetAddress'); 
                return;
            }
        
            const paymentSelected = document.querySelector('input[name="payment"]:checked');
            if (!paymentSelected) {
                alert('Mohon pilih metode pembayaran.');
                openSheet('sheetPayment');
                return;
            }
            
                // ... (kode validasi ongkir & payment sebelumnya) ...

            let cart = JSON.parse(localStorage.getItem('krupukCart')) || [];
            
            // ==========================================
            // TARIK DATA ALAMAT DARI CACHE BROWSER
            // ==========================================
            const savedAddress = JSON.parse(localStorage.getItem('krupukmie_user_address')) || {};

            const safeSubtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
            const adminFee = 5000;
            const safeGrandTotal = safeSubtotal + ongkirAmount + adminFee;

            const courierChoice = document.getElementById('displayShipping').innerText.replace(/\n/g, ' - ');
            const invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

            const orderPayload = {
                invoice_number: invoiceNumber,
                customer: {
                    // Gunakan data dari Cache (savedAddress) sebagai prioritas utama
                    name: savedAddress.name || document.getElementById('fullname').value,
                    phone: savedAddress.phone || document.getElementById('phone').value,
                    email: 'customer@email.com',
                    address: savedAddress.addressDetail || (document.getElementById('addressDetail') ? document.getElementById('addressDetail').value : document.getElementById('alamatLengkap').value),
                    area_id: savedAddress.areaId || (document.getElementById('biteshipAreaId') ? document.getElementById('biteshipAreaId').value : ''),

                    // MENGGUNAKAN KOORDINAT DARI CACHE SECARA OTOMATIS
                    latitude: savedAddress.lat || '',
                    longitude: savedAddress.lon || ''
                },
                items: cart,
                shipping: {
                    courier: courierChoice || (document.querySelector('input[name="kurirRadio"]:checked') ? document.querySelector('input[name="kurirRadio"]:checked').value : 'Kurir Standar'),
                    cost: ongkirAmount
                },
                payment_method: paymentSelected.value,
                summary: {
                    subtotal: safeSubtotal,
                    admin_fee: adminFee,
                    grand_total: safeGrandTotal
                }
            };

        
            const originalBtnText = btnPlaceOrder.innerHTML;
            btnPlaceOrder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            btnPlaceOrder.disabled = true;
        
            try {
                // 1. Tembak ke Webhook n8n Anda
                // Pastikan URL ini aktif dan dalam mode "Listen for Test Event"
                const webhookUrl = 'https://earnestine-fruitful-arla.ngrok-free.dev/webhook/proses-checkout'; 
                
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                
               // 2. Tangkap balasan dari n8n
               const data = await response.json(); 
                
               // PENGAMAN JITU: Cek apakah n8n membalas berupa Array [ {token:...} ] atau Object {token:...}
               const snapToken = Array.isArray(data) ? data[0].token : data.token;
            
               // Periksa apakah token benar-benar ada
               if (!snapToken) {
                   console.error("Respons n8n:", data);
                   throw new Error("Gagal mendapatkan Token dari server n8n.");
               }
               
                // 3. Panggil Pop-up Midtrans (Dipastikan window.snap sudah ter-load)
                window.snap.pay(snapToken, {
                    onSuccess: function(result){
                        alert("Pembayaran Berhasil! Pesanan sedang diproses.");
                        localStorage.removeItem('krupukCart'); 
                        window.location.reload(); 
                    },
                    onPending: function(result){
                        alert("Menunggu pembayaran Anda. Silakan cek detail di halaman selanjutnya.");
                        localStorage.removeItem('krupukCart');
                        window.location.reload(); 
                    },
                    onError: function(result){
                        alert("Pembayaran gagal! Silakan coba lagi.");
                    },
                    onClose: function(){
                        alert('Anda menutup layar pembayaran sebelum menyelesaikannya.');
                    }
                });
            
            } catch (error) {
                console.error('Error Checkout:', error);
                alert('Terjadi kesalahan koneksi ke server. Pastikan Webhook n8n sedang aktif (Listen for Test Event).');
            } finally {
                btnPlaceOrder.innerHTML = originalBtnText;
                btnPlaceOrder.disabled = false;
            }
        });
    }

    
}


// --- KONFIGURASI BITESHIP ---
// CATATAN: Untuk keamanan level produksi, API Key sebaiknya tidak ditaruh di Frontend. 
// Namun untuk tahap ini, kita gunakan langsung agar UI berfungsi.

// --- 1. LOCAL STORAGE (MENYIMPAN DATA SAAT REFRESH) ---
document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah ada data lokasi yang tersimpan sebelumnya
    const savedLocation = localStorage.getItem('krupukmie_user_location');
    if (savedLocation) {
        const locData = JSON.parse(savedLocation);
        document.getElementById('displayLocation').textContent = locData.name; // Ganti ID sesuai elemen UI Anda
        document.getElementById('hiddenAreaId').value = locData.area_id;
        document.getElementById('hiddenPostalCode').value = locData.postal_code;
        
        // Nanti di Tahap 2: Panggil fungsi cek ongkir di sini
        // fetchShippingRates(locData.area_id); 
    }
});

// --- 2. LOGIKA PENCARIAN LOKASI (SHOPEE STYLE) ---
const inputSearch = document.getElementById('inputSearchLocation');
const resultsList = document.getElementById('locationResultsList');
let searchTimeout;

inputSearch.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();

    if (query.length < 3) {
        resultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #9CA3AF; font-size: 0.9rem;">Ketik minimal 3 huruf...</div>';
        return;
    }

    resultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6B7280;"><i class="fas fa-spinner fa-spin"></i> Mencari lokasi...</div>';

    // Jeda 500ms agar tidak membombardir server Biteship saat user mengetik cepat (Debounce)
    searchTimeout = setTimeout(() => {
        fetchBiteshipAreas(query);
    }, 500);
});



// Fungsi memanggil API Maps Biteship VIA N8N
async function fetchBiteshipAreas(query) {
    try {
        // GANTI DENGAN URL NGROK / N8N ANDA
        // Tambahkan parameter headers di fetch ini
        const response = await fetch(`https://earnestine-fruitful-arla.ngrok-free.dev/webhook/proxy-biteship-areas?input=${encodeURIComponent(query)}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const data = await response.json();
        
        if (data.success && data.areas.length > 0) {
            renderLocationResults(data.areas);
        } else {
            resultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #EF4444;">Lokasi tidak ditemukan. Coba kata kunci lain.</div>';
        }
    } catch (error) {
        console.error('Error fetching areas:', error);
        resultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #EF4444;">Gagal menghubungi server. Periksa koneksi internet.</div>';
    }
}

// Fungsi merender hasil pencarian ke dalam list HTML
function renderLocationResults(areas) {
    resultsList.innerHTML = ''; // Bersihkan loading
    
    areas.forEach(area => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 15px 0; border-bottom: 1px solid #E5E7EB; cursor: pointer; display: flex; flex-direction: column; gap: 4px;';
        
        // Tampilan Hierarki seperti gambar Anda (Adiwerna, Kab. Tegal, Jawa Tengah)
        item.innerHTML = `
            <strong style="font-size: 0.95rem; color: #1F2937;">${area.name}</strong>
            <span style="font-size: 0.8rem; color: #6B7280;">${area.administrative_division_level_2_name}, ${area.administrative_division_level_1_name}</span>
            <span style="font-size: 0.75rem; color: #9CA3AF;">Kode Pos: ${area.postal_code || '-'}</span>
        `;
        
        // Saat lokasi diklik
        item.addEventListener('click', () => {
            // 1. Simpan ke Input Hidden Form
            document.getElementById('hiddenAreaId').value = area.id;
            document.getElementById('hiddenPostalCode').value = area.postal_code;
            
            // 2. Ubah Tampilan UI Utama
            document.getElementById('displayLocation').textContent = `${area.name}, ${area.administrative_division_level_2_name}`;
            
            // 3. Simpan ke LocalStorage agar awet saat di-refresh
            const locDataToSave = {
                id: area.id, // Area ID khusus Biteship (Sangat Penting untuk Tahap 2!)
                name: `${area.name}, ${area.administrative_division_level_2_name}`,
                postal_code: area.postal_code
            };
            localStorage.setItem('krupukmie_user_location', JSON.stringify(locDataToSave));
            
            // 4. Tutup Sheet
            closeAllSheets(); // Pastikan Anda punya fungsi ini dari kode sebelumnya
            
            // PANGGILAN RAHASIA TAHAP 2 (Mencari Ongkir)
            // fetchDynamicRates(area.id, area.postal_code); 
        });
        
        resultsList.appendChild(item);
    });
}