import random
import time
import requests

SEND_BASE = 'https://whatsapptest-stij.onrender.com'

# Lista de contatos exemplo
contatos = [
    '5511999999999',
]

mensagens = [
    'Ola, tudo bem?',
    'Posso te apresentar uma oportunidade incrivel!',
    'Se tiver interesse, me responde aqui \U0001f603',
]

def send_message(numero: str, mensagem: str, chip: str = '1'):
    requests.get(
        f"{SEND_BASE}/send/{chip}", params={"para": numero, "mensagem": mensagem}, timeout=30
    )


def main():
    for contato in contatos:
        mensagem = random.choice(mensagens)
        try:
            send_message(contato, mensagem)
            print(f"\u2705 Mensagem enviada para {contato}")
        except Exception as e:
            print(f"\u274c Falha ao enviar para {contato}: {e}")
        delay = random.randint(30, 60)
        print(f"\u23f1 Aguardando {delay}s antes do proximo envio...")
        time.sleep(delay)
    print("\ud83d\ude80 Disparos finalizados.")


if __name__ == "__main__":
    main()
