# Coolproject Template

This is a template for a full-stack React/Typescript/Trpc/Prisma/Postgres project.

By convention, the project is named "Coolproject." Doing a file search for `coolproject` will show you all the places where you will have to do a string replace.

This file also uses `coolproject` as a placeholder.

# Setting up DB

## First, start docker container

```
docker run --name coolproject-postgres -e POSTGRES_USER=coolproject-postgres -e POSTGRES_PASSWORD=coolproject-postgres -e POSTGRES_DB=coolproject-postgres -e POSTGRES_HOST_AUTH_METHOD=md5  -v coolproject-postgres:/var/lib/postgresql/data -p 6432:5432 -d postgres:latest
```


## Connect From Another Docker Instance on the Host Network

Then, you can connect to it on its host network. You can find this by going to the container in Docker Desktop, clicking on the "Network" tab and getting the "Gateway" value. I found it set to `172.17.0.1` so I sent my `DATABASE_URL` to `postgresql://coolproject-postgres:coolproject-postgres@172.17.0.1:6432/coolproject-postgres?schema=public`

I can connect from inside another Docker instance on the same engine with:

```
PGPASSWORD=coolproject-postgres psql -h 172.17.0.3 -p 6432 -U coolproject-postgres -d coolproject-postgres
```

## Connect From WSL

Or, from the host machine WSL instance

Set `DATABASE_URL` to `postgresql://coolproject-postgres:coolproject-postgres@127.0.0.1:6432/coolproject-postgres?schema=public`

```
PGPASSWORD=coolproject-postgres psql -h 127.0.0.1 -p 6432 -U coolproject-postgres -d coolproject-postgres
```

## File Management API

We are using S3-compatible APIs for file management. 

For local development, you can run the minio docker image, then create a bucket


### Step 1

```bash
docker run -p 9000:9000 -p 9001:9001 --name coolproject-minio \
  -e MINIO_ROOT_USER=coolproject-minio -e MINIO_ROOT_PASSWORD=coolproject-minio \
  minio/minio server /data --console-address ":9001"
```

### Step 2

Visit localhost:9000

Log in with coolproject-minio/coolproject-minio

Create a bucket called `coolproject-minio`

