// متغيرات عامة
const API_BASE = 'http://localhost:8080/api';
let currentUser = null;
let notifications = [];
let repositories = [];
let stats = {};

// عناصر DOM
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const toast = document.getElementById('toast');
const confirmModal = document.getElementById('confirmModal');

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// تهيئة التطبيق
function initializeApp() {
    // إخفاء شاشة لوحة التحكم في البداية
    dashboardScreen.style.display = 'none';
    
    // تعيين القيم الافتراضية للنماذج
    document.getElementById('notificationPriority').value = 'medium';
    document.getElementById('notificationType').value = 'general';
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // تسجيل الدخول
    loginForm.addEventListener('submit', handleLogin);
    
    // تسجيل الخروج
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // النماذج
    document.getElementById('notificationForm').addEventListener('submit', handleSendNotification);
    document.getElementById('repositoryForm').addEventListener('submit', handleAddRepository);
    
    // أزرار التحديث
    document.getElementById('refreshBtn').addEventListener('click', loadDashboardData);
    document.getElementById('refreshNotifications').addEventListener('click', loadNotifications);
    document.getElementById('refreshRepositories').addEventListener('click', loadRepositories);
    document.getElementById('refreshStatsBtn').addEventListener('click', loadStatistics);
    
    // الإجراءات السريعة
    document.getElementById('clearCacheBtn').addEventListener('click', () => performQuickAction('clear-cache'));
    document.getElementById('exportDataBtn').addEventListener('click', () => performQuickAction('export-data'));
    document.getElementById('refreshAllRepos').addEventListener('click', () => performQuickAction('refresh-all-repos'));
    
    // نافذة التأكيد
    document.querySelector('.modal-close').addEventListener('click', hideConfirmModal);
    document.getElementById('confirmCancel').addEventListener('click', hideConfirmModal);
    
    // إغلاق النافذة عند النقر خارجها
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            hideConfirmModal();
        }
    });
}

// التحقق من حالة المصادقة
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/auth/check`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
                currentUser = data.user;
                showDashboard();
                loadDashboardData();
            } else {
                showLogin();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
        showLogin();
    }
}

// تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = data.user;
            hideLoginError();
            showDashboard();
            loadDashboardData();
            showToast('تم تسجيل الدخول بنجاح', 'success');
        } else {
            showLoginError(data.message || 'خطأ في تسجيل الدخول');
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showLoginError('حدث خطأ في الاتصال بالخادم');
    }
}

// تسجيل الخروج
async function handleLogout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        showLogin();
        showToast('تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        showToast('حدث خطأ في تسجيل الخروج', 'error');
    }
}

// عرض شاشة تسجيل الدخول
function showLogin() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
    loginForm.reset();
    hideLoginError();
}

// عرض لوحة التحكم
function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
}

// عرض/إخفاء رسالة خطأ تسجيل الدخول
function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function hideLoginError() {
    loginError.style.display = 'none';
}

// تبديل التبويبات
function switchTab(tabName) {
    // إزالة الفئة النشطة من جميع الأزرار والألواح
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // إضافة الفئة النشطة للتبويب المحدد
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // تحميل البيانات حسب التبويب
    switch(tabName) {
        case 'notifications':
            loadNotifications();
            break;
        case 'repositories':
            loadRepositories();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

// تحميل بيانات لوحة التحكم
async function loadDashboardData() {
    await Promise.all([
        loadNotifications(),
        loadRepositories(),
        loadStatistics()
    ]);
}

// تحميل الإشعارات
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            notifications = data.notifications || [];
            renderNotifications();
        } else {
            showToast('خطأ في تحميل الإشعارات', 'error');
        }
    } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
        showToast('حدث خطأ في تحميل الإشعارات', 'error');
    }
}

// عرض الإشعارات
function renderNotifications() {
    const container = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد إشعارات</div>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item">
            <div class="notification-header">
                <div>
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-meta">
                        <span class="badge badge-${getNotificationTypeColor(notification.type)}">${getNotificationTypeText(notification.type)}</span>
                        <span class="badge badge-${getPriorityColor(notification.priority)}">${getPriorityText(notification.priority)}</span>
                        <span>${formatDateTime(notification.createdAt)}</span>
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-danger action-btn-small" onclick="deleteNotification('${notification.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
            <div class="notification-body">${notification.body}</div>
        </div>
    `).join('');
}

