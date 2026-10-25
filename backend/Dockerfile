FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OCR fallback, PostgreSQL driver compilation, and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from repository root context and install dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend application and shared scripts from repository root context
COPY backend/ /app/backend/
COPY scripts/ /app/scripts/

ENV PYTHONPATH=/app
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
