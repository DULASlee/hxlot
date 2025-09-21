using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Build.Construction;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Services
{
    public class SolutionIntegrationService : ITransientDependency
    {
        private readonly ILogger<SolutionIntegrationService> _logger;

        public SolutionIntegrationService(ILogger<SolutionIntegrationService> logger)
        {
            _logger = logger;
        }

        public async Task AddProjectToSolutionAsync(string solutionFilePath, string projectFilePath)
        {
            try
            {
                _logger.LogInformation("Adding project {Project} to solution {Solution} via dotnet CLI", projectFilePath, solutionFilePath);
                
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "dotnet",
                        Arguments = $"sln \"{solutionFilePath}\" add \"{projectFilePath}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                    }
                };

                process.Start();
                string output = await process.StandardOutput.ReadToEndAsync();
                string error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                if (process.ExitCode == 0)
                {
                    _logger.LogInformation("Successfully added project to solution via dotnet CLI. Output: {Output}", output);
                }
                else
                {
                    _logger.LogError("Failed to add project to solution via dotnet CLI. Error: {Error}", error);
                    throw new InvalidOperationException($"Failed to add project to solution via dotnet CLI. Error: {error}");
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Invalid argument provided while adding project to solution. Solution: {Solution}, Project: {Project}", solutionFilePath, projectFilePath);
                throw;
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Invalid operation while adding project to solution. Solution: {Solution}, Project: {Project}", solutionFilePath, projectFilePath);
                throw;
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Access denied while adding project to solution. Solution: {Solution}, Project: {Project}", solutionFilePath, projectFilePath);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding project to solution. Solution: {Solution}, Project: {Project}", solutionFilePath, projectFilePath);
                throw;
            }
        }

        public async Task AddProjectReferenceAsync(string targetProjectPath, string referencedProjectPath)
        {
            try
            {
                _logger.LogInformation("Adding project reference from {Target} to {Reference}", targetProjectPath, referencedProjectPath);
                var project = ProjectRootElement.Open(targetProjectPath);
                if (project.Items.All(i => i.ItemType != "ProjectReference" || i.Include != referencedProjectPath))
                {
                    project.AddItem("ProjectReference", referencedProjectPath);
                    project.Save();
                    _logger.LogInformation("Successfully added project reference.");
                }
                else
                {
                    _logger.LogInformation("Project reference already exists. Skipping.");
                }
                await Task.CompletedTask;
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Invalid argument provided while adding project reference. Target: {Target}, Reference: {Reference}", targetProjectPath, referencedProjectPath);
                throw;
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Invalid operation while adding project reference. Target: {Target}, Reference: {Reference}", targetProjectPath, referencedProjectPath);
                throw;
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Access denied while adding project reference. Target: {Target}, Reference: {Reference}", targetProjectPath, referencedProjectPath);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while adding project reference. Target: {Target}, Reference: {Reference}", targetProjectPath, referencedProjectPath);
                throw;
            }
        }
    }
}
