# Use an official Node.js runtime as a parent image
FROM node:18.20.4-alpine3.20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the port that your app runs on
EXPOSE 3000

# Command to run your app
CMD [ "node", "index.js" ]