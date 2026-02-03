FROM node:20-alpine AS build
WORKDIR /app
COPY minimal-app/package.json minimal-app/tsconfig.json minimal-app/vite.config.ts minimal-app/index.html ./
COPY minimal-app/src ./src
COPY minimal-app/server ./server
RUN npm install
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
