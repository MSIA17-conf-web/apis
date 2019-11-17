FROM node:10.16-alpine

WORKDIR /app

COPY ./app/package-lock.json ./app/package.json ./app/.env ./app/src /app/

RUN npm install

CMD npm start