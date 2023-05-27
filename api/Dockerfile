FROM node:lts-bullseye
WORKDIR /code
COPY src/ /code/src
COPY package.json /code
COPY package-lock.json /code
RUN npm install
CMD [ "npm", "start"]
