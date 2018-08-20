FROM node:8.9 as node

RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY XXXX
ENV PM2_SECRET_KEY YYYY
COPY . /usr/app-platform-server/
COPY package.json /usr/app-platform-server
#COPY .npmrc ./
WORKDIR /usr/app-platform-server/
RUN npm install --only=production

#default environment variables
ENV NODE_ENV production
ENV PORT 8086
EXPOSE 8086
CMD ["pm2-runtime", "server.js"]