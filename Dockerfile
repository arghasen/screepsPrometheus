# Fetch and build the node modules
FROM node:13-alpine as BUILD_IMAGE

RUN apk update && apk add python make g++ && rm -rf /var/cache/apk/*

WORKDIR /screepsPrometheus
COPY package.json package-lock.json ./
RUN npm install

# Setup the actual run environment
FROM node:13-alpine

WORKDIR /screepsPrometheus
COPY --from=BUILD_IMAGE /screepsPrometheus/node_modules ./node_modules
COPY README.md LICENSE ./
COPY src ./src

LABEL maintainer "danielv@live.no"
EXPOSE 8081
VOLUME /screepsPrometheus/config

CMD node src/index.js
