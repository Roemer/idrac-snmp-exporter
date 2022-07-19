FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Add package files
COPY package*.json ./
# Copy the app
COPY index.js ./
COPY metrics ./metrics
COPY mibs ./mibs

# Install the dependencies
RUN npm install

EXPOSE 8080
CMD [ "node", "index.js" ]
