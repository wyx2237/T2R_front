import type { Metric } from '@/types/metric'

export const metrics: Metric[] = [
  {
    id: 'metric_001',
    code: 'REN-001',
    name: 'eGFR (CKD-EPI)',
    description: 'Estimate glomerular filtration rate based on serum creatinine, age, and sex using the CKD-EPI 2021 formula.',
    department: 'Nephrology',
    reference: 'CKD-EPI 2021 (KDIGO)',
    inputs: [
      { input_name: 'SerumCreatinine', input_desc: 'Serum creatinine level', input_type: 'float' },
      { input_name: 'Age', input_desc: 'Patient age', input_type: 'int' },
      { input_name: 'Sex', input_desc: 'Patient biological sex (M/F)', input_type: 'enum' },
    ],
    output: {
      output_name: 'eGFR',
      output_desc: 'Estimated glomerular filtration rate',
      output_type: 'float',
    },
    steps: [
      {
        step_id: '1',
        step_name: 'convert_creatinine_units',
        step_description: 'Convert serum creatinine units from μmol/L to mg/dL if needed.',
        step_inputs: [
          { input_name: 'SerumCreatinine', input_desc: 'Serum creatinine level', input_type: 'float', input_source: '$|inputs|.SerumCreatinine' },
        ],
        step_outputs: [
          { output_name: 'Scr_mg_dL', output_desc: 'Serum creatinine in mg/dL', output_type: 'float' },
        ],
        category: 'unit_conversion',
        reason: 'The CKD-EPI formula requires serum creatinine in mg/dL; input may be provided in other units.',
        detail: 'If the input creatinine unit is already mg/dL, this step passes through unchanged. Otherwise, divide by 88.4 to convert from μmol/L.',
      },
      {
        step_id: '2',
        step_name: 'compute_egfr_ckd_epi',
        step_description: 'Compute eGFR using the CKD-EPI 2021 formula.',
        step_inputs: [
          { input_name: 'Scr_mg_dL', input_desc: 'Serum creatinine in mg/dL', input_type: 'float', input_source: '$|steps|.1.Scr_mg_dL' },
          { input_name: 'Age', input_desc: 'Patient age', input_type: 'int', input_source: '$|inputs|.Age' },
          { input_name: 'Sex', input_desc: 'Patient biological sex', input_type: 'enum', input_source: '$|inputs|.Sex' },
        ],
        step_outputs: [
          { output_name: 'eGFR', output_desc: 'Estimated GFR value', output_type: 'float' },
        ],
        category: 'formula_calculation',
        reason: 'The CKD-EPI formula is the gold standard for estimating kidney function from serum markers.',
        detail: 'eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200) × 0.9938^Age × 1.012 [if female]. κ = 0.7 (female) or 0.9 (male); α = -0.241 (female) or -0.302 (male).',
      },
      {
        step_id: '3',
        step_name: 'classify_ckd_stage',
        step_description: 'Classify CKD stage based on the computed eGFR value.',
        step_inputs: [
          { input_name: 'eGFR', input_desc: 'Estimated GFR value', input_type: 'float', input_source: '$|steps|.2.eGFR' },
        ],
        step_outputs: [
          { output_name: 'CKD_Stage', output_desc: 'CKD stage classification', output_type: 'string' },
        ],
        category: 'condition_evaluation',
        reason: 'Clinical guidelines require staging to determine treatment and monitoring plans.',
        detail: 'Stage 1: eGFR ≥ 90; Stage 2: 60-89; Stage 3a: 45-59; Stage 3b: 30-44; Stage 4: 15-29; Stage 5: < 15.',
      },
    ],
    executableCode: `def solve(SerumCreatinine, Age, Sex):
    # Step 1: Convert creatinine units if needed
    Scr_mg_dL = SerumCreatinine  # assuming already in mg/dL
    yield {"step_name": "convert_creatinine_units", "step_result": Scr_mg_dL, "unit": "mg/dL"}

    # Step 2: CKD-EPI formula
    kappa = 0.7 if Sex == "F" else 0.9
    alpha = -0.241 if Sex == "F" else -0.302
    sex_factor = 1.012 if Sex == "F" else 1.0
    ratio = Scr_mg_dL / kappa
    eGFR = 142 * min(ratio, 1) ** alpha * max(ratio, 1) ** (-1.200) * 0.9938 ** Age * sex_factor
    yield {"step_name": "compute_egfr_ckd_epi", "step_result": round(eGFR, 1), "unit": "mL/min/1.73m²"}

    # Step 3: Classify stage
    if eGFR >= 90: stage = "Stage 1"
    elif eGFR >= 60: stage = "Stage 2"
    elif eGFR >= 45: stage = "Stage 3a"
    elif eGFR >= 30: stage = "Stage 3b"
    elif eGFR >= 15: stage = "Stage 4"
    else: stage = "Stage 5"
    yield {"step_name": "classify_ckd_stage", "step_result": stage, "unit": None}

    return round(eGFR, 1)`,
  },
  {
    id: 'metric_002',
    code: 'CAR-003',
    name: 'LVEF (Left Ventricular Ejection Fraction)',
    description: 'Calculate left ventricular ejection fraction from echocardiographic measurements using the Teichholz formula.',
    department: 'Cardiology',
    reference: 'ASE Guidelines 2015',
    inputs: [
      { input_name: 'LVEDD', input_desc: 'Left ventricular end-diastolic diameter', input_type: 'float' },
      { input_name: 'LVESD', input_desc: 'Left ventricular end-systolic diameter', input_type: 'float' },
    ],
    output: {
      output_name: 'LVEF',
      output_desc: 'Left ventricular ejection fraction percentage',
      output_type: 'float',
    },
    steps: [
      {
        step_id: '1',
        step_name: 'compute_lvef_teichholz',
        step_description: 'Calculate LVEF using the Teichholz formula from LVEDD and LVESD.',
        step_inputs: [
          { input_name: 'LVEDD', input_desc: 'LV end-diastolic diameter', input_type: 'float', input_source: '$|inputs|.LVEDD' },
          { input_name: 'LVESD', input_desc: 'LV end-systolic diameter', input_type: 'float', input_source: '$|inputs|.LVESD' },
        ],
        step_outputs: [
          { output_name: 'LVEF', output_desc: 'Ejection fraction percentage', output_type: 'float' },
        ],
        category: 'formula_calculation',
        reason: 'The Teichholz formula is a well-established echocardiographic method for LVEF estimation.',
        detail: 'EDV = 7.0 × LVEDD³ / (2.4 + LVEDD); ESV = 7.0 × LVESD³ / (2.4 + LVESD); LVEF = (EDV - ESV) / EDV × 100.',
      },
      {
        step_id: '2',
        step_name: 'classify_lvef_severity',
        step_description: 'Classify LVEF into severity categories based on percentage.',
        step_inputs: [
          { input_name: 'LVEF', input_desc: 'Ejection fraction percentage', input_type: 'float', input_source: '$|steps|.1.LVEF' },
        ],
        step_outputs: [
          { output_name: 'Severity', output_desc: 'LVEF severity category', output_type: 'string' },
        ],
        category: 'condition_evaluation',
        reason: 'Clinicians need a categorical severity label to guide treatment decisions.',
        detail: 'Normal: ≥ 55%; Mildly reduced: 45-54%; Moderately reduced: 35-44%; Severely reduced: < 35%.',
      },
    ],
    executableCode: `def solve(LVEDD, LVESD):
    # Step 1: Teichholz formula
    EDV = 7.0 * LVEDD ** 3 / (2.4 + LVEDD)
    ESV = 7.0 * LVESD ** 3 / (2.4 + LVESD)
    LVEF = (EDV - ESV) / EDV * 100
    yield {"step_name": "compute_lvef_teichholz", "step_result": round(LVEF, 1), "unit": "%"}

    # Step 2: Classify
    if LVEF >= 55: severity = "Normal"
    elif LVEF >= 45: severity = "Mildly reduced"
    elif LVEF >= 35: severity = "Moderately reduced"
    else: severity = "Severely reduced"
    yield {"step_name": "classify_lvef_severity", "step_result": severity, "unit": None}

    return round(LVEF, 1)`,
  },
  {
    id: 'metric_003',
    code: 'CAR-007',
    name: 'HAS-BLED Score',
    description: 'Calculate the HAS-BLED bleeding risk score for patients on anticoagulation therapy.',
    department: 'Cardiology',
    reference: 'ESC Guidelines 2020',
    inputs: [
      { input_name: 'Hypertension', input_desc: 'Uncontrolled hypertension (SBP > 160 mmHg)', input_type: 'enum' },
      { input_name: 'RenalDisease', input_desc: 'Abnormal renal function', input_type: 'enum' },
      { input_name: 'LiverDisease', input_desc: 'Abnormal liver function', input_type: 'enum' },
      { input_name: 'BleedingHistory', input_desc: 'History of bleeding', input_type: 'enum' },
      { input_name: 'Age', input_desc: 'Age > 65', input_type: 'int' },
      { input_name: 'AlcoholUse', input_desc: 'Alcohol use', input_type: 'enum' },
      { input_name: 'LabileINR', input_desc: 'Labile INR', input_type: 'enum' },
    ],
    output: {
      output_name: 'HASBLED_Score',
      output_desc: 'Total HAS-BLED bleeding risk score (0-9)',
      output_type: 'int',
    },
    steps: [
      {
        step_id: '1',
        step_name: 'evaluate_hypertension',
        step_description: 'Evaluate whether the patient has uncontrolled hypertension.',
        step_inputs: [
          { input_name: 'Hypertension', input_desc: 'Uncontrolled hypertension flag', input_type: 'enum', input_source: '$|inputs|.Hypertension' },
        ],
        step_outputs: [
          { output_name: 'htn_point', output_desc: 'Hypertension point (0 or 1)', output_type: 'int' },
        ],
        category: 'condition_evaluation',
        reason: 'Uncontrolled hypertension (SBP > 160) is a key risk factor for bleeding.',
        detail: 'Assign 1 point if uncontrolled hypertension is present (SBP > 160 mmHg), 0 otherwise.',
      },
      {
        step_id: '2',
        step_name: 'evaluate_renal_liver',
        step_description: 'Map abnormal renal and liver function flags to risk points.',
        step_inputs: [
          { input_name: 'RenalDisease', input_desc: 'Abnormal renal function flag', input_type: 'enum', input_source: '$|inputs|.RenalDisease' },
          { input_name: 'LiverDisease', input_desc: 'Abnormal liver function flag', input_type: 'enum', input_source: '$|inputs|.LiverDisease' },
        ],
        step_outputs: [
          { output_name: 'renal_point', output_desc: 'Renal disease point', output_type: 'int' },
          { output_name: 'liver_point', output_desc: 'Liver disease point', output_type: 'int' },
        ],
        category: 'discrete_value_mapping',
        reason: 'Renal and liver impairment each independently contribute 1 point to bleeding risk.',
        detail: '1 point each for abnormal renal function (dialysis, transplant, Cr > 2.26 mg/dL) and abnormal liver function (cirrhosis, bilirubin > 2× normal).',
      },
      {
        step_id: '3',
        step_name: 'evaluate_bleeding_alcohol',
        step_description: 'Combine bleeding history and alcohol use risk factors.',
        step_inputs: [
          { input_name: 'BleedingHistory', input_desc: 'History of bleeding', input_type: 'enum', input_source: '$|inputs|.BleedingHistory' },
          { input_name: 'AlcoholUse', input_desc: 'Alcohol use', input_type: 'enum', input_source: '$|inputs|.AlcoholUse' },
        ],
        step_outputs: [
          { output_name: 'bleed_point', output_desc: 'Bleeding history point', output_type: 'int' },
          { output_name: 'alcohol_point', output_desc: 'Alcohol use point', output_type: 'int' },
        ],
        category: 'logical_combination',
        reason: 'Bleeding history and alcohol use are independent binary risk factors.',
        detail: '1 point each for prior bleeding history and alcohol use (≥ 8 drinks/week).',
      },
      {
        step_id: '4',
        step_name: 'sum_has_bled_score',
        step_description: 'Sum all risk factor points to produce the final HAS-BLED score.',
        step_inputs: [
          { input_name: 'htn_point', input_desc: 'Hypertension point', input_type: 'int', input_source: '$|steps|.1.htn_point' },
          { input_name: 'renal_point', input_desc: 'Renal disease point', input_type: 'int', input_source: '$|steps|.2.renal_point' },
          { input_name: 'liver_point', input_desc: 'Liver disease point', input_type: 'int', input_source: '$|steps|.2.liver_point' },
          { input_name: 'bleed_point', input_desc: 'Bleeding history point', input_type: 'int', input_source: '$|steps|.3.bleed_point' },
          { input_name: 'Age', input_desc: 'Age > 65', input_type: 'int', input_source: '$|inputs|.Age' },
          { input_name: 'alcohol_point', input_desc: 'Alcohol use point', input_type: 'int', input_source: '$|steps|.3.alcohol_point' },
          { input_name: 'LabileINR', input_desc: 'Labile INR flag', input_type: 'enum', input_source: '$|inputs|.LabileINR' },
        ],
        step_outputs: [
          { output_name: 'HASBLED_Score', output_desc: 'Total HAS-BLED score', output_type: 'int' },
        ],
        category: 'formula_calculation',
        reason: 'The final score is the arithmetic sum of all individual risk factor points.',
        detail: 'HAS-BLED = H (hypertension) + A (abnormal renal/liver) + S (stroke) + B (bleeding) + L (labile INR) + E (elderly > 65) + D (drugs/alcohol). Max 9 points.',
      },
    ],
    executableCode: `def solve(Hypertension, RenalDisease, LiverDisease, BleedingHistory, Age, AlcoholUse, LabileINR):
    score = 0

    # Step 1: Hypertension
    htn_point = 1 if Hypertension == "yes" else 0
    score += htn_point
    yield {"step_name": "evaluate_hypertension", "step_result": htn_point, "unit": None}

    # Step 2: Renal/Liver
    renal_point = 1 if RenalDisease == "yes" else 0
    liver_point = 1 if LiverDisease == "yes" else 0
    score += renal_point + liver_point
    yield {"step_name": "evaluate_renal_liver", "step_result": {"renal": renal_point, "liver": liver_point}, "unit": None}

    # Step 3: Bleeding/Alcohol
    bleed_point = 1 if BleedingHistory == "yes" else 0
    alcohol_point = 1 if AlcoholUse == "yes" else 0
    score += bleed_point + alcohol_point
    yield {"step_name": "evaluate_bleeding_alcohol", "step_result": {"bleeding": bleed_point, "alcohol": alcohol_point}, "unit": None}

    # Step 4: Sum remaining
    age_point = 1 if Age > 65 else 0
    inr_point = 1 if LabileINR == "yes" else 0
    score += age_point + inr_point
    yield {"step_name": "sum_has_bled_score", "step_result": score, "unit": None}

    return score`,
  },
  {
    id: 'metric_004',
    code: 'GEN-001',
    name: 'BMI (Body Mass Index)',
    description: 'Calculate body mass index from weight and height measurements.',
    department: 'General',
    reference: 'WHO BMI Classification',
    inputs: [
      { input_name: 'weight_kg', input_desc: "Patient's weight in kilograms", input_type: 'float' },
      { input_name: 'height_m', input_desc: "Patient's height in meters", input_type: 'float' },
    ],
    output: {
      output_name: 'bmi_value',
      output_desc: 'Calculated BMI value',
      output_type: 'float',
    },
    steps: [
      {
        step_id: '1',
        step_name: 'calculate_bmi',
        step_description: 'Calculate the Body Mass Index (BMI) using the formula BMI = weight (kg) / height (m)^2.',
        step_inputs: [
          { input_name: 'weight_kg', input_desc: "Patient's weight in kilograms", input_type: 'float', input_source: '$|inputs|.weight_kg' },
          { input_name: 'height_m', input_desc: "Patient's height in meters", input_type: 'float', input_source: '$|inputs|.height_m' },
        ],
        step_outputs: [
          { output_name: 'bmi_value', output_desc: 'Calculated BMI value', output_type: 'float' },
        ],
        category: 'anthropometric',
        reason: 'This step directly implements the BMI calculation formula, a standard anthropometric measurement.',
        detail: 'The BMI is calculated by dividing the patient\'s weight in kilograms by the square of their height in meters.',
      },
    ],
    executableCode: `def solve(weight_kg, height_m):
    bmi_value = weight_kg / (height_m ** 2)
    yield {"step_name": "calculate_bmi", "step_result": bmi_value, "unit": None}
    return bmi_value`,
  },
  {
    id: 'metric_005',
    code: 'REN-002',
    name: 'CrCl (Cockcroft-Gault)',
    description: 'Estimate creatinine clearance using the Cockcroft-Gault formula, accounting for age, weight, serum creatinine, and sex.',
    department: 'Nephrology',
    reference: 'Cockcroft-Gault 1976',
    inputs: [
      { input_name: 'SerumCreatinine', input_desc: 'Serum creatinine level', input_type: 'float' },
      { input_name: 'Age', input_desc: 'Patient age', input_type: 'int' },
      { input_name: 'Weight', input_desc: 'Body weight', input_type: 'float' },
      { input_name: 'Sex', input_desc: 'Patient biological sex (M/F)', input_type: 'enum' },
    ],
    output: {
      output_name: 'CrCl',
      output_desc: 'Estimated creatinine clearance',
      output_type: 'float',
    },
    steps: [
      {
        step_id: '1',
        step_name: 'compute_crcl_cg',
        step_description: 'Compute CrCl using the Cockcroft-Gault formula.',
        step_inputs: [
          { input_name: 'SerumCreatinine', input_desc: 'Serum creatinine level', input_type: 'float', input_source: '$|inputs|.SerumCreatinine' },
          { input_name: 'Age', input_desc: 'Patient age', input_type: 'int', input_source: '$|inputs|.Age' },
          { input_name: 'Weight', input_desc: 'Body weight', input_type: 'float', input_source: '$|inputs|.Weight' },
          { input_name: 'Sex', input_desc: 'Patient sex', input_type: 'enum', input_source: '$|inputs|.Sex' },
        ],
        step_outputs: [
          { output_name: 'CrCl', output_desc: 'Creatinine clearance value', output_type: 'float' },
        ],
        category: 'formula_calculation',
        reason: 'Cockcroft-Gault is the most widely used formula for estimating creatinine clearance.',
        detail: 'CrCl = ((140 - Age) × Weight) / (72 × Scr) × 0.85 [if female]. Weight in kg, Scr in mg/dL.',
      },
      {
        step_id: '2',
        step_name: 'classify_renal_function',
        step_description: 'Map CrCl to renal function category.',
        step_inputs: [
          { input_name: 'CrCl', input_desc: 'Creatinine clearance value', input_type: 'float', input_source: '$|steps|.1.CrCl' },
        ],
        step_outputs: [
          { output_name: 'Category', output_desc: 'Renal function category', output_type: 'string' },
        ],
        category: 'threshold_mapping',
        reason: 'Dose adjustment guidelines use renal function categories based on CrCl thresholds.',
        detail: 'Normal: ≥ 90; Mild impairment: 60-89; Moderate: 30-59; Severe: 15-29; Kidney failure: < 15.',
      },
    ],
    executableCode: `def solve(SerumCreatinine, Age, Weight, Sex):
    # Step 1: Cockcroft-Gault
    crcl = ((140 - Age) * Weight) / (72 * SerumCreatinine)
    if Sex == "F":
        crcl *= 0.85
    yield {"step_name": "compute_crcl_cg", "step_result": round(crcl, 1), "unit": "mL/min"}

    # Step 2: Classify
    if crcl >= 90: category = "Normal"
    elif crcl >= 60: category = "Mild impairment"
    elif crcl >= 30: category = "Moderate impairment"
    elif crcl >= 15: category = "Severe impairment"
    else: category = "Kidney failure"
    yield {"step_name": "classify_renal_function", "step_result": category, "unit": None}

    return round(crcl, 1)`,
  },
  {
    id: 'metric_006',
    code: 'PUL-001',
    name: 'PSI Score: Pneumonia Severity Index for CAP',
    description: 'Calculate the Pneumonia Severity Index (PSI) for community-acquired pneumonia to predict 30-day mortality risk.',
    department: 'Pulmonology',
    reference: 'Fine et al., NEJM 1997',
    inputs: [
      { input_name: 'Age', input_desc: 'Patient age in years', input_type: 'int' },
      { input_name: 'Sex', input_desc: 'Patient biological sex (M/F)', input_type: 'enum' },
      { input_name: 'NursingHome', input_desc: 'Nursing home resident', input_type: 'enum' },
      { input_name: 'NeoplasticDisease', input_desc: 'History of neoplastic disease', input_type: 'enum' },
      { input_name: 'LiverDisease', input_desc: 'History of liver disease', input_type: 'enum' },
      { input_name: 'CHF', input_desc: 'History of congestive heart failure', input_type: 'enum' },
      { input_name: 'CerebrovascularDisease', input_desc: 'History of cerebrovascular disease', input_type: 'enum' },
      { input_name: 'RenalDisease', input_desc: 'History of renal disease', input_type: 'enum' },
      { input_name: 'AlteredMentalStatus', input_desc: 'Altered mental status', input_type: 'enum' },
      { input_name: 'RespiratoryRate', input_desc: 'Respiratory rate ≥ 30 breaths/min', input_type: 'enum' },
      { input_name: 'SBP', input_desc: 'Systolic blood pressure < 90 mmHg', input_type: 'enum' },
      { input_name: 'Temperature', input_desc: 'Temperature < 35°C or > 39.9°C', input_type: 'enum' },
      { input_name: 'Pulse', input_desc: 'Pulse ≥ 125 beats/min', input_type: 'enum' },
      { input_name: 'pH', input_desc: 'Arterial pH < 7.35', input_type: 'enum' },
      { input_name: 'BUN', input_desc: 'BUN ≥ 30 mg/dL or ≥ 11 mmol/L', input_type: 'enum' },
      { input_name: 'Sodium', input_desc: 'Sodium < 130 mmol/L', input_type: 'enum' },
      { input_name: 'Glucose', input_desc: 'Glucose ≥ 250 mg/dL or ≥ 14 mmol/L', input_type: 'enum' },
      { input_name: 'Hematocrit', input_desc: 'Hematocrit < 30%', input_type: 'enum' },
      { input_name: 'PaO2', input_desc: 'Partial pressure of oxygen < 60 mmHg or < 8 kPa', input_type: 'enum' },
      { input_name: 'PleuralEffusion', input_desc: 'Pleural effusion on x-ray', input_type: 'enum' },
    ],
    output: {
      output_name: 'PSI_Score',
      output_desc: 'Total Pneumonia Severity Index score',
      output_type: 'int',
    },
    steps: [
      {
        step_id: '1',
        step_name: 'evaluate_demographics',
        step_description: 'Score demographic risk factors: age, sex, and nursing home residence.',
        step_inputs: [
          { input_name: 'Age', input_desc: 'Patient age in years', input_type: 'int', input_source: '$|inputs|.Age' },
          { input_name: 'Sex', input_desc: 'Patient sex', input_type: 'enum', input_source: '$|inputs|.Sex' },
          { input_name: 'NursingHome', input_desc: 'Nursing home resident', input_type: 'enum', input_source: '$|inputs|.NursingHome' },
        ],
        step_outputs: [
          { output_name: 'age_points', output_desc: 'Age score (equals age in years)', output_type: 'int' },
          { output_name: 'sex_points', output_desc: 'Sex score (-10 for female, 0 for male)', output_type: 'int' },
          { output_name: 'nursing_home_points', output_desc: 'Nursing home points (+10 if yes)', output_type: 'int' },
        ],
        category: 'demographic_scoring',
        reason: 'Age is the single largest contributor to PSI; sex and nursing home status refine risk.',
        detail: 'Age score = age in years. Female = -10 points. Nursing home resident = +10 points.',
      },
      {
        step_id: '2',
        step_name: 'evaluate_comorbidities',
        step_description: 'Score comorbidity risk factors.',
        step_inputs: [
          { input_name: 'NeoplasticDisease', input_desc: 'Neoplastic disease', input_type: 'enum', input_source: '$|inputs|.NeoplasticDisease' },
          { input_name: 'LiverDisease', input_desc: 'Liver disease', input_type: 'enum', input_source: '$|inputs|.LiverDisease' },
          { input_name: 'CHF', input_desc: 'CHF history', input_type: 'enum', input_source: '$|inputs|.CHF' },
          { input_name: 'CerebrovascularDisease', input_desc: 'Cerebrovascular disease', input_type: 'enum', input_source: '$|inputs|.CerebrovascularDisease' },
          { input_name: 'RenalDisease', input_desc: 'Renal disease', input_type: 'enum', input_source: '$|inputs|.RenalDisease' },
        ],
        step_outputs: [
          { output_name: 'neoplastic_points', output_desc: 'Neoplastic disease points (+30)', output_type: 'int' },
          { output_name: 'liver_points', output_desc: 'Liver disease points (+20)', output_type: 'int' },
          { output_name: 'chf_points', output_desc: 'CHF points (+10)', output_type: 'int' },
          { output_name: 'cvd_points', output_desc: 'Cerebrovascular disease points (+10)', output_type: 'int' },
          { output_name: 'renal_points', output_desc: 'Renal disease points (+10)', output_type: 'int' },
        ],
        category: 'comorbidity_scoring',
        reason: 'Comorbidities are major independent predictors of mortality in CAP.',
        detail: 'Neoplastic disease +30, Liver disease +20, CHF +10, CVD +10, Renal disease +10.',
      },
      {
        step_id: '3',
        step_name: 'evaluate_clinical_findings',
        step_description: 'Score physical exam and vital sign abnormalities.',
        step_inputs: [
          { input_name: 'AlteredMentalStatus', input_desc: 'Altered mental status', input_type: 'enum', input_source: '$|inputs|.AlteredMentalStatus' },
          { input_name: 'RespiratoryRate', input_desc: 'RR ≥ 30', input_type: 'enum', input_source: '$|inputs|.RespiratoryRate' },
          { input_name: 'SBP', input_desc: 'SBP < 90 mmHg', input_type: 'enum', input_source: '$|inputs|.SBP' },
          { input_name: 'Temperature', input_desc: 'Temp abnormality', input_type: 'enum', input_source: '$|inputs|.Temperature' },
          { input_name: 'Pulse', input_desc: 'Pulse ≥ 125', input_type: 'enum', input_source: '$|inputs|.Pulse' },
        ],
        step_outputs: [
          { output_name: 'ams_points', output_desc: 'Altered mental status (+20)', output_type: 'int' },
          { output_name: 'rr_points', output_desc: 'RR points (+20)', output_type: 'int' },
          { output_name: 'sbp_points', output_desc: 'SBP points (+20)', output_type: 'int' },
          { output_name: 'temp_points', output_desc: 'Temperature points (+15)', output_type: 'int' },
          { output_name: 'pulse_points', output_desc: 'Pulse points (+10)', output_type: 'int' },
        ],
        category: 'clinical_scoring',
        reason: 'Acute clinical instability signs indicate higher severity and mortality risk.',
        detail: 'AMS +20, RR≥30 +20, SBP<90 +20, Temp abnormal +15, Pulse≥125 +10.',
      },
      {
        step_id: '4',
        step_name: 'evaluate_lab_imaging',
        step_description: 'Score laboratory and radiographic abnormalities.',
        step_inputs: [
          { input_name: 'pH', input_desc: 'pH < 7.35', input_type: 'enum', input_source: '$|inputs|.pH' },
          { input_name: 'BUN', input_desc: 'BUN ≥ 30 mg/dL', input_type: 'enum', input_source: '$|inputs|.BUN' },
          { input_name: 'Sodium', input_desc: 'Sodium < 130 mmol/L', input_type: 'enum', input_source: '$|inputs|.Sodium' },
          { input_name: 'Glucose', input_desc: 'Glucose ≥ 250 mg/dL', input_type: 'enum', input_source: '$|inputs|.Glucose' },
          { input_name: 'Hematocrit', input_desc: 'Hematocrit < 30%', input_type: 'enum', input_source: '$|inputs|.Hematocrit' },
          { input_name: 'PaO2', input_desc: 'PaO2 < 60 mmHg', input_type: 'enum', input_source: '$|inputs|.PaO2' },
          { input_name: 'PleuralEffusion', input_desc: 'Pleural effusion', input_type: 'enum', input_source: '$|inputs|.PleuralEffusion' },
        ],
        step_outputs: [
          { output_name: 'ph_points', output_desc: 'pH points (+30)', output_type: 'int' },
          { output_name: 'bun_points', output_desc: 'BUN points (+20)', output_type: 'int' },
          { output_name: 'sodium_points', output_desc: 'Sodium points (+20)', output_type: 'int' },
          { output_name: 'glucose_points', output_desc: 'Glucose points (+10)', output_type: 'int' },
          { output_name: 'hct_points', output_desc: 'Hematocrit points (+10)', output_type: 'int' },
          { output_name: 'pao2_points', output_desc: 'PaO2 points (+10)', output_type: 'int' },
          { output_name: 'effusion_points', output_desc: 'Pleural effusion points (+10)', output_type: 'int' },
        ],
        category: 'lab_scoring',
        reason: 'Lab and imaging abnormalities reflect end-organ dysfunction and severity of infection.',
        detail: 'pH<7.35 +30, BUN≥30 +20, Na<130 +20, Glucose≥250 +10, Hct<30% +10, PaO2<60 +10, Pleural effusion +10.',
      },
      {
        step_id: '5',
        step_name: 'sum_psi_score',
        step_description: 'Sum all risk factor points to produce the final PSI score and risk class.',
        step_inputs: [
          { input_name: 'age_points', input_desc: 'Age score', input_type: 'int', input_source: '$|steps|.1.age_points' },
          { input_name: 'sex_points', input_desc: 'Sex score', input_type: 'int', input_source: '$|steps|.1.sex_points' },
          { input_name: 'nursing_home_points', input_desc: 'Nursing home points', input_type: 'int', input_source: '$|steps|.1.nursing_home_points' },
          { input_name: 'neoplastic_points', input_desc: 'Neoplastic disease points', input_type: 'int', input_source: '$|steps|.2.neoplastic_points' },
          { input_name: 'liver_points', input_desc: 'Liver disease points', input_type: 'int', input_source: '$|steps|.2.liver_points' },
          { input_name: 'chf_points', input_desc: 'CHF points', input_type: 'int', input_source: '$|steps|.2.chf_points' },
          { input_name: 'cvd_points', input_desc: 'CVD points', input_type: 'int', input_source: '$|steps|.2.cvd_points' },
          { input_name: 'renal_points', input_desc: 'Renal disease points', input_type: 'int', input_source: '$|steps|.2.renal_points' },
          { input_name: 'ams_points', input_desc: 'AMS points', input_type: 'int', input_source: '$|steps|.3.ams_points' },
          { input_name: 'rr_points', input_desc: 'RR points', input_type: 'int', input_source: '$|steps|.3.rr_points' },
          { input_name: 'sbp_points', input_desc: 'SBP points', input_type: 'int', input_source: '$|steps|.3.sbp_points' },
          { input_name: 'temp_points', input_desc: 'Temperature points', input_type: 'int', input_source: '$|steps|.3.temp_points' },
          { input_name: 'pulse_points', input_desc: 'Pulse points', input_type: 'int', input_source: '$|steps|.3.pulse_points' },
          { input_name: 'ph_points', input_desc: 'pH points', input_type: 'int', input_source: '$|steps|.4.ph_points' },
          { input_name: 'bun_points', input_desc: 'BUN points', input_type: 'int', input_source: '$|steps|.4.bun_points' },
          { input_name: 'sodium_points', input_desc: 'Sodium points', input_type: 'int', input_source: '$|steps|.4.sodium_points' },
          { input_name: 'glucose_points', input_desc: 'Glucose points', input_type: 'int', input_source: '$|steps|.4.glucose_points' },
          { input_name: 'hct_points', input_desc: 'Hematocrit points', input_type: 'int', input_source: '$|steps|.4.hct_points' },
          { input_name: 'pao2_points', input_desc: 'PaO2 points', input_type: 'int', input_source: '$|steps|.4.pao2_points' },
          { input_name: 'effusion_points', input_desc: 'Pleural effusion points', input_type: 'int', input_source: '$|steps|.4.effusion_points' },
        ],
        step_outputs: [
          { output_name: 'PSI_Score', output_desc: 'Total PSI score', output_type: 'int' },
          { output_name: 'RiskClass', output_desc: 'PSI risk class (I-V)', output_type: 'string' },
        ],
        category: 'summation',
        reason: 'The total score determines risk class and guides site-of-care decisions.',
        detail: 'Class I: <51 (age<50, no risk factors); Class II: 51-70; Class III: 71-90; Class IV: 91-130; Class V: >130.',
      },
    ],
    executableCode: `def solve(Age, Sex, NursingHome, NeoplasticDisease, LiverDisease, CHF, CerebrovascularDisease, RenalDisease, AlteredMentalStatus, RespiratoryRate, SBP, Temperature, Pulse, pH, BUN, Sodium, Glucose, Hematocrit, PaO2, PleuralEffusion):
    score = 0

    # Step 1: Demographics
    age_points = Age
    sex_points = -10 if Sex == "F" else 0
    nursing_home_points = 10 if NursingHome == "yes" else 0
    score += age_points + sex_points + nursing_home_points
    yield {"step_name": "evaluate_demographics", "step_result": {"age": age_points, "sex": sex_points, "nursing_home": nursing_home_points}, "unit": None}

    # Step 2: Comorbidities
    neoplastic_points = 30 if NeoplasticDisease == "yes" else 0
    liver_points = 20 if LiverDisease == "yes" else 0
    chf_points = 10 if CHF == "yes" else 0
    cvd_points = 10 if CerebrovascularDisease == "yes" else 0
    renal_points = 10 if RenalDisease == "yes" else 0
    score += neoplastic_points + liver_points + chf_points + cvd_points + renal_points
    yield {"step_name": "evaluate_comorbidities", "step_result": {"neoplastic": neoplastic_points, "liver": liver_points, "chf": chf_points, "cvd": cvd_points, "renal": renal_points}, "unit": None}

    # Step 3: Clinical findings
    ams_points = 20 if AlteredMentalStatus == "yes" else 0
    rr_points = 20 if RespiratoryRate == "yes" else 0
    sbp_points = 20 if SBP == "yes" else 0
    temp_points = 15 if Temperature == "yes" else 0
    pulse_points = 10 if Pulse == "yes" else 0
    score += ams_points + rr_points + sbp_points + temp_points + pulse_points
    yield {"step_name": "evaluate_clinical_findings", "step_result": {"ams": ams_points, "rr": rr_points, "sbp": sbp_points, "temp": temp_points, "pulse": pulse_points}, "unit": None}

    # Step 4: Lab/imaging
    ph_points = 30 if pH == "yes" else 0
    bun_points = 20 if BUN == "yes" else 0
    sodium_points = 20 if Sodium == "yes" else 0
    glucose_points = 10 if Glucose == "yes" else 0
    hct_points = 10 if Hematocrit == "yes" else 0
    pao2_points = 10 if PaO2 == "yes" else 0
    effusion_points = 10 if PleuralEffusion == "yes" else 0
    score += ph_points + bun_points + sodium_points + glucose_points + hct_points + pao2_points + effusion_points
    yield {"step_name": "evaluate_lab_imaging", "step_result": {"ph": ph_points, "bun": bun_points, "sodium": sodium_points, "glucose": glucose_points, "hct": hct_points, "pao2": pao2_points, "effusion": effusion_points}, "unit": None}

    # Step 5: Risk class
    if score < 51: risk_class = "Class I"
    elif score <= 70: risk_class = "Class II"
    elif score <= 90: risk_class = "Class III"
    elif score <= 130: risk_class = "Class IV"
    else: risk_class = "Class V"
    yield {"step_name": "sum_psi_score", "step_result": {"PSI": score, "RiskClass": risk_class}, "unit": None}

    return score`,
  },
  {
    id: 'metric_007',
    code: 'NEU-001',
    name: 'Glasgow Coma Score (GCS)',
    description: "Calculate the Glasgow Coma Scale to assess a patient's level of consciousness based on eye, verbal, and motor responses.",
    department: 'Neurology',
    reference: 'Teasdale & Jennett, Lancet 1974',
    inputs: [
      { input_name: 'EyeResponse', input_desc: 'Best eye response (spontaneous/to_pain/to_verbal/none)', input_type: 'enum' },
      { input_name: 'VerbalResponse', input_desc: 'Best verbal response (oriented/confused/words/sounds/none)', input_type: 'enum' },
      { input_name: 'MotorResponse', input_desc: 'Best motor response (obeys/localizes/withdraws/flexion/extension/none)', input_type: 'enum' },
    ],
    output: {
      output_name: 'GCS_Score',
      output_desc: 'Total Glasgow Coma Score (3-15)',
      output_type: 'int',
    },
    steps: [
      {
        step_id: '1',
        step_name: 'score_eye_response',
        step_description: 'Map the best eye response to GCS eye component score.',
        step_inputs: [
          { input_name: 'EyeResponse', input_desc: 'Best eye response', input_type: 'enum', input_source: '$|inputs|.EyeResponse' },
        ],
        step_outputs: [
          { output_name: 'eye_score', output_desc: 'Eye component score (1-4)', output_type: 'int' },
        ],
        category: 'discrete_value_mapping',
        reason: 'Each eye response level maps to a fixed integer score.',
        detail: 'Spontaneous = 4, To verbal = 3, To pain = 2, None = 1. If not testable, default to 4.',
      },
      {
        step_id: '2',
        step_name: 'score_verbal_response',
        step_description: 'Map the best verbal response to GCS verbal component score.',
        step_inputs: [
          { input_name: 'VerbalResponse', input_desc: 'Best verbal response', input_type: 'enum', input_source: '$|inputs|.VerbalResponse' },
        ],
        step_outputs: [
          { output_name: 'verbal_score', output_desc: 'Verbal component score (1-5)', output_type: 'int' },
        ],
        category: 'discrete_value_mapping',
        reason: 'Each verbal response level maps to a fixed integer score.',
        detail: 'Oriented = 5, Confused = 4, Words = 3, Sounds = 2, None = 1. If not testable, default to 5.',
      },
      {
        step_id: '3',
        step_name: 'score_motor_response',
        step_description: 'Map the best motor response to GCS motor component score.',
        step_inputs: [
          { input_name: 'MotorResponse', input_desc: 'Best motor response', input_type: 'enum', input_source: '$|inputs|.MotorResponse' },
        ],
        step_outputs: [
          { output_name: 'motor_score', output_desc: 'Motor component score (1-6)', output_type: 'int' },
        ],
        category: 'discrete_value_mapping',
        reason: 'Each motor response level maps to a fixed integer score.',
        detail: 'Obeys = 6, Localizes = 5, Withdraws = 4, Flexion = 3, Extension = 2, None = 1. If not testable, default to 6.',
      },
      {
        step_id: '4',
        step_name: 'sum_gcs_score',
        step_description: 'Sum the three component scores to produce the final GCS total.',
        step_inputs: [
          { input_name: 'eye_score', input_desc: 'Eye component score', input_type: 'int', input_source: '$|steps|.1.eye_score' },
          { input_name: 'verbal_score', input_desc: 'Verbal component score', input_type: 'int', input_source: '$|steps|.2.verbal_score' },
          { input_name: 'motor_score', input_desc: 'Motor component score', input_type: 'int', input_source: '$|steps|.3.motor_score' },
        ],
        step_outputs: [
          { output_name: 'GCS_Score', output_desc: 'Total GCS score (3-15)', output_type: 'int' },
          { output_name: 'Severity', output_desc: 'Severity classification', output_type: 'string' },
        ],
        category: 'summation',
        reason: 'The total GCS score is the sum of its three components and correlates with injury severity.',
        detail: 'Severe: 3-8, Moderate: 9-12, Mild: 13-15.',
      },
    ],
    executableCode: `def solve(EyeResponse, VerbalResponse, MotorResponse):
    # Step 1: Eye response
    eye_map = {"spontaneous": 4, "to_verbal": 3, "to_pain": 2, "none": 1}
    eye_score = eye_map.get(EyeResponse, 4)
    yield {"step_name": "score_eye_response", "step_result": eye_score, "unit": None}

    # Step 2: Verbal response
    verbal_map = {"oriented": 5, "confused": 4, "words": 3, "sounds": 2, "none": 1}
    verbal_score = verbal_map.get(VerbalResponse, 5)
    yield {"step_name": "score_verbal_response", "step_result": verbal_score, "unit": None}

    # Step 3: Motor response
    motor_map = {"obeys": 6, "localizes": 5, "withdraws": 4, "flexion": 3, "extension": 2, "none": 1}
    motor_score = motor_map.get(MotorResponse, 6)
    yield {"step_name": "score_motor_response", "step_result": motor_score, "unit": None}

    # Step 4: Total
    gcs = eye_score + verbal_score + motor_score
    if gcs <= 8: severity = "Severe"
    elif gcs <= 12: severity = "Moderate"
    else: severity = "Mild"
    yield {"step_name": "sum_gcs_score", "step_result": {"GCS": gcs, "Severity": severity}, "unit": None}

    return gcs`,
  },
]
