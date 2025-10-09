export var SecurityAlertType;
(function (SecurityAlertType) {
    SecurityAlertType["VULNERABILITY"] = "VULNERABILITY";
    SecurityAlertType["LOGIN_ATTEMPT"] = "LOGIN_ATTEMPT";
    SecurityAlertType["OFF_HOURS_ACCESS"] = "OffHoursAccess";
    SecurityAlertType["PERMISSION_ESCALATION"] = "PermissionEscalation";
    SecurityAlertType["MULTIPLE_FAILED_ATTEMPTS"] = "MultipleFailedAttempts";
    SecurityAlertType["SENSITIVE_DATA_ACCESS"] = "SensitiveDataAccess";
    SecurityAlertType["SUSPICIOUS_ACTIVITY"] = "SuspiciousActivity";
})(SecurityAlertType || (SecurityAlertType = {}));
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["CRITICAL"] = "Critical";
    AlertSeverity["HIGH"] = "High";
    AlertSeverity["MEDIUM"] = "Medium";
    AlertSeverity["LOW"] = "Low";
})(AlertSeverity || (AlertSeverity = {}));
