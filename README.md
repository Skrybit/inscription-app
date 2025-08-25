# This is a Next.js app powered by the Skrybit API that allows users to inscribe content

## Getting Started

First create a `.env` file
```.env
NEXT_PUBLIC_AUTH_TOKEN=<Skrybit API Token>
```
Run the server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/inscribe](http://localhost:3000/inscribe) with your browser to see the result.


## Running with Docker (Optional)

If you prefer Docker:

1. Open your `docker-compose.yml`.
2. Under the `environment` section for the app service, add your API token
3. Run the app
```
docker compose up --build
```