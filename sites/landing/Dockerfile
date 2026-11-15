FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

ENV NODE_ENV=production
EXPOSE 5070

CMD ["yarn", "start"]
