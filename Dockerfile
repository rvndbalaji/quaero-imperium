FROM node:12.12.0-buster
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
EXPOSE 443
CMD [ "npm", "run", "prod" ]