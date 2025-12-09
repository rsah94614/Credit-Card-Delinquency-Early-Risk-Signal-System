import React from 'react';

function PortfolioSummary({ summary }) {
    if (!summary) return null;

    return (
        <section className="summary-section">
            <h2>Portfolio Overview</h2>
            <div className="summary-cards">
                <div className="card">
                    <div className="label">Total Accounts</div>
                    <div className="value">{summary.total_accounts}</div>
                </div>
                <div className="card">
                    <div className="label">Critical Risk</div>
                    <div className="value">{summary.critical_risk_accounts}</div>
                </div>
                <div className="card">
                    <div className="label">High Risk</div>
                    <div className="value">{summary.high_risk_accounts}</div>
                </div>
                <div className="card">
                    <div className="label">Medium Risk</div>
                    <div className="value">{summary.medium_risk_accounts}</div>
                </div>
                <div className="card">
                    <div className="label">Low Risk</div>
                    <div className="value">{summary.low_risk_accounts}</div>
                </div>
                <div className="card">
                    <div className="label">Avg Utilization %</div>
                    <div className="value">{summary.avg_utilization_pct}%</div>
                </div>
            </div>
        </section>
    );
}

export default PortfolioSummary;
