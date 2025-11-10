# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.18.0
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/app/backend
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
