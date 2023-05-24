FROM node:lts-bullseye
WORKDIR /code
COPY src/ /code/src
COPY public/ /code/public
COPY index.jsx package.json tailwind.config.js /code/
RUN npm install
CMD [ "npm", "start"]
