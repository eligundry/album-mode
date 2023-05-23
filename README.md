# album-mode.party [![Netlify Status](https://api.netlify.com/api/v1/badges/e24e0200-16f4-4d50-a3f4-ef1edf891881/deploy-status)](https://app.netlify.com/sites/album-mode/deploys)

Web application that recommends albums based upon magic (aka randomly selecting an album from a list).

## Development

Standard [Remix](https://remix.run) setup here.

```bash
# Run the site in development mode @ http://localhost:3000
$ npm run dev
# Build the site
$ npm run build
```

### Styling

I'm using [tailwindcss](https://tailwindcss.com/) for styling this site because I'm lazy. Nothing super special here
except that when editing `tailwind.config.js`, you must run the following command so that the application code has
access to the changes, which are generated to `app/tailwind.config.json`.

```bash
$ npm run seed-script -- scripts/dumpTailwindConfig.ts
```

## Database

All the data used by this application lives in a sqlite database in `data.db` that is checked into this repo and
deployed to production along with the code. There are a fair amount of seed/scraping scripts to populate this database
with reviews from various publications. They can be run like so:

```bash
$ npm run seed-script -- app/jobs/pazz-and-jop.ts
```

I have also setup a Github Action that runs weekly to update the data from some publications every Sunday at noon.

## Deployment

All deployments run through Netlify. You should never need to deploy from your local machine, but if you do, you can do
the following:

```bash
# Build the site
$ npm run build
# Deploy to a preview branch with the netlify-cli
$ netlify deploy
# Deploy to production
$ netlify deploy --prod
```
