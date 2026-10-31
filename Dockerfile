FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt ./
RUN python3 -m venv /opt/finn-python \
    && /opt/finn-python/bin/pip install --no-cache-dir -r requirements.txt
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY scripts ./scripts
COPY test ./test
COPY public ./public
COPY data/recorded-snapshot.json ./data/recorded-snapshot.json
COPY data/research ./data/research
ENV HOST=0.0.0.0 PORT=3000 PYTHON_BIN=/opt/finn-python/bin/python
RUN mkdir -p data/cache && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
