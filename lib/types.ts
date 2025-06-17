export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  prompt?: string
  lastCode?: string
  framework?: string
  diagramType?: string
  createdAt: string
  updatedAt?: string
  umlDiagrams?: {
    class?: string
    entity?: string
    sequence?: string
    component?: string
    architecture?: string
    [key: string]: string | undefined
  }
  design?: string
  documentation?: Documentation
  designDocument?: DesignDocument
  infraCode?: string
  appCode?: {
    frontend: {
      components: Record<string, string>;
      pages: Record<string, string>;
      utils: Record<string, string>;
    };
    backend: {
      controllers: Record<string, string>;
      models: Record<string, string>;
      routes: Record<string, string>;
      utils: Record<string, string>;
    };
    documentation: string;
  };
}

export interface UMLDiagram {
  id: string
  projectId?: string
  diagramType: string
  diagramData: string
  diagrams?: UMLDiagram[] // For batch responses
  prompt?: string
  createdAt: string
  updatedAt: string

  // For direct property format
  class?: string
  sequence?: string
  component?: string
  architecture?: string
}

export interface User {
  id: string
  email: string
}

export interface ApiResponse<T> {
  data: T
  status: string
}

export interface ApiErrorResponse {
  error: string
  status: string
  statusCode: number
}

export interface GenerateDocumentationResponse {
  status: "accepted"
  jobId: string
  message: string
  checkStatusUrl: string
}

export interface DocumentationStatusResponse {
  jobId: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  result?: DesignDocument // Present when status is "completed"
  error?: string // Present when status is "failed"
}

export interface DesignDocument {
  metadata: {
    title: string
    authors: string[]
    date_created: string
    date_updated: string
    reviewers: string[]
    version: string
    status: string
    document_scope: string
  }
  executive_summary: string
  goals: {
    goals_list: string[]
    non_goals_list: string[]
  }
  background_context: string
  requirements: {
    functional: string[]
    non_functional: string[]
    regulatory_compliance: string[]
  }
  proposed_architecture: {
    high_level_architecture_diagram: string
    components: Array<{
      name: string
      purpose: string
      responsibility: string
      inputs_outputs: string
      failure_modes: string
      interfaces: string
    }>
    data_models: Array<{
      name: string
      description: string
      fields: string[]
    }>
    external_integrations: Array<{
      name: string
      purpose: string
      interface: string
    }>
  }
  detailed_design: {
    sequence_diagrams: Array<{
      name: string
      description: string
    }>
    algorithms: Array<{
      name: string
      description: string
      complexity: string
    }>
    modules_classes: Array<{
      name: string
      purpose: string
      responsibilities: string[]
    }>
    concurrency_model: string
    retry_idempotency_logic: string
  }
  api_contracts: {
    api_type: string
    endpoints: Array<{
      path: string
      method: string
      description: string
      request_format: string
      response_format: string
    }>
    request_response_format: string
    error_handling: string
    versioning_strategy: string
  }
  deployment_infrastructure: {
    environment_setup: Array<{
      environment: string
      requirements: string[]
    }>
    iac_outline: string
    ci_cd_strategy: string
    feature_flags: string
    secrets_configuration: string
  }
  observability_plan: {
    logging: string
    metrics: string
    tracing: string
    dashboards: string
    alerting_rules: string
  }
  security_considerations: {
    threat_model: string
    encryption: {
      at_rest: string
      in_transit: string
    }
    authentication_authorization: string
    secrets_handling: string
    security_reviews_required: boolean
  }
  failure_handling_resilience: {
    failure_modes: string
    fallbacks_retries: string
    graceful_degradation: string
    disaster_recovery: string
  }
  cost_estimation: {
    infrastructure: string
    third_party_services: string
    storage_bandwidth: string
  }
  risks_tradeoffs: Array<{
    risk: string
    mitigation: string
    tradeoff: string
  }>
  alternatives_considered: Array<{
    alternative: string
    pros: string[]
    cons: string[]
    why_rejected: string
  }>
  rollout_plan: {
    strategy: string
    data_migration: string
    stakeholder_communication: string
    feature_flags_usage: string
  }
  post_launch_checklist: {
    health_checks: string
    regression_coverage: string
    load_testing: string
    ownership_and_runbooks: string
  }
  open_questions: Array<{
    question: string
    impact: string
    next_steps: string
  }>
  appendix: {
    external_links: string[]
    reference_docs: string[]
    terminology: Array<{
      term: string
      definition: string
    }>
  }
}

export interface Documentation {
  id: string
  projectId: string
  prompt: string
  umlDiagrams: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
  createdAt: string
  updatedAt: string
}

export interface GenerateIaCRequest {
  prompt: string;
  projectId: string;
  umlDiagrams: Record<string, string>;
  async?: boolean;
}

export interface GenerateIaCResponse {
  code?: string;
  documentation?: string;
  jobId?: string;
  status?: string;
  message?: string;
}

export interface ProjectStateUpdate {
  prompt?: string;
  lastCode?: string;
  design?: string;
}

export interface GenerateAppCodeRequest {
  prompt: string;
  projectId: string;
  umlDiagrams: Record<string, string>;
}

export interface AppCodeResponse {
  frontend: {
    components: Record<string, string>;
    pages: Record<string, string>;
    utils: Record<string, string>;
  };
  backend: {
    controllers: Record<string, string>;
    models: Record<string, string>;
    routes: Record<string, string>;
    utils: Record<string, string>;
  };
  documentation: string;
}
