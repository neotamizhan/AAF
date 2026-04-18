"use client";

import Papa from "papaparse";
import { useMemo, useState } from "react";
import type { z } from "zod";
import {
  actualResultRowSchema,
  currentCandidateRowSchema,
  previousResultRowSchema,
  validateRows,
  type ValidationIssue
} from "@/lib/csv/validation";
import { csvTemplates, type CsvTemplateKey } from "@/lib/csv/templates";
import { Button } from "@/components/ui";

const validators: Record<CsvTemplateKey, z.ZodSchema<unknown> | null> = {
  currentCandidates: currentCandidateRowSchema,
  previousResults: previousResultRowSchema,
  actualResults: actualResultRowSchema,
  constituencies: null
};

type ParsedRow = Record<string, string>;

export function CsvImportPanel() {
  const [templateKey, setTemplateKey] = useState<CsvTemplateKey>("currentCandidates");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const template = csvTemplates[templateKey];
  const sampleCsv = useMemo(() => template.headers.join(",") + "\n", [template]);

  function parse(file: File) {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(result) {
        const parsedRows = result.data;
        setRows(parsedRows);
        const validator = validators[templateKey];
        if (!validator) {
          setIssues([]);
          return;
        }
        setIssues(validateRows(parsedRows, validator).issues);
      }
    });
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div>
          <label className="block text-sm font-semibold" htmlFor="import-type">
            Import type
          </label>
          <select
            id="import-type"
            value={templateKey}
            onChange={(event) => {
              setTemplateKey(event.target.value as CsvTemplateKey);
              setRows([]);
              setIssues([]);
            }}
            className="focus-ring mt-2 min-h-11 w-full rounded-md border border-line bg-paper px-3 text-sm"
          >
            {(Object.keys(csvTemplates) as CsvTemplateKey[]).map((key) => (
              <option key={key} value={key}>
                {csvTemplates[key].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold" htmlFor="csv-file">
            CSV file
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) parse(file);
            }}
            className="focus-ring mt-2 min-h-11 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-5 rounded-md border border-line bg-paper p-3">
        <p className="text-sm font-bold">Required headers</p>
        <code className="mt-2 block overflow-x-auto whitespace-pre rounded-md bg-white p-3 text-xs">
          {sampleCsv}
        </code>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-line p-4">
          <p className="font-semibold">{rows.length} parsed rows</p>
          <p className="mt-1 text-sm text-ink/65">
            Preview validation runs in the browser. Confirmed imports should go through
            Supabase Edge Functions.
          </p>
        </div>
        <div className="rounded-md border border-line p-4">
          <p className="font-semibold">{issues.length} validation issues</p>
          <div className="mt-2 max-h-40 overflow-auto text-sm text-ember">
            {issues.slice(0, 12).map((issue) => (
              <p key={`${issue.rowNumber}-${issue.field}-${issue.message}`}>
                Row {issue.rowNumber}, {issue.field}: {issue.message}
              </p>
            ))}
          </div>
        </div>
      </div>

      <Button className="mt-5" disabled>
        Confirm import through Edge Function
      </Button>
    </section>
  );
}
