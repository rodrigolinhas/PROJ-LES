export function envHostBackend() {
    let url: string | undefined = process.env.HOST_URL
    if (url == undefined || url === "") {
        url = "localhost"
    }
    let port: string | undefined = process.env.HOST_PORT_BACKEND
    if (port == undefined || url === "") {
        port = "8080"
    }
    return url + ":" + port
}
