# Prérequis

Du fait de l'utilisation de Docker, aucuns autres outils ou languages autres que Docker, docker-compose et Git sont nécessaire pour faire fonctionner l'infrastructure.


| Technologies | Sub-Tech            | Version    |
| ------------ | ------------------- | :--------: |
| Docker       |                     | 18.06.0-ce |
|              | Docker Compose      | 1.21.2     |
|              | Docker Compose File | v3         |
| Git Linux    |                     | 2.17.1     |
`#TODO : Add link to dl tools`

# Démarrage

Placer un terminal a la racine du dossier et executer la commande : 

    `docker-compose --file primary.yml up -d && docker-compose --file secondary.yml up -d`    

## Remarque 

Pour s'assurer que les containers puisse communiquer entres eux, il faut les faire appartenir à un même réseau Docker. Actuellement vous n'avez pas besoinn deu vous en souciez car ce réseau est créé automatiquement gràce à `docker-compose`, sinon il existe plusieurrs options pour créer un réseau Docker :
 - Utiliser la CLI Docker
 - Utiliser l'interface graphique de Portainer
 - Utiliser le fichier docker-compose ( [exemple](https://docs.docker.com/compose/compose-file/#ipam)  )   

On peut utiliser la CLI Docker pour créer un network qui s'apellera `custom`, comme ceci :

```sh
docker network create \ 
  --driver=bridge \ 
  --subnet=172.20.0.0/16 \ 
  --ip-range=172.20.0.0/16 \ 
  --gateway=172.20.0.50 \ 
  custom
```

## Remarques importantes
 > Il peut être utile d'avoir `Portainer` de lancé sur votre machine, si ce n'est pas déjà fait : 

  ```sh
  docker run -d -p 9000:9000 \ 
  -v /var/run/docker.sock:/var/run/docker.sock \ 
  -v portainer_data:/data \ 
  --name=portainer \ 
  --restart=always \ 
  portainer/portainer
  ```
