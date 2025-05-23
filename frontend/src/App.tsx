
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import SimulationForm from './components/SimulationForm'
import './App.css'

import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

import type {
  StrategyParamsInput,
  ScenarioInput,
  SimulateRequest,
} from './types'
import type { StrategiesResponse } from './types/api'

const BASE_SCENARIO: ScenarioInput = {
  age: 65,
  rrsp_balance: 500_000,
  defined_benefit_pension: 20_000,
  cpp_at_65: 12_000,
  oas_at_65: 8_000,
  tfsa_balance: 100_000,
  desired_spending: 60_000,
  expect_return_pct: 5,
  stddev_return_pct: 8,
  life_expectancy_years: 25,
  province: 'ON',
  goal: 'maximize_spending',
  spouse: {
    age: 63,
    rrsp_balance: 250_000,
    other_income: 10_000,
    cpp_at_65: 9_000,
    oas_at_65: 7_000,
    tfsa_balance: 50_000,
    defined_benefit_pension: 0,
  },
}

function App() {
  const [apiStatus, setApiStatus] = useState<string | null>(null)
  const [goal, setGoal] = useState('maximize_spending')
  const [strategyList, setStrategyList] = useState<StrategiesResponse | null>(null)
  const [results] = useState([
    { year: 2024, rrsp: 10000, tfsa: 6000, oasClawback: 0 },
    { year: 2025, rrsp: 10500, tfsa: 7000, oasClawback: 50 },
  ])
  const [paramsState, setParamsState] = useState<StrategyParamsInput>({})

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StrategyParamsInput>({
    defaultValues: paramsState,
  })

  useEffect(() => {
    reset(paramsState)
  }, [paramsState, reset])

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const resp = await fetch(`/api/v1/strategies?goal=${goal}`)
        if (!resp.ok) throw new Error('failed')
        const data: StrategiesResponse = await resp.json()
        setStrategyList(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchStrategies()
  }, [goal])


  const checkHealth = async () => {
    try {
      const resp = await fetch('/api/v1/health');
      if (!resp.ok) throw new Error('Request failed');
      const data = await resp.json();
      setApiStatus(data.status);
    } catch (err) {
      setApiStatus('error');
    }
  };

  const submitParams = async (data: StrategyParamsInput) => {
    setParamsState(data)
    const req: SimulateRequest = {
      scenario: { ...BASE_SCENARIO, params: data },
      strategy_code: 'GM',
    }
    try {
      const resp = await fetch('/api/v1/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })
      if (!resp.ok) throw new Error('Request failed')
      const resData = await resp.json()
      console.log(resData)
    } catch (err) {
      console.error(err)
    }
  }

  const runCompare = async () => {
    const body = {
      scenario: { ...BASE_SCENARIO, goal },
      strategies: ['auto'],
    }
    try {
      const resp = await fetch('/api/v1/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!resp.ok) throw new Error('Request failed')
      const data = await resp.json()
      console.log(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Ontario Retirement Planner</h1>
      <button
        onClick={checkHealth}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Check API Health
      </button>

      {apiStatus && (
        <p className="mt-4">API status: {apiStatus}</p>
      )}
      <div className="mt-4">
        <label className="mr-2">Goal:</label>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="border p-1 rounded">
          <option value="minimize_tax">Minimize Tax</option>
          <option value="maximize_spending">Maximize Spending</option>
          <option value="preserve_estate">Preserve Estate</option>
          <option value="simplify">Simplify</option>
        </select>
      </div>
      {strategyList && (
        <div className="mt-4 space-y-1">
          {strategyList.strategies.map((s) => (
            <label key={s.code} className={strategyList.recommended.includes(s.code) ? 'font-bold text-blue-600 block' : 'block'}>
              <input type="checkbox" checked={strategyList.recommended.includes(s.code)} readOnly className="mr-1" />
              {s.label}
            </label>
          ))}
          <button onClick={runCompare} className="mt-2 px-3 py-1 bg-purple-600 text-white rounded">
            Compare Recommended
          </button>
        </div>
      )}
      <table className="mt-8 border-collapse border text-left">
        <thead>
          <tr>
            <th className="border px-4 py-2">Year</th>
            <th className="border px-4 py-2">RRSP Balance</th>
            <th className="border px-4 py-2">TFSA Balance</th>
            <th className="border px-4 py-2">
              <div className="flex items-center">
                OAS Clawback
                <span
                  className="ml-1 text-sm text-blue-600 cursor-pointer"
                  data-tooltip-id="oas-info"
                  data-tooltip-content="Old Age Security payments are reduced by 15% of net income over the threshold."
                  aria-label="Explanation of OAS clawback calculation"
                  aria-describedby="oas-info"
                  role="button"
                  tabIndex={0}
                >
                  ℹ️
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={row.year}>
              <td className="border px-4 py-2">{row.year}</td>
              <td className="border px-4 py-2">{row.rrsp}</td>
              <td className="border px-4 py-2">{row.tfsa}</td>
              <td className="border px-4 py-2">{row.oasClawback}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Tooltip id="oas-info" place="top" />
      {apiStatus && <p className="mt-2">API status: {apiStatus}</p>}

      <form
        onSubmit={handleSubmit(submitParams)}
        className="w-full max-w-md mt-6 space-y-4"
      >
        <div>
          <label className="block text-left">
            Bracket Fill Ceiling
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-bf-ceiling-info"
              data-tooltip-content="Income ceiling used for Bracket-Filling strategy"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            step="any"
            className="w-full border p-2 rounded"
            {...register('bracket_fill_ceiling', { min: 0 })}
          />

          <Tooltip id="app-bf-ceiling-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="bf-ceiling-tip-app"
            data-tooltip-content="Bracket Fill Ceiling – taxable income target"
            aria-label="Bracket Fill Ceiling info"
            aria-describedby="bf-ceiling-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="bf-ceiling-tip-app" place="top" />

        </div>

        <div>
          <label className="block text-left">
            RRIF Conversion Age
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-rrif-age-info"
              data-tooltip-content="Age to convert RRSP to RRIF"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            {...register('rrif_conversion_age', { min: 55, max: 71 })}
          />

          <Tooltip id="app-rrif-age-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="rrif-age-tip"
            data-tooltip-content="Age to convert RRSP into RRIF"
            aria-label="RRIF Conversion Age info"
            aria-describedby="rrif-age-tip"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="rrif-age-tip" place="top" />

        </div>

        <div>
          <label className="block text-left">
            CPP Start Age
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-cpp-age-info"
              data-tooltip-content="Age to begin CPP payments"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            {...register('cpp_start_age', { min: 60, max: 70 })}
          />

          <Tooltip id="app-cpp-age-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="cpp-age-tip-app"
            data-tooltip-content="Age when CPP benefits start"
            aria-label="CPP Start Age info"
            aria-describedby="cpp-age-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="cpp-age-tip-app" place="top" />

        </div>

        <div>
          <label className="block text-left">
            OAS Start Age
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-oas-age-info"
              data-tooltip-content="Age to begin OAS payments"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            {...register('oas_start_age', { min: 65, max: 70 })}
          />

          <Tooltip id="app-oas-age-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="oas-age-tip-app"
            data-tooltip-content="Age when OAS benefits start"
            aria-label="OAS Start Age info"
            aria-describedby="oas-age-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="oas-age-tip-app" place="top" />

        </div>

        <div>
          <label className="block text-left">
            Target Depletion Age
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-target-age-info"
              data-tooltip-content="Age by which RRIF should be depleted"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            {...register('target_depletion_age', { min: 70, max: 120 })}
          />

          <Tooltip id="app-target-age-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="deplete-age-tip-app"
            data-tooltip-content="Age to fully deplete RRIF"
            aria-label="Target Depletion Age info"
            aria-describedby="deplete-age-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="deplete-age-tip-app" place="top" />

        </div>

        <div>
          <label className="block text-left">
            Lump Sum Year Offset
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-lump-offset-info"
              data-tooltip-content="Years from start to withdraw lump sum"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            {...register('lump_sum_year_offset', { min: 0 })}
          />

          <Tooltip id="app-lump-offset-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="ls-offset-tip-app"
            data-tooltip-content="Years after retirement to withdraw lump sum"
            aria-label="Lump Sum Year Offset info"
            aria-describedby="ls-offset-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="ls-offset-tip-app" place="top" />

        </div>

        <div>
          <label className="block text-left">
            Lump Sum Amount
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-lump-amount-info"
              data-tooltip-content="One-time withdrawal amount"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            step="any"
            className="w-full border p-2 rounded"
            {...register('lump_sum_amount', { min: 0 })}
          />

          <Tooltip id="app-lump-amount-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="ls-amount-tip-app"
            data-tooltip-content="Amount of one-time lump sum"
            aria-label="Lump Sum Amount info"
            aria-describedby="ls-amount-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="ls-amount-tip-app" place="top" />

        </div>

        <div>
          <label className="block text-left">
            Loan Interest Rate (%)
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-interest-rate-info"
              data-tooltip-content="Interest rate on borrowed amount"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            step="any"
            className="w-full border p-2 rounded"
            {...register('loan_interest_rate_pct', { min: 0, max: 100 })}
          />

          <Tooltip id="app-interest-rate-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="loan-rate-tip-app"
            data-tooltip-content="Interest rate for investment loan"
            aria-label="Loan Interest Rate info"
            aria-describedby="loan-rate-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="loan-rate-tip-app" place="top" />

        </div>

        <div>
          <label className="block text-left">
            Loan Amount as % of RRIF
            <span
              className="ml-1 text-sm text-blue-600 cursor-pointer"
              data-tooltip-id="app-loan-pct-info"
              data-tooltip-content="Loan size as percentage of RRIF"
            >
              ℹ️
            </span>
          </label>
          <input
            type="number"
            step="any"
            className="w-full border p-2 rounded"
            {...register('loan_amount_as_pct_of_rrif', { min: 0, max: 100 })}
          />

          <Tooltip id="app-loan-pct-info" place="top" />

          <span
            className="ml-1 text-sm text-blue-600 cursor-pointer"
            data-tooltip-id="loan-pct-tip-app"
            data-tooltip-content="Loan amount as % of RRIF value"
            aria-label="Loan % of RRIF info"
            aria-describedby="loan-pct-tip-app"
            role="button"
            tabIndex={0}
          >
            ℹ️
          </span>
          <Tooltip id="loan-pct-tip-app" place="top" />

        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Run Simulation
        </button>
      </form>

      <pre className="mt-4 w-full max-w-md bg-gray-100 p-2 text-left overflow-x-auto text-xs">
        {JSON.stringify(paramsState, null, 2)}
      </pre>
      {apiStatus && <p className="mt-4">API status: {apiStatus}</p>}
      <div className="w-full max-w-2xl mt-6">
        <SimulationForm />
      </div>

    </div>
  )
}

export default App
