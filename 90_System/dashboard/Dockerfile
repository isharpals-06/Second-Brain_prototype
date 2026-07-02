FROM node:20-alpine

WORKDIR /app/90_System/dashboard

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy dashboard codebase
COPY . .

# Expose ports for Vite (5180) and Express Backend (3010)
EXPOSE 5180
EXPOSE 3010

# Default configuration settings
ENV PORT=3010
ENV VITE_API_URL=http://localhost:3010
ENV OLLAMA_URL=http://host.docker.internal:11434

# Boot dev frontend and backend concurrently
CMD ["npm", "run", "dev"]
