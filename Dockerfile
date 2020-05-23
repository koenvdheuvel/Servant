FROM node:erbium

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies and lock
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app
RUN npm run build-ts

CMD [ "npm", "start" ]