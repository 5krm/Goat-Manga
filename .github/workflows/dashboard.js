/**
 * ملف JavaScript للوحة تحكم FreeGoat Manga
 * Dashboard JavaScript for FreeGoat Manga Admin Panel
 */

// المتغيرات العامة
let currentTab = 'notifications';
let isLoading = false;

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
    setupEventListeners();
});

/**
 * تهيئة لوحة التحكم
 */
function initializeDashboard() {
    // إظهار التبويب الافتراضي
    switchTab('notifications');
    
    // تحديث الوقت
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // تحميل الإحصائيات
    loadStatistics();
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    // أزرار التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // نموذج إرسال الإشعارات
    const notificationForm = document.getElementById('notification-form');
    if (notificationForm) {
        notificationForm.addEventListener('submit', handleNotificationSubmit);
    }
    
    // نموذج إضافة المستخدمين
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }
    
    // نموذج إضافة المانجا
    const mangaForm = document.getElementById('manga-form');
    if (mangaForm) {
        mangaForm.addEventListener('submit', handleMangaSubmit);
    }
    
    // أزرار الإجراءات السريعة
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
    
    // أزرار التحديث
    document.querySelectorAll('.refresh-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            refreshSection(section);
        });
    });
}

/**
 * تبديل التبويبات
 */
function switchTab(tabId) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // إزالة الحالة النشطة من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار التبويب المحدد
    const targetPane = document.getElementById(tabId + '-tab');
    const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (targetPane && targetBtn) {
        targetPane.classList.add('active');
        targetBtn.classList.add('active');
        currentTab = tabId;
        
        // تحميل بيانات التبويب
        loadTabData(tabId);
    }
}

/**
 * تحميل بيانات التبويب
 */
function loadTabData(tabId) {
    switch(tabId) {
        case 'notifications':
            loadNotifications();
            break;
        case 'users':
            loadUsers();
            break;
        case 'manga':
            loadManga();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

/**
 * تحميل بيانات لوحة التحكم
 */
function loadDashboardData() {
    loadStatistics();
    loadRecentActivity();
}

/**
 * تحميل الإحصائيات
 */
function loadStatistics() {
    // محاكاة تحميل الإحصائيات
    const stats = {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        totalManga: Math.floor(Math.random() * 200) + 100,
        totalChapters: Math.floor(Math.random() * 5000) + 2000,
        activeUsers: Math.floor(Math.random() * 100) + 50
    };
    
    updateStatistics(stats);
}

/**
 * تحديث الإحصائيات في الواجهة
 */
function updateStatistics(stats) {
    const elements = {
        'total-users': stats.totalUsers,
        'total-manga': stats.totalManga,
        'total-chapters': stats.totalChapters,
        'active-users': stats.activeUsers
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, 0, elements[id], 1000);
        }
    });
}

/**
 * تحريك الأرقام
 */
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current.toLocaleString('ar-EG');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * تحميل الإشعارات
 */
function loadNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    // محاكاة تحميل الإشعارات
    const notifications = [
        {
            id: 1,
            title: 'إشعار جديد',
            message: 'تم إضافة فصل جديد من مانجا One Piece',
            type: 'info',
            date: new Date().toLocaleDateString('ar-EG')
        },
        {
            id: 2,
            title: 'تحديث النظام',
            message: 'تم تحديث النظام إلى الإصدار الجديد',
            type: 'success',
            date: new Date().toLocaleDateString('ar-EG')
        }
    ];
    
    renderNotifications(notifications, container);
}

/**
 * عرض الإشعارات
 */
function renderNotifications(notifications, container) {
    container.innerHTML = '';
    
    if (notifications.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">لا توجد إشعارات</p>';
        return;
    }
    
    notifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        container.appendChild(notificationElement);
    });
}

/**
 * إنشاء عنصر إشعار
 */
function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = 'notification-item';
    div.innerHTML = `
        <div class="notification-content">
            <h5>${notification.title}</h5>
            <p>${notification.message}</p>
            <small class="text-muted">${notification.date}</small>
        </div>
        <div class="notification-actions">
            <button class="btn btn-sm btn-danger" onclick="deleteNotification(${notification.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

/**
 * معالجة إرسال الإشعارات
 */
function handleNotificationSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const notification = {
        title: formData.get('title'),
        message: formData.get('message'),
        type: formData.get('type'),
        priority: formData.get('priority')
    };
    
    if (!notification.title || !notification.message) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // محاكاة إرسال الإشعار
    showLoading('إرسال الإشعار...');
    
    setTimeout(() => {
        hideLoading();
        showToast('تم إرسال الإشعار بنجاح', 'success');
        event.target.reset();
        loadNotifications();
    }, 1000);
}

/**
 * تحميل المستخدمين
 */
function loadUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    // محاكاة تحميل المستخدمين
    const users = [
        {
            id: 1,
            username: 'user1',
            email: 'user1@example.com',
            role: 'user',
            status: 'active',
            joinDate: '2024-01-15'
        },
        {
            id: 2,
            username: 'moderator1',
            email: 'mod1@example.com',
            role: 'moderator',
            status: 'active',
            joinDate: '2024-01-10'
        }
    ];
    
    renderUsers(users, container);
}

/**
 * عرض المستخدمين
 */
function renderUsers(users, container) {
    container.innerHTML = '';
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">لا يوجد مستخدمين</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>اسم المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>تاريخ الانضمام</th>
                <th>الإجراءات</th>
            </tr>
        </thead>
        <tbody>
            ${users.map(user => `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td><span class="badge badge-primary">${user.role}</span></td>
                    <td><span class="badge badge-success">${user.status}</span></td>
                    <td>${user.joinDate}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.appendChild(table);
}

/**
 * معالجة إضافة المستخدمين
 */
function handleUserSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const user = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    if (!user.username || !user.email || !user.password) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // محاكاة إضافة المستخدم
    showLoading('إضافة المستخدم...');
    
    setTimeout(() => {
        hideLoading();
        showToast('تم إضافة المستخدم بنجاح', 'success');
        event.target.reset();
        loadUsers();
    }, 1000);
}

/**
 * تحميل المانجا
 */
function loadManga() {
    const container = document.getElementById('manga-list');
    if (!container) return;
    
    // محاكاة تحميل المانجا
    const manga = [
        {
            id: 1,
            title: 'One Piece',
            author: 'Eiichiro Oda',
            status: 'ongoing',
            chapters: 1100,
            rating: 9.5
        },
        {
            id: 2,
            title: 'Naruto',
            author: 'Masashi Kishimoto',
            status: 'completed',
            chapters: 700,
            rating: 9.0
        }
    ];
    
    renderManga(manga, container);
}

/**
 * عرض المانجا
 */
function renderManga(manga, container) {
    container.innerHTML = '';
    
    if (manga.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">لا توجد مانجا</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>العنوان</th>
                <th>المؤلف</th>
                <th>الحالة</th>
                <th>عدد الفصول</th>
                <th>التقييم</th>
                <th>الإجراءات</th>
            </tr>
        </thead>
        <tbody>
            ${manga.map(item => `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.author}</td>
                    <td><span class="badge badge-${item.status === 'ongoing' ? 'success' : 'info'}">${item.status}</span></td>
                    <td>${item.chapters}</td>
                    <td>${item.rating}/10</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editManga(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteManga(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.appendChild(table);
}

/**
 * معالجة إضافة المانجا
 */
function handleMangaSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const manga = {
        title: formData.get('title'),
        author: formData.get('author'),
        description: formData.get('description'),
        status: formData.get('status')
    };
    
    if (!manga.title || !manga.author) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // محاكاة إضافة المانجا
    showLoading('إضافة المانجا...');
    
    setTimeout(() => {
        hideLoading();
        showToast('تم إضافة المانجا بنجاح', 'success');
        event.target.reset();
        loadManga();
    }, 1000);
}

/**
 * تحميل الإعدادات
 */
function loadSettings() {
    // تحميل الإعدادات الحالية
    const settings = {
        siteName: 'FreeGoat Manga',
        siteDescription: 'موقع مانجا مجاني',
        allowRegistration: true,
        enableNotifications: true,
        maintenanceMode: false
    };
    
    // تحديث النموذج بالإعدادات الحالية
    Object.keys(settings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = settings[key];
            } else {
                element.value = settings[key];
            }
        }
    });
}

/**
 * معالجة الإجراءات السريعة
 */
function handleQuickAction(action) {
    switch(action) {
        case 'backup':
            performBackup();
            break;
        case 'clear-cache':
            clearCache();
            break;
        case 'update-system':
            updateSystem();
            break;
        case 'send-notification':
            switchTab('notifications');
            break;
    }
}

/**
 * تنفيذ النسخ الاحتياطي
 */
function performBackup() {
    showLoading('جاري إنشاء النسخة الاحتياطية...');
    
    setTimeout(() => {
        hideLoading();
        showToast('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
    }, 3000);
}

/**
 * مسح الذاكرة المؤقتة
 */
function clearCache() {
    showLoading('جاري مسح الذاكرة المؤقتة...');
    
    setTimeout(() => {
        hideLoading();
        showToast('تم مسح الذاكرة المؤقتة بنجاح', 'success');
    }, 1500);
}

/**
 * تحديث النظام
 */
function updateSystem() {
    showLoading('جاري البحث عن التحديثات...');
    
    setTimeout(() => {
        hideLoading();
        showToast('النظام محدث إلى أحدث إصدار', 'info');
    }, 2000);
}

/**
 * تحديث قسم معين
 */
function refreshSection(section) {
    switch(section) {
        case 'notifications':
            loadNotifications();
            break;
        case 'users':
            loadUsers();
            break;
        case 'manga':
            loadManga();
            break;
        case 'stats':
            loadStatistics();
            break;
    }
    
    showToast('تم تحديث البيانات', 'success');
}

/**
 * تحديث التاريخ والوقت
 */
function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('ar-EG');
    }
}

/**
 * إظهار رسالة Toast
 */
function showToast(message, type = 'info') {
    // إزالة أي toast موجود
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // إظهار التوست
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // إخفاء التوست بعد 3 ثوان
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * إظهار شاشة التحميل
 */
function showLoading(message = 'جاري التحميل...') {
    if (isLoading) return;
    
    isLoading = true;
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        text-align: center;
    `;
    
    document.body.appendChild(loading);
}

/**
 * إخفاء شاشة التحميل
 */
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
        isLoading = false;
    }
}

/**
 * حذف إشعار
 */
function deleteNotification(id) {
    if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
        showToast('تم حذف الإشعار', 'success');
        loadNotifications();
    }
}

/**
 * تعديل مستخدم
 */
function editUser(id) {
    showToast('ميزة التعديل قيد التطوير', 'info');
}

/**
 * حذف مستخدم
 */
function deleteUser(id) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        showToast('تم حذف المستخدم', 'success');
        loadUsers();
    }
}

/**
 * تعديل مانجا
 */
function editManga(id) {
    showToast('ميزة التعديل قيد التطوير', 'info');
}

/**
 * حذف مانجا
 */
function deleteManga(id) {
    if (confirm('هل أنت متأكد من حذف هذه المانجا؟')) {
        showToast('تم حذف المانجا', 'success');
        loadManga();
    }
}

/**
 * تسجيل الخروج
 */
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        window.location.href = 'index.php?action=logout';
    }
}