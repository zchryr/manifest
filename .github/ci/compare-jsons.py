import os
import json


def compare_jsons(json1, json2):
    return json.loads(json1) == json.loads(json2)


if __name__ == "__main__":
    env_json_string = os.environ.get("ENV_JSON_STRING")
    file_json_string = os.environ.get("FILE_JSON_STRING")

    print(env_json_string)
    print(file_json_string)

    # if not compare_jsons(env_json_string, file_json_string):
    #     print("JSONs are not the same!")
    #     exit(1)
    # else:
    #     print("JSONs match!")
