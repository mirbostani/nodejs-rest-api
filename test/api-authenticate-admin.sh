#!/usr/bin/env bash

curl --verbose \
  --request POST \
  --header 'Content-Type:application/json' \
  --data '{"email": "admin@example.com", "password": "admin123"}' \
  http://localhost:7000/api/authenticate
