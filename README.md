# PROJ-LES
Projeto de LES PL01

## Generating Swagger Documentation
1. Make sure the `swag` command can be executed on the `/server` project. If the command is not recognized, consider one of the following options:
  - Installing `swag` with: `go install github.com/swaggo/swag/cmd/swag@latest`
  - Adding `$GOPATH/bin` to your `PATH` environment variable
  - (Linux) Executing `swag` from `~/go/bin/swag`
2. Run the following command on the `/server` project: `swag init -g cmd/main.go`

After this the documentation can be read with a web browser on the endpoint `/docs/index.html`
