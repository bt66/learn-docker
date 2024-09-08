pull image from registry:
```bash
docker pull nginx:latest
```

Run container :

```bash
docker run --name nginx -p 80:80 nginx:latest
```

hardcode some secret like database connection string inside a code is a big misstake, sometimes that env can be leaked by untrusted user. so we need to impmenet env

in docker we can specify env with -e argument

this folder will show you how to specify env to your docker container.

to specify env just add -e with following by key value of env.

```bash
docker run -d -p 3000:3000 -e NAME=your_name bt66/learn-docker:v1.0
```


to build image from this folder run 
```bash
docker build -t your_username/learn-docker:v1.0 .
```

push to registry 
```bash
docker push your_username/learn-docker:v1.0 .
```