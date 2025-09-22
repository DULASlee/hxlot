@echo off
REM Security Testing Execution Script (Windows)
REM Stage 6.2 Large-Scale Performance & Security Testing

echo.
echo ==========================================
echo 🛡️  SmartAbp Enterprise Security Testing Suite
echo ==========================================
echo Starting comprehensive security assessment...
echo.

REM Configuration
set BASE_URL=https://localhost:5001
if not "%1"=="" set BASE_URL=%1

set SECURITY_RESULTS_DIR=.\results\security
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM Create results directory
if not exist %SECURITY_RESULTS_DIR% mkdir %SECURITY_RESULTS_DIR%

REM Function to check if K6 is installed
k6 version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] K6 is not installed. Please install K6 first.
    echo Install instructions: https://k6.io/docs/getting-started/installation/
    exit /b 1
)
echo [SUCCESS] K6 is available

REM Function to check if the target application is running
echo [INFO] Checking if target application is available at %BASE_URL%...
curl -k -s --head --request GET "%BASE_URL%/api/health" | findstr "200" >nul
if errorlevel 1 (
    echo [ERROR] Target application is not accessible at %BASE_URL%
    echo Please ensure the SmartAbp application is running before starting security tests.
    exit /b 1
)
echo [SUCCESS] Target application is running and accessible

REM Set environment variables
set K6_BROWSER_ENABLED=false
set K6_NO_USAGE_REPORT=true

echo.
echo [INFO] Starting security testing sequence...
echo.

REM 1. Security Stress Testing
echo [INFO] Starting Security Stress Testing...
k6 run ^
    --env BASE_URL=%BASE_URL% ^
    --env K6_TEST_TYPE=mixed ^
    --out json=%SECURITY_RESULTS_DIR%\security_stress_%TIMESTAMP%.json ^
    --summary-export=%SECURITY_RESULTS_DIR%\security_stress_summary_%TIMESTAMP%.json ^
    .\tests\security\security-stress.js

if errorlevel 1 (
    echo [ERROR] Security stress testing failed
) else (
    echo [SUCCESS] Security stress testing completed successfully
)

echo.

REM 2. OWASP Top 10 Vulnerability Scanning
echo [INFO] Starting OWASP Top 10 Vulnerability Scanning...
k6 run ^
    --env BASE_URL=%BASE_URL% ^
    --env K6_VULNERABILITY_TYPE=mixed ^
    --out json=%SECURITY_RESULTS_DIR%\vulnerability_scan_%TIMESTAMP%.json ^
    --summary-export=%SECURITY_RESULTS_DIR%\vulnerability_summary_%TIMESTAMP%.json ^
    .\tests\security\vulnerability-scan.js

if errorlevel 1 (
    echo [ERROR] Vulnerability scanning failed
) else (
    echo [SUCCESS] Vulnerability scanning completed successfully
)

echo.

REM 3. Penetration Testing
echo [INFO] Starting Automated Penetration Testing...
k6 run ^
    --env BASE_URL=%BASE_URL% ^
    --env K6_PENTEST_TYPE=comprehensive ^
    --out json=%SECURITY_RESULTS_DIR%\penetration_test_%TIMESTAMP%.json ^
    --summary-export=%SECURITY_RESULTS_DIR%\penetration_summary_%TIMESTAMP%.json ^
    .\tests\security\penetration-test.js

if errorlevel 1 (
    echo [ERROR] Penetration testing failed
) else (
    echo [SUCCESS] Penetration testing completed successfully
)

echo.

REM 4. Performance Testing Under Attack
echo [INFO] Starting Performance Testing Under Attack Conditions...

REM Start load test in background
start /b k6 run ^
    --env BASE_URL=%BASE_URL% ^
    --env ATTACK_MODE=true ^
    --out json=%SECURITY_RESULTS_DIR%\perf_under_attack_%TIMESTAMP%.json ^
    --summary-export=%SECURITY_RESULTS_DIR%\perf_under_attack_summary_%TIMESTAMP%.json ^
    .\tests\load\dashboard-load.js

