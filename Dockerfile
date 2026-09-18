FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY *.js *.css index.html ./
COPY assets/ assets/
COPY tools/build.cjs tools/build.cjs
COPY server/ server/
RUN node tools/build.cjs && mkdir -p /data
ENV NODE_ENV=production
CMD ["node", "server/app.cjs"]
