import React from 'react';

function InterventionSlide({ selectedAccount, onClose, getIntervention }) {
    if (!selectedAccount) return null;

    return (
        <>
            <div className="slide-header">
                <h2>Customer Intervention</h2>
                <button className="close-btn" onClick={onClose}>&times;</button>
            </div>

            <div className={`intervention-card ${selectedAccount.risk_band}`}>
                <div className="section-title">Recommended Action</div>
                <span className="recommendation-text">
                    {getIntervention(selectedAccount)}
                </span>
            </div>

            <div className="detail-grid">
                <div className="section-title" style={{ gridColumn: '1 / -1' }}>Customer Profile</div>

                <div className="detail-item">
                    <span className="detail-label">Customer ID</span>
                    <span className="detail-value">{selectedAccount.customer_id}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Product</span>
                    <span className="detail-value">{selectedAccount.product}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Risk Band</span>
                    <span className="detail-value">{selectedAccount.risk_band}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Risk Score</span>
                    <span className="detail-value">{selectedAccount.risk_score}</span>
                </div>

                <div className="section-title" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>Risk Metrics</div>

                <div className="detail-item">
                    <span className="detail-label">Current DPD</span>
                    <span className="detail-value">{selectedAccount.current_dpd} month</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Utilization</span>
                    <span className="detail-value">{selectedAccount.utilization_pct}%</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Avg Payment Ratio</span>
                    <span className="detail-value">{selectedAccount.avg_payment_ratio}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Cash Withdrawal</span>
                    <span className="detail-value">{selectedAccount.cash_withdrawal_pct}%</span>
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="detail-label">Predicted Roll-Forward Probability (30+ DPD)</span>
                    <span className="detail-value">{Math.round(selectedAccount.predicted_roll_to_30_plus * 100)}%</span>
                </div>
            </div>
        </>
    );
}

export default InterventionSlide;
