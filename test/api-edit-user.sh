#!/usr/bin/env bash

# Read token in redis
# $ redis-cli
# > select 1
# keys *
# get access_token:user_id:62972b7c53cdbb4998d4a163

curl --verbose \
  --request PUT \
  --header 'Content-Type:application/json' \
  --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmJjNDhkYzQzNTBjMmJjMDdhNTM3Y2MwNTAyMzdhMTFiOGFkYWFjYzQ0NzIxOTRlMzcxYTE4ODQ1ZDZjNjE3YiIsImlhdCI6MTY1NDA4NjgyMywiZXhwIjoxNjU0NjkxNjIzLCJpc3MiOiJjbGltZWRvIn0.PquAvIlXUJmaYh5rAJK47Q6_5kcK43yHY25R0igtKHZoAWEb8Ceoeue42zQ-tdukIQwnEKsjXPwUEMthEfUVY6Gu30CSrIuWKQNcu1UEe7wwZObuGvv4VjDC6MpmZU0DxNWEE6eNA-d_O6WadE5ADFmzirk_bczh_BCLQlSWXcpCLdoSU7c-Bouq--ebXeDjmRBH7jNG5XKuNwmc_CD7cBcqJHIgNFDmikSa3NPacAbYF34E6J1JfnZxJkNEnONtG7b2rOgIoluI1_6BTeJYIoYpm40mwFMyyEZGyTrpooenhwUqmRkUaUKjo971rUBj9rOGpiMiG2P8XVZ6-XXnxQ' \
  --data '{"email": "m.mirbostani2@gmail.com", "password": "1234567"}' \
  http://localhost:7000/api/users/m.mirbostani@gmail.com
