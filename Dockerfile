#TODO:  Modify the docker files according to service. Each service will be in a separate docker so move these files to separate folders.

# Use Node.js LTS version instead of 23
FROM node:20-slim

# Set the working directory
WORKDIR /glut-gut

# Copy package files
COPY package*.json ./

# Install the dependencies
RUN npm install -g ts-node typescript

# Install dependencies
RUN npm install

# Copy TypeORM config and other source files
COPY . .

# Build the NestJS project
RUN npm run build

# Expose port
EXPOSE 3000

# Add environment variables
ENV NODE_ENV=development
ENV DB_HOST=host.docker.internal
ENV DB_PORT=3306
ENV DB_USERNAME=root
ENV DB_PASSWORD=pakistan001*
ENV DB_NAME=glutgut

# Start the application
CMD ["npm", "run", "start:dev"]

# Run migrations and start the application
# CMD sh -c "npm run migration:run && npm run start:dev"