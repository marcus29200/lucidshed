from bcrypt import checkpw, gensalt, hashpw


def password_matches(stored_password: str, password: str):
    # TODO Will need to change when we have oauth probably
    return checkpw(password.encode("utf-8"), stored_password.encode("utf-8")) if stored_password else False


def get_hashed_password(password: str):
    return hashpw(password.encode("utf-8"), gensalt()).decode("utf-8") if password else ""
