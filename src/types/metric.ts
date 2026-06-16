export interface WorkflowInput {
  input_name: string
  input_desc: string
  input_type: string
}

export interface WorkflowOutput {
  output_name: string
  output_desc: string
  output_type: string
}

export interface StepInput {
  input_name: string
  input_desc: string
  input_type: string
  input_source: string
}

export interface StepOutput {
  output_name: string
  output_desc: string
  output_type: string
}

export interface WorkflowStep {
  step_id: string
  step_name: string
  step_description: string
  step_inputs: StepInput[]
  step_outputs: StepOutput[]
  category: string
  reason: string
  detail: string
}

export interface Metric {
  // System
  id: string

  // Management
  code: string
  department: string
  reference: string

  // Workflow definition
  name: string
  description: string
  inputs: WorkflowInput[]
  output: WorkflowOutput
  steps: WorkflowStep[]

  // Executable
  executableCode: string
}