// إرسال إشعار جديد
async function handleSendNotification(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const notificationData = {
        title: document.getElementById('notificationTitle').value,
        body: document.getElementById('notificationBody').value,
        type: document.getElementById('notificationType').value,
        priority: document.getElementById('notificationPriority').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/notifications/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(notificationData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('تم إرسال الإشعار بنجاح', 'success');
            e.target.reset();
            loadNotifications();
            loadStatistics();
        } else {
            showToast(data.message || 'خطأ في إرسال الإشعار', 'error');
        }
    } catch (error) {
        console.error('خطأ في إرسال الإشعار:', error);
        showToast('حدث خطأ في إرسال الإشعار', 'error');
    }
}

// حذف إشعار
async function deleteNotification(notificationId) {
    showConfirmModal(
        'حذف الإشعار',
        'هل أنت متأكد من حذف هذا الإشعار؟',
        async () => {
            try {
                const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    showToast('تم حذف الإشعار بنجاح', 'success');
                    loadNotifications();
                    loadStatistics();
                } else {
                    showToast(data.message || 'خطأ في حذف الإشعار', 'error');
                }
            } catch (error) {
                console.error('خطأ في حذف الإشعار:', error);
                showToast('حدث خطأ في حذف الإشعار', 'error');
            }
        }
    );
}

// تحميل المستودعات
async function loadRepositories() {
    try {
        const response = await fetch(`${API_BASE}/repositories`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            repositories = data.repositories || [];
            renderRepositories();
        } else {
            showToast('خطأ في تحميل المستودعات', 'error');
        }
    } catch (error) {
        console.error('خطأ في تحميل المستودعات:', error);
        showToast('حدث خطأ في تحميل المستودعات', 'error');
    }
}

// عرض المستودعات
function renderRepositories() {
    const container = document.getElementById('repositoriesList');
    
    if (repositories.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد مستودعات</div>';
        return;
    }
    
    container.innerHTML = repositories.map(repo => `
        <div class="repository-item">
            <div class="repository-header">
                <div>
                    <div class="repository-name">${repo.name}</div>
                    <div class="repository-meta">
                        <span class="badge badge-${repo.isActive ? 'success' : 'danger'}">${repo.isActive ? 'نشط' : 'غير نشط'}</span>
                        <span>المصادر: ${repo.sourceCount || 0}</span>
                        <span>آخر تحديث: ${formatDateTime(repo.lastUpdated)}</span>
                    </div>
                </div>
                <div class="repository-actions">
                    <button class="btn btn-${repo.isActive ? 'warning' : 'success'} action-btn-small" 
                            onclick="toggleRepository('${repo.id}', ${!repo.isActive})">
                        <i class="fas fa-${repo.isActive ? 'pause' : 'play'}"></i>
                        ${repo.isActive ? 'إيقاف' : 'تفعيل'}
                    </button>
                    <button class="btn btn-secondary action-btn-small" onclick="refreshRepository('${repo.id}')">
                        <i class="fas fa-sync-alt"></i>
                        تحديث
                    </button>
                    <button class="btn btn-danger action-btn-small" onclick="deleteRepository('${repo.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
            <div class="repository-description">
                <strong>الرابط:</strong> ${repo.url}<br>
                ${repo.description ? `<strong>الوصف:</strong> ${repo.description}` : ''}
            </div>
        </div>
    `).join('');
}

// إضافة مستودع جديد
async function handleAddRepository(e) {
    e.preventDefault();
    
    const repositoryData = {
        name: document.getElementById('repoName').value,
        url: document.getElementById('repoUrl').value,
        description: document.getElementById('repoDescription').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/repositories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(repositoryData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('تم إضافة المستودع بنجاح', 'success');
            e.target.reset();
            loadRepositories();
            loadStatistics();
        } else {
            showToast(data.message || 'خطأ في إضافة المستودع', 'error');
        }
    } catch (error) {
        console.error('خطأ في إضافة المستودع:', error);
        showToast('حدث خطأ في إضافة المستودع', 'error');
    }
}

