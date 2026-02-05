FROM node:20-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts index.html ./
COPY .npmrc ./.npmrc
COPY src ./src
COPY server ./server
RUN npm install --no-audit --no-fund
ENV VITE_DEFAULT_OPENSEARCH_URL=http://opensearch:9200
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/server /app/server
EXPOSE 3000
CMD ["npm", "run", "start"]
