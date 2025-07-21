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

# File Management API

We are using S3-compatible APIs for file management.

For local development, you can run the minio docker image, then create a bucket

## Step 0

Initialize python3. For example, with uv

```bash
uv venv
source .venv/bin/activate
uv pip install awscli --upgrade
```

## Step 1

```bash
docker run -d -it \
  -p 4566:4566 \
  -e SERVICES=s3 \
  -e DEFAULT_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=coolproject-minio \
  -e AWS_SECRET_ACCESS_KEY=coolproject-minio \
  -e DEBUG=1 \
  -v "/var/run/docker.sock:/var/run/docker.sock" \
  --name coolproject-localstack \
  localstack/localstack

```

Then configure

```bash
aws configure
```

# Then set the following values

- `AWS Access Key ID`: coolproject-localstack
- `AWS Secret Access Key`: coolproject-localstack
- `Default region name`: us-east-1
- `Default output format`: json

## Step 2 - Create bucket

```bash
aws --endpoint-url=http://localhost:4566 \
    s3api create-bucket \
    --bucket coolproject-localstack \
    --region us-east-1
```

## Step 3 - configure cors

There is a file called `localstack/cors.json` that will let you set the cors configuration for the bucket.

```bash
# From the project rootdir
aws --endpoint-url=http://localhost:4566 \
  s3api put-bucket-cors \
  --bucket coolproject-localstack \
  --cors-configuration file://localstack/cors.json
```

## Keycloak

(Running off https://www.keycloak.org/getting-started/getting-started-docker)

Run the docker container with the following command

Takes about 30 seconds for it to be available on localhost:6789

```bash
# Note: this runs as --user 0, NOT RECOMMENDED FOR PRODUCTION.
# first cd into the ./keycloak folder in this project
docker run -d -p 127.0.0.1:6789:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  --user 0 \
  --name coolproject-keycloak \
  -v coolproject-keycloak:/opt/keycloak/data/h2 \
  quay.io/keycloak/keycloak:26.3.1 \
  start-dev
```

After 30s, visit http://localhost:6789 and log in with `admin/admin` (configured in the bash command above)

Then create realm and user

- Open the Keycloak Admin Console.
- Click Create Realm next to Current realm.
- Enter `coolproject` in the Realm name field.
- Click Create.

- Click Manage -> Users
- Create the following users manually

```
# admin
username:         admin
email:            admin@admin.com
firstname:        admin
lastname:         admin
email verified:   true

# normal
username:         user
email:            user@user.com
firstname:        user
lastname:         user
email verified:   true
```

For each, also go to the "User -> Credentials" tab and set a new password, with 'temporary' set to false

(At this point, if you would like, check that you can log in at `http://localhost:6789/realms/coolproject/account` with the users.)

Then, still in the main admin console...

- click on "Clients" -> Create Client
- clientId = `coolproject-app`
- click next... "Standard Flow" should be checked
- click next
  - Valid redirect URIs should be `http://localhost:5173/auth/callback`
  - Web origins should be `http://localhost:5173`
- click save

Now you should be able to click the 'login' button to get redirected

# Deployment

# Terraform

Install terraform https://developer.hashicorp.com/terraform/install
