import React from 'react';

function AccountsTable({ accounts, loading, onSelectAccount }) {
    if (loading) {
        return (
            <div className="accounts-list">
                <h3>Accounts</h3>
                <div>Loading accounts…</div>
            </div>
        );
    }

    return (
        <div className="accounts-list">
            <h3>Accounts</h3>
            <table>
                <thead>
                    <tr>
                        <th>Customer ID</th>
                        <th>Current DPD</th>
                        <th>Utilization %</th>
                        <th>Avg Payment Ratio</th>
                        <th>Min_Due_Paid_Freq</th>
                        <th>Cash_Withdrawal %</th>
                        <th>Risk Band</th>
                        <th>Predicted Roll to 30+ DPD %</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((a) => (
                        <tr
                            key={a.account_id}
                            onClick={() => onSelectAccount(a)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td>{a.customer_id}</td>
                            <td>{a.current_dpd}</td>
                            <td>{a.utilization_pct}%</td>
                            <td>{a.avg_payment_ratio}</td>
                            <td>{a.min_due_paid_freq}</td>
                            <td>{a.cash_withdrawal_pct}%</td>
                            <td>{a.risk_band}</td>
                            <td>{Math.round(a.predicted_roll_to_30_plus * 100)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AccountsTable;
