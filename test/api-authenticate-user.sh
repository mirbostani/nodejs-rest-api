#!/usr/bin/env bash

curl --verbose \
  --request POST \
  --header 'Content-Type:application/json' \
  --data '{"email": "m.mirbostani@gmail.com", "password": "123456"}' \
  http://localhost:7000/api/authenticate
