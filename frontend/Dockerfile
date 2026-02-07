# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

# Install all dependencies (ci for consistent builds)
RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]