// ==========================================
// 0. SISTEM KEAMANAN (AUTH GUARD)
// ==========================================
// Cek apakah ada token login di brankas browser
const adminToken = sessionStorage.getItem('krupukmie_admin_token');

if (!adminToken) {
    // Jika tidak ada token (belum login), tendang kembali ke halaman login!
    alert("Akses Ditolak! Silakan login terlebih dahulu.");
    window.location.href = 'login.html';
    // Hentikan pengeksekusian kode di bawahnya
    throw new Error("Akses dihentikan karena tidak ada sesi login.");
}

// Fungsi Logout
function logoutAdmin() {
    Swal.fire({
        title: 'Keluar Dashboard?',
        text: "Apakah Anda yakin ingin keluar dari sesi Admin KrupukMie?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444', // Merah
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem('krupukmie_admin_token');
            window.location.href = 'login.html';
        }
    });
}

// ==========================================
// LOGIKA UI MENU MOBILE (PWA)
// ==========================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleMobileMenu() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
}

if (menuToggle && sidebarOverlay) {
    menuToggle.addEventListener('click', toggleMobileMenu);
    sidebarOverlay.addEventListener('click', toggleMobileMenu);
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) toggleMobileMenu();
    });
});

// ==========================================
// KONFIGURASI SUPABASE DATABASE
// ==========================================
// GANTI DENGAN URL & API KEY ANON SUPABASE ANDA
const SUPABASE_URL = 'https://uomqqcntuniodhfbpxvh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbXFxY250dW5pb2RoZmJweHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDY5NTUsImV4cCI6MjA4ODM4Mjk1NX0.yO1lV5Qw-0U0HSRKlkASaL2Ol9qi6UJqzXfJFxKT7c0';

let orders = []; // Wadah kosong untuk data asli dari database

const orderContainer = document.getElementById('orderContainer');
const tabBtns = document.querySelectorAll('.tab-btn');

// Kamus Label Status
const statusLabels = {
    'pending': { text: 'Belum Bayar', class: 'pending', color: '#6B7280', bg: '#F3F4F6' },
    'paid': { text: 'Perlu Dikonfirmasi', class: 'paid', color: '#D97706', bg: '#FEF3C7' },
    'picking_up': { text: 'Penjemputan', class: 'processing', color: '#2563EB', bg: '#DBEAFE' },
    'dropping_off': { text: 'Pengantaran', class: 'shipped', color: '#7C3AED', bg: '#EDE9FE' },
    'returned': { text: 'Pengembalian', class: 'cancelled', color: '#EF4444', bg: '#FEE2E2' },
    'on_hold': { text: 'Ditahan', class: 'cancelled', color: '#9A3412', bg: '#FFEDD5' },
    'completed': { text: 'Selesai', class: 'completed', color: '#059669', bg: '#D1FAE5' },
    'cancelled': { text: 'Dibatalkan', class: 'cancelled', color: '#DC2626', bg: '#FEE2E2' }
};

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

