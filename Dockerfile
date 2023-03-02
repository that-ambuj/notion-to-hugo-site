FROM node:18-alpine as builder

WORKDIR /app

RUN apk add --no-cache git hugo

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .
RUN yarn download

RUN yarn build

FROM nginx:alpine as runtime

COPY --from=builder /app/static-site /usr/share/nginx/html
