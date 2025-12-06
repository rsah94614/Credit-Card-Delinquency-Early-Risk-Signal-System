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

# Excel Config
EXCEL_PATH = Path(
    r"C:\Users\rohit\OneDrive\Desktop\HDFC Materials\Capstone Project\Updated Problem Statement Packs\3. Credit Card Delinquency Pack\Credit Card Delinquency Watch.xlsx"
)
SHEET_NAME = "Sample"


# -----------------------------
# Load Accounts From Excel
# -----------------------------
def _build_accounts_from_excel() -> List[Dict]:
    if not EXCEL_PATH.exists():
        raise FileNotFoundError(f"Excel file not found at {EXCEL_PATH}")

    df = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME)

    records: List[Dict] = []

    for _, row in df.iterrows():
        try:
            customer_id = str(row.get("Customer ID"))
            util = float(row.get("Utilisation %", 0))
            avg_pay_ratio = float(row.get("Average Payment Ratio", 0))
            min_due_freq = float(row.get("Min Due Paid Frequency", 0))
            cash_withdrawal = float(row.get("Cash Withdrawal %", 0))
            dpd_next = int(row.get("DPD Bucket Next Month", 0))

        except Exception:
            continue

        # ------------------------------
        # Risk score calculation
        # ------------------------------
        base_score = (
            0.3 * (util / 100.0) +
            0.2 * (1 - (avg_pay_ratio / 100.0)) +
            0.25 * (min_due_freq / 100.0) +
            0.25 * (cash_withdrawal / 100.0)
        )

        # If already delinquent, bump risk slightly
        if dpd_next > 0:
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
            min(1.0, risk_score + (0.1 if dpd_next > 0 else 0.0)), 2
        )

        record = {
            "customer_id": customer_id,
            "product": "HDFC Credit Card",
            "current_dpd": dpd_next,
            "utilization_pct": util,
            "risk_score": risk_score,
            "risk_band": risk_band,
            "predicted_roll_to_30_plus": predicted_roll_to_30,
        }

        records.append(record)

    print(f"[INFO] Loaded {len(records)} accounts from Excel")
    return records


# Load the dataset into memory
ACCOUNTS = _build_accounts_from_excel()


# -----------------------------
# API Endpoints
# -----------------------------
@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/portfolio/summary")
def get_portfolio_summary():
    total_accounts = len(ACCOUNTS)

    high_risk = len(
        [a for a in ACCOUNTS if a["risk_band"] in ["High", "Critical"]]
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


@app.get("/api/accounts/{account_id}")
def get_account_detail(account_id: str):
    for a in ACCOUNTS:
        if a["account_id"] == account_id:
            return a

    raise HTTPException(status_code=404, detail="Account not found")


# Run manually:
# uvicorn main:app --host 127.0.0.1 --port 8000
