"""
Fetches all tags from Docker Hub for bankaitech/nextcloud and updates the
Available Tags table in docs/Nextcloud/Docs/Pre-built Images.mdx.

The table is replaced between sentinel comments:
  <!-- DOCKER_TAGS_START -->
  ...
  <!-- DOCKER_TAGS_END -->
"""

import json
import re
import sys
import urllib.request

REPO = "bankaitech/nextcloud"
DOCS_FILE = "docs/Nextcloud/Docs/Pre-built Images.mdx"


def fetch_all_tags():
    tags = []
    url = (
        f"https://hub.docker.com/v2/repositories/{REPO}/tags/"
        "?page_size=100&ordering=-last_updated"
    )
    while url:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
        tags.extend(data["results"])
        url = data.get("next")
    return tags


def parse_version(name):
    try:
        return tuple(int(x) for x in name.split("."))
    except Exception:
        return (0,)


def find_latest_version(tags):
    """
    Determine which versioned tag the 'latest' tag currently points to by
    comparing manifest digests. Falls back to the highest semver tag.
    """
    latest_digest = next(
        (t.get("digest") for t in tags if t["name"] == "latest"),
        None,
    )

    versioned = [t for t in tags if re.match(r"^\d+\.\d+", t["name"])]
    versioned.sort(key=lambda t: parse_version(t["name"]), reverse=True)

    if latest_digest:
        for t in versioned:
            if t.get("digest") == latest_digest:
                return t["name"], versioned

    return (versioned[0]["name"] if versioned else "unknown"), versioned


def build_table(current_latest, versioned):
    rows = [
        "| Tag | Description |",
        "|-----|-------------|",
        f"| `latest` | Most up to date image (currently {current_latest}) |",
    ]
    for t in versioned:
        rows.append(f"| `{t['name']}` | Nextcloud {t['name']} |")
    return "\n".join(rows)


def main():
    tags = fetch_all_tags()
    current_latest, versioned = find_latest_version(tags)
    table = build_table(current_latest, versioned)

    with open(DOCS_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"\{/\* DOCKER_TAGS_START \*/\}.*?\{/\* DOCKER_TAGS_END \*/\}"
    replacement = f"{{/* DOCKER_TAGS_START */}}\n{table}\n{{/* DOCKER_TAGS_END */}}"
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    if new_content == content:
        print("No changes to tags table.")
        sys.exit(0)

    with open(DOCS_FILE, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Updated tags table. Current latest: {current_latest}")
    print(f"Total versioned tags: {len(versioned)}")


if __name__ == "__main__":
    main()
