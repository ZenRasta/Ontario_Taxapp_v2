import React, { useMemo, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import StrategyChart from './StrategyChart';
import ReportPage from './ReportPage';

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

import type {
  ComparisonResponseItem,
  ScenarioInput,
  ExplainResponse,
  GoalEnum,
} from '../types/api';

type ProcessedResult = ComparisonResponseItem & {
  totalTaxes: number | null;
  totalSpending: number | null;
  finalEstate: number | null;
};

interface ResultsPageProps {
  goal: string;
  strategies: string[];
  horizon: number;
  results: ComparisonResponseItem[]; // array of result objects for each strategy
  scenario: ScenarioInput | null;
  onBack: () => void;
  onStartOver: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  goal,
  strategies,
  horizon,
  results,
  scenario,
  onBack,
  onStartOver,
}) => {
  // Normalize result metrics so the rest of the component can rely on them
  const processedResults = useMemo(
    () =>
      results.map((res: ComparisonResponseItem): ProcessedResult => {
        const totalTaxes =
          res.total_taxes ?? res.summary?.lifetime_tax_paid_nominal ?? null;
        const totalSpending =
          res.total_spending ?? res.summary?.average_annual_real_spending ?? null;
      const finalEstate =
        res.final_estate ??
        res.summary?.net_value_to_heirs_after_final_taxes_pv ??
        res.summary?.final_total_portfolio_value_nominal ??
        null;

        return { ...res, totalTaxes, totalSpending, finalEstate };
      }),
    [results],
  );

  // Determine recommended best strategy based on goal
  const recommended = useMemo(() => {
    if (!processedResults || processedResults.length === 0) return null;
    let bestStrategy = processedResults[0];
    if (goal === 'Minimize Tax') {
      processedResults.forEach((res: ProcessedResult) => {
        if (
          res.totalTaxes !== null &&
          (bestStrategy.totalTaxes === null || res.totalTaxes < bestStrategy.totalTaxes)
        ) {
          bestStrategy = res;
        }
      });
    } else if (goal === 'Maximize Spending') {
      processedResults.forEach((res: ProcessedResult) => {
        if (
          res.totalSpending !== null &&
          (bestStrategy.totalSpending === null ||
            res.totalSpending > bestStrategy.totalSpending)
        ) {
          bestStrategy = res;
        }
      });
    } else if (goal === 'Preserve Estate') {
      processedResults.forEach((res: ProcessedResult) => {
        if (
          res.finalEstate !== null &&
          (bestStrategy.finalEstate === null || res.finalEstate > bestStrategy.finalEstate)
        ) {
          bestStrategy = res;
        }
      });
    } else if (goal === 'Simplify') {
      // For "Simplify", choose the strategy with the fewest interventions (we assume that's the one with minimal strategies or baseline)
      // Here, as a proxy, pick the one with the strategy name "RRIF Minimums Only" if present.
      processedResults.forEach((res: ProcessedResult) => {
        if (res.strategy_name === 'RRIF Minimums Only') {
          bestStrategy = res;
        }
      });
    }
    return bestStrategy;
  }, [goal, processedResults]);

  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchExplanation = async () => {
      if (!recommended || !scenario) return;
      const goalEnum: GoalEnum =
        goal === 'Minimize Tax'
          ? 'minimize_tax'
          : goal === 'Maximize Spending'
          ? 'maximize_spending'
          : goal === 'Preserve Estate'
          ? 'preserve_estate'
          : 'simplify';

      try {
        const resp = await fetch('/api/v1/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario,
            strategy_code: recommended.strategy_code,
            summary: recommended.summary,
            goal: goalEnum,
          }),
        });
        if (!resp.ok) throw new Error('request failed');
        const data: ExplainResponse = await resp.json();
        setExplanation(data);
      } catch (err) {
        console.error('Failed to fetch explanation', err);
        setExplanation(null);
      }
    };

    fetchExplanation();
  }, [recommended, scenario, goal]);

  if (showReport && recommended) {
    return (
      <ReportPage
        goal={goal}
        horizon={horizon}
        results={processedResults}
        explanation={explanation}
        onBack={() => setShowReport(false)}
        onStartOver={onStartOver}
      />
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        4. Results & Recommendation
      </Typography>
        {recommended && (
          <Typography variant="h5" color="primary" gutterBottom>
            Recommended Strategy: <strong>{recommended.strategy_name}</strong>
          </Typography>
        )}
        {explanation && (
          <Typography
            variant="body2"
            gutterBottom
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(explanation.summary) }}
          />
        )}
      <Typography variant="body1" gutterBottom>
        Based on your goal (<em>{goal}</em>), the strategy above is projected to perform the best among those selected.
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Projection Horizon: {horizon} years
      </Typography>

      {/* Comparison Table for selected strategies */}
      <Table size="small" sx={{ my: 2 }} className="w-full report-table">
        <TableHead>
          <TableRow>
            <TableCell>Strategy</TableCell>
            <TableCell align="right">Total Taxes Paid</TableCell>
            <TableCell align="right">Total Spending</TableCell>
            <TableCell align="right">Final Estate Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {processedResults.map((res: ProcessedResult) => (
            <TableRow
              key={res.strategy_code}
              selected={
                !!(recommended && res.strategy_name === recommended.strategy_name)
              }
              sx={{
                bgcolor:
                  recommended && res.strategy_name === recommended.strategy_name
                    ? 'action.hover'
                    : 'inherit',
              }}
            >
              <TableCell>{res.strategy_name}</TableCell>
              <TableCell align="right">
                {res.totalTaxes !== null ? currencyFormatter.format(res.totalTaxes) : '—'}
              </TableCell>
              <TableCell align="right">
                {res.totalSpending !== null ? currencyFormatter.format(res.totalSpending) : '—'}
              </TableCell>
              <TableCell align="right">
                {res.finalEstate !== null ? currencyFormatter.format(res.finalEstate) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box my={3}>
        <Typography variant="subtitle1" gutterBottom>
          Strategy Outcomes Visualized:
        </Typography>
        {processedResults.map((res: ProcessedResult) => (
          <StrategyChart
            key={res.strategy_code}
            title={res.strategy_name}
            data={res.yearly_balances || []}
          />
        ))}
      </Box>

      {/* Navigation Buttons */}
      <Box mt={2} textAlign="right">
        <Button variant="outlined" onClick={onBack} sx={{ mr: 2 }}>
          Back
        </Button>
        <Button variant="outlined" onClick={() => setShowReport(true)} sx={{ mr: 2 }}>
          View Report
        </Button>
        <Button variant="contained" color="primary" onClick={onStartOver}>
          Start Over
        </Button>
      </Box>
    </Box>
  );
};

export default ResultsPage;
