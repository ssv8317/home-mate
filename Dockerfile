FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm audit fix || true
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine
RUN apk update && apk upgrade --no-cache
COPY --from=build /app/dist/demo/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1
CMD ["nginx", "-g", "daemon off;"]
