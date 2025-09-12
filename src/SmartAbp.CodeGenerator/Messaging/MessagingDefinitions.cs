using System;
using System.Collections.Generic;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.Messaging
{
    /// <summary>
    /// Definition for messaging solution with RabbitMQ/MassTransit
    /// </summary>
    public sealed class MessagingDefinition
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<MessageDefinition> Messages { get; set; } = new List<MessageDefinition>();
        
        [PublicAPI]
        public IList<EventDefinition> IntegrationEvents { get; set; } = new List<EventDefinition>();
        
        [PublicAPI]
        public IList<ConsumerDefinition> Consumers { get; set; } = new List<ConsumerDefinition>();
        
        [PublicAPI]
        public MessagingConfiguration Configuration { get; set; } = new();
    }
    
    /// <summary>
    /// Definition for individual message
    /// </summary>
    public sealed class MessageDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public MessageType Type { get; set; } = MessageType.Command;
        
        [PublicAPI]
        public IList<MessagePropertyDefinition> Properties { get; set; } = new List<MessagePropertyDefinition>();
        
        [PublicAPI]
        public string? HandlerName { get; set; }
        
        [PublicAPI]
        public bool RequiresTransaction { get; set; } = false;
        
        [PublicAPI]
        public int RetryCount { get; set; } = 3;
        
        [PublicAPI]
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromSeconds(5);
    }
    
    /// <summary>
    /// Definition for events
    /// </summary>
    public sealed class EventDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public EventType Type { get; set; } = EventType.Domain;
        
        [PublicAPI]
        public IList<MessagePropertyDefinition> Properties { get; set; } = new List<MessagePropertyDefinition>();
        
        [PublicAPI]
        public string AggregateType { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsIntegrationEvent { get; set; } = false;
    }
    
    /// <summary>
    /// Definition for message consumers
    /// </summary>
    public sealed class ConsumerDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string MessageType { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public int ConcurrencyLimit { get; set; } = 1;
        
        [PublicAPI]
        public bool UseRetry { get; set; } = true;
        
        [PublicAPI]
        public bool UseCircuitBreaker { get; set; } = false;
        
        [PublicAPI]
        public bool UseRateLimit { get; set; } = false;
        
        [PublicAPI]
        public string? DeadLetterQueue { get; set; }
    }
    
    /// <summary>
    /// Definition for message properties
    /// </summary>
    public sealed class MessagePropertyDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsRequired { get; set; } = false;
        
        [PublicAPI]
        public string? DefaultValue { get; set; }
        
        [PublicAPI]
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Messaging configuration
    /// </summary>
    public sealed class MessagingConfiguration
    {
        [PublicAPI]
        public string RabbitMqConnectionString { get; set; } = "rabbitmq://localhost";
        
        [PublicAPI]
        public string Username { get; set; } = "admin";
        
        [PublicAPI]
        public string Password { get; set; } = "admin123";
        
        [PublicAPI]
        public string VirtualHost { get; set; } = "/";
        
        [PublicAPI]
        public bool UseOutbox { get; set; } = true;
        
        [PublicAPI]
        public bool UseRetry { get; set; } = true;
        
        [PublicAPI]
        public bool UseCircuitBreaker { get; set; } = true;
        
        [PublicAPI]
        public int DefaultRetryCount { get; set; } = 3;
        
        [PublicAPI]
        public TimeSpan DefaultRetryDelay { get; set; } = TimeSpan.FromSeconds(5);
        
        [PublicAPI]
        public bool EnableMetrics { get; set; } = true;
        
        [PublicAPI]
        public bool EnableTracing { get; set; } = true;
    }
    
    /// <summary>
    /// Generated messaging solution result
    /// </summary>
    public sealed class GeneratedMessagingSolution
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int MessageCount { get; set; }
        
        [PublicAPI]
        public int EventCount { get; set; }
        
        [PublicAPI]
        public int ConsumerCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
        
        [PublicAPI]
        public MessagingStatistics Statistics { get; set; } = new();
    }
    
    /// <summary>
    /// Statistics about generated messaging solution
    /// </summary>
    public sealed class MessagingStatistics
    {
        [PublicAPI]
        public int TotalCommands { get; set; }
        
        [PublicAPI]
        public int TotalEvents { get; set; }
        
        [PublicAPI]
        public int TotalIntegrationEvents { get; set; }
        
        [PublicAPI]
        public int TotalHandlers { get; set; }
        
        [PublicAPI]
        public int TotalConsumers { get; set; }
        
        [PublicAPI]
        public bool HasOutboxPattern { get; set; }
        
        [PublicAPI]
        public bool HasRetryPolicies { get; set; }
        
        [PublicAPI]
        public bool HasCircuitBreaker { get; set; }
        
        [PublicAPI]
        public bool HasDeadLetterQueues { get; set; }
    }
    
    /// <summary>
    /// Message type enumeration
    /// </summary>
    public enum MessageType
    {
        Command,
        Query,
        Event,
        IntegrationEvent
    }
    
    /// <summary>
    /// Event type enumeration
    /// </summary>
    public enum EventType
    {
        Domain,
        Integration,
        System,
        Application
    }
    
    /// <summary>
    /// Messaging pattern enumeration
    /// </summary>
    public enum MessagingPattern
    {
        PublishSubscribe,
        RequestResponse,
        SendReceive,
        Saga,
        Choreography,
        Orchestration
    }
    
    /// <summary>
    /// Delivery guarantee enumeration
    /// </summary>
    public enum DeliveryGuarantee
    {
        AtMostOnce,
        AtLeastOnce,
        ExactlyOnce
    }
    
    /// <summary>
    /// Queue type enumeration
    /// </summary>
    public enum QueueType
    {
        Standard,
        Delayed,
        Priority,
        DeadLetter,
        Retry
    }
}