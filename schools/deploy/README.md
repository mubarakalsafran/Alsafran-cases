# Vercel deployment

`schools/` is already a plain static site — no build, no dependencies. The best way to host it
is therefore the boring one:

> In the Vercel dashboard: **Add New → Project → import `mubarakalsafran/Alsafran-cases`**,
> set **Root Directory** to `schools`, framework **Other**, and leave the build command empty.

That gives automatic deploys on every push, which is what you want long term.

## Why this folder exists

The deployment in this folder was made through the Vercel MCP connection, which had no team
scope available — and creating a git-linked project through it requires one. So instead of
linking the repository, this project is deployed as files and its build step pulls `schools/`
from the public repository at build time:

```
node build.mjs      # fetches the 19 site files from GitHub → public/
```

It also rewrites the absolute URLs in `sitemap.xml` and `robots.txt` to whatever host Vercel is
actually serving (`VERCEL_PROJECT_PRODUCTION_URL`), so they are never left pointing at a
placeholder or at a throwaway preview domain.

The trade-off: **it does not redeploy on push.** It picks up whatever is on
`claude/kuwait-schools-guide-nn8d5y` the next time it builds. Override the branch with the
`SITE_REF` environment variable. Once the repository is connected properly in the dashboard,
this folder can be deleted.
