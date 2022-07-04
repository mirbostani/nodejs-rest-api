```shell
$ openssl genrsa -des3 -passout pass:abc123 -out server.pass.key 2048
$ openssl rsa -passin pass:abc123 -in server.pass.key -out server.key
$ rm server.pass.key
$ openssl req -new -key server.key -out server.csr
$ openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
```
