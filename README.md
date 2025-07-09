# Setting up DB

## First, start docker container

```
docker run --name git-reports-postgres -e POSTGRES_USER=git-reports-postgres -e POSTGRES_PASSWORD=git-reports-postgres -e POSTGRES_DB=git-reports-postgres -e POSTGRES_HOST_AUTH_METHOD=md5  -v git-reports-postgres:/var/lib/postgresql/data -p 6432:5432 -d postgres:latest
```


## Connect From Another Docker Instance on the Host Network

Then, you can connect to it on its host network. You can find this by going to the container in Docker Desktop, clicking on the "Network" tab and getting the "Gateway" value. I found it set to `172.17.0.1` so I sent my `DATABASE_URL` to `postgresql://git-reports-postgres:git-reports-postgres@172.17.0.1:6432/git-reports-postgres?schema=public`

I can connect from inside another Docker instance on the same engine with:

```
PGPASSWORD=git-reports-postgres psql -h 172.17.0.3 -p 6432 -U git-reports-postgres -d git-reports-postgres
```

## Connect From WSL

Or, from the host machine WSL instance

Set `DATABASE_URL` to `postgresql://git-reports-postgres:git-reports-postgres@127.0.0.1:6432/git-reports-postgres?schema=public`

```
PGPASSWORD=git-reports-postgres psql -h 127.0.0.1 -p 6432 -U git-reports-postgres -d git-reports-postgres
```