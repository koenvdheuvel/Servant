FROM node:carbon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies and lock
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install --production

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]