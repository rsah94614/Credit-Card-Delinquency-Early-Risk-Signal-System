import React, { useEffect, useState } from 'react';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiskBand, setSelectedRiskBand] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/summary`);
      if (!res.ok) throw new Error('Failed to load summary');
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      setError(e.message || 'Error loading summary');
    }
  };

  const fetchAccounts = async (riskBand) => {
    try {
      let url = `${API_BASE}/api/accounts`;
      if (riskBand) {
        url += `?risk_band=${encodeURIComponent(riskBand)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load accounts');
      const data = await res.json();
      setAccounts(data);
    } catch (e) {
      setError(e.message || 'Error loading accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSummary(), fetchAccounts(selectedRiskBand)])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRiskBand]);

  const onSelectAccount = (account) => {
    setSelectedAccount(account);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>HDFC Early Risk Signal System–Credit Card Delinquency Watch</h1>
        <p className="subtitle">
          Early warning dashboard for credit card roll-rate and delinquency risk.
        </p>
      </header>

      {error && <div className="error">{error}</div>}

      {summary && (
        <section className="summary-section">
          <h2>Portfolio Overview</h2>
          <div className="summary-cards">
            <div className="card">
              <div className="label">Total Accounts</div>
              <div className="value">{summary.total_accounts}</div>
            </div>
            <div className="card">
              <div className="label">High / Critical Risk</div>
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
      )}

      <section className="filters-section">
        <h2>Account Segments</h2>
        <label>
          Filter by Risk Band:&nbsp;
          <select
            value={selectedRiskBand}
            onChange={(e) => setSelectedRiskBand(e.target.value)}
          >
            <option value="">All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
      </section>

      <section className="content-section">
        <div className="accounts-list">
          <h3>Accounts</h3>
          {loading ? (
            <div>Loading accounts…</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Product</th>
                  <th>Current DPD</th>
                  <th>Utilization %</th>
                  <th>Avg Payment Ratio</th>
                  <th>MinDue_Paid_Frequency</th>
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
                    className={
                      selectedAccount && selectedAccount.account_id === a.account_id
                        ? 'selected-row'
                        : ''
                    }
                  >
                    <td>{a.customer_name}</td>
                    <td>{a.product}</td>
                    <td>{a.current_dpd}</td>
                    <td>{a.utilization_pct}%</td>
                    <td>{a.utilization_pct}%</td>
                    <td>{a.utilization_pct}%</td>
                    <td>{a.utilization_pct}%</td>
                    {/* <td>{a.avg_payment_ratio}</td>
                    <td>{mindue_paid_frequency}</td>
                    <td>{a.cash_withdrawal}%</td> */}
                    <td>{a.risk_band}</td>
                    <td>{Math.round(a.predicted_roll_to_30_plus * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="account-detail">
          <h3>Account Detail</h3>
          {selectedAccount ? (
            <div className="detail-card">
              <h4>{selectedAccount.customer_name} ({selectedAccount.account_id})</h4>
              <p><strong>Product:</strong> {selectedAccount.product}</p>
              <p><strong>Current DPD:</strong> {selectedAccount.current_dpd} months</p>
              <p><strong>Utilization:</strong> {selectedAccount.utilization_pct}% of limit</p>
              <p><strong>Risk Band:</strong> {selectedAccount.risk_band}</p>
              <p><strong>Predicted roll to 30+ DPD (next cycles):</strong> {Math.round(selectedAccount.predicted_roll_to_30_plus * 100)}%</p>
            </div>
          ) : (
            <p>Select an account from the table to view details.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
