# [Backstage](https://backstage.io)

Backstage demo from dsoderlund.consulting

Requires: node 22, npm, yarn, docker.

To start the app, run:

```sh
yarn install
yarn start
```


To run with tilt to get the local kubernetes experience, first create a `.env.tilt` file and populate it.
Then run:
```sh
tilt up
```