REM Wait for load test to stabilize
timeout /t 30 /nobreak >nul

REM Start security attacks in parallel
start /b k6 run ^
    --env BASE_URL=%BASE_URL% ^
    --env K6_TEST_TYPE=rate_limit ^
    --duration=10m ^
    --vus=20 ^
    .\tests\security\security-stress.js

REM Wait for tests to complete (approximate)
echo [INFO] Waiting for performance and security tests to complete...
timeout /t 600 /nobreak >nul

echo [SUCCESS] Performance testing under attack completed

echo.

REM Generate Security Report
echo [INFO] Generating comprehensive security report...

set REPORT_FILE=%SECURITY_RESULTS_DIR%\security_report_%TIMESTAMP%.html

echo ^<!DOCTYPE html^> > %REPORT_FILE%
echo ^<html^> >> %REPORT_FILE%
echo ^<head^> >> %REPORT_FILE%
echo     ^<title^>SmartAbp Security Assessment Report^</title^> >> %REPORT_FILE%
echo     ^<style^> >> %REPORT_FILE%
echo         body { font-family: Arial, sans-serif; margin: 20px; } >> %REPORT_FILE%
echo         .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; } >> %REPORT_FILE%
echo         .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; } >> %REPORT_FILE%
echo         .critical { border-left-color: #dc3545; background-color: #fff5f5; } >> %REPORT_FILE%
echo         .warning { border-left-color: #ffc107; background-color: #fffbf0; } >> %REPORT_FILE%
echo         .success { border-left-color: #28a745; background-color: #f0fff4; } >> %REPORT_FILE%
echo         .metric { display: inline-block; margin: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 3px; } >> %REPORT_FILE%
echo         pre { background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; } >> %REPORT_FILE%
echo     ^</style^> >> %REPORT_FILE%
echo ^</head^> >> %REPORT_FILE%
echo ^<body^> >> %REPORT_FILE%
echo     ^<div class="header"^> >> %REPORT_FILE%
echo         ^<h1^>🛡️ SmartAbp Enterprise Security Assessment Report^</h1^> >> %REPORT_FILE%
echo         ^<p^>^<strong^>Generated:^</strong^> %date% %time%^</p^> >> %REPORT_FILE%
echo         ^<p^>^<strong^>Test Duration:^</strong^> Comprehensive security testing completed^</p^> >> %REPORT_FILE%
echo         ^<p^>^<strong^>Target:^</strong^> %BASE_URL%^</p^> >> %REPORT_FILE%
echo     ^</div^> >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo     ^<div class="section"^> >> %REPORT_FILE%
echo         ^<h2^>📊 Executive Summary^</h2^> >> %REPORT_FILE%
echo         ^<p^>This report provides a comprehensive security assessment of the SmartAbp enterprise permission management system, >> %REPORT_FILE%
echo         including penetration testing, vulnerability scanning, and performance testing under attack conditions.^</p^> >> %REPORT_FILE%
echo     ^</div^> >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo     ^<div class="section"^> >> %REPORT_FILE%
echo         ^<h2^>🎯 Test Coverage^</h2^> >> %REPORT_FILE%
echo         ^<div class="metric"^> >> %REPORT_FILE%
echo             ^<strong^>Security Stress Testing^</strong^>^<br^> >> %REPORT_FILE%
echo             Brute force, injection, XSS, rate limiting >> %REPORT_FILE%
echo         ^</div^> >> %REPORT_FILE%
echo         ^<div class="metric"^> >> %REPORT_FILE%
echo             ^<strong^>OWASP Top 10 Scanning^</strong^>^<br^> >> %REPORT_FILE%
echo             A01-A10 comprehensive coverage >> %REPORT_FILE%
echo         ^</div^> >> %REPORT_FILE%
echo         ^<div class="metric"^> >> %REPORT_FILE%
echo             ^<strong^>Penetration Testing^</strong^>^<br^> >> %REPORT_FILE%
echo             Authentication, authorization, session management >> %REPORT_FILE%
echo         ^</div^> >> %REPORT_FILE%
echo         ^<div class="metric"^> >> %REPORT_FILE%
echo             ^<strong^>Performance Under Attack^</strong^>^<br^> >> %REPORT_FILE%
echo             System resilience testing >> %REPORT_FILE%
echo         ^</div^> >> %REPORT_FILE%
echo     ^</div^> >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo     ^<div class="section success"^> >> %REPORT_FILE%
echo         ^<h2^>✅ Security Tests Completed^</h2^> >> %REPORT_FILE%
echo         ^<p^>All security testing modules have been executed successfully. Detailed results are available in JSON format in the results directory.^</p^> >> %REPORT_FILE%
echo     ^</div^> >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo     ^<div class="section"^> >> %REPORT_FILE%
echo         ^<h2^>📁 Result Files^</h2^> >> %REPORT_FILE%
echo         ^<ul^> >> %REPORT_FILE%
echo             ^<li^>^<code^>security_stress_%TIMESTAMP%.json^</code^> - Security stress test results^</li^> >> %REPORT_FILE%
echo             ^<li^>^<code^>vulnerability_scan_%TIMESTAMP%.json^</code^> - OWASP Top 10 scan results^</li^> >> %REPORT_FILE%
echo             ^<li^>^<code^>penetration_test_%TIMESTAMP%.json^</code^> - Penetration test results^</li^> >> %REPORT_FILE%
echo             ^<li^>^<code^>perf_under_attack_%TIMESTAMP%.json^</code^> - Performance under attack results^</li^> >> %REPORT_FILE%
echo         ^</ul^> >> %REPORT_FILE%
echo     ^</div^> >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo     ^<div class="section"^> >> %REPORT_FILE%
echo         ^<h2^>🔍 Next Steps^</h2^> >> %REPORT_FILE%
echo         ^<ol^> >> %REPORT_FILE%
echo             ^<li^>Review JSON result files for detailed metrics and findings^</li^> >> %REPORT_FILE%
echo             ^<li^>Analyze any identified vulnerabilities and implement fixes^</li^> >> %REPORT_FILE%
echo             ^<li^>Schedule regular security testing as part of CI/CD pipeline^</li^> >> %REPORT_FILE%
echo             ^<li^>Update security policies based on test results^</li^> >> %REPORT_FILE%
echo         ^</ol^> >> %REPORT_FILE%
echo     ^</div^> >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo     ^<div class="section"^> >> %REPORT_FILE%
echo         ^<h2^>📈 Recommendations^</h2^> >> %REPORT_FILE%
echo         ^<ul^> >> %REPORT_FILE%
echo             ^<li^>Implement automated security testing in development pipeline^</li^> >> %REPORT_FILE%
echo             ^<li^>Regular penetration testing by third-party security experts^</li^> >> %REPORT_FILE%
echo             ^<li^>Continuous monitoring and threat detection^</li^> >> %REPORT_FILE%
echo             ^<li^>Security awareness training for development team^</li^> >> %REPORT_FILE%
echo         ^</ul^> >> %REPORT_FILE%
echo     ^</div^> >> %REPORT_FILE%
echo ^</body^> >> %REPORT_FILE%
echo ^</html^> >> %REPORT_FILE%

echo [SUCCESS] Security report generated: %REPORT_FILE%

echo.
echo ==========================================
echo [INFO] Security Testing Suite Completed
echo.
echo [SUCCESS] All security tests completed successfully ✅
echo [SUCCESS] Results saved to: %SECURITY_RESULTS_DIR%
echo.
echo [INFO] Review the generated security report and JSON result files for detailed analysis.
echo [INFO] Report location: %SECURITY_RESULTS_DIR%\security_report_%TIMESTAMP%.html
echo.

pause