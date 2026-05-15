FROM node:22-slim 

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable pnpm

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV YT_DLP_JS_RUNTIMES=node

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

ENV PORT=5000

EXPOSE 5000

CMD [ "node", "./main.js" ]
