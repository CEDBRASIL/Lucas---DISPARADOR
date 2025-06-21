import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables from a .env file if present (useful for local testing)
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")

def init_db():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        print("\u2705 Conex\u00e3o estabelecida")
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                  id SERIAL PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  email VARCHAR(255) UNIQUE NOT NULL,
                  password VARCHAR(255) NOT NULL,
                  profile VARCHAR(50) DEFAULT 'admin',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            conn.commit()
        print("\u2705 Tabela criada com sucesso ou j\u00e1 existente")
    except Exception as e:
        print("\u274c Erro ao conectar ou criar tabela")
        print(e)
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    init_db()
