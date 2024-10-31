#### General Info
- Set `testing` to `True` in settings.py, this will print/return certain info when running the api you'll need

#### Creating a user account
Post to the users/register endpoint to create a user account, you can specify other data, but only email is required
```
curl --request POST \
  --url http://localhost:8080/users/register \
  --header 'Content-Type: application/json' \
  --data '{
  "email": "test@test.com"
}'
```

The API will return your reset/confirmation code, but you can also see it in the logs (assuming `testing` is true)

Next, set your password by calling the users/reset-password endpoint
```
curl --request POST \
  --url http://localhost:8080/users/reset-password \
  --header 'Content-Type: application/json' \
  --data '{
  "reset_code": "code from previous call",
  "password": "Test password"
}'
```
You should get a 200 from this, now you can login

Login by calling the /users/login endpont
```
curl --request POST \
  --url http://localhost:8080/users/login \
  --header 'Content-Type: application/json' \
  --data '{
  "username": "test@test.com"
  "password": "Test password"
}'
```
This response will have two things, the user object, and the token info, for which you'll need for the authenticated endpoints

For example:
```
{
	"user": {
		"email": "test@test.com",
		"first_name": null,
		"last_name": null,
		"disabled": false,
		"permissions": null,
		"title": null,
		"team": null,
		"phone": null,
		"location": null,
		"timezone": null,
		"bio": null,
		"picture": null,
		"id": "c6268288a04e48fe9bfeaf89dab5aecf",
		"created_at": "2024-07-15T14:42:05.441352",
		"created_by_id": "system",
		"modified_at": "2024-07-15T14:42:05.441352",
		"modified_by_id": "system",
		"deleted_at": null,
		"deleted_by_id": null,
		"super_admin": false
	},
	"token": {
		"access_token": "a token",
		"token_type": "bearer"
	}
}
