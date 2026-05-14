# -----------------------------
# Stage 1: Build Stage
# -----------------------------

FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# -----------------------------
# Stage 2: Production Stage
# -----------------------------

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
