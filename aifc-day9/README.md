# AIFC Day 9 — Jahra Shop Stock Agent

**Stock Monitoring & Low-Stock Alert System**

A single-page, dependency-free website documenting an AI agent that checks a Jahra shop's
**test** inventory and flags products that are about to run out.

```bash
cd aifc-day9 && python3 -m http.server 8080   # then open http://localhost:8080
```

---

## The goal

> "The agent checks the Jahra shop's test inventory and flags products when their stock reaches
> or falls below the minimum stock level without changing inventory quantities."

The agent **does not** purchase products, **does not** change inventory quantities, and only
identifies and records low-stock alerts so that a human can decide what to order.

## What the site contains

| Section | What it shows |
|---|---|
| Overview | Goal, the three "does not" rules, and a test inventory dashboard with stock bars |
| Agent Spec | The five-part spec: goal, tools, memory, guardrails, stop condition |
| Tools | 4 tools — manual trigger, test sheet, stock check, test alert log — each with can / cannot / purpose |
| Memory | What is remembered, for 7 days, and how duplicate alerts are prevented |
| Guardrails | 🚫 Never · ✋ Ask first · 💰 Spend (0 KD, 10 alerts) · 🛑 Stop and ask |
| Rehearsal | Three cases — easy, awkward, rule-breaking — each answering the four questions |
| Rule Change | Rule 3 before → what broke it → after → retest (FAIL ✕ → rule updated → PASS ✓) |
| Workflow | Five n8n-style nodes with the LOW STOCK / NO ACTION branch |
| Failure Plans | A failure plan for every node |
| Security | Test data only, no credentials, minimum permissions, 0 KD |
| Demo | Interactive stock check that follows the updated Rule 3 exactly |
| Run Evidence | Placeholders for the real n8n screenshot — **not yet filled in** |

## The rule that changed

| | |
|---|---|
| **Before** | "If current quantity is less than or equal to minimum stock, create a low-stock alert." |
| **What broke it** | Juice Boxes had a minimum stock of 8 but a **blank** current quantity. A blank read as zero would create a false alert. |
| **After** | "If current quantity and minimum stock are both valid numbers, compare them. If current quantity is less than or equal to minimum stock, create a low-stock alert. If either value is missing or invalid, STOP and ask a human. Never treat missing information as zero." |
| **Retest** | Same input, new rule → NO ACTION, human review requested → **PASS ✓** |

## Adding the real workflow screenshot

The Run Evidence section is intentionally empty. It states that no verified run has been
recorded yet, and the site makes **no claim** that the workflow ran successfully.

To fill it in:

1. Save the real n8n screenshot as `assets/img/n8n-run.png`.
2. In `index.html`, find the `slot slot--wide` block in the `#evidence` section and replace its
   contents with:
   ```html
   <img src="assets/img/n8n-run.png" alt="n8n manual workflow run">
   ```
3. Replace the "⏳ No verified run recorded yet" badge with the real run status, and fill the
   Test Input / Workflow Output / Date-Time / Run Status slots with what n8n actually reported.

## Files

```
aifc-day9/
├── index.html              the whole site
├── assets/css/agent.css    dark inventory-control-centre theme
├── assets/js/app.js        scroll spy, reveal animations, stock-check demo
└── assets/img/             put the real n8n screenshot here
```

## Safety notes

* All numbers on the site are **safe fake test data**.
* No real customer data, passwords, API keys or credentials appear anywhere — and none should
  ever be added.
* The interactive demo is a rule simulator. It runs entirely in the browser, connects to
  nothing, changes no inventory, and cannot make purchases.
