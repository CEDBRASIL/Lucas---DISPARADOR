import os
import random
import threading
import time
from flask import Flask, request, session, redirect, send_from_directory, jsonify
import requests

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'secret')
LOGIN_USER = os.getenv('LOGIN', 'admin')
LOGIN_PASS = os.getenv('SENHA', '1234')

SEND_BASE = 'http://localhost:3000'
progress = {'running': False, 'total': 0, 'sent': 0}


def normalize(num: str):
    digits = ''.join(filter(str.isdigit, num))
    if digits.startswith('55') and len(digits) == 12:
        return digits
    if len(digits) == 11 and digits[2] == '9':
        return '55' + digits[:2] + digits[3:]
    return None


def send_messages(numbers, messages, chip):
    progress.update({'running': True, 'total': len(numbers), 'sent': 0})
    for number in numbers:
        if not progress['running']:
            break
        msg = random.choice(messages)
        try:
            requests.get(f"{SEND_BASE}/send/{chip}", params={'para': number, 'mensagem': msg})
        except Exception as e:
            print('Send error', e)
        progress['sent'] += 1
        time.sleep(random.randint(35, 120))
    progress['running'] = False


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form.get('username') == LOGIN_USER and request.form.get('password') == LOGIN_PASS:
            session['user'] = LOGIN_USER
            return redirect('/')
        return 'Credenciais inválidas', 401
    return send_from_directory('public', 'login.html')


def login_required(func):
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return redirect('/login')
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper


@app.route('/')
@login_required
def index():
    return send_from_directory('public', 'index.html')


@app.route('/public/<path:path>')
def static_files(path):
    return send_from_directory('public', path)


@app.route('/api/disparo', methods=['POST'])
@login_required
def api_disparo():
    data = request.json
    nums = [normalize(n) for n in data.get('numbers', [])]
    nums = [n for n in nums if n]
    messages = data.get('messages', [])
    chip = data.get('chip', '1')
    if progress['running'] or not nums or not messages:
        return jsonify({'status': 'error'}), 400
    threading.Thread(target=send_messages, args=(nums, messages, chip), daemon=True).start()
    return jsonify({'status': 'started'})


@app.route('/api/progress')
@login_required
def api_progress():
    return jsonify(progress)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
