FROM node:22-alpine

WORKDIR /app

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --chown=node:node package.json package-lock.json ./
RUN chown node:node /app
USER node
RUN npm ci

COPY --chown=node:node . .

# Build once at image build time so runtime requests are fast.
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
