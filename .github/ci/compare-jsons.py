import json
import argparse


def compare_jsons(json1, json2):
    return json.loads(json1) == json.loads(json2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compare two JSON strings.")
    parser.add_argument(
        "--env-json", required=True, help="JSON string from environment variable."
    )
    parser.add_argument("--file-json", required=True, help="JSON string from file.")

    args = parser.parse_args()
    print(args.env_json)
    print(args.file_json)

    if not compare_jsons(args.env_json, args.file_json):
        print("JSONs are not the same!")
        exit(1)
    else:
        print("JSONs match!")
