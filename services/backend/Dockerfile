# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files first (better cache)
COPY pyproject.toml .
COPY uv.lock* .

# Install dependencies into /app/.venv
RUN uv sync --frozen --no-dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim

# System deps needed by opencv-headless and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /app/.venv /app/.venv

# Copy source code
COPY app/ app/
COPY pyproject.toml .

# Activate venv
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]