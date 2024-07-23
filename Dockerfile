#* ✈️ Production 
FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install -g @nestjs/cli

RUN npm install --only-production

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "prod" ]