
### STAGE 1: Build ###
# Specify a base image
FROM node:16-alpine as builder

WORKDIR '/app'
COPY . .

# Install some depenendencies
RUN yarn install


# Default command
#CMD ["yarn", "build"]

### STAGE 2: Setup ###
#FROM nginx:1.14.1-alpine
#
### Allow for various nginx proxy configuration
#ARG NGINX_CONF=nginx/ares-chain-tools.conf
#ENV NGINX_CONF=$NGINX_CONF
#
### Remove default nginx configs
#RUN rm -rf /etc/nginx/conf.d/*
#
### Copy our default nginx config
#COPY ${NGINX_CONF} /etc/nginx/conf.d/
#
### Remove default nginx website
#RUN rm -rf /usr/share/nginx/html/*
#
### From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
#COPY --from=builder /app/build /usr/share/nginx/html
#
#CMD ["nginx", "-g", "daemon off;"]