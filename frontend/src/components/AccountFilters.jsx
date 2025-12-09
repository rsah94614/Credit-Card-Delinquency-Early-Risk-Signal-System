import React from 'react';

function AccountFilters({ selectedRiskBand, onRiskBandChange }) {
    return (
        <section className="filters-section">
            <h2>Account Segments</h2>
            <label>
                Filter by Risk Band:&nbsp;
                <select
                    value={selectedRiskBand}
                    onChange={(e) => onRiskBandChange(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </label>
        </section>
    );
}

export default AccountFilters;
