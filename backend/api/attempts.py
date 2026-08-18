COLLECTION="attempts"
def validate(data):
    if not isinstance(data,dict): raise ValueError("Object expected")
    return data
