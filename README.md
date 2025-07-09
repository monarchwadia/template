```
docker run --name git-reports-postgres -e POSTGRES_USER=git-reports-postgres -e POSTGRES_PASSWORD=git-reports-postgres -e POSTGRES_DB=git-reports-postgres -v git-reports-postgres:/var/lib/postgresql/data -p 6432:6432 -d postgres:latest
```

Then, you can connect to it on its host network. You can find this by going to the container in Docker Desktop, clicking on the "Network" tab and getting the "Gateway" value. I found it set to `172.17.0.1` so I sent my `DATABASE_URL` to `postgresql://git-reports-postgres:git-reports-postgres@172.17.0.1:5432/git-reports-postgres?schema=public`