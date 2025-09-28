{{/*
SmartAbp LowCode Engine Helm Chart Helper Templates
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "smartabp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "smartabp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "smartabp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "smartabp.labels" -}}
helm.sh/chart: {{ include "smartabp.chart" . }}
{{ include "smartabp.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: smartabp-lowcode-engine
{{- end }}

{{/*
Selector labels
*/}}
{{- define "smartabp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "smartabp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "smartabp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "smartabp.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
PostgreSQL host template
*/}}
{{- define "smartabp.postgresql.host" -}}
{{- if .Values.postgresql.enabled }}
{{- printf "%s-postgresql" (include "smartabp.fullname" .) }}
{{- else }}
{{- .Values.externalDatabase.host }}
{{- end }}
{{- end }}

{{/*
PostgreSQL port template
*/}}
{{- define "smartabp.postgresql.port" -}}
{{- if .Values.postgresql.enabled }}
{{- .Values.postgresql.primary.service.ports.postgresql | default 5432 }}
{{- else }}
{{- .Values.externalDatabase.port | default 5432 }}
{{- end }}
{{- end }}

{{/*
PostgreSQL database template
*/}}
{{- define "smartabp.postgresql.database" -}}
{{- if .Values.postgresql.enabled }}
{{- .Values.postgresql.auth.database }}
{{- else }}
{{- .Values.externalDatabase.database }}
{{- end }}
{{- end }}

{{/*
PostgreSQL username template
*/}}
{{- define "smartabp.postgresql.username" -}}
{{- if .Values.postgresql.enabled }}
{{- .Values.postgresql.auth.username }}
{{- else }}
{{- .Values.externalDatabase.username }}
{{- end }}
{{- end }}

{{/*
PostgreSQL password secret name template
*/}}
{{- define "smartabp.postgresql.secretName" -}}
{{- if .Values.postgresql.enabled }}
{{- printf "%s-postgresql" (include "smartabp.fullname" .) }}
{{- else }}
{{- .Values.externalDatabase.existingSecret }}
{{- end }}
{{- end }}

{{/*
PostgreSQL password secret key template
*/}}
{{- define "smartabp.postgresql.secretPasswordKey" -}}
{{- if .Values.postgresql.enabled }}
password
{{- else }}
{{- .Values.externalDatabase.existingSecretPasswordKey }}
{{- end }}
{{- end }}

{{/*
Redis host template
*/}}
{{- define "smartabp.redis.host" -}}
{{- if .Values.redis.enabled }}
{{- printf "%s-redis-master" (include "smartabp.fullname" .) }}
{{- else }}
{{- .Values.externalRedis.host }}
{{- end }}
{{- end }}

{{/*
Redis port template
*/}}
{{- define "smartabp.redis.port" -}}
{{- if .Values.redis.enabled }}
{{- .Values.redis.master.service.ports.redis | default 6379 }}
{{- else }}
{{- .Values.externalRedis.port | default 6379 }}
{{- end }}
{{- end }}

{{/*
Create PostgreSQL connection string
*/}}
{{- define "smartabp.postgresql.connectionString" -}}
{{- printf "Server=%s;Port=%v;Database=%s;User Id=%s;Password=${POSTGRESQL_PASSWORD};" (include "smartabp.postgresql.host" .) (include "smartabp.postgresql.port" .) (include "smartabp.postgresql.database" .) (include "smartabp.postgresql.username" .) }}
{{- end }}

{{/*
Create Redis connection string
*/}}
{{- define "smartabp.redis.connectionString" -}}
{{- if .Values.redis.auth.enabled }}
{{- printf "%s:%v,password=${REDIS_PASSWORD}" (include "smartabp.redis.host" .) (include "smartabp.redis.port" .) }}
{{- else }}
{{- printf "%s:%v" (include "smartabp.redis.host" .) (include "smartabp.redis.port" .) }}
{{- end }}
{{- end }}

{{/*
Return true if cert-manager required annotations for TLS signed
certificates are set in the Ingress annotations
Ref: https://cert-manager.io/docs/usage/ingress/#supported-annotations
*/}}
{{- define "smartabp.ingress.certManagerRequest" -}}
{{ if or (hasKey . "cert-manager.io/cluster-issuer") (hasKey . "cert-manager.io/issuer") }}
    {{- true -}}
{{ end }}
{{- end }}