// ==========================================
// 1. FUNGSI TARIK DATA DARI SUPABASE (GET JOINED)
// ==========================================
async function fetchOrdersFromSupabase() {

    try {
        const headers = {
            'apikey': SUPABASE_KEY, // Papan nama proyek (tetap pakai kunci anonim)
            'Authorization': `Bearer ${adminToken}` // PASPOR RAHASIA: Gunakan token dari hasil Login!
        };

        // KECERDASAN BARU: Tarik data dari tabel 'orders' DAN 'order_items' secara bersamaan
        const [ordersResponse, itemsResponse] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, { method: 'GET', headers: headers }),
            fetch(`${SUPABASE_URL}/rest/v1/order_items?select=*`, { method: 'GET', headers: headers })
        ]);

        if (!ordersResponse.ok || !itemsResponse.ok) throw new Error('Gagal mengambil data dari Supabase');

        const dbOrders = await ordersResponse.json();
        const dbItems = await itemsResponse.json(); // Berisi seluruh rincian keranjang
        
        // Terjemahkan data Supabase ke format Dashboard kita
        orders = dbOrders.map(order => {
            
            // LOGIKA PENCARIAN BARANG: Cari item yang 'order_id'-nya sama dengan 'id' pesanan ini
            const myItems = dbItems.filter(item => item.order_id === order.id);
            
            // ==========================================
            // DESAIN BARU: KOTAK RINCIAN BARANG PROFESIONAL
            // ==========================================
            // Rangkai item menjadi UI kotak yang rapi (List Item)
            let itemsTextHtml = '';
            if (myItems.length > 0) {
                itemsTextHtml = myItems.map((item, index) => {
                    // Hilangkan garis bawah putus-putus pada item paling terakhir
                    const borderBottom = index === myItems.length - 1 ? '' : 'border-bottom: 1px dashed #E5E7EB;';
                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; ${borderBottom}">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: #FFFBEB; color: #D97706; font-weight: 700; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1rem; border: 1px solid #FDE68A;">
                                ${item.qty}x
                            </div>
                            <div>
                                <strong style="display: block; color: #1F2937; font-size: 0.95rem;">${item.product_name}</strong>
                                <span style="color: #6B7280; font-size: 0.85rem;"><i class="fas fa-tag" style="color: #D1D5DB;"></i> Varian: <span style="color: #4B5563; font-weight: 500;">${item.variant}</span></span>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                itemsTextHtml = `<div style="padding: 12px 0; color: #EF4444; font-style: italic; font-size: 0.85rem;">Rincian barang tidak ditemukan</div>`;
            }
            // Logika Sinkronisasi Status (Mayar -> Dashboard Baru)
            let currentStatus = order.order_status || 'pending';
            
            if (currentStatus === 'pending' && (order.payment_status === 'settlement' || order.payment_status === 'paid')) {
                currentStatus = 'paid';
            }
            
            // JIKA STATUSNYA 'processing' (Dari Mayar), MASUKKAN KE TAB 'Perlu Dikonfirmasi' ('paid')
            if (currentStatus === 'processing') {
                currentStatus = 'paid';
            }
            return {
                id: order.id,                           
                invoice: order.invoice_number || order.id, 
                date: new Date(order.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
                customer: order.customer_name || 'Pembeli',
                phone: order.customer_phone || '-',
                
                // MASUKKAN HTML BARANG YANG SUDAH DIRANGKAI DI SINI
                items: itemsTextHtml,      
                
                total: order.grand_total || 0,
                courier: order.courier_choice || 'Kurir Standar',
                status: currentStatus, 
                resi: order.biteship_tracking_id || null
            };
        });

        // Tampilkan pesanan sesuai tab yang sedang aktif
        currentTab = document.querySelector('.tab-btn.active').getAttribute('data-status');
        renderOrders();

    } catch (error) {
        console.error("Supabase Error:", error);
        orderContainer.innerHTML = `<div class="empty-state" style="color:#EF4444;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <h3>Koneksi Terputus</h3>
            <p>Pastikan URL dan API Key Supabase sudah benar.</p>
        </div>`;
    }
}
// ==========================================
// 2. FUNGSI RENDER KE LAYAR
// ==========================================
// Variabel penyimpan state filter saat ini
let currentTab = 'all';
let currentSearch = '';
let currentCourier = 'all';

function renderOrders() {
    orderContainer.innerHTML = '';
    
    // LOGIKA FILTER GABUNGAN (Triple Filter)
    const filteredOrders = orders.filter(o => {
        const matchTab = currentTab === 'all' ? true : o.status === currentTab;
        const matchSearch = o.invoice.toLowerCase().includes(currentSearch.toLowerCase()) || o.customer.toLowerCase().includes(currentSearch.toLowerCase());
        const matchCourier = currentCourier === 'all' ? true : o.courier.toLowerCase().includes(currentCourier.toLowerCase());
        
        return matchTab && matchSearch && matchCourier;
    });

    if (filteredOrders.length === 0) {
        orderContainer.innerHTML = `<div class="empty-state" style="text-align: center; padding: 40px; color: #9CA3AF;">
            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; color: #E5E7EB;"></i>
            <h3>Data tidak ditemukan</h3>
            <p>Cobalah kata kunci atau filter lain.</p>
        </div>`;
        return;
    }

    filteredOrders.forEach(order => {
        const badge = statusLabels[order.status] || statusLabels['pending']; 
        
        let actionButtons = '';
        if (order.status === 'paid') {
            actionButtons = `<button class="btn-action btn-confirm" onclick="requestPickupN8n('${order.invoice}')" style="background:#8B5CF6; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;"><i class="fas fa-truck-loading"></i> Proses & Panggil Kurir</button>`;
        } else if (order.status === 'picking_up' || order.status === 'dropping_off') {
            actionButtons = `<button class="btn-action btn-track" onclick="window.open('https://biteship.com/v1/trackings/${order.resi}', '_blank')" style="background:#3B82F6; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;"><i class="fas fa-map-marked-alt"></i> Lacak Paket</button>`;
        } else if (order.status === 'on_hold') {
            actionButtons = `<button class="btn-action btn-danger" style="background:#EF4444; color:white; border:none; padding:8px 15px; border-radius:6px;"><i class="fas fa-exclamation-triangle"></i> Cek Kendala</button>`;
        }

        const resiHtml = order.resi ? `<div style="margin-top: 8px; padding: 6px 12px; background: #EEF2FF; border: 1px dashed #6366F1; border-radius: 6px; font-size: 0.85rem; color: #4F46E5; display: inline-block; font-weight: 500;"><i class="fas fa-barcode" style="margin-right: 5px;"></i> ${order.resi}</div>` : '';

        const cardHtml = `
            <div class="order-card" style="padding: 0; overflow: hidden; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="background: #F9FAFB; padding: 15px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #1F2937; font-size: 1.05rem;"><i class="fas fa-file-invoice" style="color: #9CA3AF; margin-right: 5px;"></i> ${order.invoice}</strong>
                        <span style="font-size: 0.85rem; color: #6B7280; margin-left: 12px;"><i class="far fa-clock"></i> ${order.date}</span>
                    </div>
                    <span style="font-size: 0.75rem; padding: 6px 12px; border-radius: 20px; font-weight: 600; background: ${badge.bg}; color: ${badge.color};">${badge.text}</span>
                </div>
                
                <div style="padding: 20px;">
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                        <div style="flex: 1; min-width: 200px;">
                            <span style="font-size: 0.75rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Informasi Pembeli</span>
                            <strong style="display: block; color: #1F2937; font-size: 1rem; margin-top: 6px;">${order.customer}</strong>
                            <span style="font-size: 0.9rem; color: #4B5563; display: block; margin-top: 4px;"><i class="fab fa-whatsapp" style="color: #10B981;"></i> ${order.phone}</span>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <span style="font-size: 0.75rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Opsi Pengiriman</span>
                            <strong style="display: block; color: #1F2937; font-size: 0.95rem; margin-top: 6px;"><i class="fas fa-truck" style="color: #F59E0B; margin-right: 5px;"></i> ${order.courier.toUpperCase()}</strong>
                            ${resiHtml}
                        </div>
                    </div>

                    <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 0 20px; margin-bottom: 20px; background: #FAFAFA;">
                        ${order.items}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #E5E7EB; padding-top: 20px;">
                        <div>
                            <span style="display: block; font-size: 0.8rem; color: #6B7280; margin-bottom: 4px;">Total Belanja</span>
                            <strong style="font-size: 1.4rem; color: #EF4444; font-weight: 800;">${formatRupiah(order.total)}</strong>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                            ${actionButtons}
                        </div>
                    </div>
                </div>
            </div>
        `;
        orderContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// A. Mendengarkan Input Pencarian (Real-time Typing)
document.getElementById('searchInvoice').addEventListener('input', function(e) {
    currentSearch = e.target.value;
    renderOrders();
});

// B. Mendengarkan Pilihan Kurir
document.getElementById('filterCourier').addEventListener('change', function(e) {
    currentCourier = e.target.value;
    renderOrders();
});

// C. Perbarui Logika Navigasi Tab
tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        tabBtns.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        currentTab = this.getAttribute('data-status');
        renderOrders();
    });
});


