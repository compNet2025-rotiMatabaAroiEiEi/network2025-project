# syntax=docker/dockerfile:1
FROM node:lts-alpine

WORKDIR /usr/app/frontend

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5174

CMD ["npm", "run", "dev"]