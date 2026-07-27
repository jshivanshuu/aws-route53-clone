import re

SUPPORTED_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"}


def parse_bind_zone(content: str, default_domain: str) -> list[dict]:
    clean_domain = default_domain.strip().lower().rstrip(".")
    origin = clean_domain
    default_ttl = 300
    last_name = "@"

    lines = content.splitlines()
    combined_lines = []
    in_parentheses = False
    current_line = ""

    for line in lines:
        comment_idx = line.find(";")
        if comment_idx != -1:
            line = line[:comment_idx]
        line = line.strip()

        if not line:
            continue

        if "(" in line and ")" not in line:
            in_parentheses = True
            current_line += " " + line.replace("(", " ")
            continue
        elif in_parentheses:
            current_line += " " + line.replace(")", " ")
            if ")" in line:
                in_parentheses = False
                combined_lines.append(" ".join(current_line.split()))
                current_line = ""
            continue
        else:
            line = line.replace("(", " ").replace(")", " ")
            combined_lines.append(" ".join(line.split()))

    records = []

    for line in combined_lines:
        tokens = line.split()
        if not tokens:
            continue

        first_token = tokens[0].upper()

        if first_token == "$ORIGIN":
            if len(tokens) > 1:
                origin = tokens[1].strip().lower().rstrip(".")
            continue

        if first_token == "$TTL":
            if len(tokens) > 1 and tokens[1].isdigit():
                default_ttl = int(tokens[1])
            continue

        if first_token.startswith("$"):
            continue

        name = None
        ttl = default_ttl
        record_type = None
        rdata_idx = -1

        possible_first = tokens[0].upper()
        if possible_first in ("IN", "CS", "CH", "HS") or possible_first in SUPPORTED_TYPES or possible_first.isdigit():
            name = last_name
        else:
            name = tokens[0]
            last_name = name
            idx = 1

        idx = 1 if name == tokens[0] else 0
        token_count = len(tokens)

        while idx < token_count:
            token_upper = tokens[idx].upper()
            if token_upper in ("IN", "CS", "CH", "HS"):
                idx += 1
            elif tokens[idx].isdigit():
                ttl = int(tokens[idx])
                idx += 1
            elif token_upper in SUPPORTED_TYPES or token_upper == "SOA":
                record_type = token_upper
                idx += 1
                rdata_idx = idx
                break
            else:
                idx += 1

        if not record_type or rdata_idx == -1 or rdata_idx >= token_count:
            continue

        if record_type == "SOA":
            continue

        rdata = " ".join(tokens[rdata_idx:])

        clean_name = name.strip()
        if clean_name == "@" or clean_name == clean_domain or clean_name == f"{clean_domain}.":
            record_name = clean_domain
        elif clean_name.endswith(f".{clean_domain}.") or clean_name.endswith(f".{clean_domain}"):
            record_name = clean_name[: -len(clean_domain) - (2 if clean_name.endswith(".") else 1)]
        elif clean_name.endswith("."):
            record_name = clean_name.rstrip(".")
        else:
            record_name = clean_name

        if record_type == "TXT":
            rdata = rdata.strip()
            if rdata.startswith('"') and rdata.endswith('"') and len(rdata) >= 2:
                rdata = rdata[1:-1]

        records.append({
            "name": record_name,
            "type": record_type,
            "value": rdata,
            "ttl": ttl,
            "description": "Imported from BIND zone file",
        })

    return records


def export_bind_zone(domain_name: str, records: list[dict], nameservers: list[str] = None) -> str:
    clean_domain = domain_name.strip().lower().rstrip(".")
    lines = [
        f"; BIND Zone File for {clean_domain}",
        "; Exported from AWS Route 53 Clone",
        f"$ORIGIN {clean_domain}.",
        "$TTL 300",
        "",
    ]

    if nameservers:
        lines.append("; Nameservers")
        for ns in nameservers:
            lines.append(f"@ 300 IN NS {ns}")
        lines.append("")

    lines.append("; DNS Records")
    for r in records:
        name = r.get("name", "@")
        r_type = r.get("type", "A")
        ttl = r.get("ttl", 300)
        val = r.get("value", "")

        if name == clean_domain or name == f"{clean_domain}.":
            formatted_name = "@"
        else:
            formatted_name = name

        if r_type == "TXT" and not (val.startswith('"') and val.endswith('"')):
            val = f'"{val}"'

        lines.append(f"{formatted_name:<20} {ttl:<6} IN {r_type:<7} {val}")

    return "\n".join(lines) + "\n"