// ==========================================
// 3. FUNGSI UPDATE STATUS KE SUPABASE (PATCH)
// ==========================================
async function updateOrderStatusInSupabase(dbId, newStatus, invoiceLabel) {
    // Popup Konfirmasi yang Elegan
    const confirmResult = await Swal.fire({
        title: 'Ubah Status?',
        text: `Ubah status pesanan ${invoiceLabel} menjadi: ${statusLabels[newStatus].text}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6', // Biru
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Ubah!',
        cancelButtonText: 'Batal'
    });

    if (!confirmResult.isConfirmed) return; // Hentikan jika klik Batal

    try {
        const payload = { order_status: newStatus };
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${dbId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Gagal update database');

        // Notifikasi Sukses Pojok Kanan Atas (Toast)
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Status berhasil diperbarui!',
            showConfirmButton: false,
            timer: 2000
        });
        
        fetchOrdersFromSupabase(); // Tarik ulang data
    } catch (error) {
        Swal.fire('Oops!', 'Gagal mengubah status. Periksa koneksi Anda.', 'error');
    }
}

// ==========================================
// FUNGSI REQUEST PICKUP KE N8N (BITESHIP)
// ==========================================
async function requestPickupN8n(invoiceLabel) {
    const confirmResult = await Swal.fire({
        title: 'Panggil Kurir?',
        text: `Panggil kurir ekspedisi sekarang untuk pesanan ${invoiceLabel}? Pastikan barang sudah siap dipacking!`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#8B5CF6', // Ungu Biteship
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Panggil!',
        cancelButtonText: 'Batal'
    });

    if (!confirmResult.isConfirmed) return;

    const WEBHOOK_PICKUP_URL = 'https://n8n-brfcubpy6mnf.jkt2.sumopod.my.id/webhook/request-pickup-biteship';

    try {
        // Tampilkan Popup Loading Interaktif
        Swal.fire({
            title: 'Memanggil Kurir...',
            html: 'Sistem sedang berkomunikasi dengan satelit ekspedisi 📡',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(WEBHOOK_PICKUP_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // Anti blokir ngrok
            },
            body: JSON.stringify({ invoice: invoiceLabel })
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                title: 'Kurir OTW! 🛵',
                text: `Berhasil! Kurir sedang menuju ke toko. No Resi: ${data.biteship_tracking_id}`,
                icon: 'success',
                confirmButtonColor: '#10B981'
            });
        } else {
            Swal.fire('Kendala Pengiriman', 'Terjadi kendala saat memesan kurir. Silakan cek dashboard n8n/Biteship.', 'warning');
        }
    } catch (error) {
        Swal.fire('Koneksi Terputus', 'Gagal terhubung ke server pemanggil kurir.', 'error');
    } finally {
        fetchOrdersFromSupabase(); // Refresh layar agar resi muncul
    }
}


// ==========================================
// 4. LOGIKA NAVIGASI TAB
// ==========================================
tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        tabBtns.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const status = this.getAttribute('data-status');
        renderOrders(status);
    });
});

// ==========================================
// INITIALISASI (JALANKAN SAAT HALAMAN DIBUKA)
// ==========================================
fetchOrdersFromSupabase();


// ==========================================
// 5. FITUR MANAJEMEN PRODUK (HARGA DINAMIS)
// ==========================================
const viewOrders = document.getElementById('viewOrders');
const viewProducts = document.getElementById('viewProducts');
const productsList = document.getElementById('productsList');

// --- A. Logika Pindah Ruangan (Navigasi) ---
function openProductsView() {
    viewOrders.style.display = 'none';
    viewProducts.style.display = 'block';
    fetchProductsAdmin(); // Tarik data harga terbaru saat halaman dibuka
}

function openOrdersView() {
    viewProducts.style.display = 'none';
    viewOrders.style.display = 'block';
    fetchOrdersFromSupabase(); // Tarik data pesanan terbaru
}

// --- B. Tarik Data Produk dari Supabase ---
async function fetchProductsAdmin() {
    productsList.innerHTML = '<div style="text-align:center; padding: 30px; color:#6B7280;"><i class="fas fa-spinner fa-spin" style="font-size:2rem; margin-bottom:10px;"></i><br>Mengambil data produk...</div>';
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?order=weight.asc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${adminToken}` // Gunakan Paspor Admin!
            }
        });
        
        if (!response.ok) throw new Error('Gagal menarik data');
        const data = await response.json();
        renderProductsAdmin(data);
    } catch (error) {
        productsList.innerHTML = '<div style="color:#EF4444; text-align:center; padding: 20px;"><i class="fas fa-exclamation-circle"></i> Gagal memuat produk. Periksa koneksi Anda.</div>';
    }
}

