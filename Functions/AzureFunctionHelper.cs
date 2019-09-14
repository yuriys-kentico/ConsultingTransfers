using System;

namespace Functions
{
    public static class AzureFunctionHelper
    {
        public static string GetEnvironmentVariable(string variableName, string variableSuffix = null)
        {
            var key = variableSuffix != null
                ? $"{variableName}:{variableSuffix}"
                : variableName;

            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }
    }
}