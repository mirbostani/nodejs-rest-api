#!/usr/bin/env bash

curl --verbose \
  --request POST \
  --header 'Content-Type:application/json' \
  --header 'Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWU5OWZiYmY4MWVjY2UyZjYxMTUxNjlkZGQzNDM3NTBkMWE3YzQ4YjE4MzljZGYyOTE0ZTAxZjhjNWVlYjIxYiIsImlhdCI6MTY1NDA4OTc3MywiZXhwIjoxNjU0Njk0NTczLCJpc3MiOiJjbGltZWRvIn0.jqe3yYeSHl3U322yI-5OvizZgZWUw8iMJfn6rUrT5fPo8YTcnNzITFcjCd0gXQjVZmznioS7fNAOLgGKRjFYvrKTAMCVtfaascasoFixrus7QX95-SKFo1RxJoH3CR8Pj6pcFv1s2l32j2oRvFD5QNIe--j08L5w-izNVcskmAjUGSgwFcR2UZYHPffFNWROf5Hp6H5_ooMHwjP4VkPZ4kOzAB5ynlhIJrBKTRxrX4h3WRT6lgQ5nuNhSvLmU169RQupi587LOQJv9zo64t3KDaV1zpAqKNyeTGJsYpiJAQLo6FycDy7dMhWvX6JlN4ziTlqZcwC3m3qwvYY5LRUNw' \
  --data '{"fullname": "John Smith", "email": "m.mirbostani2@gmail.com", "password": "abc123"}' \
  http://localhost:7000/api/admin/users/
