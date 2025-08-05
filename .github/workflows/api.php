<?php
/**
 * API للتعامل مع طلبات AJAX
 * API for handling AJAX requests
 */

// بدء الجلسة
session_start();

// تعيين headers للاستجابة JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// إعدادات قاعدة البيانات
$config = [
    'admin_user' => 'admin',
    'admin_pass' => 'admin'
];

// التحقق من تسجيل الدخول
function isLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// الحصول على المسار المطلوب
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);

// معالجة الطلبات
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        handlePostRequest($path);
        break;
    case 'GET':
        handleGetRequest($path);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// معالجة طلبات POST
function handlePostRequest($path) {
    global $config;
    
    switch ($path) {
        case '/auth/login':
            $input = json_decode(file_get_contents('php://input'), true);
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            
            if ($username === $config['admin_user'] && $password === $config['admin_pass']) {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_user'] = $username;
                echo json_encode([
                    'success' => true,
                    'message' => 'تم تسجيل الدخول بنجاح',
                    'user' => ['username' => $username]
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة'
                ]);
            }
            break;
            
        case '/auth/logout':
            session_destroy();
            echo json_encode([
                'success' => true,
                'message' => 'تم تسجيل الخروج بنجاح'
            ]);
            break;
            
        case '/notifications/send':
            if (!isLoggedIn()) {
                http_response_code(401);
                echo json_encode(['error' => 'غير مصرح']);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            // هنا يمكن إضافة منطق إرسال الإشعارات
            echo json_encode([
                'success' => true,
                'message' => 'تم إرسال الإشعار بنجاح'
            ]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
}

// معالجة طلبات GET
function handleGetRequest($path) {
    switch ($path) {
        case '/auth/check':
            if (isLoggedIn()) {
                echo json_encode([
                    'authenticated' => true,
                    'user' => ['username' => $_SESSION['admin_user']]
                ]);
            } else {
                echo json_encode(['authenticated' => false]);
            }
            break;
            
        case '/notifications':
            if (!isLoggedIn()) {
                http_response_code(401);
                echo json_encode(['error' => 'غير مصرح']);
                return;
            }
            
            // بيانات وهمية للإشعارات
            echo json_encode([
                'notifications' => [
                    [
                        'id' => 1,
                        'title' => 'إشعار تجريبي',
                        'type' => 'general',
                        'body' => 'هذا إشعار تجريبي',
                        'priority' => 'medium',
                        'created_at' => date('Y-m-d H:i:s')
                    ]
                ]
            ]);
            break;
            
        case '/repositories':
            if (!isLoggedIn()) {
                http_response_code(401);
                echo json_encode(['error' => 'غير مصرح']);
                return;
            }
            
            // بيانات وهمية للمستودعات
            echo json_encode([
                'repositories' => [
                    [
                        'id' => 1,
                        'name' => 'مستودع تجريبي',
                        'url' => 'https://example.com',
                        'description' => 'وصف المستودع',
                        'status' => 'active'
                    ]
                ]
            ]);
            break;
            
        case '/statistics':
            if (!isLoggedIn()) {
                http_response_code(401);
                echo json_encode(['error' => 'غير مصرح']);
                return;
            }
            
            // إحصائيات وهمية
            echo json_encode([
                'stats' => [
                    'totalUsers' => 150,
                    'totalManga' => 45,
                    'totalDownloads' => 2340,
                    'totalNotifications' => 12
                ]
            ]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
}
?>