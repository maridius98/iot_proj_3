FROM node:22-alpine3.19 as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine3.19

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/build ./build

RUN npm install -g serve

CMD [ "serve", "-s", "build" ]