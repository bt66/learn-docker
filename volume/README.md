docker container is immutable, it mean if we remove container and recreate same container, data will be loss

we can use docker volume to store data 
just specify -v for volume mount.

first i will run mysql cotnainer without any volume mount
```bash
docker run --name mysql-without-volume -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```

fill some data

remove container

recreate  &  verify your data.

then i will run mysql with volume mount 



```bash
docker run --name mysql-with-volume -p 3306:3306 -v ./mysql-volume:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
```
fill some data

remove container

recreate  &  verify your data.

then i will run mysql with volume mount 

