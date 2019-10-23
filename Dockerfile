FROM node:12.11.0

WORKDIR /app

COPY app/package.json app/package-lock.json /app/
RUN npm i

COPY app/ /app/
CMD node /app/bot --production