// --- C. Gambar Daftar Produk ke Layar ---
function renderProductsAdmin(products) {
    let html = '';
    products.forEach(prod => {
        html += `
        <div style="background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: #EFF6FF; color: #3B82F6; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.2rem;">
                    <i class="fas fa-cookie"></i>
                </div>
                <div>
                    <strong style="display:block; font-size: 1.1rem; color: #1F2937;">${prod.name}</strong>
                    <span style="color: #6B7280; font-size: 0.9rem;"><i class="fas fa-tag"></i> Varian: <b style="color:#1F2937;">${prod.variant}</b> &nbsp;|&nbsp; <i class="fas fa-weight-hanging"></i> ${prod.weight}g</span>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="display:block; color: #10B981; font-weight: 800; font-size: 1.3rem; margin-bottom: 8px;">${formatRupiah(prod.price)}</span>
                <button onclick="editProductPrice('${prod.id}', '${prod.name} (${prod.variant})', ${prod.price})" style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: background 0.2s;"><i class="fas fa-edit"></i> Ubah Harga</button>
            </div>
        </div>
        `;
    });
    productsList.innerHTML = html;
}

// --- D. Aksi Ubah Harga (PATCH ke Supabase) ---
async function editProductPrice(id, name, currentPrice) {
    // Memunculkan Pop-up Input Angka Modern
    const { value: newPriceStr } = await Swal.fire({
        title: 'Ubah Harga Produk',
        html: `Masukkan harga baru untuk:<br><b style="color:#1F2937; font-size:1.1rem;">📦 ${name}</b><br><br><span style="color:#6B7280; font-size:0.85rem;">Harga saat ini: ${formatRupiah(currentPrice)}</span>`,
        input: 'number',
        inputPlaceholder: 'Ketik angka saja (misal: 16000)',
        showCancelButton: true,
        confirmButtonColor: '#10B981', // Hijau
        cancelButtonColor: '#6B7280',
        confirmButtonText: '<i class="fas fa-save"></i> Simpan Harga',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
            if (!value || isNaN(value) || value <= 0) {
                return '⚠️ Harap masukkan angka harga yang valid!';
            }
        }
    });
    
    // Validasi Jika dibatalkan
    if (!newPriceStr) return; 
    
    const newPrice = parseInt(newPriceStr);
    
    // Jika harga tidak berubah, abaikan
    if (newPrice === currentPrice) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ price: newPrice })
        });

        if (!response.ok) throw new Error('Gagal update harga');
        
        Swal.fire('Sukses!', `Harga ${name} berhasil diperbarui menjadi ${formatRupiah(newPrice)}.`, 'success');
        
        fetchProductsAdmin(); // Refresh layar
    } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan harga. Pastikan sesi login Anda masih aktif.', 'error');
    }
}
// ==========================================
// 6. AUTO-REFRESH & SILENT POLLING (FIXED)
// ==========================================

