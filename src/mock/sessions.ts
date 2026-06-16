import type { ExtractedParam, MetricComputeResult } from '@/types/compute'

export const rawText = 'Patient is a 58-year-old male admitted for routine checkup. Height: 178 cm, Weight: 95 kg. History of hypertension for 8 years. Physical exam: BP 148/92 mmHg, HR 76 bpm. Lab results: Serum Cr 1.2 mg/dL, K 4.2 mmol/L, Hemoglobin 112 g/L. Fasting glucose 6.8 mmol/L. Urinalysis: protein(+). Echocardiography: LVEDD 52 mm, LVESD 34 mm.'

export const extractedParams: ExtractedParam[] = [
  { name: 'Age', rawValue: '58', normalizedValue: 58, unit: 'years', confidence: 5, position: { start: 13, end: 15 } },
  { name: 'Sex', rawValue: 'male', normalizedValue: 'M', unit: '-', confidence: 5, position: { start: 25, end: 29 } },
  { name: 'Height', rawValue: '178', normalizedValue: 178, unit: 'cm', confidence: 5, position: { start: 68, end: 71 } },
  { name: 'Weight', rawValue: '95', normalizedValue: 95, unit: 'kg', confidence: 5, position: { start: 84, end: 86 } },
  { name: 'SBP', rawValue: '148', normalizedValue: 148, unit: 'mmHg', confidence: 3, position: { start: 146, end: 149 } },
  { name: 'HR', rawValue: '76', normalizedValue: 76, unit: 'bpm', confidence: 5, position: { start: 162, end: 164 } },
  { name: 'SerumCreatinine', rawValue: '1.2', normalizedValue: 1.2, unit: 'mg/dL', confidence: 5, position: { start: 192, end: 195 } },
  { name: 'Hemoglobin', rawValue: '112', normalizedValue: 112, unit: 'g/L', confidence: 5, position: { start: 228, end: 231 } },
  { name: 'LVEDD', rawValue: '52', normalizedValue: 52, unit: 'mm', confidence: 5, position: { start: 313, end: 315 } },
  { name: 'LVESD', rawValue: '34', normalizedValue: 34, unit: 'mm', confidence: 5, position: { start: 326, end: 328 } },
]

export const uploadResponse = {
  sessionId: 'session_demo_001',
  rawText,
}

export const computeResponse: { results: MetricComputeResult[] } = {
  results: [
    {
      metricId: 'metric_001',
      metricName: 'eGFR (CKD-EPI)',
      metricCode: 'REN-001',
      finalValue: 72.4,
      finalUnit: 'mL/min/1.73m²',
      status: 'borderline',
      statusLabel: 'CKD Stage 2: Mildly decreased kidney function',
      referenceRange: { min: 90, max: 120 },
      extractedParams,
      steps: [
        {
          order: 1,
          stepName: 'Unit Conversion',
          toolId: 'tool_004',
          toolName: 'UnitConversion',
          description: 'Convert serum creatinine units if needed',
          input: { value: 1.2, fromUnit: 'mg/dL', toUnit: 'mg/dL' },
          inputSource: {
            value: { sourceType: 'raw', sourceLabel: 'Raw Text' },
          },
          output: { convertedValue: 1.2, unit: 'mg/dL' },
          status: 'success',
        },
        {
          order: 2,
          stepName: 'CKD-EPI Formula',
          toolId: 'tool_001',
          toolName: 'FormulaCalculation',
          description: 'Compute eGFR with CKD-EPI formula',
          formulaLatex: 'eGFR = 142 \\times \\min(Scr/\\kappa, 1)^\\alpha \\times \\max(Scr/\\kappa, 1)^{-1.200} \\times 0.9938^{Age} \\times 1.012',
          input: { Scr: 1.2, Age: 58, Sex: 'M' },
          inputSource: {
            Scr: { sourceType: 'raw', sourceLabel: 'Raw Text' },
            Age: { sourceType: 'raw', sourceLabel: 'Raw Text' },
            Sex: { sourceType: 'raw', sourceLabel: 'Raw Text' },
          },
          output: { eGFR: 72.4 },
          status: 'success',
        },
        {
          order: 3,
          stepName: 'CKD Stage Classification',
          toolId: 'xxx',
          toolName: 'ConditionEvaluation',
          description: 'Classify CKD stage based on eGFR value',
          input: { eGFR: 72.4 },
          inputSource: {
            eGFR: { sourceType: 'step', sourceLabel: 'Step2 : eGFR' },
          },
          output: { stage: 'Stage 2', description: 'Mildly decreased kidney function' },
          status: 'success',
        },
      ],
    },
  ],
}
