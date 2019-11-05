using System;

namespace Core
{
    public static class CoreHelper
    {
        public static string GetSetting(params string[] settingParts)
        {
            var key = string.Join(':', settingParts);

            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }
    }
}