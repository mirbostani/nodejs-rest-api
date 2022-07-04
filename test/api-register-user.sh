#!/usr/bin/env bash

curl --verbose \
  --request POST \
  --header 'Content-Type:application/json' \
  --data '{"fullname": "Morteza Mirbostani", "email": "m.mirbostani@gmail.com", "password": "123456", "birthday": "1990-01-01"}' \
  http://localhost:7000/api/register
