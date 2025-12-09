import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function RiskDistributionChart({ summary }) {
    if (!summary) {
        return (
            <div className="account-detail">
                <h3>Risk Distribution</h3>
                <p>Loading summary data...</p>
            </div>
        );
    }

    return (
        <div className="account-detail">
            <h3>Risk Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Critical', value: summary.critical_risk_accounts },
                                { name: 'High', value: summary.high_risk_accounts },
                                { name: 'Medium', value: summary.medium_risk_accounts },
                                { name: 'Low', value: summary.low_risk_accounts },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {[
                                { name: 'Critical', color: '#d32f2f' },
                                { name: 'High', color: '#f57c00' },
                                { name: 'Medium', color: '#fbc02d' },
                                { name: 'Low', color: '#388e3c' }
                            ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default RiskDistributionChart;
