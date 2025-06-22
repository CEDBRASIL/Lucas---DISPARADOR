import base64
import io
from flask import Flask, request
import qrcode

app = Flask(__name__)
connected = False

@app.get('/connect')
def connect():
    global connected
    if request.args.get('done') == '1':
        connected = True
    if connected:
        return '<h1>Conectado com sucesso</h1>'
    qr_data = request.url_root.rstrip('/') + '/connect?done=1'
    img_io = io.BytesIO()
    qrcode.make(qr_data).save(img_io, format='PNG')
    img_io.seek(0)
    b64 = base64.b64encode(img_io.getvalue()).decode()
    html = f'<img src="data:image/png;base64,{b64}" alt="QR Code" />'
    return html

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
