FROM python:3.11-slim

# Stockfish und System-Tools installieren
RUN apt-get update && apt-get install -y stockfish && rm -rf /var/lib/apt/lists/*

# Verlinkung, falls dein Code "./stockfish" statt "/usr/games/stockfish" sucht
WORKDIR /app
COPY . .
RUN ln -s /usr/games/stockfish /app/stockfish

# Python-Pakete installieren
RUN pip install --no-cache-dir flask chess

# Startbefehl
CMD ["python3", "epic_chess.py"]
