package utils

import (
	"os"
)

func EnvHostTuple() (string, string, string) {
	host := os.Getenv("HOST_URL")
	if host == "" {
		host = "localhost"
	}
	bport := os.Getenv("HOST_PORT_BACKEND")
	if bport == "" {
		bport = "8080"
	}
	fport := os.Getenv("HOST_PORT_FRONTEND")
	if fport == "" {
		fport = "5173"
	}

	return host, bport, fport
}

func EnvHostBackend() string {
	host, port, _ := EnvHostTuple()
	return host + ":" + port
}

func EnvHostFrontend() string {
	host, _, port := EnvHostTuple()
	return host + ":" + port
}

func EnvHostUrl() string {
	host := os.Getenv("HOST_URL")
	if host == "" {
		host = "localhost"
	}
	return host
}
