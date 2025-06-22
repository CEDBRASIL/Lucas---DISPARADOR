import argparse
import random
import time
from threading import Thread
import requests

BASE_URLS = {
    1: 'https://whatsapp-api-uylw.onrender.com',
    2: 'https://wha-api-lucas-2.onrender.com',
    3: 'https://wha-api-lucas-3.onrender.com'
}


def read_lines(path):
    """Read non-empty lines from a text file."""
    with open(path, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]


def send_messages(chip, mensagens, contatos):
    base_url = BASE_URLS[chip]
    for numero in contatos:
        msg = random.choice(mensagens)
        try:
            r = requests.get(f'{base_url}/send', params={'para': numero, 'mensagem': msg}, timeout=30)
            if r.status_code == 200:
                print(f'[Chip {chip}] Mensagem enviada para {numero}')
            else:
                print(f'[Chip {chip}] Falha ao enviar para {numero}: {r.text}')
        except Exception as e:
            print(f'[Chip {chip}] Erro ao enviar para {numero}: {e}')
        delay = random.randint(30, 134)
        time.sleep(delay)


def main():
    parser = argparse.ArgumentParser(description='Disparo simult\u00e2neo de mensagens.')
    parser.add_argument('--chips', type=int, choices=[1, 2, 3], nargs='+', required=True,
                        help='Chips a serem usados (1, 2 e/ou 3)')
    parser.add_argument('--mensagens', required=True, help='Arquivo com varia\u00e7\u00f5es de mensagens')
    parser.add_argument('--contatos', required=True, help='Arquivo com n\u00fameros de telefone')
    args = parser.parse_args()

    mensagens = read_lines(args.mensagens)
    contatos = read_lines(args.contatos)

    if not mensagens:
        print('Nenhuma mensagem encontrada.')
        return

    threads = []
    for chip in args.chips:
        t = Thread(target=send_messages, args=(chip, mensagens, contatos), daemon=True)
        threads.append(t)
        t.start()

    for t in threads:
        t.join()


if __name__ == '__main__':
    main()