// تبديل حالة المستودع
async function toggleRepository(repoId, isActive) {
    try {
        const response = await fetch(`${API_BASE}/repositories/${repoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ isActive })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast(`تم ${isActive ? 'تفعيل' : 'إيقاف'} المستودع بنجاح`, 'success');
            loadRepositories();
            loadStatistics();
        } else {
            showToast(data.message || 'خطأ في تحديث المستودع', 'error');
        }
    } catch (error) {
        console.error('خطأ في تحديث المستودع:', error);
        showToast('حدث خطأ في تحديث المستودع', 'error');
    }
}

// تحديث مستودع
async function refreshRepository(repoId) {
    try {
        const response = await fetch(`${API_BASE}/repositories/${repoId}/refresh`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('تم تحديث المستودع بنجاح', 'success');
            loadRepositories();
        } else {
            showToast(data.message || 'خطأ في تحديث المستودع', 'error');
        }
    } catch (error) {
        console.error('خطأ في تحديث المستودع:', error);
        showToast('حدث خطأ في تحديث المستودع', 'error');
    }
}

// حذف مستودع
async function deleteRepository(repoId) {
    showConfirmModal(
        'حذف المستودع',
        'هل أنت متأكد من حذف هذا المستودع؟ هذا الإجراء لا يمكن التراجع عنه.',
        async () => {
            try {
                const response = await fetch(`${API_BASE}/repositories/${repoId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    showToast('تم حذف المستودع بنجاح', 'success');
                    loadRepositories();
                    loadStatistics();
                } else {
                    showToast(data.message || 'خطأ في حذف المستودع', 'error');
                }
            } catch (error) {
                console.error('خطأ في حذف المستودع:', error);
                showToast('حدث خطأ في حذف المستودع', 'error');
            }
        }
    );
}

// تحميل الإحصائيات
async function loadStatistics() {
    try {
        const [notificationStats, repositoryStats] = await Promise.all([
            fetch(`${API_BASE}/notifications/stats`, { credentials: 'include' }),
            fetch(`${API_BASE}/repositories/stats`, { credentials: 'include' })
        ]);
        
        if (notificationStats.ok && repositoryStats.ok) {
            const notificationData = await notificationStats.json();
            const repositoryData = await repositoryStats.json();
            
            stats = {
                notifications: notificationData.stats,
                repositories: repositoryData.stats
            };
            
            renderStatistics();
        } else {
            showToast('خطأ في تحميل الإحصائيات', 'error');
        }
    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
        showToast('حدث خطأ في تحميل الإحصائيات', 'error');
    }
}

// عرض الإحصائيات
function renderStatistics() {
    if (!stats.notifications || !stats.repositories) return;
    
    document.getElementById('totalNotifications').textContent = stats.notifications.total || 0;
    document.getElementById('sentNotifications').textContent = stats.notifications.sent || 0;
    document.getElementById('totalRepositories').textContent = stats.repositories.total || 0;
    document.getElementById('activeRepositories').textContent = stats.repositories.active || 0;
}

// تنفيذ الإجراءات السريعة
async function performQuickAction(action) {
    let endpoint = '';
    let message = '';
    
    switch(action) {
        case 'clear-cache':
            endpoint = '/quick-actions/clear-cache';
            message = 'تم تنظيف الذاكرة المؤقتة بنجاح';
            break;
        case 'export-data':
            endpoint = '/quick-actions/export-data';
            message = 'تم تصدير البيانات بنجاح';
            break;
        case 'refresh-all-repos':
            endpoint = '/repositories/refresh-all';
            message = 'تم تحديث جميع المستودعات بنجاح';
            break;
        default:
            return;
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast(message, 'success');
            if (action === 'refresh-all-repos') {
                loadRepositories();
            }
        } else {
            showToast(data.message || 'حدث خطأ في تنفيذ العملية', 'error');
        }
    } catch (error) {
        console.error('خطأ في تنفيذ الإجراء:', error);
        showToast('حدث خطأ في تنفيذ العملية', 'error');
    }
}

// عرض رسالة تنبيه
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// عرض نافذة التأكيد
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmOk');
    confirmBtn.onclick = () => {
        hideConfirmModal();
        onConfirm();
    };
    
    confirmModal.style.display = 'flex';
}

// إخفاء نافذة التأكيد
function hideConfirmModal() {
    confirmModal.style.display = 'none';
}

// دوال مساعدة
function getNotificationTypeText(type) {
    const types = {
        general: 'عام',
        update: 'تحديث',
        newManga: 'مانجا جديدة',
        maintenance: 'صيانة'
    };
    return types[type] || type;
}

function getNotificationTypeColor(type) {
    const colors = {
        general: 'info',
        update: 'warning',
        newManga: 'success',
        maintenance: 'danger'
    };
    return colors[type] || 'info';
}

function getPriorityText(priority) {
    const priorities = {
        low: 'منخفضة',
        medium: 'متوسطة',
        high: 'عالية'
    };
    return priorities[priority] || priority;
}

function getPriorityColor(priority) {
    const colors = {
        low: 'info',
        medium: 'warning',
        high: 'danger'
    };
    return colors[priority] || 'info';
}

function formatDateTime(dateString) {
    if (!dateString) return 'غير محدد';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}