{{/*
Compile all warnings into a single message.
*/}}
{{- define "smartabp.validateValues" -}}
{{- $messages := list -}}
{{- $messages := append $messages (include "smartabp.validateValues.foo" .) -}}
{{- $messages := append $messages (include "smartabp.validateValues.bar" .) -}}
{{- $messages := without $messages "" -}}
{{- $message := join "\n" $messages -}}

{{- if $message -}}
{{-   printf "\nVALUES VALIDATION:\n%s" $message -}}
{{- end -}}
{{- end -}}

{{/*
Validate foo values
*/}}
{{- define "smartabp.validateValues.foo" -}}
{{- if and .Values.foo.enabled (not .Values.foo.name) }}
smartabp: foo.name
    A valid foo name is required!
{{- end -}}
{{- end -}}

{{/*
Validate bar values
*/}}
{{- define "smartabp.validateValues.bar" -}}
{{- if and .Values.bar.enabled (not .Values.bar.host) }}
smartabp: bar.host
    A valid bar host is required!
{{- end -}}
{{- end -}}

{{/*
Get the password secret name for PostgreSQL
*/}}
{{- define "smartabp.databaseSecretName" -}}
{{- if .Values.postgresql.enabled }}
    {{- if .Values.postgresql.auth.existingSecret }}
        {{- printf "%s" (tpl .Values.postgresql.auth.existingSecret $) }}
    {{- else }}
        {{- printf "%s-postgresql" (include "smartabp.fullname" .) }}
    {{- end }}
{{- else }}
    {{- printf "%s-external-db" (include "smartabp.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Get the password key for PostgreSQL
*/}}
{{- define "smartabp.databaseSecretPasswordKey" -}}
{{- if .Values.postgresql.enabled }}
    {{- if .Values.postgresql.auth.existingSecret }}
        {{- if .Values.postgresql.auth.secretKeys }}
            {{- if .Values.postgresql.auth.secretKeys.adminPasswordKey }}
                {{- printf "%s" .Values.postgresql.auth.secretKeys.adminPasswordKey }}
            {{- else }}
                {{- "postgres-password" }}
            {{- end }}
        {{- else }}
            {{- "postgres-password" }}
        {{- end }}
    {{- else }}
        {{- "password" }}
    {{- end }}
{{- else }}
    {{- "password" }}
{{- end }}
{{- end }}

{{/*
Return the appropriate apiVersion for networkpolicy.
*/}}
{{- define "smartabp.networkPolicy.apiVersion" -}}
{{- if semverCompare ">=1.11-0" .Capabilities.KubeVersion.GitVersion -}}
{{- print "networking.k8s.io/v1" -}}
{{- else -}}
{{- print "extensions/v1beta1" -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for poddisruptionbudget.
*/}}
{{- define "smartabp.podDisruptionBudget.apiVersion" -}}
{{- if semverCompare ">=1.21-0" .Capabilities.KubeVersion.GitVersion -}}
{{- print "policy/v1" -}}
{{- else -}}
{{- print "policy/v1beta1" -}}
{{- end -}}
{{- end -}}

{{/*
Return true if a TLS secret object should be created
*/}}
{{- define "smartabp.createTlsSecret" -}}
{{- if and .Values.ingress.tls .Values.ingress.selfSigned }}
    {{- true -}}
{{- end -}}
{{- end -}}

{{/*
Get the image registry
*/}}
{{- define "smartabp.imageRegistry" -}}
{{- $registries := list -}}
{{- if .Values.global }}
    {{- if .Values.global.imageRegistry }}
        {{- $registries = append $registries .Values.global.imageRegistry -}}
    {{- end -}}
{{- end -}}
{{- if .Values.image.registry }}
    {{- $registries = append $registries .Values.image.registry -}}
{{- end -}}
{{- if $registries }}
    {{- printf "%s" (first $registries) -}}
{{- end -}}
{{- end -}}

{{/*
Return the target Kubernetes version
*/}}
{{- define "smartabp.capabilities.kubeVersion" -}}
{{- if .Values.global }}
    {{- if .Values.global.compatibility }}
        {{- if .Values.global.compatibility.openshift }}
            {{- if .Values.global.compatibility.openshift.adaptSecurityContext }}
                {{- print "openshift-adapt-security-context" -}}
            {{- end -}}
        {{- end -}}
    {{- end -}}
{{- end -}}
{{- print .Capabilities.KubeVersion.Version -}}
{{- end -}}
