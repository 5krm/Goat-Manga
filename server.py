#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Admin Dashboard Server for FreeGoat Manga
A simple Python server to test the admin dashboard functionality
"""

import json
import time
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os
import mimetypes

# Global variables for data storage
current_user = None
is_authenticated = False
notification_id = 3
repository_id = 3

# Sample data
notifications = [
    {
        "id": "1",
        "title": "مرحباً بك في لوحة التحكم",
        "body": "تم تفعيل لوحة التحكم بنجاح. يمكنك الآن إدارة الإشعارات والمستودعات.",
        "type": "general",
        "priority": "medium",
        "createdAt": (datetime.now() - timedelta(hours=2)).isoformat(),
        "sent": True
    },
    {
        "id": "2",
        "title": "تحديث النظام",
        "body": "تم تحديث النظام إلى الإصدار الجديد مع تحسينات في الأداء.",
        "type": "update",
        "priority": "high",
        "createdAt": (datetime.now() - timedelta(hours=24)).isoformat(),
        "sent": True
    }
]

repositories = [
    {
        "id": "1",
        "name": "مستودع المانجا الرئيسي",
        "url": "https://example.com/manga-repo",
        "description": "المستودع الرئيسي لمصادر المانجا",
        "isActive": True,
        "sourceCount": 150,
        "lastUpdated": (datetime.now() - timedelta(hours=6)).isoformat()
    },
    {
        "id": "2",
        "name": "مستودع المانجا الثانوي",
        "url": "https://example.com/manga-repo-2",
        "description": "مستودع إضافي للمصادر الجديدة",
        "isActive": False,
        "sourceCount": 75,
        "lastUpdated": (datetime.now() - timedelta(hours=12)).isoformat()
    }
]

class AdminHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Credentials', 'true')
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        response = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def send_file_response(self, file_path):
        """Send file response"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type is None:
                mime_type = 'application/octet-stream'
            
            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'File not found')
    
    def get_request_body(self):
        """Get request body as JSON"""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length)
            return json.loads(body.decode('utf-8'))
        return {}
    
    def require_auth(self):
        """Check if user is authenticated"""
        global is_authenticated
        if not is_authenticated:
            self.send_json_response({
                "success": False,
                "message": "غير مصرح بالوصول"
            }, 401)
            return False
        return True
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # API routes
        if path.startswith('/api/'):
            self.handle_api_get(path)
        else:
            # Serve static files
            if path == '/' or path == '':
                file_path = 'index.html'
            else:
                file_path = path.lstrip('/')
            
            if os.path.exists(file_path):
                self.send_file_response(file_path)
            else:
                self.send_response(404)
                self.end_headers()
    
    def handle_api_get(self, path):
        """Handle API GET requests"""
        global notifications, repositories, is_authenticated, current_user
        
        if path == '/api/auth/check':
            self.send_json_response({
                "authenticated": is_authenticated,
                "user": current_user if is_authenticated else None
            })
        
        elif path == '/api/notifications':
            if not self.require_auth():
                return
            self.send_json_response({"notifications": notifications})
        
        elif path == '/api/notifications/stats':
            if not self.require_auth():
                return
            total = len(notifications)
            sent = sum(1 for n in notifications if n.get('sent', False))
            self.send_json_response({"stats": {"total": total, "sent": sent}})
        
        elif path == '/api/repositories':
            if not self.require_auth():
                return
            self.send_json_response({"repositories": repositories})
        
        elif path == '/api/repositories/stats':
            if not self.require_auth():
                return
            total = len(repositories)
            active = sum(1 for r in repositories if r.get('isActive', False))
            self.send_json_response({"stats": {"total": total, "active": active}})
        
        else:
            self.send_json_response({"success": False, "message": "Endpoint not found"}, 404)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if not path.startswith('/api/'):
            self.send_response(404)
            self.end_headers()
            return
        
        self.handle_api_post(path)
    
    def handle_api_post(self, path):
        """Handle API POST requests"""
        global notifications, repositories, is_authenticated, current_user, notification_id, repository_id
        
        if path == '/api/auth/login':
            data = self.get_request_body()
            print(f"تم استلام بيانات تسجيل الدخول: {data}")
            username = data.get('username', '')
            password = data.get('password', '')
            print(f"اسم المستخدم: '{username}', كلمة المرور: '{password}'")
            
            if username == 'admin' and password == 'admin':
                is_authenticated = True
                current_user = {
                    "id": "1",
                    "username": "admin",
                    "role": "administrator"
                }
                self.send_json_response({
                    "success": True,
                    "message": "تم تسجيل الدخول بنجاح",
                    "user": current_user
                })
            else:
                self.send_json_response({
                    "success": False,
                    "message": "اسم المستخدم أو كلمة المرور غير صحيحة"
                }, 401)
        
        elif path == '/api/auth/logout':
            is_authenticated = False
            current_user = None
            self.send_json_response({
                "success": True,
                "message": "تم تسجيل الخروج بنجاح"
            })
        
        elif path == '/api/notifications/send':
            if not self.require_auth():
                return
            
            data = self.get_request_body()
            notification = {
                "id": str(notification_id),
                "title": data.get('title', ''),
                "body": data.get('body', ''),
                "type": data.get('type', 'general'),
                "priority": data.get('priority', 'medium'),
                "createdAt": datetime.now().isoformat(),
                "sent": True
            }
            notifications.insert(0, notification)
            notification_id += 1
            
            self.send_json_response({
                "success": True,
                "message": "تم إرسال الإشعار بنجاح"
            })
        
        elif path == '/api/repositories':
            if not self.require_auth():
                return
            
            data = self.get_request_body()
            repository = {
                "id": str(repository_id),
                "name": data.get('name', ''),
                "url": data.get('url', ''),
                "description": data.get('description', ''),
                "isActive": True,
                "sourceCount": 0,
                "lastUpdated": datetime.now().isoformat()
            }
            repositories.append(repository)
            repository_id += 1
            
            self.send_json_response({
                "success": True,
                "message": "تم إضافة المستودع بنجاح"
            })
        
        elif path == '/api/repositories/refresh-all':
            if not self.require_auth():
                return
            
            for repo in repositories:
                if repo.get('isActive', False):
                    repo['lastUpdated'] = datetime.now().isoformat()
                    repo['sourceCount'] = repo.get('sourceCount', 0) + 3
            
            self.send_json_response({
                "success": True,
                "message": "تم تحديث جميع المستودعات بنجاح"
            })
        
        elif path.startswith('/api/repositories/') and path.endswith('/refresh'):
            if not self.require_auth():
                return
            
            repo_id = path.split('/')[-2]
            for repo in repositories:
                if repo['id'] == repo_id:
                    repo['lastUpdated'] = datetime.now().isoformat()
                    repo['sourceCount'] = repo.get('sourceCount', 0) + 5
                    self.send_json_response({
                        "success": True,
                        "message": "تم تحديث المستودع بنجاح"
                    })
                    return
            
            self.send_json_response({
                "success": False,
                "message": "المستودع غير موجود"
            }, 404)
        
        elif path.startswith('/api/quick-actions/'):
            if not self.require_auth():
                return
            
            action = path.split('/')[-1]
            messages = {
                'clear-cache': 'تم تنظيف الذاكرة المؤقتة بنجاح',
                'export-data': 'تم تصدير البيانات بنجاح'
            }
            
            message = messages.get(action, 'تم تنفيذ العملية بنجاح')
            self.send_json_response({
                "success": True,
                "message": message
            })
        
        else:
            self.send_json_response({"success": False, "message": "Endpoint not found"}, 404)
    
    def do_PUT(self):
        """Handle PUT requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if not path.startswith('/api/'):
            self.send_response(404)
            self.end_headers()
            return
        
        if path.startswith('/api/repositories/'):
            if not self.require_auth():
                return
            
            repo_id = path.split('/')[-1]
            data = self.get_request_body()
            
            for repo in repositories:
                if repo['id'] == repo_id:
                    if 'isActive' in data:
                        repo['isActive'] = data['isActive']
                        repo['lastUpdated'] = datetime.now().isoformat()
                    
                    self.send_json_response({
                        "success": True,
                        "message": "تم تحديث المستودع بنجاح"
                    })
                    return
            
            self.send_json_response({
                "success": False,
                "message": "المستودع غير موجود"
            }, 404)
        else:
            self.send_json_response({"success": False, "message": "Endpoint not found"}, 404)
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if not path.startswith('/api/'):
            self.send_response(404)
            self.end_headers()
            return
        
        if path.startswith('/api/notifications/'):
            if not self.require_auth():
                return
            
            notification_id = path.split('/')[-1]
            global notifications
            notifications = [n for n in notifications if n['id'] != notification_id]
            
            self.send_json_response({
                "success": True,
                "message": "تم حذف الإشعار بنجاح"
            })
        
        elif path.startswith('/api/repositories/'):
            if not self.require_auth():
                return
            
            repo_id = path.split('/')[-1]
            global repositories
            repositories = [r for r in repositories if r['id'] != repo_id]
            
            self.send_json_response({
                "success": True,
                "message": "تم حذف المستودع بنجاح"
            })
        
        else:
            self.send_json_response({"success": False, "message": "Endpoint not found"}, 404)
    
    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_server(port=8080):
    """Run the admin dashboard server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, AdminHandler)
    
    print(f"🚀 خادم لوحة التحكم يعمل على http://localhost:{port}")
    print(f"📝 بيانات تسجيل الدخول: admin / admin")
    print(f"📁 مجلد الملفات: {os.getcwd()}")
    print("\n🔗 الروابط المتاحة:")
    print(f"   • لوحة التحكم: http://localhost:{port}")
    print(f"   • API: http://localhost:{port}/api")
    print("\n⏹️  اضغط Ctrl+C لإيقاف الخادم")
    print("-" * 50)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 تم إيقاف الخادم")
        httpd.server_close()

if __name__ == '__main__':
    run_server()