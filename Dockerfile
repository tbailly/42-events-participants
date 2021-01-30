FROM node:alpine

RUN apk add --no-cache git \
    && git clone https://github.com/tbailly/42-events-participants /run_dir \
    && apk del git 

WORKDIR /run_dir

RUN npm install

RUN npm install pm2 -g

USER node

CMD ["pm2-runtime", "index.js"]
