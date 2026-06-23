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
          category: 'preprocessing',
          step_name: 'Unit Conversion',
          step_description: 'Convert serum creatinine units if needed',
          inputs: [
            { input_name: 'value', input_value: 1.2, input_unit: 'mg/dL', input_source: '$|inputs|.SerumCreatinine' },
            { input_name: 'fromUnit', input_value: 'mg/dL', input_unit: null, input_source: '$|inputs|.fromUnit' },
            { input_name: 'toUnit', input_value: 'mg/dL', input_unit: null, input_source: '$|inputs|.toUnit' },
          ],
          outputs: [
            { output_name: 'convertedValue', output_value: 1.2, output_unit: 'mg/dL' },
          ],
          status: 'success',
        },
        {
          order: 2,
          category: 'computation',
          step_name: 'CKD-EPI Formula',
          step_description: 'Compute eGFR with CKD-EPI formula',
          inputs: [
            { input_name: 'Scr', input_value: 1.2, input_unit: 'mg/dL', input_source: '$|inputs|.SerumCreatinine' },
            { input_name: 'Age', input_value: 58, input_unit: 'years', input_source: '$|inputs|.Age' },
            { input_name: 'Sex', input_value: 'M', input_unit: null, input_source: '$|inputs|.Sex' },
          ],
          outputs: [
            { output_name: 'eGFR', output_value: 72.4, output_unit: 'mL/min/1.73m²' },
          ],
          status: 'success',
        },
        {
          order: 3,
          category: 'classification',
          step_name: 'CKD Stage Classification',
          step_description: 'Classify CKD stage based on eGFR value',
          inputs: [
            { input_name: 'eGFR', input_value: 72.4, input_unit: 'mL/min/1.73m²', input_source: '$|2|.eGFR' },
          ],
          outputs: [
            { output_name: 'stage', output_value: 'Stage 2', output_unit: null },
            { output_name: 'description', output_value: 'Mildly decreased kidney function', output_unit: null },
          ],
          status: 'success',
        },
      ],
    },
  ],
}
