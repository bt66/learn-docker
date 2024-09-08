in before tasks, we try to integrate mysql & phpmyadmin, but so many command to achive that

we can use docker compose to simplify deployment. with docker compose we can run multiple container in 1 command

here docker compose to achive integration between mysql & phpmyadmin in tutorial before.

```bash
services:
  mysql:
    image: mysql:latest
    container_name: mysql-database
    environment:
      MYSQL_ROOT_PASSWORD: my-secret-pw
    volumes:
      - ./mysql-volume:/var/lib/mysql
    networks:
      - db-network
    restart: unless-stopped

  phpmyadmin:
    image: phpmyadmin
    container_name: phpmyadmin
    environment:
      PMA_HOST: mysql-database
    ports:
      - "8080:80"  # Expose phpMyAdmin to public on port 8080
    networks:
      - db-network
    restart: unless-stopped

networks:
  db-network:
    driver: bridge
```