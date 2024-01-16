# Use an official Node runtime as a parent image
FROM node:latest

# Set the working directory to the application's directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]