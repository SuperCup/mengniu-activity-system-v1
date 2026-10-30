import functools, os, re
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hq-console')
BUILD = '20261030h'

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path.split('?', 1)[0] in ('/', '/index.html'):
            path = os.path.join(ROOT, 'index.html')
            with open(path, 'rb') as f:
                text = f.read().decode('utf-8')
            text = re.sub(r'(src="js/[^"?]+\.js)"', r'\1?v=' + BUILD + '"', text)
            text = re.sub(r'(href="css/[^"?]+\.css)"', r'\1?v=' + BUILD + '"', text)
            data = text.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        pass

Handler = functools.partial(NoCacheHandler, directory=ROOT)
ThreadingHTTPServer(('127.0.0.1', 8899), Handler).serve_forever()
