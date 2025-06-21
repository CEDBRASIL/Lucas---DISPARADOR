import argparse
import random
import time
import requests

BASE_URLS = {
    1: 'https://whatsapp-api-uylw.onrender.com',
    2: 'https://wha-api-lucas-2.onrender.com',
    3: 'https://wha-api-lucas-3.onrender.com'
}


def read_lines(path):
    with open(path, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]


def main():
    parser = argparse.ArgumentParser(description='Envio humanizado de mensagens.')
    parser.add_argument('--chip', type=int, choices=[1, 2, 3], required=True, help='Número do chip (1-3)')
    parser.add_argument('--mensagens', required=True, help='Arquivo com variações de mensagens, uma por linha')
    parser.add_argument('--contatos', required=True, help='Arquivo com números de telefone, um por linha')
    args = parser.parse_args()

    base_url = BASE_URLS[args.chip]
    mensagens = read_lines(args.mensagens)
    contatos = read_lines(args.contatos)

    if not mensagens:
        print('Nenhuma mensagem encontrada.')
        return

    for numero in contatos:
        msg = random.choice(mensagens)
        try:
            r = requests.get(f'{base_url}/send', params={'para': numero, 'mensagem': msg}, timeout=30)
            if r.status_code == 200:
                print(f'Mensagem enviada para {numero}')
            else:
                print(f'Falha ao enviar para {numero}: {r.text}')
        except Exception as e:
            print(f'Erro ao enviar para {numero}: {e}')
        delay = random.randint(30, 134)
        time.sleep(delay)


if __name__ == '__main__':
    main()
