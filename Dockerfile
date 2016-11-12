# BUILD-USING:  docker build -t airburst/mfa-processor:latest .
# RUN-USING:    docker run -d -v /home/mark/mfa-processor:/usr/app/logs airburst/mfa-processor
FROM node:argon

# Create app directory
RUN mkdir -p /usr/app
RUN mkdir -p /usr/app/logs
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN npm install

# Bundle app source
COPY . /usr/app

# Build the app
RUN npm run build

# Make logfiles available outside container
VOLUME  ["/usr/app/logs"]

# EXPOSE 6000
CMD [ "node", "/usr/app/dist/index.js" ]
