FROM node:24.15.0-alpine as builder
WORKDIR /usr/src/app

COPY ./package*.json ./
COPY ./yarn* ./
RUN yarn

COPY src tsconfig.json ./
RUN yarn build

ENV PORT 8080
EXPOSE 8080

CMD ["node", "./dist/main.js"]
