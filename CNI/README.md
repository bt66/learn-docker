### CONTAINER NETWORK INTERFACE

see all network

```bash
docker network ls
```

lets create network for mysql database
```bash
docker network create db-network
```

run mysql database without expose to public area
```bash
docker run --name mysql-database --network db-network -v ./mysql-volume:/var/lib/mysql -d -e MYSQL_ROOT_PASSWORD=my-secret-pw mysql:latest
```

run phpmyadmin which connected to frontend-network
```bash
docker run --name phpmyadmin --network db-network -d -e PMA_HOST=mysql-database -p 8080:80 phpmyadmin
```

verify your setup.
Only phpmyadmin can access this database.

