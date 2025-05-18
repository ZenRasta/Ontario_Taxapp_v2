import { useState } from 'react';

interface Summary {
  strategy_code: string;
  strategy_name: string;
  summary: {
    lifetime_tax_paid_nominal: number;
    average_annual_real_spending: number;
    final_total_portfolio_value_nominal: number;
  };
}

const strategyOptions = [
  { code: 'BF', label: 'Bracket Filling' },
  { code: 'E65', label: 'Early RRIF Conversion' },
  { code: 'CD', label: 'Delay CPP/OAS' },
  { code: 'GM', label: 'Gradual Meltdown' },
  { code: 'SEQ', label: 'Spousal Equalization' },
  { code: 'IO', label: 'Interest-Offset Loan' },
  { code: 'LS', label: 'Lump-Sum Withdrawal' },
  { code: 'EBX', label: 'Empty-by-X' },
  { code: 'MIN', label: 'RRIF Minimums Only' },
];

export default function SimulatorSection() {
  const [age, setAge] = useState(65);
  const [rrsp, setRrsp] = useState(500000);
  const [cpp, setCpp] = useState(12000);
  const [oas, setOas] = useState(8000);
  const [tfsa, setTfsa] = useState(100000);
  const [spending, setSpending] = useState(60000);
  const [expReturn, setExpReturn] = useState(5);
  const [stddev, setStddev] = useState(8);
  const [horizon, setHorizon] = useState(25);
  const [goal, setGoal] = useState('maximize_spending');
  const [strategies, setStrategies] = useState<string[]>(['GM']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Summary[] | null>(null);

  const toggleStrategy = (code: string) => {
    setStrategies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    const payload = {
      scenario: {
        age: Number(age),
        rrsp_balance: Number(rrsp),
        cpp_at_65: Number(cpp),
        oas_at_65: Number(oas),
        tfsa_balance: Number(tfsa),
        desired_spending: Number(spending),
        expect_return_pct: Number(expReturn),
        stddev_return_pct: Number(stddev),
        life_expectancy_years: Number(horizon),
        province: 'ON',
        goal,
      },
      strategies,
    };
    try {
      const res = await fetch('/api/v1/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResults(data.comparisons as Summary[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="simulator" className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">Run a Simulation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col text-sm">
              Age
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              RRSP Balance
              <input type="number" value={rrsp} onChange={e => setRrsp(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              CPP at 65
              <input type="number" value={cpp} onChange={e => setCpp(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              OAS at 65
              <input type="number" value={oas} onChange={e => setOas(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              TFSA Balance
              <input type="number" value={tfsa} onChange={e => setTfsa(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              Desired Spending
              <input type="number" value={spending} onChange={e => setSpending(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              Expected Return %
              <input type="number" value={expReturn} onChange={e => setExpReturn(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              Stddev Return %
              <input type="number" value={stddev} onChange={e => setStddev(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              Horizon (years)
              <input type="number" value={horizon} onChange={e => setHorizon(Number(e.target.value))} className="border p-2 rounded" />
            </label>
            <label className="flex flex-col text-sm">
              Goal
              <select value={goal} onChange={e => setGoal(e.target.value)} className="border p-2 rounded">
                <option value="minimize_tax">Minimize Tax</option>
                <option value="maximize_spending">Maximize Spending</option>
                <option value="preserve_estate">Preserve Estate</option>
                <option value="simplify">Simplify</option>
              </select>
            </label>
          </div>
          <fieldset className="mt-4">
            <legend className="font-semibold mb-2">Strategies</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {strategyOptions.map(opt => (
                <label key={opt.code} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={strategies.includes(opt.code)}
                    onChange={() => toggleStrategy(opt.code)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
        </form>
        {results && (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Strategy</th>
                  <th className="p-2 text-right">Lifetime Tax</th>
                  <th className="p-2 text-right">Avg Annual Spending</th>
                  <th className="p-2 text-right">Final Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.strategy_code} className="border-t">
                    <td className="p-2">{r.strategy_name}</td>
                    <td className="p-2 text-right">{r.summary.lifetime_tax_paid_nominal.toLocaleString()}</td>
                    <td className="p-2 text-right">{r.summary.average_annual_real_spending.toLocaleString()}</td>
                    <td className="p-2 text-right">{r.summary.final_total_portfolio_value_nominal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

