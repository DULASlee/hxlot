using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Web.Configuration;

public class ApplicationOptions
{
    [Required]
    public string Name { get; set; } = "SmartAbp";

    public string Version { get; set; } = "1.0.0";

    public string LogRoot { get; set; }

    public string Environment { get; set; } = "Development";

    public DatabaseOptions Database { get; set; } = new DatabaseOptions();

    public AuthenticationOptions Authentication { get; set; } = new AuthenticationOptions();

    public CorsOptions Cors { get; set; } = new CorsOptions();
}

public class DatabaseOptions
{
    public string ConnectionString { get; set; }
    
    public bool EnableSensitiveDataLogging { get; set; }
    
    public int CommandTimeout { get; set; } = 30;
}

public class AuthenticationOptions
{
    public JwtOptions Jwt { get; set; } = new JwtOptions();
    
    public OpenIdConnectOptions OpenIdConnect { get; set; } = new OpenIdConnectOptions();
}

public class JwtOptions
{
    public string Issuer { get; set; }
    
    public string Audience { get; set; }
    
    public string Secret { get; set; }
    
    public int ExpiryMinutes { get; set; } = 60;
}

public class OpenIdConnectOptions
{
    public string Authority { get; set; }
    
    public string ClientId { get; set; }
    
    public string ClientSecret { get; set; }
    
    public string[] Scopes { get; set; } = new[] { "openid", "profile", "email" };
}

public class CorsOptions
{
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
    
    public string[] AllowedMethods { get; set; } = new[] { "GET", "POST", "PUT", "DELETE", "OPTIONS" };
    
    public string[] AllowedHeaders { get; set; } = new[] { "Content-Type", "Authorization" };
    
    public bool AllowCredentials { get; set; } = true;
}