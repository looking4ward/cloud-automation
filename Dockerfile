FROM keymetrics/pm2:16-buster

WORKDIR /app
# Bundle all files
COPY . /app

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
ENV PM2_PUBLIC_KEY 85qrx6tczcqwbp1
ENV PM2_SECRET_KEY k9rbpoudtz47gzm

RUN cd /app
RUN npm install

# https://stackoverflow.com/questions/27596409/how-do-i-publish-a-udp-port-on-docker
EXPOSE 29588/udp

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "/app/pm2.json" ]