// 1. Auto-Refresh Database setiap 10 detik (Silent Polling)
setInterval(() => {
    const viewOrdersMode = document.getElementById('viewOrders');
    // Hanya lakukan refresh jika Admin sedang membuka Tab Pesanan
    if (viewOrdersMode && viewOrdersMode.style.display !== 'none') {
        fetchOrdersFromSupabaseSilent();
    }
}, 10000);

// 2. Fungsi Silent Polling dengan Logika Mapping Lengkap
async function fetchOrdersFromSupabaseSilent() {
    try {
        const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${adminToken}` };
        const [ordersResponse, itemsResponse] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/order_items?select=*`, { headers })
        ]);

        if (!ordersResponse.ok || !itemsResponse.ok) return;

        const dbOrders = await ordersResponse.json();
        const dbItems = await itemsResponse.json(); 
        
        // MAPPING DATA: Terjemahkan data Supabase ke format array "orders"
        orders = dbOrders.map(order => {
            const myItems = dbItems.filter(item => item.order_id === order.id);
            
            let itemsTextHtml = '';
            if (myItems.length > 0) {
                itemsTextHtml = myItems.map((item, index) => {
                    const borderBottom = index === myItems.length - 1 ? '' : 'border-bottom: 1px dashed #E5E7EB;';
                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; ${borderBottom}">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: #FFFBEB; color: #D97706; font-weight: 700; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1rem; border: 1px solid #FDE68A;">
                                ${item.qty}x
                            </div>
                            <div>
                                <strong style="display: block; color: #1F2937; font-size: 0.95rem;">${item.product_name}</strong>
                                <span style="color: #6B7280; font-size: 0.85rem;"><i class="fas fa-tag" style="color: #D1D5DB;"></i> Varian: <span style="color: #4B5563; font-weight: 500;">${item.variant}</span></span>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                itemsTextHtml = `<div style="padding: 12px 0; color: #EF4444; font-style: italic; font-size: 0.85rem;">Rincian barang tidak ditemukan</div>`;
            }

            let currentStatus = order.order_status || 'pending';
            if (currentStatus === 'pending' && (order.payment_status === 'settlement' || order.payment_status === 'paid')) {
                currentStatus = 'paid';
            }

            return {
                id: order.id,                           
                invoice: order.invoice_number || order.id, 
                date: new Date(order.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
                customer: order.customer_name || 'Pembeli',
                phone: order.customer_phone || '-',
                items: itemsTextHtml,      
                total: order.grand_total || 0,
                courier: order.courier_choice || 'Kurir Standar',
                status: currentStatus, 
                resi: order.biteship_tracking_id || null
            };
        });
        
        // Populate Dropdown Kurir Otomatis (Hanya jika belum pernah diisi)
        const selectKurir = document.getElementById('filterCourier');
        if (selectKurir && selectKurir.options.length === 1) {
            // Hindari error split jika nama kurir kosong
            const unikKurir = [...new Set(dbOrders.map(item => item.courier_choice ? item.courier_choice.split('-')[0].trim() : ''))].filter(Boolean);
            unikKurir.forEach(kurir => {
                selectKurir.innerHTML += `<option value="${kurir}">${kurir.toUpperCase()}</option>`;
            });
        }

        // Refresh layar dengan data yang baru diperbarui
        renderOrders(); 
        
    } catch (e) {
        // Biarkan diam jika gagal (agar admin tidak terganggu popup error)
        console.error("Silent Polling Error:", e);
    }
}