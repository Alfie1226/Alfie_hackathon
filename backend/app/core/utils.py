import hashlib

def sha1_str(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()

def dataurl_to_b64(dataurl: str) -> str:
    if not dataurl:
        return ""
    if "," in dataurl:
        return dataurl.split(",", 1)[1]
    return dataurl
