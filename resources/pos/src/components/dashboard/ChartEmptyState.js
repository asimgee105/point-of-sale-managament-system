import React from 'react';
import { getFormattedMessage } from '../../shared/sharedMethod';

const ChartEmptyState = () => (
    <div className="cp-chart-empty" role="status">
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="7" y="6" width="34" height="36" rx="8" stroke="currentColor" strokeWidth="2"/><path d="M15 32v-7m9 7V16m9 16V21" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
        <span>{getFormattedMessage('sale.product.table.no-data.label')}</span>
    </div>
);
export default ChartEmptyState;
