<?php
/**
 * لوحة تحكم إدارة FreeGoat Manga
 * Admin Dashboard for FreeGoat Manga
 * 
 * @author FreeGoat Team
 * @version 1.0
 */

// بدء الجلسة
session_start();

// إعدادات قاعدة البيانات
$config = [
    'db_host' => 'localhost',
    'db_name' => 'freegoat_manga',
    'db_user' => 'root',
    'db_pass' => '',
    'admin_user' => 'admin',
    'admin_pass' => 'admin'
];

// التحقق من تسجيل الدخول
function isLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// معالجة تسجيل الدخول
if ($_POST && isset($_POST['action']) && $_POST['action'] === 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($username === $config['admin_user'] && $password === $config['admin_pass']) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_user'] = $username;
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    } else {
        $login_error = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    }
}

// معالجة تسجيل الخروج
if ($_GET && isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// إذا لم يكن مسجل دخول، عرض نموذج تسجيل الدخول
if (!isLoggedIn()) {
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم Goat Manga</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        /* تصميم صفحة تسجيل الدخول */
        .login-page {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-container {
            background: white;
            padding: 2.5rem;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 420px;
            text-align: center;
            animation: slideUp 0.6s ease;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .login-header {
            margin-bottom: 2.5rem;
        }
        
        .login-header .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .login-header .logo i {
            font-size: 2rem;
            color: white;
        }
        
        .login-header h1 {
            color: #333;
            margin-bottom: 0.5rem;
            font-size: 1.8rem;
            font-weight: 700;
        }
        
        .login-header p {
            color: #666;
            font-size: 1rem;
        }
        
        .login-form .form-group {
            margin-bottom: 1.5rem;
            text-align: right;
        }
        
        .login-form .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 600;
            font-size: 0.95rem;
        }
        
        .login-form .form-group input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }
        
        .login-form .form-group input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .login-btn {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .login-btn:active {
            transform: translateY(0);
        }
        
        .error-message {
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            font-weight: 500;
            animation: shake 0.5s ease;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    </style>
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-header">
            <div class="logo">
                <i class="fas fa-shield-alt"></i>
            </div>
            <h1>لوحة تحكم الإدارة</h1>
            <p>FreeGoat Manga Admin Dashboard</p>
        </div>
        
        <?php if (isset($login_error)): ?>
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <?php echo htmlspecialchars($login_error); ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" class="login-form">
            <input type="hidden" name="action" value="login">
            
            <div class="form-group">
                <label for="username">اسم المستخدم</label>
                <input type="text" id="username" name="username" required placeholder="أدخل اسم المستخدم">
            </div>
            
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" name="password" required placeholder="أدخل كلمة المرور">
            </div>
            
            <button type="submit" class="login-btn">
                <i class="fas fa-sign-in-alt"></i>
                تسجيل الدخول
            </button>
        </form>
    </div>
</body>
</html>
<?php
    exit;
}

// إذا كان مسجل دخول، عرض لوحة التحكم
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم FreeGoat Manga</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="dashboard.css" rel="stylesheet">
</head>
<body>
    <div class="dashboard">
        <!-- شريط التنقل العلوي -->
        <nav class="top-nav">
            <div class="nav-brand">
                <i class="fas fa-tachometer-alt"></i>
                <span>لوحة تحكم الإدارة</span>
            </div>
            <div class="nav-actions">
                <span class="welcome-text">مرحباً، <?php echo htmlspecialchars($_SESSION['admin_user']); ?></span>
                <a href="?action=logout" class="nav-btn" title="تسجيل الخروج">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            </div>
        </nav>
        
        <!-- المحتوى الرئيسي -->
        <div class="main-content">
            <!-- التبويبات -->
            <div class="tabs">
                <button class="tab-btn active" data-tab="dashboard">
                    <i class="fas fa-home"></i>
                    الرئيسية
                </button>
                <button class="tab-btn" data-tab="notifications">
                    <i class="fas fa-bell"></i>
                    الإشعارات
                </button>
                <button class="tab-btn" data-tab="users">
                    <i class="fas fa-users"></i>
                    المستخدمين
                </button>
                <button class="tab-btn" data-tab="manga">
                    <i class="fas fa-book"></i>
                    المانجا
                </button>
                <button class="tab-btn" data-tab="settings">
                    <i class="fas fa-cog"></i>
                    الإعدادات
                </button>
            </div>
            
            <!-- محتوى التبويبات -->
            <div class="tab-content">
                <!-- تبويب الرئيسية -->
                <div id="dashboard" class="tab-pane active">
                    <div class="section-header">
                        <h2><i class="fas fa-home"></i> لوحة التحكم الرئيسية</h2>
                    </div>
                    
                    <!-- بطاقات الإحصائيات -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="totalUsers">0</h3>
                                <p>إجمالي المستخدمين</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="totalManga">0</h3>
                                <p>إجمالي المانجا</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-download"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="totalDownloads">0</h3>
                                <p>إجمالي التحميلات</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="totalNotifications">0</h3>
                                <p>الإشعارات المرسلة</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- الإجراءات السريعة -->
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-bolt"></i> الإجراءات السريعة</h3>
                        </div>
                        <div class="card-body">
                            <div class="quick-actions">
                                <button class="btn btn-primary" onclick="sendNotification()">
                                    <i class="fas fa-paper-plane"></i>
                                    إرسال إشعار
                                </button>
                                <button class="btn btn-warning" onclick="clearCache()">
                                    <i class="fas fa-trash"></i>
                                    مسح الذاكرة المؤقتة
                                </button>
                                <button class="btn btn-info" onclick="exportData()">
                                    <i class="fas fa-download"></i>
                                    تصدير البيانات
                                </button>
                                <button class="btn btn-success" onclick="refreshStats()">
                                    <i class="fas fa-sync-alt"></i>
                                    تحديث الإحصائيات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- تبويب الإشعارات -->
                <div id="notifications" class="tab-pane">
                    <div class="section-header">
                        <h2><i class="fas fa-bell"></i> إدارة الإشعارات</h2>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-plus"></i> إرسال إشعار جديد</h3>
                        </div>
                        <div class="card-body">
                            <form id="notificationForm">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="notificationTitle">عنوان الإشعار</label>
                                        <input type="text" id="notificationTitle" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="notificationType">نوع الإشعار</label>
                                        <select id="notificationType">
                                            <option value="general">عام</option>
                                            <option value="update">تحديث التطبيق</option>
                                            <option value="newManga">مانجا جديدة</option>
                                            <option value="maintenance">صيانة</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="notificationBody">محتوى الإشعار</label>
                                    <textarea id="notificationBody" rows="3" required></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-paper-plane"></i>
                                        إرسال الإشعار
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <!-- تبويب المستخدمين -->
                <div id="users" class="tab-pane">
                    <div class="section-header">
                        <h2><i class="fas fa-users"></i> إدارة المستخدمين</h2>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-list"></i> قائمة المستخدمين</h3>
                        </div>
                        <div class="card-body">
                            <div id="usersList">
                                <p>جاري تحميل قائمة المستخدمين...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- تبويب المانجا -->
                <div id="manga" class="tab-pane">
                    <div class="section-header">
                        <h2><i class="fas fa-book"></i> إدارة المانجا</h2>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-list"></i> قائمة المانجا</h3>
                        </div>
                        <div class="card-body">
                            <div id="mangaList">
                                <p>جاري تحميل قائمة المانجا...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- تبويب الإعدادات -->
                <div id="settings" class="tab-pane">
                    <div class="section-header">
                        <h2><i class="fas fa-cog"></i> إعدادات النظام</h2>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-wrench"></i> الإعدادات العامة</h3>
                        </div>
                        <div class="card-body">
                            <form id="settingsForm">
                                <div class="form-group">
                                    <label for="appName">اسم التطبيق</label>
                                    <input type="text" id="appName" value="FreeGoat Manga">
                                </div>
                                <div class="form-group">
                                    <label for="appVersion">إصدار التطبيق</label>
                                    <input type="text" id="appVersion" value="1.0.0">
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i>
                                        حفظ الإعدادات
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Toast للرسائل -->
    <div id="toast" class="toast"></div>
    
    <script src="dashboard.js"></script>
</body>
</html>