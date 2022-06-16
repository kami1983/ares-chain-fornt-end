
# Specify a base image
FROM node:16-alpine as builder

WORKDIR '/app'
COPY . .
RUN yarn install
RUN yarn build

FROM nginx:1.14.1-alpine

ARG NGINX_CONF=nginx/ares-chain-tools.conf
ENV NGINX_CONF=$NGINX_CONF
RUN rm -rf /etc/nginx/conf.d/*
COPY ${NGINX_CONF} /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]