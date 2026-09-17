#!/usr/bin/env python3
"""Build the importable n8n workflow files from the Code node sources.

    python3 build/build.py                 -> placeholder email (safe for GitHub)
    python3 build/build.py you@school.com  -> ready to import
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent
PLACEHOLDER = "__STUDENT_EMAIL__"


def node(name, ntype, version, params, pos, notes=None):
    n = {
        "parameters": params,
        "id": name.lower().replace(" ", "-").replace("'", ""),
        "name": name,
        "type": ntype,
        "typeVersion": version,
        "position": pos,
    }
    if notes:
        n["notes"] = notes
        n["notesInFlow"] = True
    return n


def build(email, mailer):
    tasks_js = (HERE / "tasks.js").read_text(encoding="utf-8")
    check_js = (HERE / "check-due.js").read_text(encoding="utf-8").replace(PLACEHOLDER, email)

    nodes = [
        node(
            "Every Day at 6 PM",
            "n8n-nodes-base.scheduleTrigger",
            1.2,
            {"rule": {"interval": [{"field": "days", "daysInterval": 1,
                                    "triggerAtHour": 18, "triggerAtMinute": 0}]}},
            [-220, 0],
            "Runs once a day at 18:00 Kuwait time. Change the hour here if you want the reminder earlier or later.",
        ),
        node("My Tasks", "n8n-nodes-base.code", 2, {"jsCode": tasks_js}, [0, 0],
             "EDIT THIS ONE. Add a line for every quiz, test or homework. Dates are YYYY-MM-DD."),
        node("Find What Is Due Tomorrow", "n8n-nodes-base.code", 2, {"jsCode": check_js}, [220, 0],
             "Works out today's date in Kuwait and keeps only what is due tomorrow. If nothing is due, no email is sent."),
    ]

    if mailer == "gmail":
        nodes.append(node(
            "Send Reminder Email",
            "n8n-nodes-base.gmail",
            2.1,
            {
                "sendTo": "={{ $json.to }}",
                "subject": "={{ $json.subject }}",
                "emailType": "html",
                "message": "={{ $json.html }}",
                "options": {"appendAttribution": False},
            },
            [440, 0],
            "Connect your Gmail account in the Credentials box above.",
        ))
    else:
        nodes.append(node(
            "Send Reminder Email",
            "n8n-nodes-base.emailSend",
            2.1,
            {
                "fromEmail": email,
                "toEmail": "={{ $json.to }}",
                "subject": "={{ $json.subject }}",
                "emailFormat": "html",
                "html": "={{ $json.html }}",
                "options": {},
            },
            [440, 0],
            "Add your SMTP credentials in the Credentials box above (host, port, user, password).",
        ))

    connections = {
        "Every Day at 6 PM": {"main": [[{"node": "My Tasks", "type": "main", "index": 0}]]},
        "My Tasks": {"main": [[{"node": "Find What Is Due Tomorrow", "type": "main", "index": 0}]]},
        "Find What Is Due Tomorrow": {"main": [[{"node": "Send Reminder Email", "type": "main", "index": 0}]]},
    }

    return {
        "name": "Study Reminder — email me 1 day before",
        "nodes": nodes,
        "connections": connections,
        "settings": {"executionOrder": "v1", "timezone": "Asia/Kuwait"},
        "pinData": {},
        "meta": {"instanceId": "study-reminder"},
        "tags": [],
    }


def main():
    email = sys.argv[1] if len(sys.argv) > 1 else "YOUR_EMAIL_HERE@example.com"
    out_dir = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else OUT
    out_dir.mkdir(parents=True, exist_ok=True)
    for mailer, filename in (("gmail", "study-reminder-gmail.json"),
                             ("smtp", "study-reminder-smtp.json")):
        path = out_dir / filename
        path.write_text(json.dumps(build(email, mailer), indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8")
        print("wrote", path)


if __name__ == "__main__":
    main()
