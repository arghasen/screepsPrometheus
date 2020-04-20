FROM node:latest

WORKDIR screepsPrometheus
COPY ./ ./
RUN npm install

LABEL maintainer "danielv@live.no"
EXPOSE 8081
VOLUME /screepsPrometheus/config

CMD node src/index.js
