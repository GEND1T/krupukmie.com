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
    if (confirm("Apakah Anda yakin ingin keluar dari Seller Dashboard?")) {
        sessionStorage.removeItem('krupukmie_admin_token');
        window.location.href = 'login.html';
    }
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
    'pending': { text: 'Belum Bayar', class: 'pending' },
    'paid': { text: 'Menunggu Konfirmasi', class: 'paid' },
    'processing': { text: 'Diproses / Dikemas', class: 'processing' },
    'shipped': { text: 'Sedang Dikirim', class: 'shipped' },
    'completed': { text: 'Selesai', class: 'completed' },
    'cancelled': { text: 'Dibatalkan', class: 'cancelled' }
};

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

// ==========================================
// 1. FUNGSI TARIK DATA DARI SUPABASE (GET JOINED)
// ==========================================
async function fetchOrdersFromSupabase() {
    orderContainer.innerHTML = `<div class="empty-state">
        <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #F59E0B; margin-bottom: 15px;"></i>
        <h3>Menyinkronkan Database & Rincian Pesanan...</h3>
    </div>`;

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
            // Logika Status Otomatis Midtrans
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
                
                // MASUKKAN HTML BARANG YANG SUDAH DIRANGKAI DI SINI
                items: itemsTextHtml,      
                
                total: order.grand_total || 0,
                courier: order.courier_choice || 'Kurir Standar',
                status: currentStatus, 
                resi: order.biteship_tracking_id || null
            };
        });

        // Tampilkan pesanan sesuai tab yang sedang aktif
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-status');
        renderOrders(activeTab);

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
function renderOrders(filterStatus = 'all') {
    orderContainer.innerHTML = '';
    
    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

    if (filteredOrders.length === 0) {
        orderContainer.innerHTML = `<div class="empty-state">
            <i class="fas fa-box-open" style="font-size: 3rem; color: #D1D5DB; margin-bottom: 15px;"></i>
            <h3>Tidak ada pesanan</h3>
            <p>Belum ada pesanan di kategori ini.</p>
        </div>`;
        return;
    }

    filteredOrders.forEach(order => {
        // Jika status DB tidak ada di kamus kita, set default ke pending
        const badge = statusLabels[order.status] || statusLabels['pending']; 
        
        // PERBAIKAN: Tambahkan tanda kutip tunggal pada '${order.id}'
        let actionButtons = '';
        if (order.status === 'paid') {
            actionButtons = `<button class="btn-action btn-confirm" onclick="updateOrderStatusInSupabase('${order.id}', 'processing', '${order.invoice}')"><i class="fas fa-check"></i> Konfirmasi Pesanan</button>`;
        } else if (order.status === 'processing') {
            // Gunakan fungsi requestPickupN8n yang baru!
            actionButtons = `<button class="btn-action btn-process" onclick="requestPickupN8n('${order.invoice}')"><i class="fas fa-truck-loading"></i> Kirim (Request Pickup)</button>`;
        } else if (order.status === 'shipped') {
            actionButtons = `<button class="btn-action btn-ship" onclick="updateOrderStatusInSupabase('${order.id}', 'completed', '${order.invoice}')"><i class="fas fa-flag-checkered"></i> Tandai Selesai</button>`;
        }

        // ... (kode pengecekan actionButtons tetap di atas sini) ...

        // Tampilkan Resi dengan gaya yang lebih rapi
        // Desain Resi yang lebih menonjol
        const resiHtml = order.resi ? `<div style="margin-top: 8px; padding: 6px 12px; background: #EEF2FF; border: 1px dashed #6366F1; border-radius: 6px; font-size: 0.85rem; color: #4F46E5; display: inline-block; font-weight: 500;"><i class="fas fa-barcode" style="margin-right: 5px;"></i> ${order.resi}</div>` : '';

        // Desain Kartu Pesanan Profesional
        const cardHtml = `
            <div class="order-card" style="padding: 0; overflow: hidden; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                
                <div style="background: #F9FAFB; padding: 15px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #1F2937; font-size: 1.05rem;"><i class="fas fa-file-invoice" style="color: #9CA3AF; margin-right: 5px;"></i> ${order.invoice}</strong>
                        <span style="font-size: 0.85rem; color: #6B7280; margin-left: 12px;"><i class="far fa-clock"></i> ${order.date}</span>
                    </div>
                    <span class="badge ${badge.class}" style="font-size: 0.75rem; padding: 6px 12px;">${badge.text}</span>
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

// ==========================================
// 3. FUNGSI UPDATE STATUS KE SUPABASE (PATCH)
// ==========================================
async function updateOrderStatusInSupabase(dbId, newStatus, invoiceLabel) {
    if (!confirm(`Ubah status pesanan ${invoiceLabel} menjadi: ${statusLabels[newStatus].text}?`)) return;

    try {
        // PERBAIKAN: Gunakan order_status, bukan status, agar sesuai dengan DB
        const payload = { order_status: newStatus };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${dbId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${adminToken}`, // PASPOR RAHASIA DARI LOGIN
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Gagal update database');

        alert('Status berhasil diperbarui!');
        
        // Tarik ulang data terbaru dari server agar tampilan tersinkronisasi
        fetchOrdersFromSupabase();

    } catch (error) {
        console.error("Update Error:", error);
        alert('Gagal mengubah status. Periksa koneksi Anda.');
    }
}

// ==========================================
// FUNGSI REQUEST PICKUP KE N8N (BITESHIP)
// ==========================================
async function requestPickupN8n(invoiceLabel) {
    if (!confirm(`Panggil kurir Biteship sekarang untuk pesanan ${invoiceLabel}? Pastikan barang sudah siap dipacking!`)) return;

    // GANTI DENGAN URL WEBHOOK N8N "REQUEST PICKUP" ANDA
    const WEBHOOK_PICKUP_URL = 'https://earnestine-fruitful-arla.ngrok-free.dev/webhook/request-pickup-biteship';

    try {
        // Beri efek loading di layar
        orderContainer.innerHTML = `<div class="empty-state">
            <i class="fas fa-motorcycle fa-spin" style="font-size: 3rem; color: #8B5CF6; margin-bottom: 15px;"></i>
            <h3>Sedang memanggil kurir...</h3>
            <p>Mohon tunggu, sedang berkomunikasi dengan sistem ekspedisi.</p>
        </div>`;

        const response = await fetch(WEBHOOK_PICKUP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoice: invoiceLabel })
        });

        const data = await response.json();

        if (data.success) {
            alert(`Berhasil! Kurir sedang menuju ke toko.\nNo Resi: ${data.biteship_tracking_id}`);
        } else {
            alert("Terjadi kendala saat memesan kurir. Silakan cek dashboard n8n/Biteship.");
        }
    } catch (error) {
        console.error("Pickup Error:", error);
        alert("Gagal terhubung ke server pemanggil kurir.");
    } finally {
        // Tarik ulang data dari Supabase agar Resi muncul di layar!
        fetchOrdersFromSupabase();
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

