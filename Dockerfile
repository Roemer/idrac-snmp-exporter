FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Add package files
COPY package*.json ./
# Copy the app
COPY index.js ./
COPY metrics ./
COPY mibs ./

# Install the dependencies
RUN npm install

EXPOSE 8080
CMD [ "node", "index.js" ]
