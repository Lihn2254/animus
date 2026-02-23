def serialize_user(user):
    if user is None:
        return None

    return user.to_dict()
