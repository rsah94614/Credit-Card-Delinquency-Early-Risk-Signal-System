from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Dict, Optional
import pandas as pd

app = FastAPI(title="HDFC ERSS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Excel Config - prefer file in repository root for portability
REPO_ROOT = Path(__file__).resolve().parents[1]
EXCEL_CANDIDATES = [
    REPO_ROOT / "Credit_Card_Delinquency_Watch.xlsx",
    REPO_ROOT / "Credit Card Delinquency Watch.xlsx",
    REPO_ROOT / "backend" / "Credit_Card_Delinquency_Watch.xlsx",
]

# Pick the first candidate that exists, otherwise None
EXCEL_PATH: Path | None = next((p for p in EXCEL_CANDIDATES if p.exists()), None)
SHEET_NAME = "Sample"

if EXCEL_PATH:
    print(f"[INFO] Using Excel file at: {EXCEL_PATH}")
else:
    print(f"[WARN] No Excel file found in repo root {REPO_ROOT}. Tried: {EXCEL_CANDIDATES}")
    print("[WARN] Backend will start with an empty account list until the Excel file is provided.")


# -----------------------------
# Load Accounts From Excel
# -----------------------------
def _build_accounts_from_excel() -> List[Dict]:
    # If we don't have an Excel file, return an empty list rather than crash.
    if EXCEL_PATH is None or not EXCEL_PATH.exists():
        return []

    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME)
    except Exception as e:
        print(f"[ERROR] Failed to read Excel file {EXCEL_PATH}: {e}")
        return []

    records: List[Dict] = []

    for _, row in df.iterrows():
        try:
            customer_id = str(row.get("Customer ID"))
            util = float(row.get("Utilisation %", 0))
            avg_pay_ratio = float(row.get("Avg Payment Ratio", 0))
            min_due_freq = float(row.get("Min Due Paid Frequency", 0))
            cash_withdrawal = float(row.get("Cash Withdrawal %", 0))
            dpd_next = int(row.get("DPD Bucket Next Month", 0))

        except Exception:
            continue

        # ------------------------------
        # Risk score calculation
        # ------------------------------
        base_score = (
            0.35 * (util / 100.0) +
            0.25 * (1 - (avg_pay_ratio / 100.0)) +
            0.2 * (min_due_freq / 100.0) +
            0.2 * (cash_withdrawal / 100.0)
        )

        # If already delinquent, bump risk slightly
        if dpd_next == 3:
            base_score = min(1.0, base_score + 0.6)
        elif dpd_next == 2:
            base_score = min(1.0, base_score + 0.4)
        elif dpd_next == 1:
            base_score = min(1.0, base_score + 0.2)

        risk_score = round(min(1.0, max(0.0, base_score)), 2)

        # Risk bands
        if risk_score >= 0.8:
            risk_band = "Critical"
        elif risk_score >= 0.6:
            risk_band = "High"
        elif risk_score >= 0.3:
            risk_band = "Medium"
        else:
            risk_band = "Low"

        # Probability of rolling to 30+ DPD
        predicted_roll_to_30 = round(
            min(1.0, risk_score), 2
        )

        record = {
            "customer_id": customer_id,
            "product": "HDFC Credit Card",
            "current_dpd": dpd_next,
            "utilization_pct": util,
            "avg_payment_ratio": avg_pay_ratio,
            "min_due_paid_freq": min_due_freq,
            "cash_withdrawal_pct": cash_withdrawal,
            "risk_band": risk_band,
            "risk_score": risk_score,
            "predicted_roll_to_30_plus": predicted_roll_to_30,
        }

        records.append(record)

    print(f"[INFO] Loaded {len(records)} accounts from Excel")
    return records


# Load the dataset into memory (non-fatal if missing)
try:
    ACCOUNTS = _build_accounts_from_excel()
except Exception as e:
    print(f"[ERROR] Unexpected error building accounts: {e}")
    ACCOUNTS = []


# -----------------------------
# API Endpoints
# -----------------------------
@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/portfolio/summary")
def get_portfolio_summary():
    total_accounts = len(ACCOUNTS)

    critical_risk = len(
        [a for a in ACCOUNTS if a["risk_band"] in ["Critical"]]
    )

    high_risk = len(
        [a for a in ACCOUNTS if a["risk_band"] in ["High"]]
    )

    medium_risk = len(
        [a for a in ACCOUNTS if a["risk_band"] in ["Medium"]]
    )

    low_risk = len(
        [a for a in ACCOUNTS if a["risk_band"] in ["Low"]]
    )

    avg_utilization = (
        sum(a["utilization_pct"] for a in ACCOUNTS) / total_accounts
        if total_accounts else 0
    )

    return {
        "total_accounts": total_accounts,
        "critical_risk_accounts": critical_risk,
        "high_risk_accounts": high_risk,
        "medium_risk_accounts": medium_risk,
        "low_risk_accounts": low_risk,
        "avg_utilization_pct": round(avg_utilization, 1),
    }


@app.get("/api/accounts")
def list_accounts(risk_band: Optional[str] = None):
    accounts = ACCOUNTS

    if risk_band:
        risk_band = risk_band.capitalize()
        allowed = ["Low", "Medium", "High", "Critical"]

        if risk_band not in allowed:
            raise HTTPException(status_code=400, detail="Invalid risk band filter")

        accounts = [a for a in ACCOUNTS if a["risk_band"] == risk_band]

    return accounts


@app.get("/api/accounts/{customer_id}")
def get_account_detail(customer_id: str):
    for a in ACCOUNTS:
        if a["customer_id"] == customer_id:
            return a

    raise HTTPException(status_code=404, detail="Account not found")
