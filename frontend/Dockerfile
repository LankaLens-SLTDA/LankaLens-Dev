# Next.js Frontend Development Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies based on package.json / package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Copy full application code
COPY . .

# Expose Next.js dev server port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run development server
CMD ["npm", "run", "dev"]

